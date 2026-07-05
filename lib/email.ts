import nodemailer from 'nodemailer';

function createTransporter() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST   ?? '',
    port:   Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT ?? 587) === 465,
    auth: {
      user: process.env.SMTP_USER ?? '',
      pass: process.env.SMTP_PASS ?? '',
    },
  });
}

export interface BookingEmailData {
  // Trip
  tripTitle: string;
  tripDate: string;
  tripVg: string;
  tripPrice: number;
  // Travelers
  travelers: Array<{
    anrede: string;
    vorname: string;
    nachname: string;
    geburtstag: string;
    zimmer: string;
  }>;
  // Contact
  contact: {
    vorname: string;
    nachname: string;
    email: string;
    telefon: string;
    strasse?: string;
    plz?: string;
    ort?: string;
  };
  notes?: string;
  // Bank
  iban: string;
  bic: string;
  bankName: string;
  bankInhaber: string;
  // CMS-editable email content
  emailIntro?: string;
  emailStep1Title?: string;
  emailStep1Text?: string;
  emailStep2Title?: string;
  emailStep2Text?: string;
  emailStep3Title?: string;
  emailStep3Text?: string;
}

const COLORS = {
  primary:  '#C2724A',
  ink:      '#16242B',
  bg:       '#F4F1EA',
  border:   '#EAE3D8',
  light:    '#9A9082',
};

function baseTemplate(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title></head>
<body style="margin:0;padding:0;background:${COLORS.bg};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0">
  <tr><td align="center" style="padding:40px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
      <!-- Header -->
      <tr><td style="background:${COLORS.ink};padding:28px 40px;border-radius:12px 12px 0 0;">
        <p style="margin:0;color:rgba(255,255,255,0.9);font-size:22px;font-weight:600;letter-spacing:-0.3px;">
          Makarim Reisen
        </p>
        <p style="margin:4px 0 0;color:rgba(255,255,255,0.45);font-size:12px;letter-spacing:0.12em;text-transform:uppercase;font-family:monospace;">
          Pilgerreisen mit Seele
        </p>
      </td></tr>
      <!-- Body -->
      <tr><td style="background:white;padding:40px;border-radius:0 0 12px 12px;border:1px solid ${COLORS.border};border-top:none;">
        ${body}
      </td></tr>
      <!-- Footer -->
      <tr><td style="padding:24px 0;text-align:center;color:${COLORS.light};font-size:12px;">
        Makarim Reisen · Bei Fragen antworten Sie auf diese E-Mail
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

function zimmerLabel(z: string): string {
  if (z === 'EZ') return 'Einzelzimmer';
  if (z === 'DZ+') return 'Doppelzimmer Haram-Blick';
  return 'Doppelzimmer';
}

// ── Confirmation email to customer ────────────────────────────────────────────
export async function sendCustomerConfirmation(data: BookingEmailData) {
  const travelerRows = data.travelers.map((t, i) => `
    <tr style="border-bottom:1px solid ${COLORS.border};">
      <td style="padding:10px 16px;color:${COLORS.light};font-size:13px;">Person ${i + 1}</td>
      <td style="padding:10px 16px;color:${COLORS.ink};font-size:14px;font-weight:500;">
        ${t.anrede} ${t.vorname} ${t.nachname}
      </td>
      <td style="padding:10px 16px;color:${COLORS.light};font-size:13px;">${zimmerLabel(t.zimmer)}</td>
    </tr>`).join('');

  const body = `
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:400;color:${COLORS.ink};font-family:Georgia,serif;">
      Ihre Buchungsanfrage ist eingegangen
    </h1>
    <p style="color:${COLORS.light};font-size:14px;margin:0 0 32px;">
      Vorgangsnummer: <strong style="color:${COLORS.primary};font-family:monospace;">${data.tripVg}</strong>
    </p>

    <p style="font-size:15px;color:#5A5448;line-height:1.7;margin:0 0 28px;">
      Sehr geehrte/r ${data.contact.vorname} ${data.contact.nachname},<br><br>
      ${data.emailIntro ?? 'vielen Dank für Ihre Buchungsanfrage. Wir haben Ihre Anfrage erhalten und werden uns innerhalb von <strong>24 Stunden</strong> bei Ihnen melden, um alle weiteren Details zu besprechen.'}
    </p>

    <!-- Trip box -->
    <div style="background:${COLORS.bg};border-radius:10px;padding:20px 24px;margin-bottom:28px;border:1px solid ${COLORS.border};">
      <p style="margin:0 0 4px;font-size:12px;color:${COLORS.light};text-transform:uppercase;letter-spacing:0.1em;font-family:monospace;">Ihre Reise</p>
      <p style="margin:0 0 4px;font-size:20px;font-weight:400;color:${COLORS.ink};font-family:Georgia,serif;">${data.tripTitle}</p>
      <p style="margin:0;font-size:14px;color:${COLORS.light};">${data.tripDate}</p>
    </div>

    <!-- Travelers -->
    <p style="font-size:13px;font-weight:600;color:${COLORS.ink};margin:0 0 8px;text-transform:uppercase;letter-spacing:0.08em;">Reisende</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${COLORS.border};border-radius:8px;overflow:hidden;margin-bottom:28px;">
      ${travelerRows}
    </table>

    <!-- Next steps -->
    <p style="font-size:13px;font-weight:600;color:${COLORS.ink};margin:0 0 16px;text-transform:uppercase;letter-spacing:0.08em;">Nächste Schritte</p>
    ${[
      ['1', data.emailStep1Title ?? 'Wir bestätigen Ihre Anfrage', data.emailStep1Text ?? 'Sie erhalten innerhalb von 24 Stunden eine Buchungsbestätigung per E-Mail.'],
      ['2', data.emailStep2Title ?? 'Anzahlung überweisen',        data.emailStep2Text ?? 'Nach Bestätigung überweisen Sie bitte die Anzahlung auf unser Konto.'],
      ['3', data.emailStep3Title ?? 'Reiseunterlagen',             data.emailStep3Text ?? 'Ca. 4 Wochen vor Reisebeginn erhalten Sie alle Unterlagen.'],
    ].map(([n, t, d]) => `
      <div style="display:flex;gap:16px;margin-bottom:16px;">
        <div style="width:28px;height:28px;border-radius:50%;background:${COLORS.primary};color:white;font-size:13px;font-weight:600;display:flex;align-items:center;justify-content:center;flex-shrink:0;line-height:28px;text-align:center;">${n}</div>
        <div>
          <p style="margin:0 0 3px;font-size:14px;font-weight:600;color:${COLORS.ink};">${t}</p>
          <p style="margin:0;font-size:13px;color:${COLORS.light};">${d}</p>
        </div>
      </div>`).join('')}

    <!-- Bank details -->
    <div style="background:#F0F7F3;border-radius:10px;padding:20px 24px;margin-top:8px;border:1px solid #C8E0D4;">
      <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#2D5A42;text-transform:uppercase;letter-spacing:0.08em;">Bankverbindung für Anzahlung</p>
      <p style="margin:0 0 4px;font-size:13px;color:#2D5A42;">Kontoinhaber: <strong>${data.bankInhaber}</strong></p>
      <p style="margin:0 0 4px;font-size:13px;font-family:monospace;color:#2D5A42;">IBAN: <strong>${data.iban}</strong></p>
      <p style="margin:0 0 4px;font-size:13px;font-family:monospace;color:#2D5A42;">BIC: <strong>${data.bic}</strong></p>
      <p style="margin:0;font-size:13px;color:#2D5A42;">Bank: ${data.bankName}</p>
      <p style="margin:8px 0 0;font-size:12px;color:#4A8A68;">Verwendungszweck: <strong style="font-family:monospace;">${data.tripVg}</strong></p>
    </div>`;

  const transporter = createTransporter();
  await transporter.sendMail({
    from:    process.env.SMTP_FROM ?? 'Makarim Reisen <info@makarim-reisen.de>',
    to:      data.contact.email,
    subject: `Buchungsanfrage eingegangen — ${data.tripTitle} (${data.tripVg})`,
    html:    baseTemplate('Buchungsbestätigung — Makarim Reisen', body),
  });
}

// ── Internal notification to team ─────────────────────────────────────────────
export async function sendInternalNotification(data: BookingEmailData) {
  const travelerList = data.travelers.map((t, i) =>
    `<li style="margin-bottom:6px;">Person ${i + 1}: ${t.anrede} ${t.vorname} ${t.nachname} — geb. ${t.geburtstag} — ${zimmerLabel(t.zimmer)}</li>`
  ).join('');

  const body = `
    <div style="background:#FEF3EC;border-left:4px solid ${COLORS.primary};padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:28px;">
      <p style="margin:0;font-size:16px;font-weight:600;color:${COLORS.primary};">Neue Buchungsanfrage</p>
      <p style="margin:4px 0 0;font-size:13px;color:${COLORS.light};">VG: <strong style="font-family:monospace;color:${COLORS.ink};">${data.tripVg}</strong></p>
    </div>

    <p style="font-size:13px;font-weight:600;color:${COLORS.ink};margin:0 0 8px;text-transform:uppercase;letter-spacing:0.08em;">Reise</p>
    <p style="margin:0 0 4px;font-size:15px;color:${COLORS.ink};font-weight:500;">${data.tripTitle}</p>
    <p style="margin:0 0 24px;font-size:14px;color:${COLORS.light};">${data.tripDate} · ab €${data.tripPrice.toLocaleString('de-DE')}/Person</p>

    <p style="font-size:13px;font-weight:600;color:${COLORS.ink};margin:0 0 8px;text-transform:uppercase;letter-spacing:0.08em;">Kontaktperson</p>
    <p style="margin:0 0 4px;font-size:14px;color:${COLORS.ink};">${data.contact.vorname} ${data.contact.nachname}</p>
    <p style="margin:0 0 4px;font-size:14px;color:${COLORS.ink};">📧 <a href="mailto:${data.contact.email}" style="color:${COLORS.primary};">${data.contact.email}</a></p>
    <p style="margin:0 0 4px;font-size:14px;color:${COLORS.ink};">📞 <a href="tel:${data.contact.telefon}" style="color:${COLORS.primary};">${data.contact.telefon}</a></p>
    ${data.contact.strasse || data.contact.plz || data.contact.ort ? `
    <p style="margin:0 0 24px;font-size:14px;color:${COLORS.ink};">📍 ${[data.contact.strasse, [data.contact.plz, data.contact.ort].filter(Boolean).join(' ')].filter(Boolean).join(', ')}</p>` : '<div style="margin-bottom:24px;"></div>'}

    <p style="font-size:13px;font-weight:600;color:${COLORS.ink};margin:0 0 8px;text-transform:uppercase;letter-spacing:0.08em;">Reisende (${data.travelers.length})</p>
    <ul style="margin:0 0 24px;padding-left:20px;font-size:14px;color:#5A5448;">
      ${travelerList}
    </ul>

    ${data.notes ? `
    <p style="font-size:13px;font-weight:600;color:${COLORS.ink};margin:0 0 8px;text-transform:uppercase;letter-spacing:0.08em;">Anmerkungen</p>
    <p style="margin:0;font-size:14px;color:#5A5448;background:${COLORS.bg};padding:16px;border-radius:8px;border:1px solid ${COLORS.border};">${data.notes}</p>
    ` : ''}`;

  const transporter = createTransporter();
  await transporter.sendMail({
    from:    process.env.SMTP_FROM ?? 'Makarim Reisen <info@makarim-reisen.de>',
    to:      process.env.BOOKING_NOTIFY_EMAIL ?? process.env.SMTP_USER ?? '',
    subject: `[Neue Anfrage] ${data.tripTitle} — ${data.contact.vorname} ${data.contact.nachname} (${data.travelers.length} Person${data.travelers.length > 1 ? 'en' : ''})`,
    html:    baseTemplate('Neue Buchungsanfrage', body),
  });
}
