'use client';

import Link from 'next/link';
import { useCMS } from '@/components/cms/CMSProvider';
import { PublishBar } from '@/components/cms/PublishBar';

const quickLinks = [
  { href: '/admin/startseite',     label: 'Startseite bearbeiten',   desc: 'Hero, Trust, CTA' },
  { href: '/admin/reisen',         label: 'Reisen verwalten',         desc: 'Trips, Hotels, SEO' },
  { href: '/admin/kategorien',     label: 'Kategorien',               desc: 'Umrah, Hajj, Kultur' },
  { href: '/admin/mediathek',      label: 'Mediathek',                desc: 'Bilder hochladen' },
  { href: '/admin/seo',            label: 'SEO-Einstellungen',        desc: 'Titel & Beschreibungen' },
  { href: '/admin/kontakt-footer', label: 'Kontakt & Footer',         desc: 'Telefon, Bank, Adresse' },
];

export default function AdminDashboard() {
  const { store, draftCount } = useCMS();
  if (!store) return null;

  const tripCount  = store.c.trips.length;
  const pubCount   = store.c.trips.filter((t) => t.published !== false).length;
  const faqCount   = store.c.faq.length;
  const mediaCount = store.media.length;

  const stats = [
    { label: 'Reisen gesamt',      value: tripCount,  sub: `${pubCount} veröffentlicht` },
    { label: 'Im Entwurf',         value: draftCount, sub: 'Warten auf Veröffentlichung', amber: draftCount > 0 },
    { label: 'FAQ-Einträge',       value: faqCount,   sub: 'Aktive Fragen' },
    { label: 'Medien',             value: mediaCount, sub: 'Bilder in der Bibliothek' },
  ];

  return (
    <>
      <PublishBar title="Übersicht" subtitle="Willkommen im Makarim CMS" />

      <main className="flex-1 p-8 overflow-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-card bg-white p-6"
              style={{ border: '1px solid #EAE3D8', boxShadow: '0 2px 8px rgba(40,30,20,0.04)' }}
            >
              <p
                className="font-serif font-normal mb-1"
                style={{ fontSize: '38px', lineHeight: '1', color: s.amber ? '#956214' : '#16242B' }}
              >
                {s.value}
              </p>
              <p className="font-medium text-ink text-sm">{s.label}</p>
              <p className="text-xs text-body-light mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <h2 className="font-semibold text-ink text-sm uppercase tracking-widest mb-4" style={{ fontSize: '11px', color: '#9A9082' }}>
          Schnellzugriff
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map(({ href, label, desc }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-4 p-5 rounded-card bg-white hover:shadow-card transition-shadow group"
              style={{ border: '1px solid #EAE3D8' }}
            >
              <div className="flex-1">
                <p className="font-medium text-ink text-sm group-hover:text-primary transition-colors">{label}</p>
                <p className="text-xs text-body-light mt-0.5">{desc}</p>
              </div>
              <span className="text-body-light group-hover:text-primary transition-colors text-lg">→</span>
            </Link>
          ))}
        </div>

        {/* Draft trips notice */}
        {draftCount > 0 && (
          <div
            className="mt-8 flex items-start gap-4 p-5 rounded-card"
            style={{ backgroundColor: '#F6ECD9', border: '1px solid #E0A23C33' }}
          >
            <span style={{ fontSize: '20px' }}>⚠</span>
            <div>
              <p className="font-medium text-sm" style={{ color: '#956214' }}>
                {draftCount} {draftCount === 1 ? 'Reise wartet' : 'Reisen warten'} auf Veröffentlichung
              </p>
              <p className="text-xs mt-1" style={{ color: '#B8850A' }}>
                Klicke auf „Veröffentlichen" in der Leiste oben oder öffne den{' '}
                <Link href="/admin/reisen" className="underline">Trips-Manager</Link> um einzelne Reisen zu veröffentlichen.
              </p>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
