'use client';

import { useState } from 'react';
import { useCMS } from '@/components/cms/CMSProvider';
import { PublishBar } from '@/components/cms/PublishBar';
import { Field, TextInput } from '@/components/cms/FormEditor';
import { FAQ } from '@/lib/content-schema';

function FaqCard({
  item, idx, total, upd, remove, onMoveUp, onMoveDown,
  onDragStart, onDragEnd, onDragOverItem, onDropItem, isDragging, isDropTarget,
}: {
  item: FAQ;
  idx: number;
  total: number;
  upd: (patch: Partial<FAQ>) => void;
  remove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOverItem: () => void;
  onDropItem: () => void;
  isDragging: boolean;
  isDropTarget: boolean;
}) {
  const isHeading = item.heading !== undefined;

  return (
    <div
      className="rounded-card bg-white p-4"
      onDragOver={(e) => { e.preventDefault(); onDragOverItem(); }}
      onDrop={(e) => { e.preventDefault(); onDropItem(); }}
      style={{
        border: '1px solid',
        borderColor: isDropTarget ? '#C2724A' : (isHeading ? '#E4D9C2' : '#EAE3D8'),
        background: isHeading ? '#FBF6EC' : 'white',
        boxShadow: isDropTarget ? '0 0 0 3px rgba(194,114,74,0.15)' : 'none',
        opacity: isDragging ? 0.45 : 1,
        transition: 'border-color .12s, box-shadow .12s, opacity .12s',
      }}
    >
      <div className="flex items-start gap-3">
        {/* Ziehgriff + Pfeile */}
        <div className="flex flex-col items-center flex-shrink-0 pt-1 gap-1">
          <div
            draggable
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            title="Ziehen zum Sortieren"
            style={{ cursor: 'grab', color: '#B4AB9B', fontSize: '15px', lineHeight: 1, padding: '2px 4px', userSelect: 'none' }}
          >
            ⠿
          </div>
          <button type="button" onClick={onMoveUp} disabled={idx === 0} title="Nach oben"
            style={{ fontSize: '11px', lineHeight: 1, color: idx === 0 ? '#D8D1C4' : '#A8542F', background: 'none', border: 'none', cursor: idx === 0 ? 'default' : 'pointer', padding: '1px 4px' }}>▲</button>
          <button type="button" onClick={onMoveDown} disabled={idx === total - 1} title="Nach unten"
            style={{ fontSize: '11px', lineHeight: 1, color: idx === total - 1 ? '#D8D1C4' : '#A8542F', background: 'none', border: 'none', cursor: idx === total - 1 ? 'default' : 'pointer', padding: '1px 4px' }}>▼</button>
        </div>

        {/* Inhalt */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs" style={{ color: isHeading ? '#A8542F' : '#9A9082' }}>
              {isHeading ? 'ÜBERSCHRIFT' : `Frage ${'•'}`}
            </span>
            <button onClick={remove} className="text-xs" style={{ color: '#9A9082', background: 'none', border: 'none', cursor: 'pointer' }}>Entfernen</button>
          </div>

          {isHeading ? (
            <input
              type="text"
              value={item.heading ?? ''}
              onChange={(e) => upd({ heading: e.target.value })}
              placeholder="z. B. Zahlung & Stornierung"
              className="w-full px-4 py-2.5 rounded-button text-ink bg-white font-serif"
              style={{ border: '1px solid #E2DBCF', outline: 'none', fontSize: '17px' }}
            />
          ) : (
            <div className="space-y-3">
              <Field label="Frage">
                <TextInput value={item.q} onChange={(v) => upd({ q: v })} placeholder="Wer kann teilnehmen?" />
              </Field>
              <Field label="Antwort">
                <TextInput value={item.a} onChange={(v) => upd({ a: v })} multiline rows={3} />
              </Field>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FAQEditor() {
  const { store, updateSection } = useCMS();
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  if (!store) return null;

  const faq: FAQ[] = store.c.faq;
  const setFaq = (list: FAQ[]) => updateSection('faq', list);

  const updItem = (i: number, patch: Partial<FAQ>) => setFaq(faq.map((f, j) => (j === i ? { ...f, ...patch } : f)));
  const addQuestion = () => setFaq([...faq, { q: '', a: '' }]);
  const addHeading = () => setFaq([...faq, { q: '', a: '', heading: '' }]);
  const removeItem = (i: number) => setFaq(faq.filter((_, j) => j !== i));

  /** Eintrag von `from` an Position `to` verschieben (echtes Einfügen, kein Tausch). */
  const reorder = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= faq.length || to >= faq.length) return;
    const next = faq.slice();
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setFaq(next);
  };
  const move = (i: number, dir: 'up' | 'down') => reorder(i, dir === 'up' ? i - 1 : i + 1);
  const handleDrop = () => {
    if (dragIdx !== null && overIdx !== null) reorder(dragIdx, overIdx);
    setDragIdx(null);
    setOverIdx(null);
  };

  return (
    <>
      <PublishBar title="FAQ" subtitle="Fragen & thematische Überschriften" />

      <main className="flex-1 p-7 overflow-auto">
        <div style={{ maxWidth: '760px' }}>
          <p className="text-sm text-body-light mb-5">
            Reihenfolge frei änderbar: am Griff <span style={{ color: '#7C746A' }}>⠿</span> ziehen (oder ▲▼).
            Mit <strong>Zwischenüberschriften</strong> gruppierst du die Fragen thematisch (z. B. „Umrah", „Zahlung").
          </p>

          {faq.length === 0 ? (
            <div className="text-center py-16 rounded-card bg-white" style={{ border: '1px solid #EAE3D8' }}>
              <p className="text-body-light text-sm">Noch keine Einträge. Füge die erste Frage oder eine Überschrift hinzu.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {faq.map((item, i) => (
                <FaqCard
                  key={i}
                  item={item}
                  idx={i}
                  total={faq.length}
                  upd={(patch) => updItem(i, patch)}
                  remove={() => removeItem(i)}
                  onMoveUp={() => move(i, 'up')}
                  onMoveDown={() => move(i, 'down')}
                  onDragStart={() => setDragIdx(i)}
                  onDragEnd={() => { setDragIdx(null); setOverIdx(null); }}
                  onDragOverItem={() => setOverIdx(i)}
                  onDropItem={handleDrop}
                  isDragging={dragIdx === i}
                  isDropTarget={dragIdx !== null && overIdx === i && dragIdx !== i}
                />
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={addQuestion}
              style={{ padding: '10px 16px', fontSize: '14px', fontWeight: 500, border: '1px dashed #C9C0B1', borderRadius: '10px', background: '#FBF9F4', color: '#7C746A', cursor: 'pointer' }}
            >
              + Frage
            </button>
            <button
              onClick={addHeading}
              style={{ padding: '10px 16px', fontSize: '14px', fontWeight: 500, border: '1px dashed #D8C7A6', borderRadius: '10px', background: '#FBF6EC', color: '#A8542F', cursor: 'pointer' }}
            >
              + Zwischenüberschrift
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
