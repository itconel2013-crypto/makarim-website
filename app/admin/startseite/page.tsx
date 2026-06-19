'use client';

import { useCMS } from '@/components/cms/CMSProvider';
import { PublishBar } from '@/components/cms/PublishBar';
import { Field, TextInput, FormSection } from '@/components/cms/FormEditor';
import { LivePreviewPane } from '@/components/cms/LivePreviewPane';
import { StartseitePreview } from '@/components/cms/previews/StartseitePreview';
import { ImageUpload } from '@/components/cms/ImageUpload';
import { HomeContent, FeaturedSection } from '@/lib/content-schema';

export default function StartseiteEditor() {
  const { store, updateSection } = useCMS();
  if (!store) return null;

  const home = store.c.home;
  const upd = (patch: Partial<HomeContent>) => updateSection('home', { ...home, ...patch });

  const fs: FeaturedSection = home.featuredSection ?? {
    kicker: 'Aktuelle Termine',
    title: 'Unsere Umrah Reisen',
    linkText: 'Alle Reisen ansehen →',
    linkUrl: '/umrah',
  };
  const updFs = (patch: Partial<FeaturedSection>) => upd({ featuredSection: { ...fs, ...patch } });

  return (
    <>
      <PublishBar title="Startseite" subtitle="Hero, Trust-Karten, CTA" />
      <div className="flex flex-1 overflow-hidden">
      <main className="flex-1 p-8 overflow-auto" style={{ maxWidth: '640px' }}>

        <FormSection title="Hero-Bereich">
          <Field label="Kicker" hint="Kleine Schrift über der Überschrift">
            <TextInput value={home.kicker} onChange={(v) => upd({ kicker: v })} placeholder="PILGERREISEN MIT SEELE" />
          </Field>
          <Field label="Hauptüberschrift">
            <TextInput value={home.headline} onChange={(v) => upd({ headline: v })} />
          </Field>
          <Field label="Unterzeile">
            <TextInput value={home.sub} onChange={(v) => upd({ sub: v })} multiline rows={2} />
          </Field>
          <Field label="Primär-Button">
            <TextInput value={home.btnP} onChange={(v) => upd({ btnP: v })} placeholder="Reisen entdecken" />
          </Field>
          <Field label="Sekundär-Button">
            <TextInput value={home.btnS} onChange={(v) => upd({ btnS: v })} placeholder="Mehr erfahren" />
          </Field>
          <Field label="Hero-Bild">
            <ImageUpload
              value={home.heroUrl}
              onChange={(v) => upd({ heroUrl: v })}
            />
          </Field>
        </FormSection>

        <FormSection title="Reisen-Sektion (Startseite)">
          <Field label="Kicker" hint="Kleiner Text über der Überschrift">
            <TextInput value={fs.kicker} onChange={(v) => updFs({ kicker: v })} placeholder="Aktuelle Termine" />
          </Field>
          <Field label="Überschrift">
            <TextInput value={fs.title} onChange={(v) => updFs({ title: v })} placeholder="Unsere Umrah Reisen" />
          </Field>
          <Field label="Link-Text (rechts)">
            <TextInput value={fs.linkText} onChange={(v) => updFs({ linkText: v })} placeholder="Alle Reisen ansehen →" />
          </Field>
          <Field label="Link-Ziel">
            <TextInput value={fs.linkUrl} onChange={(v) => updFs({ linkUrl: v })} placeholder="/umrah" />
          </Field>
        </FormSection>

        <FormSection title="Vier Gründe (Trust-Karten)">
          {home.trust.map((card, i) => (
            <div key={i} className="p-4 rounded-card bg-white space-y-3" style={{ border: '1px solid #EAE3D8' }}>
              <p className="font-mono text-xs text-body-light">{String(i + 1).padStart(2, '0')}</p>
              <Field label="Titel">
                <TextInput
                  value={card.value}
                  onChange={(v) => {
                    const trust = home.trust.map((c, j) => j === i ? { ...c, value: v } : c);
                    upd({ trust });
                  }}
                  placeholder="Rundum-Sorglos-Paket"
                />
              </Field>
              <Field label="Beschreibung">
                <TextInput
                  value={card.label}
                  onChange={(v) => {
                    const trust = home.trust.map((c, j) => j === i ? { ...c, label: v } : c);
                    upd({ trust });
                  }}
                  multiline
                  rows={2}
                  placeholder="Kurze Beschreibung des Grundes…"
                />
              </Field>
            </div>
          ))}
        </FormSection>

      </main>
      <LivePreviewPane url="makarim-reisen.de">
        <StartseitePreview />
      </LivePreviewPane>
      </div>
    </>
  );
}
