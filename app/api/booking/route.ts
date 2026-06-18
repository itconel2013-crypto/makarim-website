import { NextRequest, NextResponse } from 'next/server';
import { loadContent } from '@/lib/db';
import { sendCustomerConfirmation, sendInternalNotification, BookingEmailData } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tripVg, travelers, contact, notes } = body;

    if (!tripVg || !travelers?.length || !contact?.email) {
      return NextResponse.json({ error: 'Fehlende Pflichtfelder' }, { status: 400 });
    }

    // Load trip + brand data from DB
    const store = await loadContent();
    const trip  = store.c.trips.find((t) => t.vg === tripVg);
    if (!trip) {
      return NextResponse.json({ error: 'Reise nicht gefunden' }, { status: 404 });
    }

    const emailData: BookingEmailData = {
      tripTitle:    trip.title,
      tripDate:     trip.date,
      tripVg:       trip.vg,
      tripPrice:    trip.price,
      travelers,
      contact,
      notes:        notes ?? '',
      iban:         store.c.brand.bank.iban,
      bic:          store.c.brand.bank.bic,
      bankName:     store.c.brand.bank.name,
      bankInhaber:  store.c.brand.bank.inhaber,
    };

    // Send both emails in parallel
    await Promise.all([
      sendCustomerConfirmation(emailData),
      sendInternalNotification(emailData),
    ]);

    return NextResponse.json({ success: true, vg: tripVg });
  } catch (error) {
    console.error('Booking API error:', error);
    return NextResponse.json({ error: 'E-Mail-Versand fehlgeschlagen' }, { status: 500 });
  }
}
