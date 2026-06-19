'use client';

import { useState } from 'react';
import { Trip, Hotel, deriveStatus } from '@/lib/content-schema';
import { useCMS } from './CMSProvider';
import { Field, TextInput } from './FormEditor';

interface Props { trip: Trip; }
type TabKey = 'inhalt' | 'hotels' | 'seo';

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

function AvailBadge({ trip }: { trip: Trip }) {
  const status = deriveStatus(trip);
  if (status === 'ausgebucht') return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>ausgebucht</span>
  );
  if (status === 'ausgebucht (Warteliste)') return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>Warteliste</span>
  );
  if (status === 'begrenzte Plätze') return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>noch {trip.seats} Plätze</span>
  );
  return null;
}

export function TripCardCMS({ trip }: Props) {
  const { updateTrip } = useCMS();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<TabKey>('inhalt');

  const upd = (patch: Partial<Trip>) => updateTrip(trip.vg, patch);
  const updBanner = (patch: Partial<NonNullable<Trip['banner']>>) =>
    upd({ banner: { enabled: true, line1: '', line2: '', color: '#C2724A', ...trip.banner, ...patch } });

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: 'inhalt', label: 'Inhalt' },
    { key: 'hotels', label: 'Hotels' },
    { key: 'seo',    label: 'SEO' },
  ];

  return (
    <div className="rounded-card bg-white overflow-hidden" style={{ border: '1px solid #EAE3D8', boxShadow: '0 2px 6px rgba(40,30,20,0.04)' }}>
      {/* Header row */}
      <div className="flex items-center gap-3 px-5 py-4 cursor-pointer select-none" onClick={() => setOpen(!open)}>
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
        </div>
      </div>

      {/* Collapsible */}
      {open && (
        <div style={{ borderTop: '1px solid #EAE3D8' }}>
          {/* Availability bar */}
          <div className="flex items-center gap-6 px-5 py-3" style={{ backgroundColor: '#FDFCF9', borderBottom: '1px solid #EAE3D8' }}>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium uppercase tracking-wide text-body-light" style={{ fontSize: '11px' }}>Verfügbare Plätze</span>
              <input
                type="number"
                min={0}
                value={trip.seats}
                onChange={(e) => upd({ seats: Number(e.target.value) })}
                className="w-16 px-2 py-1 rounded text-sm text-ink text-center tabular-nums"
                style={{ border: '1px solid #E2DBCF', outline: 'none' }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium uppercase tracking-wide text-body-light" style={{ fontSize: '11px' }}>Warteliste bei 0</span>
              <Toggle checked={!!trip.waitlist} onChange={() => upd({ waitlist: !trip.waitlist })} />
              <span className="text-xs text-body-light">{trip.waitlist ? 'Warteliste' : 'Ausgebucht'}</span>
            </div>
            <p className="text-xs text-body-light ml-auto">&gt;18 = verfügbar · 1–18 = begrenzte Plätze · 0 ohne Warteliste = ausgebucht</p>
          </div>

          {/* Tabs */}
          <div className="flex px-5 gap-1 pt-3" style={{ borderBottom: '1px solid #EAE3D8' }}>
            {tabs.map(({ key, label }) => (
              <button key={key} onClick={() => setTab(key)}
                className="px-4 py-2 text-sm font-medium transition-colors"
                style={{ color: tab === key ? '#C2724A' : '#9A9082', borderBottom: tab === key ? '2px solid #C2724A' : '2px solid transparent', marginBottom: '-1px' }}
              >{label}</button>
            ))}
          </div>

          <div className="p-5 space-y-5">
            {tab === 'inhalt' && <InhaltTab trip={trip} upd={upd} updBanner={updBanner} />}
            {tab === 'hotels' && <HotelsTab trip={trip} upd={upd} />}
            {tab === 'seo' && <SEOTab trip={trip} upd={upd} />}
          </div>
        </div>
      )}
    </div>
  );
}

function InhaltTab({ trip, upd, updBanner }: { trip: Trip; upd: (p: Partial<Trip>) => void; updBanner: (p: any) => void }) {
  const banner = trip.banner;

  function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => upd({ url: ev.target?.result as string });
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-5">
      {/* Image upload */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-body-dark mb-2" style={{ fontSize: '11px' }}>Reisebild</p>
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 rounded-button overflow-hidden" style={{ width: '96px', height: '68px', border: '1px solid #E2DBCF', backgroundColor: '#F4F1EA' }}>
            {trip.url ? (
              <img src={trip.url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl opacity-30">{trip.heroIcon ?? '🕋'}</div>
            )}
          </div>
          <label className="cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
            <span className="px-4 py-2 rounded-button text-sm font-medium text-white" style={{ backgroundColor: '#16242B' }}>Bild ändern</span>
          </label>
        </div>
      </div>

      {/* Marketing text */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-body-dark mb-2" style={{ fontSize: '11px' }}>Marketing-Text (Website)</p>
        <textarea
          value={trip.text}
          onChange={(e) => upd({ text: e.target.value })}
          rows={3}
          className="w-full px-4 py-3 rounded-card text-sm text-ink bg-white resize-none"
          style={{ border: '1px solid #E2DBCF', outline: 'none' }}
        />
      </div>

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
            <label className="absolute bottom-2 right-2 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => updHotel(i, { photo: ev.target?.result as string });
                  reader.readAsDataURL(file);
                }}
              />
              <span className="px-2 py-1 text-xs font-medium text-white rounded" style={{ backgroundColor: '#16242B' }}>
                Bild wählen
              </span>
            </label>
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
    </div>
  );
}

function SEOTab({ trip, upd }: { trip: Trip; upd: (p: Partial<Trip>) => void }) {
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
    </div>
  );
}
