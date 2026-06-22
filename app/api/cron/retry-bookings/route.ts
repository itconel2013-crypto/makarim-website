import { NextRequest, NextResponse } from 'next/server';
import { loadUnsyncedBookings, markBookingSynced } from '@/lib/db';
import { sendInternalNotification } from '@/lib/email';

const WEBHOOK_TIMEOUT_MS = 8_000;
const ALARM_AFTER_MS     = 60 * 60 * 1_000; // 60 min

export async function POST(request: NextRequest) {
  const cronKey = request.headers.get('x-cron-key');
  if (!process.env.CRON_SECRET || cronKey !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return runRetry();
}

// Also allow GET so Railway's HTTP health-check cron can trigger it
export async function GET(request: NextRequest) {
  const cronKey = request.headers.get('x-cron-key');
  if (!process.env.CRON_SECRET || cronKey !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return runRetry();
}

async function runRetry(): Promise<NextResponse> {
  if (!process.env.CRM_WEBHOOK_URL) {
    return NextResponse.json({ skipped: true, reason: 'CRM_WEBHOOK_URL not set' });
  }

  const rows = loadUnsyncedBookings();
  const results: { id: number; ok: boolean; error?: string }[] = [];
  const now = Date.now();

  for (const row of rows) {
    const payload = JSON.parse(row.payload ?? '{}');

    // Alarm if stuck > 60 min
    const age = now - new Date(row.created_at).getTime();
    if (age > ALARM_AFTER_MS && process.env.SMTP_HOST && process.env.BOOKING_NOTIFY_EMAIL) {
      const ageMin = Math.round(age / 60_000);
      sendInternalNotification({
        tripTitle: payload.tripVg ?? '?',
        tripDate: '', tripVg: payload.tripVg ?? '', tripPrice: 0,
        travelers: [], contact: payload.contact ?? { vorname: '', nachname: '', email: '', telefon: '' },
        notes: `⚠️ Buchung #${row.id} konnte seit ${ageMin} Min. nicht ans CRM übermittelt werden.`,
        iban: '', bic: '', bankName: '', bankInhaber: '',
      }).catch(() => {});
    }

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);
      const res = await fetch(process.env.CRM_WEBHOOK_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': process.env.CRM_API_KEY ?? '' },
        body: JSON.stringify({ ...payload, bookingId: row.id }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (res.ok) {
        markBookingSynced(row.id);
        results.push({ id: row.id, ok: true });
      } else {
        results.push({ id: row.id, ok: false, error: `HTTP ${res.status}` });
      }
    } catch (e: any) {
      results.push({ id: row.id, ok: false, error: e?.message ?? 'fetch failed' });
    }
  }

  return NextResponse.json({ retried: rows.length, results });
}
