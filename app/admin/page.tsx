'use client';

import Link from 'next/link';
import { useCMS } from '@/components/cms/CMSProvider';
import { PublishBar } from '@/components/cms/PublishBar';

const quickLinks = [
  { href: '/admin/startseite', label: 'Startseite', desc: 'Hero & Texte', icon: '△' },
  { href: '/admin/reisen',     label: 'Reisen',     desc: 'Bilder & Texte', icon: '+' },
  { href: '/admin/faq',        label: 'FAQ',        desc: 'Fragen pflegen', icon: '?' },
  { href: '/admin/mediathek',  label: 'Mediathek',  desc: 'Bilder verwalten', icon: '▦' },
];

export default function AdminDashboard() {
  const { store } = useCMS();
  if (!store) return null;

  const tripCount  = store.c.trips.length;
  const faqCount   = store.c.faq.length;
  const mediaCount = store.media.length;

  const stats = [
    { label: 'Reisen gesamt',           value: tripCount },
    { label: 'FAQ-Einträge',            value: faqCount },
    { label: 'Bilder in der Mediathek', value: mediaCount },
  ];

  return (
    <>
      <PublishBar title="Übersicht" subtitle="Inhalte der Website verwalten" />

      <main className="flex-1 p-8 overflow-auto">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-5 mb-8" style={{ maxWidth: '720px' }}>
          {stats.map((s) => (
            <div key={s.label} className="rounded-card bg-white p-6" style={{ border: '1px solid #EAE3D8', boxShadow: '0 2px 8px rgba(40,30,20,0.04)' }}>
              <p className="font-serif font-normal mb-1" style={{ fontSize: '38px', lineHeight: '1', color: '#16242B' }}>
                {s.value}
              </p>
              <p className="text-sm text-body-light">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Welcome box */}
        <div className="rounded-card bg-white p-8" style={{ border: '1px solid #EAE3D8', maxWidth: '720px' }}>
          <h2 className="font-serif font-normal text-ink mb-1" style={{ fontSize: '22px' }}>
            Willkommen im Website Studio
          </h2>
          <p className="text-sm mb-6" style={{ color: '#C2724A', lineHeight: '1.6' }}>
            Hier pflegst du alle Inhalte der öffentlichen Website. Änderungen werden sofort gespeichert.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {quickLinks.map(({ href, label, desc }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-4 p-5 rounded-card hover:shadow-card transition-shadow group"
                style={{ border: '1px solid #EAE3D8', backgroundColor: '#FDFCF9' }}
              >
                <div className="flex-1">
                  <p className="font-medium text-ink text-sm group-hover:text-primary transition-colors">{label}</p>
                  <p className="text-xs text-body-light mt-0.5">{desc}</p>
                </div>
                <span className="text-body-light group-hover:text-primary transition-colors">→</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
