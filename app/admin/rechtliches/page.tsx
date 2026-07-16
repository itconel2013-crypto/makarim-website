'use client';

import { useCMS } from '@/components/cms/CMSProvider';
import { PublishBar } from '@/components/cms/PublishBar';
import { LegalContent } from '@/lib/content-schema';

const FIELDS: Array<{ key: keyof LegalContent; label: string; url: string; ph: string }> = [
  { key: 'impressum',   label: 'Impressum',              url: '/impressum',   ph: 'Angaben gemäß § 5 TMG …' },
  { key: 'agb',         label: 'AGB & Reisebedingungen', url: '/agb',         ph: 'Reisebedingungen …' },
  { key: 'datenschutz', label: 'Datenschutzerklärung',   url: '/datenschutz', ph: 'Datenschutzerklärung nach DSGVO …' },
];

export default function RechtlichesManager() {
  const { store, updateSection } = useCMS();
  if (!store) return null;

  const legal: LegalContent = store.c.legal ?? {};
  const upd = (key: keyof LegalContent, value: string) =>
    updateSection('legal', { ...legal, [key]: value });

  return (
    <>
      <PublishBar title="Rechtliches" subtitle="Impressum · AGB · Datenschutz" />

      <main className="flex-1 p-8 overflow-auto">
        <div style={{ maxWidth: '760px' }}>
          <div className="rounded-card p-4 mb-6" style={{ border: '1px solid #F0E0BC', background: '#FFFBEA' }}>
            <p className="text-sm" style={{ color: '#7A5B1E', lineHeight: 1.6 }}>
              <strong>Wichtig:</strong> Diese Texte sind rechtlich bindend. Bitte einen fertigen Text vom
              Anwalt oder einem spezialisierten Generator einfügen — für Reiseveranstalter gelten besondere
              Vorgaben (Reisebedingungen nach Pauschalreiserecht, Impressumspflicht, DSGVO). Absätze/Zeilen­umbrüche
              bleiben erhalten.
            </p>
          </div>

          <div className="space-y-6">
            {FIELDS.map(({ key, label, url, ph }) => (
              <div key={key} className="p-5 rounded-card bg-white" style={{ border: '1px solid #EAE3D8' }}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-serif text-ink" style={{ fontSize: '18px' }}>{label}</h2>
                  <a href={url} target="_blank" rel="noreferrer" className="text-xs font-mono" style={{ color: '#14617A' }}>
                    makarim.de{url} ↗
                  </a>
                </div>
                <textarea
                  value={legal[key] ?? ''}
                  onChange={(e) => upd(key, e.target.value)}
                  rows={12}
                  placeholder={ph}
                  className="w-full px-4 py-3 rounded-card text-sm text-ink bg-white resize-y"
                  style={{ border: '1px solid #E2DBCF', outline: 'none', lineHeight: 1.6 }}
                />
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
