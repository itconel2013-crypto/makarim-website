import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { loadContent, saveBooking, markBookingSynced, decrementSeats } from '@/lib/db';
import { sendInternalNotification, BookingEmailData } from '@/lib/email';
import { bookingPrices } from '@/lib/pricing';
import { getAvailability } from '@/lib/content-schema';

const WEBHOOK_TIMEOUT_MS = 8_000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tripVg, travelers, contact, notes } = body;

    // 1) Validate
    if (!tripVg || !travelers?.length || !contact?.email) {
      return NextResponse.json({ error: 'Fehlende Pflichtfelder' }, { status: 400 });
    }

    // 2) Load trip
    const store = await loadContent();
    const trip  = store.c.trips.find((t) => t.vg === tripVg);
    if (!trip) {
      return NextResponse.json({ error: 'Reise nicht gefunden' }, { status: 404 });
    }

    // Ausgebucht (0 Plätze ohne Warteliste) → keine Buchung mehr möglich.
    if (!getAvailability(trip).bookable) {
      return NextResponse.json({ error: 'Diese Reise ist bereits ausgebucht.' }, { status: 409 });
    }

    // Derive geschlecht from anrede (no separate field in the form): Frau→w, sonst m.
    // Respect an explicit geschlecht if a client ever sends one.
    const travelersWithGeschlecht = travelers.map((t: any) => ({
      ...t,
      geschlecht: t.geschlecht ?? (t.anrede === 'Frau' ? 'w' : 'm'),
    }));

    const createdAt = new Date().toISOString();

    // Compute the price server-side (never trust client amounts). Same logic the
    // booking form used, so `gesamt` matches what the customer saw. Uses the
    // explicit CRM room prices (trip.prices) when present.
    const { preisProPerson, gesamt } = bookingPrices(travelers, trip);

    // 3) Persist booking in DB first (never lost even if webhook fails).
    //    Price fields live in the payload so the retry job re-sends them too.
    const payload = { tripVg, travelers: travelersWithGeschlecht, contact, notes, createdAt, gesamt, preisProPerson };
    const bookingId = saveBooking(tripVg, payload);

    // 4) Decrement seats + refresh cached public pages (seat counts changed)
    try {
      await decrementSeats(tripVg, travelers.length);
      revalidatePath('/', 'layout');
    } catch (e) {
      console.error('decrementSeats failed:', e);
    }

    // 5) Internal team notification (optional, fire-and-forget)
    if (process.env.SMTP_HOST) {
      const be = store.c.brand.bookingEmail ?? {};
      const emailData: BookingEmailData = {
        tripTitle:   trip.title,
        tripDate:    trip.date,
        tripVg:      trip.vg,
        tripPrice:   trip.price,
        travelers,
        contact,
        notes:       notes ?? '',
        iban:        store.c.brand.bank.iban,
        bic:         store.c.brand.bank.bic,
        bankName:    store.c.brand.bank.name,
        bankInhaber: store.c.brand.bank.inhaber,
        emailIntro:      be.intro,
        emailStep1Title: be.step1Title,
        emailStep1Text:  be.step1Text,
        emailStep2Title: be.step2Title,
        emailStep2Text:  be.step2Text,
        emailStep3Title: be.step3Title,
        emailStep3Text:  be.step3Text,
      };
      sendInternalNotification(emailData).catch((e) =>
        console.error('Interne Benachrichtigung fehlgeschlagen (id=' + bookingId + '):', e)
      );
    }

    // 6) CRM webhook — customer confirmation is sent by the CRM, not the CMS
    if (process.env.CRM_WEBHOOK_URL) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);
        const res = await fetch(process.env.CRM_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-API-Key': process.env.CRM_API_KEY ?? '' },
          body: JSON.stringify({ ...payload, bookingId }),
          signal: controller.signal,
        });
        clearTimeout(timer);
        if (res.ok) {
          markBookingSynced(bookingId);
        } else {
          console.error('CRM-Webhook: HTTP ' + res.status + ' (Buchung id=' + bookingId + ', Retry läuft)');
        }
      } catch (e) {
        console.error('CRM-Webhook fehlgeschlagen (Buchung id=' + bookingId + ', Retry läuft):', e);
      }
    }

    return NextResponse.json({ success: true, vg: tripVg, bookingId });
  } catch (error) {
    console.error('Booking API error:', error);
    return NextResponse.json({ error: 'Buchung fehlgeschlagen' }, { status: 500 });
  }
}
