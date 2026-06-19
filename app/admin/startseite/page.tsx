'use client';

import { useCMS } from '@/components/cms/CMSProvider';
import { PublishBar } from '@/components/cms/PublishBar';
import { Field, TextInput, FormSection } from '@/components/cms/FormEditor';
import { LivePreviewPane } from '@/components/cms/LivePreviewPane';
import { StartseitePreview } from '@/components/cms/previews/StartseitePreview';
import { ImageUpload } from '@/components/cms/ImageUpload';
import { HomeContent } from '@/lib/content-schema';

export default function StartseiteEditor() {
  const { store, updateSection } = useCMS();
  if (!store) return null;

  const home = store.c.home;
  const upd = (patch: Partial<HomeContent>) => updateSection('home', { ...home, ...patch });

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

        <FormSection title="Vertrauen-Karten (4 Stück)">
          {home.trust.map((card, i) => (
            <div key={i} className="flex gap-3 p-4 rounded-card bg-white" style={{ border: '1px solid #EAE3D8' }}>
              <div className="w-16">
                <Field label="Wert">
                  <TextInput
                    value={card.value}
                    onChange={(v) => {
                      const trust = home.trust.map((c, j) => j === i ? { ...c, value: v } : c);
                      upd({ trust });
                    }}
                    placeholder="15+"
                  />
                </Field>
              </div>
              <div className="flex-1">
                <Field label="Beschriftung">
                  <TextInput
                    value={card.label}
                    onChange={(v) => {
                      const trust = home.trust.map((c, j) => j === i ? { ...c, label: v } : c);
                      upd({ trust });
                    }}
                    placeholder="Jahre Erfahrung"
                  />
                </Field>
              </div>
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
