import { NextRequest, NextResponse } from 'next/server';
import { clientIp, rateLimit, resetRateLimit } from '@/lib/rate-limit';

/**
 * Bremse gegen Passwort-Raten: Ohne sie lässt sich das Admin-Passwort beliebig
 * oft durchprobieren — bei ~550 ms je Versuch sind das mehrere tausend Versuche
 * pro Stunde. Acht Fehlversuche je Absender pro 15 Minuten reichen für jeden,
 * der sein Passwort nur gerade nicht parat hat.
 *
 * Gezählt werden nur FEHLVERSUCHE: Nach erfolgreicher Anmeldung wird der Zähler
 * zurückgesetzt, damit sich niemand selbst aussperrt.
 */
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 15 * 60 * 1000;

/** Grundverzögerung bei jedem Fehlversuch — macht schnelles Durchprobieren zäh. */
const FAIL_DELAY_MS = 700;

async function computeToken(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function POST(request: NextRequest) {
  const key = 'login:' + clientIp(request);

  const limited = rateLimit(key, MAX_ATTEMPTS, WINDOW_MS);
  if (!limited.ok) {
    return NextResponse.json(
      { error: `Zu viele Fehlversuche. Bitte in ${Math.ceil(limited.retryAfterSec / 60)} Minuten erneut versuchen.` },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec) } },
    );
  }

  const { password } = await request.json();
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'makarim2024';
  const salt          = process.env.ADMIN_SALT     ?? 'makarim-cms-salt-2024';

  if (!password || password !== adminPassword) {
    await new Promise((r) => setTimeout(r, FAIL_DELAY_MS));
    return NextResponse.json({ error: 'Falsches Passwort' }, { status: 401 });
  }

  // Richtiges Passwort → Zähler leeren, damit ein paar Vertipper vorher nicht
  // nachwirken und die nächste Anmeldung blockieren.
  resetRateLimit(key);

  const token    = await computeToken(adminPassword, salt);
  const response = NextResponse.json({ success: true });

  response.cookies.set('makarim_session', token, {
    httpOnly:  true,
    sameSite:  'strict',
    maxAge:    60 * 60 * 24 * 7, // 7 Tage
    path:      '/',
    secure:    process.env.NODE_ENV === 'production',
  });

  return response;
}
