'use client';

import { useState } from 'react';
import { useCMS } from '@/components/cms/CMSProvider';
import { PublishBar } from '@/components/cms/PublishBar';
import { Field, TextInput } from '@/components/cms/FormEditor';
import { MediaPickerModal } from '@/components/cms/MediaPickerModal';
import { GalleryItem } from '@/lib/content-schema';
import { youtubeId, galleryImages } from '@/lib/utils';

function ItemCard({
  item, upd, remove, onMoveUp, onMoveDown, canMoveUp, canMoveDown,
  onDragStart, onDragEnd, onDragOverItem, onDropItem, isDragging, isDropTarget,
}: {
  item: GalleryItem;
  upd: (patch: Partial<GalleryItem>) => void;
  remove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOverItem: () => void;
  onDropItem: () => void;
  isDragging: boolean;
  isDropTarget: boolean;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const vid = item.type === 'video' ? youtubeId(item.url) : null;
  const linkOk = item.type !== 'video' || !item.url || !!vid;

  // Bilder-Album: alte Einzelbilder (url) werden transparent mitgelesen.
  const imgs = galleryImages(item);
  const setImgs = (list: string[]) => upd({ images: list, url: '' });
  const moveImg = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= imgs.length) return;
    const next = imgs.slice();
    [next[i], next[j]] = [next[j], next[i]];
    setImgs(next);
  };

  return (
    <div
      className="rounded-card bg-white p-5"
      // Ablageziel: die ganze Karte. Der Ziehgriff links ist die Ziehquelle —
      // so bleiben Textfelder normal bedienbar (kein versehentliches Ziehen).
      onDragOver={(e) => { e.preventDefault(); onDragOverItem(); }}
      onDrop={(e) => { e.preventDefault(); onDropItem(); }}
      style={{
        border: '1px solid',
        borderColor: isDropTarget ? '#C2724A' : '#EAE3D8',
        boxShadow: isDropTarget ? '0 0 0 3px rgba(194,114,74,0.15)' : '0 2px 6px rgba(40,30,20,0.04)',
        opacity: isDragging ? 0.45 : 1,
        transition: 'border-color .12s, box-shadow .12s, opacity .12s',
      }}
    >
      <div className="flex items-start gap-4">
        {/* Ziehgriff + Sortier-Pfeile */}
        <div className="flex flex-col items-center flex-shrink-0 pt-1 gap-1">
          <div
            draggable
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            title="Ziehen zum Umsortieren"
            aria-label="Ziehen zum Umsortieren"
            style={{ cursor: 'grab', color: '#B4AB9B', fontSize: '15px', lineHeight: 1, padding: '2px 4px', userSelect: 'none' }}
          >
            ⠿
          </div>
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
        <div className="relative flex-shrink-0" style={{ width: '120px', height: '80px' }}>
          <div className="w-full h-full overflow-hidden flex items-center justify-center" style={{ borderRadius: '10px', border: '1px solid #E2DBCF', backgroundColor: '#F4F1EA' }}>
            {item.type === 'video'
              ? (vid
                  ? <img src={`https://img.youtube.com/vi/${vid}/mqdefault.jpg`} alt="" className="w-full h-full object-cover" />
                  : <span className="text-2xl opacity-30">🎬</span>)
              : (imgs.length > 0
                  ? <img src={imgs[0]} alt="" className="w-full h-full object-cover" />
                  : <span className="text-2xl opacity-30">🖼️</span>)}
          </div>
          {item.type === 'image' && imgs.length > 1 && (
            <span
              className="absolute"
              style={{ bottom: '5px', right: '5px', backgroundColor: 'rgba(22,36,43,0.8)', color: '#fff', fontSize: '10.5px', fontWeight: 700, borderRadius: '20px', padding: '2px 7px' }}
            >
              {imgs.length} Bilder
            </span>
          )}
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
                  onClick={() => upd({ type: t, url: '', images: [] })}
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
              <p className="block font-medium text-ink mb-1.5" style={{ fontSize: '13px' }}>
                Bilder <span className="text-body-light font-normal">
                  ({imgs.length}){imgs.length > 1 ? ' — werden auf der Website als Slider gezeigt' : ''}
                </span>
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {imgs.map((src, i) => (
                  <div key={i} className="relative flex-shrink-0" style={{ width: '92px', height: '66px' }}>
                    <img src={src} alt="" className="w-full h-full object-cover" style={{ borderRadius: '8px', border: '1px solid #E2DBCF' }} />

                    {/* Entfernen */}
                    <button
                      type="button"
                      onClick={() => setImgs(imgs.filter((_, j) => j !== i))}
                      title="Bild entfernen"
                      aria-label="Bild entfernen"
                      className="absolute flex items-center justify-center"
                      style={{ top: '-6px', right: '-6px', width: '20px', height: '20px', borderRadius: '50%', background: '#fff', border: '1px solid #E2DBCF', color: '#9A9082', fontSize: '13px', lineHeight: 1, cursor: 'pointer', padding: 0 }}
                    >
                      ×
                    </button>

                    {/* Reihenfolge im Album */}
                    <div className="absolute flex" style={{ bottom: '3px', left: '3px', gap: '2px' }}>
                      <button
                        type="button" onClick={() => moveImg(i, -1)} disabled={i === 0} title="Nach links"
                        style={{ width: '18px', height: '18px', borderRadius: '5px', border: 'none', background: 'rgba(255,255,255,0.9)', color: i === 0 ? '#D8D1C4' : '#5A5448', fontSize: '10px', lineHeight: 1, cursor: i === 0 ? 'default' : 'pointer', padding: 0 }}
                      >◀</button>
                      <button
                        type="button" onClick={() => moveImg(i, 1)} disabled={i === imgs.length - 1} title="Nach rechts"
                        style={{ width: '18px', height: '18px', borderRadius: '5px', border: 'none', background: 'rgba(255,255,255,0.9)', color: i === imgs.length - 1 ? '#D8D1C4' : '#5A5448', fontSize: '10px', lineHeight: 1, cursor: i === imgs.length - 1 ? 'default' : 'pointer', padding: 0 }}
                      >▶</button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="flex-shrink-0 flex items-center justify-center"
                  style={{ width: '92px', height: '66px', borderRadius: '8px', border: '1px dashed #C9C0B1', background: '#FBF9F4', color: '#7C746A', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}
                >
                  + Bild
                </button>
              </div>
              {pickerOpen && (
                <MediaPickerModal
                  onSelect={(url) => { setImgs([...imgs, url]); setPickerOpen(false); }}
                  onClose={() => setPickerOpen(false)}
                />
              )}
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
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  if (!store) return null;

  const items: GalleryItem[] = store.c.gallery ?? [];
  const setItems = (list: GalleryItem[]) => updateSection('gallery', list);

  /** Element von `from` an Position `to` einfügen (echtes Verschieben, kein Tausch). */
  const reorder = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return;
    const next = items.slice();
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setItems(next);
  };

  const handleDrop = () => {
    if (dragIdx !== null && overIdx !== null) reorder(dragIdx, overIdx);
    setDragIdx(null);
    setOverIdx(null);
  };

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
          <p className="text-sm text-body-light" style={{ maxWidth: '660px' }}>
            Ein Bild-Eintrag ist ein <strong>Album</strong>: Füge mehrere Bilder zu einem Thema hinzu (z. B. „Umrah Dezember 2025“) —
            auf der Website erscheinen sie als <strong>Slider</strong> statt als viele Einzelkacheln.
            Reihenfolge der Einträge: am Griff <span style={{ color: '#7C746A' }}>⠿</span> ziehen (oder ▲▼).
            Videos werden <strong>nicht hochgeladen</strong> — YouTube-Link genügt.
          </p>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => addItem('image')} className="px-4 py-2 rounded-button text-sm font-medium" style={{ backgroundColor: '#C2724A', color: 'white', border: 'none', cursor: 'pointer' }}>
              + Bild-Album
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
                onDragStart={() => setDragIdx(idx)}
                onDragEnd={() => { setDragIdx(null); setOverIdx(null); }}
                onDragOverItem={() => setOverIdx(idx)}
                onDropItem={handleDrop}
                isDragging={dragIdx === idx}
                isDropTarget={dragIdx !== null && overIdx === idx && dragIdx !== idx}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
