import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { loadContent } from '@/lib/db';
import { defaultBookingPage, Trip } from '@/lib/content-schema';
import { categoryFromSlug } from '@/lib/utils';

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Buchung eingegangen – Makarim Reisen' };
}

/** Render an editable text, replacing {reise} (trip title) and {vg} (Vorgangsnummer). */
function fillTemplate(text: string, trip: Trip): React.ReactNode {
  return text.split(/(\{reise\}|\{vg\})/g).map((part, i) => {
    if (part === '{reise}') return <strong key={i}>{trip.title}</strong>;
    if (part === '{vg}') return <strong key={i} className="font-mono" style={{ color: '#A8542F' }}>VG {trip.vg}</strong>;
    return <span key={i}>{part}</span>;
  });
}

export default async function ConfirmPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const content = await loadContent();

  // öffentliches URL-Segment → interner Schlüssel (siehe lib/utils)
  const catKey = categoryFromSlug(category);
  if (!catKey) notFound();

  const trip = content.c.trips.find(
    (t) => t.slug === slug && t.category === catKey && t.published !== false
  );
  if (!trip) notFound();

  const bank = content.c.brand.bank;
  const cfg = { ...defaultBookingPage, ...(content.c.brand.bookingPage ?? {}) };

  // Vorreservierung: eigene Überschrift/Text, und KEINE Bankdaten/Schritte —
  // es ist noch keine Zahlung nötig (die Kundenmail verschickt das CRM).
  const isVorres = trip.vorreservierung === true;
  const heading = isVorres ? 'Vorreservierung eingegangen' : cfg.heading;
  const intro = isVorres
    ? 'Vielen Dank für deine Vorreservierung. Die Reise ist noch nicht bestätigt – wir melden uns, sobald sie feststeht. Eine Zahlung ist jetzt noch nicht nötig.'
    : fillTemplate(cfg.intro, trip);

  return (
    <main className="min-h-screen bg-page">
      <div className="container-max py-16 max-w-2xl">

        {/* ── Success circle + heading ───────────────────────────────── */}
        <div className="text-center mb-12">
          {/* 74px success check circle */}
          <div
            className="mx-auto mb-6 flex items-center justify-center rounded-full"
            style={{ width: '74px', height: '74px', backgroundColor: '#EAF0E8' }}
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path
                d="M6 16l7 7 13-13"
                stroke="#3E6B52"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1
            className="font-serif font-normal text-ink mb-4"
            style={{ fontSize: '38px', lineHeight: '1.2' }}
          >
            {heading}
          </h1>
          <p style={{ fontSize: '16.5px', color: '#5A5448', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
            {intro}
          </p>
        </div>

        {/* ── Nächste Schritte / Bankdaten — bei Vorreservierung ausgeblendet
              (noch keine Zahlung nötig) ──────────────────────────────── */}
        {!isVorres && (
        <div
          className="rounded-card p-8 mb-8"
          style={{ backgroundColor: 'white', border: '1px solid #EAE3D8', boxShadow: '0 6px 22px rgba(40,30,20,0.05)' }}
        >
          <h2
            className="font-serif font-normal text-ink mb-6"
            style={{ fontSize: '22px' }}
          >
            {cfg.stepsTitle}
          </h2>

          <ol className="space-y-5">
            {[
              { title: cfg.step1Title, text: cfg.step1Text },
              { title: cfg.step2Title, text: cfg.step2Text },
              { title: cfg.step3Title, text: cfg.step3Text },
            ].map((step, i) => (
              <li key={i} className="flex gap-4">
                <span
                  className="flex-shrink-0 flex items-center justify-center rounded-full font-mono font-semibold text-white text-xs"
                  style={{ width: '28px', height: '28px', backgroundColor: '#C2724A', marginTop: '1px' }}
                >
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium text-ink text-sm mb-1">{step.title}</p>
                  <p className="text-body-sm text-body" style={{ whiteSpace: 'pre-line' }}>{fillTemplate(step.text, trip)}</p>
                </div>
              </li>
            ))}
          </ol>

          {/* Bank details */}
          <div
            className="mt-8 p-5 rounded-card"
            style={{ backgroundColor: '#F4F1EA' }}
          >
            <p className="font-mono uppercase text-body-light mb-4" style={{ fontSize: '11px', letterSpacing: '0.15em' }}>
              Bankverbindung
            </p>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <dt className="text-body">Kontoinhaber</dt>
              <dd className="font-medium text-ink">{bank.inhaber}</dd>
              <dt className="text-body">Bank</dt>
              <dd className="font-medium text-ink">{bank.name}</dd>
              <dt className="text-body">IBAN</dt>
              <dd className="font-mono font-medium text-ink tracking-wide">{bank.iban}</dd>
              <dt className="text-body">BIC</dt>
              <dd className="font-mono font-medium text-ink">{bank.bic}</dd>
              <dt className="text-body">Verwendungszweck</dt>
              <dd className="font-mono font-semibold" style={{ color: '#A8542F' }}>VG {trip.vg}</dd>
            </dl>
          </div>
        </div>
        )}

        {/* ── Back to trip / Home ────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href={`/${category}/${slug}`}
            className="inline-flex items-center justify-center font-medium text-white transition-colors"
            style={{ backgroundColor: '#C2724A', height: '48px', borderRadius: '9px', padding: '0 28px', fontSize: '15px' }}
          >
            Zurück zur Reise
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center font-medium text-body hover:text-primary transition-colors"
            style={{ height: '48px', padding: '0 28px', fontSize: '15px' }}
          >
            Zur Startseite →
          </Link>
        </div>
      </div>
    </main>
  );
}
