'use client';

import { useState } from 'react';
import { useCMS } from '@/components/cms/CMSProvider';
import { PublishBar } from '@/components/cms/PublishBar';
import { Field, TextInput } from '@/components/cms/FormEditor';
import { MediaPickerModal } from '@/components/cms/MediaPickerModal';
import { Guide, TripSection } from '@/lib/content-schema';
import { slugify } from '@/lib/utils';

/** Ein Ratgeber-Artikel als aufklappbare Karte. */
function GuideCard({
  guide,
  upd,
  remove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  guide: Guide;
  upd: (patch: Partial<Guide>) => void;
  remove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const sections: TripSection[] = guide.sections ?? [];
  const updSection = (i: number, patch: Partial<TripSection>) =>
    upd({ sections: sections.map((s, j) => (j === i ? { ...s, ...patch } : s)) });
  const addSection = () => upd({ sections: [...sections, { heading: '', body: '' }] });
  const removeSection = (i: number) => upd({ sections: sections.filter((_, j) => j !== i) });

  return (
    <div className="rounded-card bg-white overflow-hidden" style={{ border: '1px solid #EAE3D8', boxShadow: '0 2px 6px rgba(40,30,20,0.04)' }}>
      {/* Kopfzeile */}
      <div className="flex items-center gap-3 px-5 py-4 cursor-pointer select-none" onClick={() => setOpen(!open)}>
        <div className="flex flex-col flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            type="button" onClick={onMoveUp} disabled={!canMoveUp} title="Nach oben"
            style={{ fontSize: '11px', lineHeight: 1, color: canMoveUp ? '#A8542F' : '#D8D1C4', background: 'none', border: 'none', cursor: canMoveUp ? 'pointer' : 'default', padding: '1px 4px' }}
          >▲</button>
          <button
            type="button" onClick={onMoveDown} disabled={!canMoveDown} title="Nach unten"
            style={{ fontSize: '11px', lineHeight: 1, color: canMoveDown ? '#A8542F' : '#D8D1C4', background: 'none', border: 'none', cursor: canMoveDown ? 'pointer' : 'default', padding: '1px 4px' }}
          >▼</button>
        </div>

        <span className="text-body-light text-sm w-4 flex-shrink-0" style={{ transform: open ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s', display: 'inline-block' }}>▶</span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-serif text-ink" style={{ fontSize: '16px' }}>{guide.title || '(ohne Titel)'}</span>
            {guide.published !== false
              ? <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#EAF0E8', color: '#3E6B52' }}>● Veröffentlicht</span>
              : <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#F6ECD9', color: '#956214' }}>Entwurf</span>}
          </div>
          <div className="font-mono text-xs text-body-light mt-0.5">makarim-reisen.de/ratgeber/{guide.slug || '…'}</div>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <label className="flex items-center gap-1.5 cursor-pointer text-xs text-body-light">
            <span>Veröffentlicht</span>
            <input type="checkbox" checked={guide.published !== false} onChange={() => upd({ published: guide.published === false })} />
          </label>
          <button onClick={remove} className="text-xs" style={{ color: '#9A9082', background: 'none', border: 'none', cursor: 'pointer' }}>Löschen</button>
        </div>
      </div>

      {/* Inhalt */}
      {open && (
        <div className="px-5 pb-6 pt-1 space-y-4" style={{ borderTop: '1px solid #F2ECE1' }}>
          <Field label="Titel" hint="Erscheint als Überschrift (H1) — z. B. „Bittgebete (Duas) für die Umrah“">
            <TextInput
              value={guide.title}
              onChange={(v) => upd({ title: v, ...(guide.slug ? {} : { slug: slugify(v) }) })}
              placeholder="Bittgebete (Duas) für die Umrah"
            />
          </Field>

          <Field label="URL (Slug)" hint="Bestimmt die Adresse. Nach Veröffentlichung möglichst nicht mehr ändern.">
            <TextInput value={guide.slug} onChange={(v) => upd({ slug: slugify(v) })} placeholder="umrah-dua" />
          </Field>

          <Field label="Teaser" hint="Kurzer Anreißer auf der Ratgeber-Übersicht (1–2 Sätze)">
            <TextInput value={guide.excerpt} onChange={(v) => upd({ excerpt: v })} multiline rows={2} placeholder="Die wichtigsten Bittgebete für jede Station deiner Umrah — mit Übersetzung." />
          </Field>

          {/* Titelbild */}
          <div>
            <p className="block font-medium text-ink mb-1.5" style={{ fontSize: '13px' }}>Titelbild <span className="text-body-light font-normal">(optional)</span></p>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 overflow-hidden flex items-center justify-center" style={{ width: '108px', height: '72px', borderRadius: '10px', border: '1px solid #E2DBCF', backgroundColor: '#F4F1EA' }}>
                {guide.image
                  ? <img src={guide.image} alt="" className="w-full h-full object-cover" />
                  : <span className="text-2xl opacity-30">📖</span>}
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setPickerOpen(true)} className="px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor: '#14617A', borderRadius: '9px', border: 'none', cursor: 'pointer' }}>
                  {guide.image ? 'Bild ändern' : 'Bild wählen'}
                </button>
                {guide.image && (
                  <button type="button" onClick={() => upd({ image: undefined })} className="px-3 py-2 text-sm font-medium" style={{ background: 'transparent', color: '#9A9082', borderRadius: '9px', border: '1px solid #E2DBCF', cursor: 'pointer' }}>
                    Entfernen
                  </button>
                )}
              </div>
            </div>
            {pickerOpen && <MediaPickerModal onSelect={(url) => { upd({ image: url }); setPickerOpen(false); }} onClose={() => setPickerOpen(false)} />}
          </div>

          <Field label="Einleitung" hint="Einleitender Absatz über dem ersten Abschnitt">
            <TextInput value={guide.intro ?? ''} onChange={(v) => upd({ intro: v })} multiline rows={4} placeholder="Die Umrah beginnt mit der Absicht…" />
          </Field>

          {/* Abschnitte */}
          <div>
            <p className="block font-medium text-ink mb-1.5" style={{ fontSize: '13px' }}>
              Abschnitte <span className="text-body-light font-normal">(werden als H2-Überschriften ausgegeben — wichtig für Google)</span>
            </p>
            <div className="space-y-3">
              {sections.map((s, i) => (
                <div key={i} className="p-4 rounded-card" style={{ border: '1px solid #EFE8DC', backgroundColor: '#FDFCF9' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs text-body-light">Abschnitt {i + 1}</span>
                    <button onClick={() => removeSection(i)} className="text-xs" style={{ color: '#9A9082', background: 'none', border: 'none', cursor: 'pointer' }}>Entfernen</button>
                  </div>
                  <div className="space-y-3">
                    <Field label="Überschrift">
                      <TextInput value={s.heading} onChange={(v) => updSection(i, { heading: v })} placeholder="Dua beim Betreten des Haram" />
                    </Field>
                    <Field label="Text">
                      <TextInput value={s.body} onChange={(v) => updSection(i, { body: v })} multiline rows={5} />
                    </Field>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={addSection}
              className="mt-3"
              style={{ width: '100%', height: '44px', fontSize: '14px', fontWeight: 500, border: '1px dashed #C9C0B1', borderRadius: '11px', background: '#FBF9F4', color: '#7C746A', cursor: 'pointer' }}
            >
              + Abschnitt hinzufügen
            </button>
          </div>

          {/* SEO */}
          <div className="pt-2" style={{ borderTop: '1px solid #F2ECE1' }}>
            <p className="block font-medium text-ink mb-3 mt-3" style={{ fontSize: '13px' }}>SEO</p>
            <div className="space-y-3">
              <Field label="SEO-Titel" hint="60–65 Zeichen. Leer lassen = Artikel-Titel wird verwendet.">
                <TextInput value={guide.seoTitle ?? ''} onChange={(v) => upd({ seoTitle: v || undefined })} placeholder={guide.title} maxLength={70} />
              </Field>
              <Field label="Meta-Beschreibung" hint="120–155 Zeichen. Leer lassen = Teaser wird verwendet.">
                <TextInput value={guide.seoDesc ?? ''} onChange={(v) => upd({ seoDesc: v || undefined })} multiline rows={2} maxLength={160} />
              </Field>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RatgeberManager() {
  const { store, updateSection } = useCMS();
  if (!store) return null;

  const guides: Guide[] = store.c.guides ?? [];

  const setGuides = (list: Guide[]) => updateSection('guides', list);

  const addGuide = () => {
    const id = `guide-${Date.now()}`;
    const neu: Guide = { id, slug: '', title: 'Neuer Ratgeber-Beitrag', excerpt: '', intro: '', sections: [], published: false };
    setGuides([...guides, neu]);
  };

  const updGuide = (id: string, patch: Partial<Guide>) =>
    setGuides(guides.map((g) => (g.id === id ? { ...g, ...patch } : g)));

  const removeGuide = (id: string) => setGuides(guides.filter((g) => g.id !== id));

  // Reihenfolge = Anzeigereihenfolge auf /ratgeber.
  const move = (id: string, dir: 'up' | 'down') => {
    const i = guides.findIndex((g) => g.id === id);
    const j = dir === 'up' ? i - 1 : i + 1;
    if (i < 0 || j < 0 || j >= guides.length) return;
    const next = guides.slice();
    [next[i], next[j]] = [next[j], next[i]];
    setGuides(next);
  };

  const draftCount = guides.filter((g) => g.published === false).length;

  return (
    <>
      <PublishBar title="Ratgeber" subtitle={`${guides.length} Beiträge${draftCount ? ` · ${draftCount} Entwurf/Entwürfe` : ''}`} />

      <main className="flex-1 p-7 overflow-auto">
        <div className="mb-5 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm text-body-light" style={{ maxWidth: '640px' }}>
            Jeder Beitrag bekommt eine eigene Adresse (z. B. <span className="font-mono">/ratgeber/umrah-dua</span>) mit eigenen SEO-Angaben —
            so wird er bei Google für genau dieses Thema gefunden.
          </p>
          <button
            onClick={addGuide}
            className="px-4 py-2 rounded-button text-sm font-medium flex-shrink-0"
            style={{ backgroundColor: '#C2724A', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            + Neuer Beitrag
          </button>
        </div>

        {guides.length === 0 ? (
          <div className="text-center py-16 rounded-card bg-white" style={{ border: '1px solid #EAE3D8' }}>
            <p className="text-body-light text-sm">Noch keine Ratgeber-Beiträge. Leg den ersten an — z. B. „Bittgebete (Duas) für die Umrah“ oder „Packliste Umrah“.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {guides.map((g, idx) => (
              <GuideCard
                key={g.id}
                guide={g}
                upd={(patch) => updGuide(g.id, patch)}
                remove={() => removeGuide(g.id)}
                onMoveUp={() => move(g.id, 'up')}
                onMoveDown={() => move(g.id, 'down')}
                canMoveUp={idx > 0}
                canMoveDown={idx < guides.length - 1}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
