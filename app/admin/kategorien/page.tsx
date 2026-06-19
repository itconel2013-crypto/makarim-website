'use client';

import React from 'react';
import { useCMS } from '@/components/cms/CMSProvider';
import { PublishBar } from '@/components/cms/PublishBar';
import { Field, TextInput } from '@/components/cms/FormEditor';
import { LivePreviewPane } from '@/components/cms/LivePreviewPane';
import { KategorienPreview } from '@/components/cms/previews/KategorienPreview';
import { MediaPickerModal } from '@/components/cms/MediaPickerModal';
import { Category } from '@/lib/content-schema';

export default function KategorienEditor() {
  const { store, updateSection } = useCMS();
  const [pickerFor, setPickerFor] = React.useState<number | null>(null);
  if (!store) return null;

  const categories = store.c.categories;

  const updCat = (i: number, patch: Partial<Category>) => {
    const updated = categories.map((c, j) => j === i ? { ...c, ...patch } : c);
    updateSection('categories', updated);
  };

  return (
    <>
      <PublishBar title="Kategorien" subtitle="Umrah · Hajj · Kulturreisen" />
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 p-8 overflow-auto">
          <div className="space-y-5">
            {categories.map((cat, i) => (
              <div
                key={cat.key}
                className="rounded-card bg-white overflow-hidden"
                style={{ border: '1px solid #EAE3D8', boxShadow: '0 2px 6px rgba(40,30,20,0.04)' }}
              >
                {/* Card header with image */}
                <div className="flex items-stretch gap-0">
                  {/* Image thumbnail */}
                  <div className="flex-shrink-0 relative" style={{ width: '120px', height: '80px', backgroundColor: '#F4F1EA' }}>
                    {cat.imageUrl ? (
                      <img src={cat.imageUrl} alt={cat.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-2xl opacity-40">{cat.icon ?? '🕋'}</span>
                      </div>
                    )}
                  </div>

                  {/* Title + change image */}
                  <div className="flex-1 px-5 py-4 flex items-center justify-between">
                    <div>
                      <p className="font-serif text-ink" style={{ fontSize: '18px' }}>{cat.title || cat.key}</p>
                      <p className="text-xs text-body-light mt-0.5">{cat.description?.slice(0, 60)}{cat.description?.length > 60 ? '…' : ''}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPickerFor(i)}
                      className="px-3 py-1.5 rounded-button text-xs font-medium text-white"
                      style={{ backgroundColor: '#16242B', border: 'none', cursor: 'pointer' }}
                    >
                      Bild wählen
                    </button>
                  </div>
                </div>

                {/* Fields */}
                <div className="px-5 pb-5 pt-4 space-y-4" style={{ borderTop: '1px solid #EAE3D8' }}>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Titel">
                      <TextInput value={cat.title} onChange={(v) => updCat(i, { title: v, name: v })} />
                    </Field>
                    <Field label="Beschreibung" hint="Für Kategorie-Karte">
                      <TextInput value={cat.description} onChange={(v) => updCat(i, { description: v })} />
                    </Field>
                  </div>
                  <Field label="Langer Text" hint="Lead-Text auf der Kategorie-Seite">
                    <TextInput value={cat.text} onChange={(v) => updCat(i, { text: v })} multiline rows={2} />
                  </Field>
                </div>
              </div>
            ))}
          </div>
        </main>
        <LivePreviewPane url="makarim-reisen.de/#kategorien" fill noScale>
          <KategorienPreview />
        </LivePreviewPane>
      </div>

      {pickerFor !== null && (
        <MediaPickerModal
          onSelect={(url) => { updCat(pickerFor, { imageUrl: url }); setPickerFor(null); }}
          onClose={() => setPickerFor(null)}
        />
      )}
    </>
  );
}
