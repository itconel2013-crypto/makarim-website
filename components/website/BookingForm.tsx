'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trip, Brand } from '@/lib/content-schema';
import { ROOM_TYPES, ageCategory, personPrice, availableRooms, effectiveRoomPrice } from '@/lib/pricing';
import { hasPrice, PRICE_ON_REQUEST, PRICE_ON_REQUEST_HINT } from '@/lib/utils';

interface Traveler {
  anrede: string; vorname: string; nachname: string; geburtstag: string;
  email: string; telefon: string;
  strasse: string; plz: string; ort: string; zimmer: string; nationalitaet: string;
}

interface BookingFormProps { trip: Trip; brand: Brand; }

/** Partner-Kennung aus dem mk_ref-Cookie (von RefCapture gesetzt). Fehlt sie → undefined. */
const getRef = (): string | undefined =>
  document.cookie.split('; ').find((c) => c.startsWith('mk_ref='))?.split('=')[1] || undefined;

export function BookingForm({ trip, brand }: BookingFormProps) {
  const router = useRouter();
  const rooms = availableRooms(trip);                       // only categories the CRM prices
  const defaultRoom = rooms[0]?.value ?? 'VZ';

  // Vorreservierung (CRM): Reise noch nicht bestätigt → unverbindlich, keine Zahlung.
  const isVorres = trip.vorreservierung === true;
  // Reisen ohne Preis (z. B. Hajj → Buchung über Nusuk) dürfen nirgends „0 €" zeigen.
  const priceAvailable = hasPrice(trip.price)
    || rooms.some((r) => hasPrice(effectiveRoomPrice(trip, r.value)?.adult));
  const makeTraveler = (): Traveler => ({
    anrede: 'Herr', vorname: '', nachname: '', geburtstag: '',
    email: '', telefon: '',
    strasse: '', plz: '', ort: '', zimmer: defaultRoom, nationalitaet: '',
  });

  const [travelers, setTravelers] = useState<Traveler[]>(() => [makeTraveler()]);
  const [contact, setContact] = useState({ vorname: '', nachname: '', email: '', telefon: '', strasse: '', plz: '', ort: '' });
  const [contactSameAsTraveler, setContactSameAsTraveler] = useState(false);
  const [notes, setNotes] = useState('');
  const [agb, setAgb] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  function updTraveler(idx: number, field: keyof Traveler, val: string) {
    setTravelers((p) => p.map((t, i) => (i === idx ? { ...t, [field]: val } : t)));
  }

  function copyPrevAddress(idx: number) {
    setTravelers((p) => p.map((t, i) => (i === idx && p[idx - 1]
      ? { ...t, strasse: p[idx - 1].strasse, plz: p[idx - 1].plz, ort: p[idx - 1].ort }
      : t)));
  }

  // When "Daten vom Reisenden übernehmen" is active, the contact's fields mirror
  // the first traveler live — a later edit there stays in sync. Person 1 now also
  // has E-Mail/Telefon, so those get mirrored too.
  const contactMirror = contactSameAsTraveler
    ? { vorname: travelers[0].vorname, nachname: travelers[0].nachname, email: travelers[0].email, telefon: travelers[0].telefon, strasse: travelers[0].strasse, plz: travelers[0].plz, ort: travelers[0].ort }
    : { vorname: contact.vorname, nachname: contact.nachname, email: contact.email, telefon: contact.telefon, strasse: contact.strasse, plz: contact.plz, ort: contact.ort };

  function validate(): string {
    for (let i = 0; i < travelers.length; i++) {
      const t = travelers[i];
      if (!t.vorname.trim()) return `Person ${i + 1}: Vorname fehlt`;
      if (!t.nachname.trim()) return `Person ${i + 1}: Nachname fehlt`;
      if (!t.geburtstag) return `Person ${i + 1}: Geburtsdatum fehlt`;
      // Adresse ist nur bei Person 1 Pflicht (dient auch als Kofferkarten-Adresse).
      // Weitere Reisende dürfen optional eine eigene Adresse angeben; bleibt sie
      // leer, wird beim Absenden die Adresse von Person 1 übernommen.
      if (i === 0) {
        if (!t.email.trim() || !t.email.includes('@')) return 'Person 1: Gültige E-Mail erforderlich';
        if (!t.telefon.trim()) return 'Person 1: Handynummer fehlt';
        if (!t.strasse.trim()) return 'Person 1: Straße fehlt';
        if (!t.plz.trim()) return 'Person 1: PLZ fehlt';
        if (!t.ort.trim()) return 'Person 1: Ort fehlt';
      }
    }
    // Bei "Daten vom Reisenden übernehmen" stehen die Kontaktfelder in contactMirror
    // (aus Person 1), nicht im Roh-State contact — daher gegen contactMirror prüfen.
    if (!contactMirror.vorname.trim()) return 'Kontaktperson: Vorname fehlt';
    if (!contactMirror.nachname.trim()) return 'Kontaktperson: Nachname fehlt';
    if (!contactMirror.email.trim() || !contactMirror.email.includes('@')) return 'Kontaktperson: Gültige E-Mail erforderlich';
    if (!contactMirror.telefon.trim()) return 'Kontaktperson: Telefonnummer fehlt';
    if (!agb) return 'Bitte Reisebedingungen akzeptieren';
    return '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) { setFormError(err); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    setFormError(''); setSubmitting(true);
    // Reisende ohne eigene Adresse erben die Adresse von Person 1, damit jede
    // Kofferkarte eine vollständige Adresse hat.
    const travelersToSend = travelers.map((t, i) =>
      i > 0 && !t.strasse.trim()
        ? { ...t, strasse: travelers[0].strasse, plz: travelers[0].plz, ort: travelers[0].ort }
        : t);
    try {
      const res = await fetch('/api/booking', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tripVg: trip.vg, travelers: travelersToSend, contact: { ...contact, ...contactMirror }, notes, ref: getRef() }) });
      if (!res.ok) { const d = await res.json(); setFormError(d.error ?? 'Versand fehlgeschlagen.'); setSubmitting(false); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
      router.push(`/${trip.category}/${trip.slug}/confirm`);
    } catch { setFormError('Netzwerkfehler — bitte erneut versuchen.'); setSubmitting(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  }

  // Summary calculations
  const totalPrice = travelers.reduce((sum, t) => sum + personPrice(t.geburtstag, t.zimmer, trip), 0);
  const adultsCount = travelers.filter((t) => ageCategory(t.geburtstag) === 'Erwachsener').length;
  const kidsCount   = travelers.filter((t) => ageCategory(t.geburtstag) === 'Kind').length;
  const babiesCount = travelers.filter((t) => ageCategory(t.geburtstag) === 'Baby').length;

  const summaryReisende = [
    adultsCount > 0 ? `${adultsCount} Erwachsene${adultsCount === 1 ? 'r' : ''}` : '',
    kidsCount   > 0 ? `${kidsCount} Kind${kidsCount > 1 ? 'er' : ''}` : '',
    babiesCount > 0 ? `${babiesCount} Baby${babiesCount > 1 ? 's' : ''}` : '',
  ].filter(Boolean).join(', ');

  const dominantRoom = travelers[0]?.zimmer ?? 'VZ';
  const dominantRoomLabel = ROOM_TYPES.find((r) => r.value === dominantRoom)?.label ?? 'Vierbettzimmer';

  // Field style
  const inputStyle: React.CSSProperties = { border: '1px solid #E2DBCF', outline: 'none', borderRadius: '9px', padding: '10px 14px', fontSize: '14px', color: '#16242B', backgroundColor: 'white', width: '100%' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9A9082', marginBottom: '6px' };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col lg:flex-row gap-8 items-start">

        {/* ── LEFT: form ─────────────────────────────────────── */}
        <div className="flex-1 min-w-0 w-full">

          {/* Error banner */}
          {formError && (
            <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '14px 18px', marginBottom: '24px', display: 'flex', gap: '10px' }}>
              <span style={{ color: '#DC2626', fontWeight: 700, flexShrink: 0 }}>!</span>
              <p style={{ fontSize: '14px', color: '#991B1B', margin: 0 }}>{formError}</p>
            </div>
          )}

          {/* Vorreservierung — Reise noch nicht bestätigt */}
          {isVorres && (
            <div style={{ backgroundColor: '#FFFBEA', border: '1px solid #F5E3B3', borderRadius: '10px', padding: '14px 18px', marginBottom: '24px', display: 'flex', gap: '10px' }}>
              <span style={{ flexShrink: 0 }}>ℹ️</span>
              <p style={{ fontSize: '14px', color: '#7A5B1E', margin: 0, lineHeight: 1.5 }}>
                Diese Reise ist noch nicht fest bestätigt. Du reservierst <strong>unverbindlich</strong> – es ist noch keine Zahlung nötig. Wir melden uns, sobald die Durchführung feststeht.
              </p>
            </div>
          )}

          {/* Preise pro Person — nur wenn es überhaupt Preise gibt (Hajj: über Nusuk) */}
          {!priceAvailable ? (
            <section style={{ marginBottom: '32px' }}>
              <h2 style={{ fontFamily: "'Newsreader', serif", fontSize: '22px', fontWeight: 400, color: '#16242B', marginBottom: '16px' }}>Preis</h2>
              <div style={{ borderRadius: '12px', border: '1px solid #EAE3D8', backgroundColor: '#FDFCF9', padding: '18px 20px' }}>
                <p style={{ fontSize: '16px', fontWeight: 600, color: '#16242B', margin: '0 0 4px' }}>{PRICE_ON_REQUEST}</p>
                <p style={{ fontSize: '13px', color: '#9A9082', margin: 0 }}>{PRICE_ON_REQUEST_HINT} — wir melden uns mit allen Details bei dir.</p>
              </div>
            </section>
          ) : (
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: "'Newsreader', serif", fontSize: '22px', fontWeight: 400, color: '#16242B', marginBottom: '16px' }}>Preise pro Person</h2>
            <div style={{ borderRadius: '12px', border: '1px solid #EAE3D8', overflow: 'hidden', overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '420px', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#16242B', color: 'white' }}>
                    <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 500 }}>Zimmer</th>
                    <th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 500 }}>Erwachsener</th>
                    <th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 500 }}>Kind 2–11</th>
                    <th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 500 }}>Baby 0–1</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((r, i) => {
                    const p = effectiveRoomPrice(trip, r.value)!;
                    return (
                      <tr key={r.value} style={{ borderTop: '1px solid #EAE3D8', backgroundColor: i % 2 === 0 ? '#FDFCF9' : 'white' }}>
                        <td style={{ padding: '12px 16px', color: '#16242B', fontWeight: 500 }}>{r.label}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#16242B' }}>{p.adult.toLocaleString('de-DE')} €</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#16242B' }}>{p.child.toLocaleString('de-DE')} €</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#16242B' }}>{p.baby.toLocaleString('de-DE')} €</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: '12px', color: '#9A9082', marginTop: '8px' }}>Preise pro Person inkl. Flug, Hotel & Visum. Die Alterskategorie ergibt sich automatisch aus dem Geburtsdatum (Stand Reisedatum).</p>
          </section>
          )}

          {/* Reisende */}
          <section style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontFamily: "'Newsreader', serif", fontSize: '22px', fontWeight: 400, color: '#16242B', margin: 0 }}>Reisende</h2>
              <span style={{ fontSize: '13px', color: '#A8542F' }}>Eigene Zimmerkategorie pro Person wählbar</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {travelers.map((t, idx) => {
                const cat = ageCategory(t.geburtstag);
                const price = personPrice(t.geburtstag, t.zimmer, trip);
                const roomLabel = ROOM_TYPES.find((r) => r.value === t.zimmer)?.label ?? '';
                return (
                  <div key={idx} style={{ border: '1px solid #EAE3D8', borderRadius: '14px', padding: '18px 20px', backgroundColor: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#A8542F' }}>Person {idx + 1}</span>
                      {travelers.length > 1 && (
                        <button type="button" onClick={() => setTravelers((p) => p.filter((_, i) => i !== idx))} style={{ fontSize: '12px', color: '#9A9082', background: 'none', border: 'none', cursor: 'pointer' }}>Entfernen</button>
                      )}
                    </div>

                    {/* Row 1: Anrede + Vorname + Nachname */}
                    <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#5A5448', marginBottom: '5px' }}>Anrede</label>
                        <select value={t.anrede} onChange={(e) => updTraveler(idx, 'anrede', e.target.value)} style={inputStyle}>
                          <option>Herr</option>
                          <option>Frau</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#5A5448', marginBottom: '5px' }}>Vorname</label>
                        <input type="text" value={t.vorname} onChange={(e) => updTraveler(idx, 'vorname', e.target.value)} placeholder="Vorname" style={inputStyle} required />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#5A5448', marginBottom: '5px' }}>Nachname</label>
                        <input type="text" value={t.nachname} onChange={(e) => updTraveler(idx, 'nachname', e.target.value)} placeholder="Nachname" style={inputStyle} required />
                      </div>
                    </div>

                    {/* Row 2: Geburtsdatum + Nationalität + Zimmer */}
                    <div className="grid gap-2 mb-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
                      {[
                        <div key="geb">
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#5A5448', marginBottom: '5px' }}>Geburtsdatum</label>
                          <input type="date" value={t.geburtstag} onChange={(e) => updTraveler(idx, 'geburtstag', e.target.value)} style={inputStyle} required />
                        </div>,
                        <div key="nat">
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#5A5448', marginBottom: '5px' }}>Nationalität</label>
                          <input type="text" value={t.nationalitaet} onChange={(e) => updTraveler(idx, 'nationalitaet', e.target.value)} placeholder="z. B. Deutsch" style={inputStyle} />
                        </div>,
                        <div key="zimmer">
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#5A5448', marginBottom: '5px' }}>Zimmerkategorie</label>
                          <select value={t.zimmer} onChange={(e) => updTraveler(idx, 'zimmer', e.target.value)} style={inputStyle}>
                            {rooms.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                          </select>
                        </div>,
                      ]}
                    </div>

                    {/* Address copy helper — from the previous traveler */}
                    {idx > 0 && (
                      <div style={{ marginBottom: '8px' }}>
                        <button
                          type="button"
                          onClick={() => copyPrevAddress(idx)}
                          style={{ fontSize: '12.5px', color: '#A8542F', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                        >
                          ↩ Adresse von Person {idx} übernehmen
                        </button>
                        <p style={{ fontSize: '11.5px', color: '#9A9082', margin: '4px 0 0' }}>
                          Adresse optional — leer gelassen wird die Adresse von Person 1 übernommen (auch für die Kofferkarte).
                        </p>
                      </div>
                    )}

                    {/* Row 3: Straße + PLZ + Ort */}
                    <div className="grid gap-2 mb-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#5A5448', marginBottom: '5px' }}>Straße &amp; Hausnr.</label>
                        <input type="text" value={t.strasse} onChange={(e) => updTraveler(idx, 'strasse', e.target.value)} placeholder="z. B. Musterstraße 12" style={inputStyle} required={idx === 0} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#5A5448', marginBottom: '5px' }}>PLZ</label>
                        <input type="text" inputMode="numeric" value={t.plz} onChange={(e) => updTraveler(idx, 'plz', e.target.value)} placeholder="12345" style={inputStyle} required={idx === 0} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#5A5448', marginBottom: '5px' }}>Ort</label>
                        <input type="text" value={t.ort} onChange={(e) => updTraveler(idx, 'ort', e.target.value)} placeholder="Musterstadt" style={inputStyle} required={idx === 0} />
                      </div>
                    </div>

                    {/* Row 4: E-Mail + Handynummer — nur Person 1 (Haupt-Kontaktdaten) */}
                    {idx === 0 && (
                      <div className="grid gap-2 mb-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#5A5448', marginBottom: '5px' }}>E-Mail</label>
                          <input type="email" value={t.email} onChange={(e) => updTraveler(idx, 'email', e.target.value)} placeholder="name@beispiel.de" style={inputStyle} required />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#5A5448', marginBottom: '5px' }}>Handynummer</label>
                          <input type="tel" value={t.telefon} onChange={(e) => updTraveler(idx, 'telefon', e.target.value)} placeholder="+49 …" style={inputStyle} required />
                        </div>
                      </div>
                    )}

                    {/* Computed summary line */}
                    {t.geburtstag && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, backgroundColor: '#EAF0E8', color: '#3E6B52', borderRadius: '20px', padding: '2px 10px' }}>{cat}</span>
                        <span style={{ fontSize: '13px', color: '#6B6457' }}>{roomLabel} · <strong style={{ color: '#16242B' }}>{price.toLocaleString('de-DE')} €</strong></span>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Add person button */}
              <button
                type="button"
                onClick={() => setTravelers((p) => [...p, makeTraveler()])}
                style={{ border: '1.5px dashed #D5CEBC', borderRadius: '14px', padding: '14px', fontSize: '14px', color: '#9A9082', backgroundColor: 'transparent', cursor: 'pointer', width: '100%' }}
              >
                + Weitere Person hinzufügen
              </button>
            </div>
          </section>

          {/* Kontaktperson */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: "'Newsreader', serif", fontSize: '22px', fontWeight: 400, color: '#16242B', marginBottom: '16px' }}>Kontaktperson</h2>
            <div style={{ border: '1px solid #EAE3D8', borderRadius: '14px', padding: '20px', backgroundColor: 'white' }}>

              {/* Ganze Person (Name + Adresse) von Person 1 übernehmen */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', cursor: travelers.length ? 'pointer' : 'default' }}>
                <input type="checkbox" checked={contactSameAsTraveler} onChange={(e) => setContactSameAsTraveler(e.target.checked)} style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: '#5A5448' }}>Kontaktperson ist Person 1 — Daten (Name, E-Mail, Telefon &amp; Adresse) vom Reisenden übernehmen</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'vorname',  label: 'Vorname',  type: 'text',  ph: 'Vorname'  },
                  { key: 'nachname', label: 'Nachname', type: 'text',  ph: 'Nachname' },
                  { key: 'email',    label: 'E-Mail',   type: 'email', ph: 'E-Mail'   },
                  { key: 'telefon',  label: 'Telefon',  type: 'tel',   ph: 'Telefon'  },
                ].map(({ key, label, type, ph }) => {
                  const locked = contactSameAsTraveler;
                  const val = contactMirror[key as 'vorname' | 'nachname' | 'email' | 'telefon'];
                  return (
                    <div key={key}>
                      <label style={labelStyle}>{label}</label>
                      <input type={type} value={val} onChange={(e) => setContact((p) => ({ ...p, [key]: e.target.value }))} placeholder={ph} disabled={locked} style={{ ...inputStyle, ...(locked ? { backgroundColor: '#F7F4EE', color: '#9A9082' } : {}) }} required />
                    </div>
                  );
                })}
              </div>

              <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', marginTop: '12px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Straße &amp; Hausnr.</label>
                  <input type="text" value={contactMirror.strasse} onChange={(e) => setContact((p) => ({ ...p, strasse: e.target.value }))} placeholder="z. B. Musterstraße 12" disabled={contactSameAsTraveler} style={{ ...inputStyle, ...(contactSameAsTraveler ? { backgroundColor: '#F7F4EE', color: '#9A9082' } : {}) }} />
                </div>
                <div>
                  <label style={labelStyle}>PLZ</label>
                  <input type="text" inputMode="numeric" value={contactMirror.plz} onChange={(e) => setContact((p) => ({ ...p, plz: e.target.value }))} placeholder="12345" disabled={contactSameAsTraveler} style={{ ...inputStyle, ...(contactSameAsTraveler ? { backgroundColor: '#F7F4EE', color: '#9A9082' } : {}) }} />
                </div>
                <div>
                  <label style={labelStyle}>Ort</label>
                  <input type="text" value={contactMirror.ort} onChange={(e) => setContact((p) => ({ ...p, ort: e.target.value }))} placeholder="Musterstadt" disabled={contactSameAsTraveler} style={{ ...inputStyle, ...(contactSameAsTraveler ? { backgroundColor: '#F7F4EE', color: '#9A9082' } : {}) }} />
                </div>
              </div>
            </div>
          </section>

          {/* Anmerkungen */}
          <section>
            <h2 style={{ fontFamily: "'Newsreader', serif", fontSize: '22px', fontWeight: 400, color: '#16242B', marginBottom: '16px' }}>
              Anmerkungen <span style={{ fontFamily: 'sans-serif', fontSize: '15px', fontWeight: 400, color: '#9A9082' }}>(optional)</span>
            </h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Besondere Wünsche, Fragen oder Hinweise…"
              style={{ ...inputStyle, resize: 'none', padding: '12px 14px' }}
            />
          </section>
        </div>

        {/* ── RIGHT: sticky summary ──────────────────────────────── */}
        <aside className="w-full lg:w-80 lg:flex-shrink-0 lg:sticky lg:top-24">
          <div style={{ backgroundColor: 'white', border: '1px solid #EAE3D8', borderRadius: '20px', padding: '24px', boxShadow: '0 10px 30px rgba(40,30,20,0.08)' }}>
            <h2 style={{ fontFamily: "'Newsreader', serif", fontSize: '22px', fontWeight: 400, color: '#16242B', marginBottom: '20px' }}>Zusammenfassung</h2>

            {/* Summary rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {[
                { label: 'Reise', value: trip.title },
                { label: 'Zimmer', value: `${travelers.length}× ${dominantRoomLabel}` },
                { label: 'Reisende', value: summaryReisende || '—' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '14px' }}>
                  <span style={{ color: '#9A9082', flexShrink: 0 }}>{label}</span>
                  <span style={{ color: '#16242B', fontWeight: 500, textAlign: 'right' }}>{value}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid #F0EADF', paddingTop: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
              <span style={{ fontSize: '14px', color: '#9A9082', flexShrink: 0 }}>Gesamtsumme</span>
              {priceAvailable ? (
                <span style={{ fontFamily: "'Newsreader', serif", fontSize: '32px', color: '#16242B', lineHeight: 1 }}>{totalPrice.toLocaleString('de-DE')} €</span>
              ) : (
                <span style={{ fontFamily: "'Newsreader', serif", fontSize: '20px', color: '#16242B', lineHeight: 1.2, textAlign: 'right' }}>{PRICE_ON_REQUEST}</span>
              )}
            </div>

            {/* AGB Checkbox */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '16px', cursor: 'pointer' }}>
              <input type="checkbox" checked={agb} onChange={(e) => setAgb(e.target.checked)} style={{ marginTop: '2px', flexShrink: 0, width: '16px', height: '16px' }} />
              <span style={{ fontSize: '13px', color: '#5A5448', lineHeight: 1.4 }}>Ich akzeptiere die Reisebedingungen und Datenschutzhinweise.</span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              style={{ width: '100%', height: '54px', backgroundColor: '#16242B', color: 'white', border: 'none', borderRadius: '13px', fontSize: '16px', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1 }}
            >
              {submitting ? 'Wird gesendet…' : (isVorres ? 'Unverbindlich vorreservieren' : 'Jetzt buchen')}
            </button>

            <p style={{ fontSize: '12px', color: '#9A9082', textAlign: 'center', marginTop: '10px' }}>
              {isVorres ? 'Unverbindlich – jetzt noch keine Zahlung nötig' : 'Zahlung später bequem per Überweisung'}
            </p>
          </div>
        </aside>
      </div>
    </form>
  );
}
