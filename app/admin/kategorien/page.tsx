'use client';

import { useCMS } from '@/components/cms/CMSProvider';
import { PublishBar } from '@/components/cms/PublishBar';
import { Field, TextInput, FormSection } from '@/components/cms/FormEditor';
import { LivePreviewPane } from '@/components/cms/LivePreviewPane';
import { KategorienPreview } from '@/components/cms/previews/KategorienPreview';
import { Category } from '@/lib/content-schema';

export default function KategorienEditor() {
  const { store, updateSection } = useCMS();
  if (!store) return null;

  const categories = store.c.categories;

  const updCat = (i: number, patch: Partial<Category>) => {
    const updated = categories.map((c, j) => j === i ? { ...c, ...patch } : c);
    updateSection('categories', updated);
  };

  return (
    <>
      <PublishBar title="Kategorien" subtitle="Umrah, Hajj, Kulturreisen" />
      <div className="flex flex-1 overflow-hidden">
      <main className="flex-1 p-8 overflow-auto" style={{ maxWidth: '640px' }}>
        {categories.map((cat, i) => (
          <FormSection key={cat.key} title={cat.title || cat.key}>
            <Field label="Anzeigename">
              <TextInput value={cat.title} onChange={(v) => updCat(i, { title: v, name: v })} />
            </Field>
            <Field label="Kurzbeschreibung" hint="Für Kategorie-Karte auf der Startseite">
              <TextInput value={cat.description} onChange={(v) => updCat(i, { description: v })} multiline rows={2} />
            </Field>
            <Field label="Langer Text" hint="Erscheint als Lead-Text auf der Kategorie-Seite">
              <TextInput value={cat.text} onChange={(v) => updCat(i, { text: v })} multiline rows={3} />
            </Field>
          </FormSection>
        ))}
      </main>
      <LivePreviewPane url="makarim-reisen.de/#kategorien">
        <KategorienPreview />
      </LivePreviewPane>
      </div>
    </>
  );
}
