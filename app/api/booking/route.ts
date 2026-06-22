import { NextRequest, NextResponse } from 'next/server';
import { loadContent, saveBooking, markBookingEmailed, decrementSeats } from '@/lib/db';
import { sendCustomerConfirmation, sendInternalNotification, BookingEmailData } from '@/lib/email';

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

    // 3) Persist booking in DB first (so it's never lost)
    const bookingId = saveBooking(tripVg, { tripVg, travelers, contact, notes });

    // 4) Decrement seats (non-blocking to the customer if it fails)
    try {
      await decrementSeats(tripVg, travelers.length);
    } catch (e) {
      console.error('decrementSeats failed:', e);
    }

    // 5) Send emails fire-and-forget — response returns immediately, email runs in background
    if (process.env.SMTP_HOST) {
      const be = store.c.brand.bookingEmail ?? {};
      const emailData: BookingEmailData = {
        tripTitle:      trip.title,
        tripDate:       trip.date,
        tripVg:         trip.vg,
        tripPrice:      trip.price,
        travelers,
        contact,
        notes:          notes ?? '',
        iban:           store.c.brand.bank.iban,
        bic:            store.c.brand.bank.bic,
        bankName:       store.c.brand.bank.name,
        bankInhaber:    store.c.brand.bank.inhaber,
        emailIntro:     be.intro,
        emailStep1Title: be.step1Title,
        emailStep1Text:  be.step1Text,
        emailStep2Title: be.step2Title,
        emailStep2Text:  be.step2Text,
        emailStep3Title: be.step3Title,
        emailStep3Text:  be.step3Text,
      };
      Promise.all([
        sendCustomerConfirmation(emailData),
        sendInternalNotification(emailData),
      ])
        .then(() => markBookingEmailed(bookingId))
        .catch((e) => console.error('E-Mail-Versand fehlgeschlagen (Buchung id=' + bookingId + '):', e));
    } else {
      console.warn('SMTP_HOST nicht konfiguriert — E-Mail übersprungen (Buchung id=' + bookingId + ')');
    }

    // 6) Optional CRM webhook
    if (process.env.CRM_WEBHOOK_URL) {
      try {
        await fetch(process.env.CRM_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-API-Key': process.env.CRM_API_KEY ?? '' },
          body: JSON.stringify({ tripVg, travelers, contact, notes, bookingId }),
        });
      } catch (e) {
        console.error('CRM-Sync fehlgeschlagen (Buchung gespeichert):', e);
      }
    }

    return NextResponse.json({ success: true, vg: tripVg, bookingId });
  } catch (error) {
    console.error('Booking API error:', error);
    return NextResponse.json({ error: 'Buchung fehlgeschlagen' }, { status: 500 });
  }
}
