'use client';

import { useState } from 'react';
import { Trip, Hotel, ProgramDay, TripSection, getAvailability, DEFAULT_INCLUDED, orderedTripSections, TRIP_SECTION_LABELS } from '@/lib/content-schema';
import { useCMS } from './CMSProvider';
import { Field, TextInput } from './FormEditor';
import { MediaPickerModal } from './MediaPickerModal';
import { tripPath } from '@/lib/utils';

interface Props {
  trip: Trip;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  /** Wird gesetzt, wenn Löschen erlaubt ist. Sicherheitsabfrage macht der Aufrufer. */
  onDelete?: () => void;
}

/** One collapsible accordion section inside a trip card (replaces the old tabs). */
function AccordionSection({ label, chip, summary, open, onToggle, children }: {
  label: string;
  chip?: React.ReactNode;
  summary?: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div style={{ borderTop: '1px solid #F2ECE1', marginTop: '16px' }}>
      <div onClick={onToggle} style={{ cursor: 'pointer', paddingTop: '14px', display: 'flex', alignItems: 'center', gap: '9px' }}>
        <span style={{ color: '#A8542F', width: '14px', fontSize: '12px', display: 'inline-block', flexShrink: 0 }}>{open ? '▾' : '▸'}</span>
        <span style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em', color: '#9A9082' }}>{label}</span>
        {chip}
        {summary && <span style={{ marginLeft: 'auto', fontSize: '11.5px', color: '#B4AB9B' }}>{summary}</span>}
      </div>
      {open && <div style={{ paddingTop: '14px' }}>{children}</div>}
    </div>
  );
}

const ChipCRM = () => (
  <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#A8542F', background: '#F0E4DC', borderRadius: '5px', padding: '3px 8px' }}>aus CRM</span>
);
const ChipOptional = () => (
  <span style={{ fontSize: '10px', color: '#A99F8D', background: '#F2ECE1', borderRadius: '5px', padding: '3px 8px' }}>optional</span>
);

/** Shared dashed "add" button (Makarim style). */
function AddButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ width: '100%', height: '44px', fontSize: '14px', fontWeight: 500, border: '1px dashed #C9C0B1', borderRadius: '11px', background: '#FBF9F4', color: '#7C746A', cursor: 'pointer' }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#C2724A'; e.currentTarget.style.color = '#A8542F'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#C9C0B1'; e.currentTarget.style.color = '#7C746A'; }}
    >
      {children}
    </button>
  );
}

const BANNER_COLORS = [
  '#C2724A', '#16242B', '#3E6B7A', '#A8542F', '#5A6B52',
  '#8A513A', '#3D88C9', '#FF751F', '#A8BB4A', '#B23232', '#6EA3AB', '#1B86A2', '#DDC385',
];

function Toggle({ checked, onChange, colorOn = '#3E6B52' }: { checked: boolean; onChange: () => void; colorOn?: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className="relative inline-flex items-center rounded-full transition-colors flex-shrink-0"
      style={{ width: '36px', height: '20px', backgroundColor: checked ? colorOn : '#D9D4CB' }}
    >
      <span
        className="inline-block rounded-full bg-white transition-transform"
        style={{ width: '14px', height: '14px', transform: checked ? 'translateX(18px)' : 'translateX(3px)' }}
      />
    </button>
  );
}

const CMS_PILL_TONE = {
  green: { bg: '#EAF0E8', color: '#3E6B52' },
  amber: { bg: '#FEF3C7', color: '#92400E' },
  red:   { bg: '#FEE2E2', color: '#991B1B' },
} as const;

function AvailBadge({ trip }: { trip: Trip }) {
  const a = getAvailability(trip);
  const c = CMS_PILL_TONE[a.tone];
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: c.bg, color: c.color }}>{a.label}</span>
  );
}

export function TripCardCMS({ trip, onMoveUp, onMoveDown, canMoveUp, canMoveDown, onDelete }: Props) {
  const { updateTrip } = useCMS();
  const showReorder = !!(onMoveUp || onMoveDown);
  const [open, setOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const isOpen = (k: string) => !!openSections[k];
  const toggleSection = (k: string) => setOpenSections((s) => ({ ...s, [k]: !s[k] }));

  const upd = (patch: Partial<Trip>) => updateTrip(trip.vg, patch);
  const updBanner = (patch: Partial<NonNullable<Trip['banner']>>) =>
    upd({ banner: { enabled: true, line1: '', line2: '', color: '#C2724A', ...trip.banner, ...patch } });

  const programLen = trip.program?.length ?? 0;
  const servicesLen = trip.services?.length ?? 0;

  return (
    <div className="rounded-card bg-white overflow-hidden" style={{ border: '1px solid #EAE3D8', boxShadow: '0 2px 6px rgba(40,30,20,0.04)' }}>
      {/* Header row */}
      <div className="flex items-center gap-3 px-5 py-4 cursor-pointer select-none" onClick={() => setOpen(!open)}>

        {/* Reorder arrows (verschiebt die Reise innerhalb ihrer Rubrik/Liste) */}
        {showReorder && (
          <div className="flex flex-col flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={onMoveUp}
              disabled={!canMoveUp}
              title="Nach oben"
              aria-label="Reise nach oben verschieben"
              style={{ fontSize: '11px', lineHeight: 1, color: canMoveUp ? '#A8542F' : '#D8D1C4', background: 'none', border: 'none', cursor: canMoveUp ? 'pointer' : 'default', padding: '1px 4px' }}
            >
              ▲
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              disabled={!canMoveDown}
              title="Nach unten"
              aria-label="Reise nach unten verschieben"
              style={{ fontSize: '11px', lineHeight: 1, color: canMoveDown ? '#A8542F' : '#D8D1C4', background: 'none', border: 'none', cursor: canMoveDown ? 'pointer' : 'default', padding: '1px 4px' }}
            >
              ▼
            </button>
          </div>
        )}

        <span className="text-body-light text-sm w-4 flex-shrink-0" style={{ transform: open ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s', display: 'inline-block' }}>▶</span>

        {/* Thumbnail */}
        <div className="flex-shrink-0 rounded overflow-hidden" style={{ width: '48px', height: '34px', backgroundColor: '#EAE3D8' }}>
          {trip.url ? (
            <img src={trip.url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-base opacity-40">{trip.heroIcon ?? '🕋'}</div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#F4F1EA', color: '#9A9082' }}>{trip.vg}</span>
            {trip.published !== false && <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#EAF0E8', color: '#3E6B52' }}>● Veröffentlicht</span>}
            {trip.published === false && <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#F6ECD9', color: '#956214' }}>Entwurf</span>}
            <span className="font-serif text-ink" style={{ fontSize: '16px' }}>{trip.title}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="font-mono text-xs text-body-light">{trip.date}</span>
            <span className="text-body-light text-xs">·</span>
            <span className="text-xs font-medium" style={{ color: '#3E6B52' }}>{trip.category}</span>
            <span className="text-body-light text-xs">·</span>
            <span className="text-xs font-medium text-ink">ab {trip.price.toLocaleString('de-DE')} €</span>
            <AvailBadge trip={trip} />
          </div>
        </div>

        {/* Toggles */}
        <div className="flex items-center gap-4 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <label className="flex items-center gap-1.5 cursor-pointer text-xs text-body-light">
            <span>Startseite</span>
            <Toggle checked={!!trip.startseite} onChange={() => upd({ startseite: !trip.startseite })} colorOn="#C2724A" />
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer text-xs text-body-light">
            <span>Veröffentlicht</span>
            <Toggle checked={trip.published !== false} onChange={() => upd({ published: trip.published === false ? true : false })} />
          </label>

          {/* Löschen — nur wo der Aufrufer es erlaubt. Die Sicherheitsabfrage
              (inkl. Warnung bei vorhandenen Buchungen) macht der Aufrufer. */}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              title="Reise endgültig aus dem CMS löschen"
              className="text-xs"
              style={{ color: '#B0563F', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px' }}
            >
              🗑 Löschen
            </button>
          )}
        </div>
      </div>

      {/* Collapsible */}
      {open && (
        <div style={{ borderTop: '1px solid #EAE3D8' }}>
          {/* Availability bar */}
          <div className="flex items-center gap-6 px-5 py-3" style={{ backgroundColor: '#FDFCF9', borderBottom: '1px solid #EAE3D8' }}>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium uppercase tracking-wide text-body-light" style={{ fontSize: '11px' }}>Verfügbare Plätze</span>
              <span className="text-sm font-semibold text-ink tabular-nums" style={{ minWidth: '28px', textAlign: 'center' }}>{trip.seats ?? 0}</span>
              <span className="text-xs text-body-light" style={{ fontStyle: 'italic' }}>vom CRM verwaltet</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium uppercase tracking-wide text-body-light" style={{ fontSize: '11px' }}>Warteliste bei 0</span>
              <Toggle checked={!!trip.waitlist} onChange={() => upd({ waitlist: !trip.waitlist })} />
              <span className="text-xs text-body-light">{trip.waitlist ? 'Warteliste' : 'Ausgebucht'}</span>
            </div>
            <p className="text-xs text-body-light ml-auto">&gt;18 = verfügbar · 1–18 = begrenzte Plätze · 0 ohne Warteliste = ausgebucht</p>
          </div>

          {/* Accordion sections (replaces the old tab bar) */}
          <div className="px-5 pb-5 pt-1">
            <AccordionSection label="Inhalt" open={isOpen('inhalt')} onToggle={() => toggleSection('inhalt')}>
              <InhaltTab trip={trip} upd={upd} updBanner={updBanner} />
            </AccordionSection>

            <AccordionSection label="Hotels" chip={<ChipCRM />} summary={`${trip.hotels?.length ?? 0} Hotels`} open={isOpen('hotels')} onToggle={() => toggleSection('hotels')}>
              <HotelsTab trip={trip} upd={upd} />
            </AccordionSection>

            <AccordionSection label="Enthaltene Leistungen" summary={servicesLen ? `${servicesLen} Leistungen` : 'Standard'} open={isOpen('leistungen')} onToggle={() => toggleSection('leistungen')}>
              <IncludedContent trip={trip} upd={upd} />
            </AccordionSection>

            <AccordionSection label="Programm" summary={programLen ? `${programLen} ${programLen === 1 ? 'Tag' : 'Tage'}` : 'Kein Programm'} open={isOpen('programm')} onToggle={() => toggleSection('programm')}>
              <ProgrammContent trip={trip} upd={upd} />
            </AccordionSection>

            <AccordionSection label="Reihenfolge der Abschnitte" summary={orderedTripSections(trip.sectionOrder).map((k) => TRIP_SECTION_LABELS[k]).join(' · ')} open={isOpen('reihenfolge')} onToggle={() => toggleSection('reihenfolge')}>
              <SectionOrderEditor trip={trip} upd={upd} />
            </AccordionSection>

            <AccordionSection label="SEO" chip={<ChipOptional />} open={isOpen('seo')} onToggle={() => toggleSection('seo')}>
              <SEOTab trip={trip} upd={upd} />
            </AccordionSection>
          </div>
        </div>
      )}
    </div>
  );
}

function InhaltTab({ trip, upd, updBanner }: { trip: Trip; upd: (p: Partial<Trip>) => void; updBanner: (p: any) => void }) {
  const banner = trip.banner;
  const [pickerOpen, setPickerOpen] = useState(false);
  const [leaderPickerOpen, setLeaderPickerOpen] = useState(false);

  // Reiseleiter: Liste. Altes Einzelfeld (leaderPhoto) wird als erstes Element
  // gelesen und beim ersten Speichern durch die Liste ersetzt.
  const leaders = trip.leaderPhotos?.length
    ? trip.leaderPhotos
    : trip.leaderPhoto ? [trip.leaderPhoto] : [];
  const setLeaders = (list: string[]) => upd({ leaderPhotos: list, leaderPhoto: undefined });

  return (
    <div className="space-y-5">
      {/* Titel — H1 auf der Reise-Seite & Name in der Übersicht.
          Hoheit: CRM führt, CMS darf übersteuern. Tippt der Admin hier etwas, wird
          titleOverride gesetzt und der CRM-Sync lässt den Titel fortan in Ruhe.
          Der Rückweg (wieder dem CRM-Namen folgen) steht direkt darunter. */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-body-dark mb-2" style={{ fontSize: '11px' }}>Titel der Reise</p>
        <input
          type="text"
          value={trip.title ?? ''}
          onChange={(e) => upd({ title: e.target.value, titleOverride: true })}
          onBlur={(e) => {
            // Leer verlassen = kein eigener Titel gewollt → zurück zum CRM-Namen.
            // Verhindert außerdem eine leere H1 auf der Reise-Seite.
            if (!e.target.value.trim()) upd({ title: trip.name ?? '', titleOverride: false });
          }}
          placeholder="z. B. Winter Umrah"
          className="w-full px-4 py-3 rounded-card text-sm text-ink bg-white"
          style={{ border: '1px solid #E2DBCF', outline: 'none' }}
        />
        {trip.titleOverride ? (
          <p className="text-xs text-body-light mt-1">
            Eigener Titel — Umbenennungen im CRM ändern ihn nicht.{' '}
            <button
              type="button"
              onClick={() => upd({ title: trip.name ?? '', titleOverride: false })}
              className="underline"
              style={{ color: '#8E6B2E', background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit' }}
            >
              ↩ wieder dem CRM-Namen folgen
            </button>
          </p>
        ) : (
          <p className="text-xs text-body-light mt-1">
            Folgt dem Reisenamen aus dem CRM{trip.name ? ` („${trip.name}")` : ''} — Umbenennungen dort erscheinen
            beim nächsten Sync automatisch hier. Sobald du den Titel änderst, gilt deiner. Die URL änderst du separat im Bereich SEO (Slug).
          </p>
        )}
      </div>

      {/* Image upload */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-body-dark mb-2" style={{ fontSize: '11px' }}>Reisebild</p>
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 overflow-hidden" style={{ width: '108px', height: '80px', borderRadius: '10px', border: '1px solid #E2DBCF', backgroundColor: '#F4F1EA' }}>
            {trip.url ? (
              <img src={trip.url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl opacity-30">{trip.heroIcon ?? '🕋'}</div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="px-4 py-2 text-sm font-medium text-white"
            style={{ backgroundColor: '#14617A', borderRadius: '9px', border: 'none', cursor: 'pointer' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0F4F63')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#14617A')}
          >
            Bild ändern
          </button>
        </div>
        {pickerOpen && <MediaPickerModal onSelect={(url) => { upd({ url }); setPickerOpen(false); }} onClose={() => setPickerOpen(false)} />}
      </div>

      {/* Reiseleiter-Fotos (freigestellt) — unten rechts auf der Reisekarte */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-body-dark mb-2" style={{ fontSize: '11px' }}>
          Reiseleiter-Fotos <span className="text-body-light normal-case tracking-normal">(optional, mehrere möglich)</span>
        </p>

        <div className="flex items-center gap-3 flex-wrap">
          {leaders.map((src, i) => (
            <div key={i} className="relative flex-shrink-0" style={{ width: '80px', height: '80px' }}>
              <div
                className="w-full h-full overflow-hidden flex items-center justify-center"
                style={{ borderRadius: '10px', border: '1px solid #E2DBCF', backgroundColor: '#F4F1EA', backgroundImage: 'linear-gradient(45deg,#E7E1D5 25%,transparent 25%,transparent 75%,#E7E1D5 75%),linear-gradient(45deg,#E7E1D5 25%,transparent 25%,transparent 75%,#E7E1D5 75%)', backgroundSize: '14px 14px', backgroundPosition: '0 0,7px 7px' }}
              >
                <img src={src} alt="" className="w-full h-full object-contain" style={{ objectPosition: 'bottom' }} />
              </div>
              <button
                type="button"
                onClick={() => setLeaders(leaders.filter((_, j) => j !== i))}
                title="Foto entfernen"
                aria-label="Foto entfernen"
                className="absolute flex items-center justify-center"
                style={{ top: '-6px', right: '-6px', width: '20px', height: '20px', borderRadius: '50%', background: '#fff', border: '1px solid #E2DBCF', color: '#9A9082', fontSize: '13px', lineHeight: 1, cursor: 'pointer', padding: 0 }}
              >
                ×
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setLeaderPickerOpen(true)}
            className="flex-shrink-0 flex items-center justify-center"
            style={{ width: '80px', height: '80px', borderRadius: '10px', border: '1px dashed #C9C0B1', background: '#FBF9F4', color: '#7C746A', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#C2724A'; e.currentTarget.style.color = '#A8542F'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#C9C0B1'; e.currentTarget.style.color = '#7C746A'; }}
          >
            + Foto
          </button>
        </div>

        <p className="text-xs text-body-light mt-2">
          Erscheinen unten rechts auf der Reisekarte (Übersicht). Bei zwei oder mehr stehen sie leicht überlappend nebeneinander. Am besten <strong>freigestellte PNGs</strong> (transparenter Hintergrund).
        </p>

        {leaderPickerOpen && (
          <MediaPickerModal
            onSelect={(url) => { setLeaders([...leaders, url]); setLeaderPickerOpen(false); }}
            onClose={() => setLeaderPickerOpen(false)}
          />
        )}
      </div>

      {/* Short text — shown on the overview card under the image */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-body-dark mb-2" style={{ fontSize: '11px' }}>Kurztext – Übersicht (unter dem Bild)</p>
        <textarea
          value={trip.description ?? ''}
          onChange={(e) => upd({ description: e.target.value })}
          rows={2}
          placeholder="Kurzer Text auf der Reisekarte unter dem Bild (ca. 1–2 Zeilen)…"
          className="w-full px-4 py-3 rounded-card text-sm text-ink bg-white resize-none"
          style={{ border: '1px solid #E2DBCF', outline: 'none' }}
        />
        <p className="text-xs text-body-light mt-1">Erscheint in der Reise-Übersicht. Wird auf der Karte auf ca. 2 Zeilen gekürzt.</p>
      </div>

      {/* Long text — shown on the opened trip detail page */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-body-dark mb-2" style={{ fontSize: '11px' }}>Langtext – Reise-Detailseite</p>
        <textarea
          value={trip.text}
          onChange={(e) => upd({ text: e.target.value })}
          rows={4}
          placeholder="Ausführlicher Text auf der geöffneten Reise-Seite…"
          className="w-full px-4 py-3 rounded-card text-sm text-ink bg-white resize-none"
          style={{ border: '1px solid #E2DBCF', outline: 'none' }}
        />
        <p className="text-xs text-body-light mt-1">
          Erscheint, wenn die Reise geöffnet wird. Tipp: <strong>*Wort*</strong> macht ein Wort fett.
        </p>
      </div>

      {/* Free heading+text sections (rendered as H2 + paragraph) */}
      <SectionsEditor trip={trip} upd={upd} />

      {/* Banner editor */}
      <div className="rounded-card p-4" style={{ border: '1px solid #EAE3D8', backgroundColor: '#FDFCF9' }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium uppercase tracking-wide text-body-dark" style={{ fontSize: '11px' }}>Balken auf dem Bild</p>
          <div className="flex items-center gap-2">
            <Toggle checked={!!banner?.enabled} onChange={() => updBanner({ enabled: !banner?.enabled })} colorOn="#C2724A" />
            <span className="text-xs text-body-light">{banner?.enabled ? 'Eingeblendet' : 'Ausgeblendet'}</span>
            {/* Live preview of banner */}
            {banner?.enabled && (
              <span className="ml-3 px-2 py-1 text-white text-xs font-bold rounded" style={{ backgroundColor: banner.color ?? '#C2724A', lineHeight: '1.2' }}>
                {banner.line1 || 'ZEILE 1'}<br />
                <span className="font-normal opacity-90 text-xs">{banner.line2 || 'Zeile 2'}</span>
              </span>
            )}
          </div>
        </div>
        {banner?.enabled && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-body-light mb-1">Zeile 1</label>
                <input
                  type="text"
                  value={banner.line1}
                  onChange={(e) => updBanner({ line1: e.target.value })}
                  placeholder="SEPTEMBER"
                  className="w-full px-3 py-2 rounded-button text-sm text-ink bg-white"
                  style={{ border: '1px solid #E2DBCF', outline: 'none' }}
                />
              </div>
              <div>
                <label className="block text-xs text-body-light mb-1">Zeile 2</label>
                <input
                  type="text"
                  value={banner.line2}
                  onChange={(e) => updBanner({ line2: e.target.value })}
                  placeholder="Umrah - Economy"
                  className="w-full px-3 py-2 rounded-button text-sm text-ink bg-white"
                  style={{ border: '1px solid #E2DBCF', outline: 'none' }}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-body-light mb-2">Farbe</label>
              <div className="flex gap-2 flex-wrap">
                {BANNER_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => updBanner({ color: c })}
                    className="rounded-full transition-transform hover:scale-110"
                    style={{
                      width: '24px', height: '24px', backgroundColor: c,
                      outline: banner.color === c ? `3px solid ${c}` : 'none',
                      outlineOffset: '2px',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Badge */}
      <Field label="Badge" hint="Optional: Bestseller, Early Bird …">
        <TextInput value={trip.badge ?? ''} onChange={(v) => upd({ badge: v || undefined })} placeholder="Bestseller" />
      </Field>
    </div>
  );
}

function HotelsTab({ trip, upd }: { trip: Trip; upd: (p: Partial<Trip>) => void }) {
  const [pickerFor, setPickerFor] = useState<number | null>(null);
  const updHotel = (i: number, patch: Partial<Hotel>) => {
    const hotels = trip.hotels.map((h, j) => j === i ? { ...h, ...patch } : h);
    upd({ hotels });
  };
  return (
    <div className="space-y-5">
      {trip.hotels.map((hotel, i) => (
        <div key={i} className="rounded-button overflow-hidden" style={{ border: '1px solid #EAE3D8' }}>
          {/* Hotel photo */}
          <div className="relative" style={{ height: '120px', backgroundColor: '#F4F1EA' }}>
            {hotel.photo ? (
              <img src={hotel.photo} alt={hotel.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span style={{ fontSize: '32px', opacity: 0.3 }}>🏨</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => setPickerFor(i)}
              className="absolute bottom-2 right-2 px-2 py-1 text-xs font-medium text-white rounded"
              style={{ backgroundColor: '#14617A', border: 'none', cursor: 'pointer' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0F4F63')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#14617A')}
            >
              Bild ändern
            </button>
          </div>
          {/* Fields */}
          <div className="p-4" style={{ backgroundColor: '#F8F5F0' }}>
            <p className="font-medium text-sm text-ink mb-3">Hotel {i + 1} – {hotel.city}</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Stadt"><TextInput value={hotel.city} onChange={(v) => updHotel(i, { city: v })} /></Field>
              <Field label="Hotelname"><TextInput value={hotel.name} onChange={(v) => updHotel(i, { name: v })} /></Field>
              <Field label="Nächte"><TextInput value={hotel.nights} onChange={(v) => updHotel(i, { nights: v })} placeholder="5 Nächte" /></Field>
              <Field label="Bewertung"><TextInput value={hotel.rating} onChange={(v) => updHotel(i, { rating: v })} placeholder="9,3" /></Field>
              <Field label="Distanz"><TextInput value={hotel.dist} onChange={(v) => updHotel(i, { dist: v })} placeholder="ca. 150 m zum Haram" /></Field>
            </div>
          </div>
        </div>
      ))}
      {pickerFor !== null && (
        <MediaPickerModal
          onSelect={(url) => { updHotel(pickerFor, { photo: url }); setPickerFor(null); }}
          onClose={() => setPickerFor(null)}
        />
      )}
    </div>
  );
}

/** Reihenfolge der Detailseiten-Blöcke (Inhalt/Leistungen/Hotels/Programm) per ↑↓. */
function SectionOrderEditor({ trip, upd }: { trip: Trip; upd: (p: Partial<Trip>) => void }) {
  const order = orderedTripSections(trip.sectionOrder);
  const move = (i: number, dir: -1 | 1) => {
    const a = [...order];
    [a[i], a[i + dir]] = [a[i + dir], a[i]];
    upd({ sectionOrder: a });
  };
  const sortBtn = (disabled: boolean): React.CSSProperties => ({
    padding: '2px 8px', fontSize: '13px', border: '1px solid #E2DBCF', borderRadius: '6px',
    backgroundColor: 'white', cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.35 : 1,
  });

  return (
    <div>
      <p className="text-xs text-body-light mb-3">So erscheinen die Abschnitte auf der Reise-Detailseite – ändere die Reihenfolge mit den Pfeilen.</p>
      <div className="space-y-2">
        {order.map((k, i) => (
          <div key={k} className="flex items-center justify-between rounded-button px-4 py-2.5" style={{ border: '1px solid #EAE3D8', backgroundColor: '#FDFCF9' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
              <span className="font-mono text-xs" style={{ color: '#9A9082' }}>{String(i + 1).padStart(2, '0')}</span>
              <span style={{ fontSize: '14px', fontWeight: 500, color: '#16242B' }}>{TRIP_SECTION_LABELS[k]}</span>
            </span>
            <div className="flex gap-1">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} style={sortBtn(i === 0)}>↑</button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === order.length - 1} style={sortBtn(i === order.length - 1)}>↓</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionsEditor({ trip, upd }: { trip: Trip; upd: (p: Partial<Trip>) => void }) {
  const sections = trip.sections ?? [];

  const set = (next: TripSection[]) => upd({ sections: next });
  const updItem = (i: number, patch: Partial<TripSection>) =>
    set(sections.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const add = () => set([...sections, { heading: '', body: '' }]);
  const remove = (i: number) => set(sections.filter((_, j) => j !== i));
  const move = (i: number, dir: -1 | 1) => {
    const a = [...sections];
    [a[i], a[i + dir]] = [a[i + dir], a[i]];
    set(a);
  };

  const sortBtn = (disabled: boolean): React.CSSProperties => ({
    padding: '2px 8px', fontSize: '13px', border: '1px solid #E2DBCF', borderRadius: '6px',
    backgroundColor: 'white', cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.35 : 1,
  });

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-body-dark mb-1" style={{ fontSize: '11px' }}>Weitere Abschnitte (Überschrift + Text)</p>
      <p className="text-xs text-body-light mb-3">Jeder Abschnitt erscheint auf der Reise-Detailseite als Zwischenüberschrift (H2) mit Text – gut für SEO. Reihenfolge = Anzeigereihenfolge.</p>

      <div className="space-y-3">
        {sections.map((s, i) => (
          <div key={i} className="rounded-button p-4" style={{ border: '1px solid #EAE3D8', backgroundColor: '#FDFCF9' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs" style={{ color: '#9A9082' }}>{String(i + 1).padStart(2, '0')}</span>
              <div className="flex gap-1">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} style={sortBtn(i === 0)}>↑</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === sections.length - 1} style={sortBtn(i === sections.length - 1)}>↓</button>
                <button type="button" onClick={() => remove(i)} style={{ padding: '2px 8px', fontSize: '13px', border: '1px solid #F0DAD3', borderRadius: '6px', backgroundColor: '#FBF4F2', color: '#B0563F', cursor: 'pointer' }}>×</button>
              </div>
            </div>
            <Field label="Überschrift">
              <TextInput value={s.heading} onChange={(v) => updItem(i, { heading: v })} placeholder="z. B. Spirituelle Begleitung" />
            </Field>
            <div className="mt-3">
              <Field label="Text">
                <TextInput value={s.body} onChange={(v) => updItem(i, { body: v })} multiline rows={3} placeholder="Text dieses Abschnitts…" />
              </Field>
            </div>
          </div>
        ))}

        <AddButton onClick={add}>+ Abschnitt hinzufügen</AddButton>
      </div>
    </div>
  );
}

function IncludedContent({ trip, upd }: { trip: Trip; upd: (p: Partial<Trip>) => void }) {
  // Trips never customized show the standard list; an explicit [] is respected.
  const services = trip.services ?? DEFAULT_INCLUDED;

  const set = (next: string[]) => upd({ services: next });
  const updItem = (i: number, val: string) => set(services.map((s, j) => (j === i ? val : s)));
  const addItem = () => set([...services, '']);
  const removeItem = (i: number) => set(services.filter((_, j) => j !== i));
  const move = (i: number, dir: -1 | 1) => {
    const a = [...services];
    [a[i], a[i + dir]] = [a[i + dir], a[i]];
    set(a);
  };

  const sortBtn = (disabled: boolean): React.CSSProperties => ({
    width: '32px', height: '32px', flexShrink: 0, border: '1px solid #E2DBCF',
    borderRadius: '8px', background: '#fff', color: '#7C746A', fontSize: '14px',
    cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.35 : 1,
  });

  return (
    <div className="space-y-2">
      <p style={{ fontSize: '12px', color: '#9A9082', lineHeight: 1.5 }}>
        Jede Zeile erscheint mit Häkchen in der Liste „Enthaltene Leistungen" auf der Reise-Detailseite. Reihenfolge = Anzeigereihenfolge (zweispaltig).
      </p>

      {services.map((service, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #EFE8DC', borderRadius: '11px', padding: '8px 10px', background: '#FBF9F4' }}>
          <span style={{ flexShrink: 0, width: '24px', height: '24px', borderRadius: '7px', background: '#EAF0E8', color: '#3E6B52', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700 }}>✓</span>
          <input
            value={service}
            onChange={(e) => updItem(i, e.target.value)}
            placeholder="Leistung…"
            style={{ flex: 1, minWidth: 0, height: '40px', border: '1px solid #E2DBCF', borderRadius: '9px', background: '#fff', padding: '0 12px', fontSize: '14px', color: '#16242B', outline: 'none' }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#C2724A')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#E2DBCF')}
          />
          <button type="button" onClick={() => move(i, -1)} disabled={i === 0} style={sortBtn(i === 0)}>↑</button>
          <button type="button" onClick={() => move(i, 1)} disabled={i === services.length - 1} style={sortBtn(i === services.length - 1)}>↓</button>
          <button type="button" onClick={() => removeItem(i)} style={{ width: '32px', height: '32px', flexShrink: 0, border: '1px solid #F0DAD3', borderRadius: '8px', background: '#FBF4F2', color: '#B0563F', fontSize: '13px', cursor: 'pointer' }}>✕</button>
        </div>
      ))}

      <AddButton onClick={addItem}>+ Leistung hinzufügen</AddButton>
    </div>
  );
}

function ProgrammContent({ trip, upd }: { trip: Trip; upd: (p: Partial<Trip>) => void }) {
  const program = trip.program ?? [];

  const addDay = () => upd({
    program: [...program, { day: `Tag ${program.length + 1}`, title: '', description: '' }],
  });

  const updDay = (i: number, patch: Partial<ProgramDay>) =>
    upd({ program: program.map((d, j) => j === i ? { ...d, ...patch } : d) });

  const removeDay = (i: number) =>
    upd({ program: program.filter((_, j) => j !== i) });

  const move = (i: number, dir: -1 | 1) => {
    const p = [...program];
    [p[i], p[i + dir]] = [p[i + dir], p[i]];
    upd({ program: p });
  };

  return (
    <div className="space-y-3">
      {program.map((day, i) => (
        <div key={i} className="rounded-button p-4" style={{ border: '1px solid #EFE8DC', backgroundColor: '#FBF9F4' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-xs" style={{ color: '#9A9082' }}>{String(i + 1).padStart(2, '0')}</span>
            <div className="flex gap-1">
              <button onClick={() => move(i, -1)} disabled={i === 0}
                style={{ width: '30px', height: '30px', fontSize: '13px', border: '1px solid #E2DBCF', borderRadius: '8px', backgroundColor: '#fff', color: '#7C746A', cursor: i === 0 ? 'default' : 'pointer', opacity: i === 0 ? 0.35 : 1 }}>↑</button>
              <button onClick={() => move(i, 1)} disabled={i === program.length - 1}
                style={{ width: '30px', height: '30px', fontSize: '13px', border: '1px solid #E2DBCF', borderRadius: '8px', backgroundColor: '#fff', color: '#7C746A', cursor: i === program.length - 1 ? 'default' : 'pointer', opacity: i === program.length - 1 ? 0.35 : 1 }}>↓</button>
              <button onClick={() => removeDay(i)}
                style={{ width: '30px', height: '30px', fontSize: '13px', border: '1px solid #F0DAD3', borderRadius: '8px', backgroundColor: '#FBF4F2', color: '#B0563F', cursor: 'pointer' }}>×</button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Field label="Tag">
              <TextInput value={String(day.day)} onChange={(v) => updDay(i, { day: v })} placeholder="Tag 1" />
            </Field>
            <Field label="Titel">
              <TextInput value={day.title} onChange={(v) => updDay(i, { title: v })} placeholder="Ankunft in Medina" />
            </Field>
          </div>
          <Field label="Text">
            <TextInput value={day.description} onChange={(v) => updDay(i, { description: v })} multiline rows={2} placeholder="Kurze Beschreibung des Tagesprogramms…" />
          </Field>
        </div>
      ))}

      <AddButton onClick={addDay}>+ Programmpunkt hinzufügen</AddButton>
    </div>
  );
}

function SEOTab({ trip, upd }: { trip: Trip; upd: (p: Partial<Trip>) => void }) {
  // Preview reflects the real fallbacks the website uses: title → trip title,
  // description → excerpt of the Langtext when no Meta-Beschreibung is set.
  const previewTitle = trip.seoTitle || trip.title;
  const previewDesc = trip.seoDesc
    || (trip.text ? (trip.text.length > 155 ? trip.text.slice(0, 155).trimEnd() + '…' : trip.text) : '');
  const previewUrl = `makarim.de${tripPath(trip)}`;

  return (
    <div className="space-y-4">
      <Field label="SEO-Titel" hint="60–65 Zeichen">
        <TextInput value={trip.seoTitle ?? ''} onChange={(v) => upd({ seoTitle: v || undefined })} placeholder={trip.title} maxLength={70} />
      </Field>
      <Field label="Meta-Beschreibung" hint="120–155 Zeichen">
        <TextInput value={trip.seoDesc ?? ''} onChange={(v) => upd({ seoDesc: v || undefined })} multiline rows={2} maxLength={160} />
      </Field>
      <Field label="Slug" hint="URL-Pfad (nicht ändern ohne Redirect)">
        <TextInput value={trip.slug} onChange={(v) => upd({ slug: v })} />
      </Field>

      {/* Google snippet preview (same look as the global SEO page) */}
      <div>
        <p className="text-xs font-medium text-body-light mb-1">Google-Vorschau</p>
        <div className="p-4 rounded-button" style={{ backgroundColor: '#F8F9FA', border: '1px solid #E2DBCF', fontFamily: 'Arial, sans-serif' }}>
          <p className="text-xs mb-0.5" style={{ color: '#202124' }}>{previewUrl}</p>
          <p className="text-base font-medium" style={{ color: '#1A0DAB', lineHeight: '1.3' }}>
            {previewTitle || <span className="text-body-light">(kein Titel)</span>}
          </p>
          <p className="text-sm mt-1" style={{ color: '#4D5156', lineHeight: '1.5' }}>
            {previewDesc || <span className="text-body-light">(keine Beschreibung)</span>}
          </p>
        </div>
      </div>
    </div>
  );
}
