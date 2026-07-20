'use client';

import { useCMS } from '@/components/cms/CMSProvider';
import { PublishBar } from '@/components/cms/PublishBar';
import { Field, TextInput, FormSection } from '@/components/cms/FormEditor';
import { ImageUpload } from '@/components/cms/ImageUpload';
import { LivePreviewPane } from '@/components/cms/LivePreviewPane';
import { UeberUnsPreview } from '@/components/cms/previews/UeberUnsPreview';
import { AboutContent, AboutTile } from '@/lib/content-schema';

export default function UeberUnsEditor() {
  const { store, updateSection } = useCMS();
  if (!store) return null;

  const about = store.c.about;
  const upd = (patch: Partial<AboutContent>) => updateSection('about', { ...about, ...patch });

  return (
    <>
      <PublishBar title="Über uns" subtitle="Intro, Warum Makarim, Kacheln" />
      <div className="flex flex-1 overflow-hidden">
      <main className="flex-1 overflow-auto p-8">
        <div style={{ maxWidth: '560px' }}>

        <FormSection title="Bilder">
          <Field label="Bild 1 (Haupt-Foto)">
            <ImageUpload value={about.url} onChange={(v) => upd({ url: v })} />
          </Field>
          <Field label="Bild 2 (zweites Foto)">
            <ImageUpload value={about.url2} onChange={(v) => upd({ url2: v })} />
          </Field>
        </FormSection>

        <FormSection title="Einleitung">
          <Field label="Hauptüberschrift">
            <TextInput value={about.title} onChange={(v) => upd({ title: v })} />
          </Field>
          <Field label="Fließtext">
            <TextInput value={about.body} onChange={(v) => upd({ body: v })} multiline rows={4} />
          </Field>
        </FormSection>

        <FormSection title="Warum Makarim?">
          <Field label="Abschnittstitel">
            <TextInput value={about.whyTitle} onChange={(v) => upd({ whyTitle: v })} />
          </Field>
          <Field label="Einleitungstext">
            <TextInput value={about.whyBody} onChange={(v) => upd({ whyBody: v })} multiline rows={3} />
          </Field>
        </FormSection>

        <FormSection title="Kacheln (4 Stück)">
          {about.tiles.map((tile, i) => (
            <div key={i} className="flex gap-3 p-4 rounded-card bg-white" style={{ border: '1px solid #EAE3D8' }}>
              <div className="flex-1 space-y-3">
                <Field label={`Kachel ${i + 1} — Titel`}>
                  <TextInput
                    value={tile.t}
                    onChange={(v) => {
                      const tiles = about.tiles.map((t, j): AboutTile => j === i ? { ...t, t: v } : t);
                      upd({ tiles });
                    }}
                  />
                </Field>
                <Field label="Text">
                  <TextInput
                    value={tile.b}
                    onChange={(v) => {
                      const tiles = about.tiles.map((t, j): AboutTile => j === i ? { ...t, b: v } : t);
                      upd({ tiles });
                    }}
                    multiline rows={2}
                  />
                </Field>
              </div>
            </div>
          ))}
        </FormSection>

        </div>
      </main>
      <LivePreviewPane url="makarim.de/ueber-uns" fill noScale>
        <UeberUnsPreview />
      </LivePreviewPane>
      </div>
    </>
  );
}
