'use client';

import { useState } from 'react';
import { useCMS } from '@/components/cms/CMSProvider';
import { PublishBar } from '@/components/cms/PublishBar';
import { Field, TextInput } from '@/components/cms/FormEditor';
import { MediaPickerModal } from '@/components/cms/MediaPickerModal';
import { GalleryItem } from '@/lib/content-schema';
import { youtubeId } from '@/lib/utils';

function ItemCard({
  item, upd, remove, onMoveUp, onMoveDown, canMoveUp, canMoveDown,
}: {
  item: GalleryItem;
  upd: (patch: Partial<GalleryItem>) => void;
  remove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const vid = item.type === 'video' ? youtubeId(item.url) : null;
  const linkOk = item.type !== 'video' || !item.url || !!vid;

  return (
    <div className="rounded-card bg-white p-5" style={{ border: '1px solid #EAE3D8', boxShadow: '0 2px 6px rgba(40,30,20,0.04)' }}>
      <div className="flex items-start gap-4">
        {/* Sortier-Pfeile */}
        <div className="flex flex-col flex-shrink-0 pt-1">
          <button
            type="button" onClick={onMoveUp} disabled={!canMoveUp} title="Nach oben"
            style={{ fontSize: '11px', lineHeight: 1, color: canMoveUp ? '#A8542F' : '#D8D1C4', background: 'none', border: 'none', cursor: canMoveUp ? 'pointer' : 'default', padding: '1px 4px' }}
          >▲</button>
          <button
            type="button" onClick={onMoveDown} disabled={!canMoveDown} title="Nach unten"
            style={{ fontSize: '11px', lineHeight: 1, color: canMoveDown ? '#A8542F' : '#D8D1C4', background: 'none', border: 'none', cursor: canMoveDown ? 'pointer' : 'default', padding: '1px 4px' }}
          >▼</button>
        </div>

        {/* Vorschau */}
        <div className="flex-shrink-0 overflow-hidden flex items-center justify-center" style={{ width: '120px', height: '80px', borderRadius: '10px', border: '1px solid #E2DBCF', backgroundColor: '#F4F1EA' }}>
          {item.type === 'video'
            ? (vid
                ? <img src={`https://img.youtube.com/vi/${vid}/mqdefault.jpg`} alt="" className="w-full h-full object-cover" />
                : <span className="text-2xl opacity-30">🎬</span>)
            : (item.url
                ? <img src={item.url} alt="" className="w-full h-full object-cover" />
                : <span className="text-2xl opacity-30">🖼️</span>)}
        </div>

        {/* Felder */}
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Typ */}
            <div className="flex items-center gap-2">
              {(['image', 'video'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => upd({ type: t, url: '' })}
                  className="px-3 py-1.5 rounded-button text-xs font-medium"
                  style={{
                    backgroundColor: item.type === t ? '#16242B' : 'white',
                    color: item.type === t ? 'white' : '#5A5448',
                    border: '1px solid', borderColor: item.type === t ? '#16242B' : '#E2DBCF', cursor: 'pointer',
                  }}
                >
                  {t === 'image' ? '🖼️ Bild' : '🎬 Video'}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-1.5 cursor-pointer text-xs text-body-light ml-auto">
              <span>Veröffentlicht</span>
              <input type="checkbox" checked={item.published !== false} onChange={() => upd({ published: item.published === false })} />
            </label>
            <button onClick={remove} className="text-xs" style={{ color: '#9A9082', background: 'none', border: 'none', cursor: 'pointer' }}>Löschen</button>
          </div>

          {item.type === 'video' ? (
            <Field label="YouTube-Link" hint="Link aus der Adresszeile einfügen — z. B. https://www.youtube.com/watch?v=…">
              <TextInput value={item.url} onChange={(v) => upd({ url: v })} placeholder="https://www.youtube.com/watch?v=..." />
            </Field>
          ) : (
            <div>
              <p className="block font-medium text-ink mb-1.5" style={{ fontSize: '13px' }}>Bild</p>
              <button type="button" onClick={() => setPickerOpen(true)} className="px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor: '#14617A', borderRadius: '9px', border: 'none', cursor: 'pointer' }}>
                {item.url ? 'Bild ändern' : 'Bild wählen'}
              </button>
              {pickerOpen && <MediaPickerModal onSelect={(url) => { upd({ url }); setPickerOpen(false); }} onClose={() => setPickerOpen(false)} />}
            </div>
          )}

          {!linkOk && (
            <p className="text-xs" style={{ color: '#991B1B' }}>
              Dieser Link wird nicht als YouTube-Video erkannt — bitte den Link direkt aus der YouTube-Adresszeile kopieren.
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Titel (optional)">
              <TextInput value={item.title ?? ''} onChange={(v) => upd({ title: v || undefined })} placeholder="Umrah Dezember 2025" />
            </Field>
            <Field label="Bildunterschrift (optional)">
              <TextInput value={item.caption ?? ''} onChange={(v) => upd({ caption: v || undefined })} placeholder="Unsere Gruppe vor der Kaaba" />
            </Field>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GalerieManager() {
  const { store, updateSection } = useCMS();
  if (!store) return null;

  const items: GalleryItem[] = store.c.gallery ?? [];
  const setItems = (list: GalleryItem[]) => updateSection('gallery', list);

  const addItem = (type: 'image' | 'video') =>
    setItems([...items, { id: `gal-${Date.now()}`, type, url: '', published: false }]);

  const updItem = (id: string, patch: Partial<GalleryItem>) =>
    setItems(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const removeItem = (id: string) => setItems(items.filter((i) => i.id !== id));

  const move = (id: string, dir: 'up' | 'down') => {
    const i = items.findIndex((x) => x.id === id);
    const j = dir === 'up' ? i - 1 : i + 1;
    if (i < 0 || j < 0 || j >= items.length) return;
    const next = items.slice();
    [next[i], next[j]] = [next[j], next[i]];
    setItems(next);
  };

  const draftCount = items.filter((i) => i.published === false).length;

  return (
    <>
      <PublishBar title="Galerie" subtitle={`${items.length} Einträge${draftCount ? ` · ${draftCount} Entwurf/Entwürfe` : ''}`} />

      <main className="flex-1 p-7 overflow-auto">
        <div className="mb-5 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm text-body-light" style={{ maxWidth: '640px' }}>
            Bilder kommen aus der Mediathek. Videos werden <strong>nicht hochgeladen</strong> — lade sie bei YouTube hoch
            und füge hier nur den Link ein (spart Speicher und lädt schneller).
          </p>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => addItem('image')} className="px-4 py-2 rounded-button text-sm font-medium" style={{ backgroundColor: '#C2724A', color: 'white', border: 'none', cursor: 'pointer' }}>
              + Bild
            </button>
            <button onClick={() => addItem('video')} className="px-4 py-2 rounded-button text-sm font-medium" style={{ backgroundColor: '#16242B', color: 'white', border: 'none', cursor: 'pointer' }}>
              + Video
            </button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16 rounded-card bg-white" style={{ border: '1px solid #EAE3D8' }}>
            <p className="text-body-light text-sm">Noch keine Einträge. Füge das erste Bild oder Video hinzu.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, idx) => (
              <ItemCard
                key={item.id}
                item={item}
                upd={(patch) => updItem(item.id, patch)}
                remove={() => removeItem(item.id)}
                onMoveUp={() => move(item.id, 'up')}
                onMoveDown={() => move(item.id, 'down')}
                canMoveUp={idx > 0}
                canMoveDown={idx < items.length - 1}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
