'use client';

import { useState } from 'react';
import { Trip, Hotel, ProgramDay } from '@/lib/content-schema';
import { useCMS } from './CMSProvider';
import { Field, TextInput } from './FormEditor';

interface Props {
  trip: Trip;
}

type TabKey = 'inhalt' | 'hotels' | 'seo';

function StatusPill({ trip }: { trip: Trip }) {
  const isDraft = trip.published === false;
  const isHome  = trip.startseite;
  return (
    <div className="flex items-center gap-2">
      {isDraft && (
        <span className="px-2 py-0.5 rounded-full font-mono text-xs" style={{ backgroundColor: '#F6ECD9', color: '#956214' }}>
          Entwurf
        </span>
      )}
      {isHome && (
        <span className="px-2 py-0.5 rounded-full font-mono text-xs" style={{ backgroundColor: '#EAF0E8', color: '#3E6B52' }}>
          Startseite
        </span>
      )}
    </div>
  );
}

export function TripCardCMS({ trip }: Props) {
  const { updateTrip } = useCMS();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<TabKey>('inhalt');

  const upd = (patch: Partial<Trip>) => updateTrip(trip.vg, patch);

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: 'inhalt',  label: 'Inhalt' },
    { key: 'hotels',  label: 'Hotels' },
    { key: 'seo',     label: 'SEO' },
  ];

  return (
    <div
      className="rounded-card bg-white overflow-hidden"
      style={{ border: '1px solid #EAE3D8', boxShadow: '0 2px 6px rgba(40,30,20,0.04)' }}
    >
      {/* Header row */}
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer select-none"
        onClick={() => setOpen(!open)}
      >
        {/* Collapse toggle */}
        <span className="text-body-light text-sm w-4 flex-shrink-0" style={{ transform: open ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s', display: 'inline-block' }}>
          ▶
        </span>

        {/* Trip info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-serif font-normal text-ink" style={{ fontSize: '18px' }}>{trip.title}</span>
            <StatusPill trip={trip} />
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="font-mono text-body-light" style={{ fontSize: '12px' }}>{trip.vg}</span>
            <span className="text-body-light" style={{ fontSize: '12px' }}>·</span>
            <span className="text-body-light" style={{ fontSize: '12px' }}>{trip.date}</span>
            <span className="text-body-light" style={{ fontSize: '12px' }}>·</span>
            <span className="font-medium" style={{ fontSize: '12px', color: '#3E6B52' }}>
              {trip.price.toLocaleString('de-DE')} € / Person
            </span>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex items-center gap-3 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {/* Startseite toggle */}
          <label className="flex items-center gap-2 cursor-pointer text-xs text-body-light">
            <span>Startseite</span>
            <button
              role="switch"
              aria-checked={trip.startseite}
              onClick={() => upd({ startseite: !trip.startseite })}
              className="relative inline-flex items-center rounded-full transition-colors flex-shrink-0"
              style={{
                width: '36px',
                height: '20px',
                backgroundColor: trip.startseite ? '#C2724A' : '#D9D4CB',
              }}
            >
              <span
                className="inline-block rounded-full bg-white transition-transform"
                style={{
                  width: '14px',
                  height: '14px',
                  transform: trip.startseite ? 'translateX(18px)' : 'translateX(3px)',
                }}
              />
            </button>
          </label>

          {/* Published toggle */}
          <label className="flex items-center gap-2 cursor-pointer text-xs text-body-light">
            <span>Veröffentlicht</span>
            <button
              role="switch"
              aria-checked={trip.published !== false}
              onClick={() => upd({ published: trip.published === false ? true : false })}
              className="relative inline-flex items-center rounded-full transition-colors flex-shrink-0"
              style={{
                width: '36px',
                height: '20px',
                backgroundColor: trip.published !== false ? '#3E6B52' : '#D9D4CB',
              }}
            >
              <span
                className="inline-block rounded-full bg-white transition-transform"
                style={{
                  width: '14px',
                  height: '14px',
                  transform: trip.published !== false ? 'translateX(18px)' : 'translateX(3px)',
                }}
              />
            </button>
          </label>
        </div>
      </div>

      {/* Collapsible content */}
      {open && (
        <div style={{ borderTop: '1px solid #EAE3D8' }}>
          {/* Tabs */}
          <div className="flex px-5 gap-1 pt-3" style={{ borderBottom: '1px solid #EAE3D8' }}>
            {tabs.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className="px-4 py-2 text-sm font-medium transition-colors rounded-t"
                style={{
                  color: tab === key ? '#C2724A' : '#9A9082',
                  borderBottom: tab === key ? '2px solid #C2724A' : '2px solid transparent',
                  marginBottom: '-1px',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-5 space-y-4">
            {tab === 'inhalt' && <InhaltTab trip={trip} upd={upd} />}
            {tab === 'hotels' && <HotelsTab trip={trip} upd={upd} />}
            {tab === 'seo' && <SEOTab trip={trip} upd={upd} />}
          </div>
        </div>
      )}
    </div>
  );
}

function InhaltTab({ trip, upd }: { trip: Trip; upd: (p: Partial<Trip>) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Name">
          <TextInput value={trip.name} onChange={(v) => upd({ name: v, title: v })} />
        </Field>
        <Field label="Preis (€ / Person)">
          <input
            type="number"
            value={trip.price}
            onChange={(e) => upd({ price: Number(e.target.value) })}
            className="w-full px-4 py-3 rounded-button text-sm text-ink bg-white"
            style={{ border: '1px solid #E2DBCF', outline: 'none' }}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Reisedatum">
          <TextInput value={trip.date} onChange={(v) => upd({ date: v })} placeholder="15.–25. Juni 2026" />
        </Field>
        <Field label="Freie Plätze">
          <input
            type="number"
            value={trip.seats}
            onChange={(e) => upd({ seats: Number(e.target.value) })}
            className="w-full px-4 py-3 rounded-button text-sm text-ink bg-white"
            style={{ border: '1px solid #E2DBCF', outline: 'none' }}
          />
        </Field>
      </div>
      <Field label="Kurzbeschreibung" hint="Für Reisekarte">
        <TextInput value={trip.description} onChange={(v) => upd({ description: v })} multiline rows={2} />
      </Field>
      <Field label="Marketingtext" hint="Detailseite, unter dem Hero">
        <TextInput value={trip.text} onChange={(v) => upd({ text: v })} multiline rows={4} />
      </Field>
      <Field label="Badge" hint="Optional: Bestseller, Early Bird …">
        <TextInput value={trip.badge ?? ''} onChange={(v) => upd({ badge: v || undefined })} placeholder="Bestseller" />
      </Field>
      <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
        <input
          type="checkbox"
          checked={trip.waitlist}
          onChange={(e) => upd({ waitlist: e.target.checked })}
          className="rounded"
        />
        Warteliste aktivieren
      </label>
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
        <div key={i} className="p-4 rounded-button" style={{ backgroundColor: '#F8F5F0', border: '1px solid #EAE3D8' }}>
          <p className="font-medium text-sm text-ink mb-3">Hotel {i + 1} – {hotel.city}</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Stadt">
              <TextInput value={hotel.city} onChange={(v) => updHotel(i, { city: v })} />
            </Field>
            <Field label="Hotelname">
              <TextInput value={hotel.name} onChange={(v) => updHotel(i, { name: v })} />
            </Field>
            <Field label="Nächte">
              <TextInput value={hotel.nights} onChange={(v) => updHotel(i, { nights: v })} placeholder="5 Nächte" />
            </Field>
            <Field label="Bewertung" hint="z.B. 9,3">
              <TextInput value={hotel.rating} onChange={(v) => updHotel(i, { rating: v })} placeholder="9,3" />
            </Field>
            <Field label="Distanz" hint="Freitext">
              <TextInput value={hotel.dist} onChange={(v) => updHotel(i, { dist: v })} placeholder="ca. 150 m zum Haram" />
            </Field>
          </div>
        </div>
      ))}
    </div>
  );
}

function SEOTab({ trip, upd }: { trip: Trip; upd: (p: Partial<Trip>) => void }) {
  return (
    <div className="space-y-4">
      <Field label="SEO-Titel" hint="Überschreibt den globalen Standard · 60–65 Zeichen">
        <TextInput
          value={trip.seoTitle ?? ''}
          onChange={(v) => upd({ seoTitle: v || undefined })}
          placeholder={trip.title}
          maxLength={70}
        />
      </Field>
      <Field label="Meta-Beschreibung" hint="120–155 Zeichen">
        <TextInput
          value={trip.seoDesc ?? ''}
          onChange={(v) => upd({ seoDesc: v || undefined })}
          multiline rows={2}
          maxLength={160}
        />
      </Field>
      <Field label="Slug" hint="URL-Pfad (nicht ändern ohne Redirect)">
        <TextInput value={trip.slug} onChange={(v) => upd({ slug: v })} />
      </Field>
    </div>
  );
}
