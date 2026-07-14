'use client';

import { useCMS } from '@/components/cms/CMSProvider';
import { PublishBar } from '@/components/cms/PublishBar';
import { Field, TextInput, FormSection } from '@/components/cms/FormEditor';
import { SEOConfig } from '@/lib/content-schema';

const pageKeys: Array<{ key: keyof SEOConfig; label: string; slug: string }> = [
  { key: 'home',    label: 'Startseite',    slug: 'makarim-reisen.de' },
  { key: 'umrah',   label: 'Umrah',         slug: '/umrah-reisen' },
  { key: 'hajj',    label: 'Hajj',          slug: '/hajj-reisen' },
  { key: 'kultur',  label: 'Kulturreisen',  slug: '/kulturreisen' },
  { key: 'about',   label: 'Über uns',      slug: '/ueber-uns' },
];

function SERPPreview({ title, desc, slug }: { title: string; desc: string; slug: string }) {
  return (
    <div
      className="p-4 rounded-button mt-3"
      style={{ backgroundColor: '#F8F9FA', border: '1px solid #E2DBCF', fontFamily: 'Arial, sans-serif' }}
    >
      <p className="text-xs mb-0.5" style={{ color: '#202124' }}>{slug}</p>
      <p className="text-base font-medium" style={{ color: '#1A0DAB', lineHeight: '1.3' }}>
        {title || <span className="text-body-light">(kein Titel)</span>}
      </p>
      <p className="text-sm mt-1" style={{ color: '#4D5156', lineHeight: '1.5' }}>
        {desc || <span className="text-body-light">(keine Beschreibung)</span>}
      </p>
    </div>
  );
}

export default function SEOEditor() {
  const { store, updateSection } = useCMS();
  if (!store) return null;

  const seo = store.c.seo;
  const updSeo = (patch: Partial<SEOConfig>) => updateSection('seo', { ...seo, ...patch });

  return (
    <>
      <PublishBar title="SEO" subtitle="Seiten-Titel und Beschreibungen" />
      <main className="flex-1 p-8 overflow-auto max-w-2xl">

        <FormSection title="Allgemein">
          <Field label="Website-Name">
            <TextInput value={seo.siteName} onChange={(v) => updSeo({ siteName: v })} />
          </Field>
          <Field label="Standard-Meta-Beschreibung" hint="Fallback wenn keine seitenspezifische gesetzt">
            <TextInput value={seo.defaultDesc} onChange={(v) => updSeo({ defaultDesc: v })} multiline rows={2} maxLength={160} />
          </Field>
        </FormSection>

        {pageKeys.map(({ key, label, slug }) => {
          const page = (seo[key] as { title: string; desc: string } | undefined) ?? { title: '', desc: '' };
          const updPage = (patch: { title?: string; desc?: string }) =>
            updSeo({ [key]: { ...page, ...patch } });

          return (
            <FormSection key={key} title={label}>
              <Field label="SEO-Titel" hint="60–65 Zeichen empfohlen">
                <TextInput
                  value={page.title}
                  onChange={(v) => updPage({ title: v })}
                  maxLength={70}
                  placeholder={`${label} — ${seo.siteName}`}
                />
              </Field>
              <Field label="Meta-Beschreibung" hint="120–155 Zeichen empfohlen">
                <TextInput
                  value={page.desc}
                  onChange={(v) => updPage({ desc: v })}
                  multiline rows={2}
                  maxLength={160}
                />
              </Field>
              <SERPPreview title={page.title} desc={page.desc} slug={slug} />
            </FormSection>
          );
        })}

      </main>
    </>
  );
}
