'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trip, Brand } from '@/lib/content-schema';
import { ROOM_TYPES, ageCategory, personPrice, availableRooms, effectiveRoomPrice } from '@/lib/pricing';

interface Traveler { anrede: string; vorname: string; nachname: string; geburtstag: string; zimmer: string; nationalitaet: string; }

interface BookingFormProps { trip: Trip; brand: Brand; }

export function BookingForm({ trip, brand }: BookingFormProps) {
  const router = useRouter();
  const rooms = availableRooms(trip);                       // only categories the CRM prices
  const defaultRoom = rooms[0]?.value ?? 'VZ';
  const makeTraveler = (): Traveler => ({ anrede: 'Herr', vorname: '', nachname: '', geburtstag: '', zimmer: defaultRoom, nationalitaet: '' });

  const [travelers, setTravelers] = useState<Traveler[]>(() => [makeTraveler()]);
  const [contact, setContact] = useState({ vorname: '', nachname: '', email: '', telefon: '' });
  const [notes, setNotes] = useState('');
  const [agb, setAgb] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  function updTraveler(idx: number, field: keyof Traveler, val: string) {
    setTravelers((p) => p.map((t, i) => (i === idx ? { ...t, [field]: val } : t)));
  }

  function validate(): string {
    for (let i = 0; i < travelers.length; i++) {
      const t = travelers[i];
      if (!t.vorname.trim()) return `Person ${i + 1}: Vorname fehlt`;
      if (!t.nachname.trim()) return `Person ${i + 1}: Nachname fehlt`;
      if (!t.geburtstag) return `Person ${i + 1}: Geburtsdatum fehlt`;
    }
    if (!contact.vorname.trim()) return 'Kontaktperson: Vorname fehlt';
    if (!contact.nachname.trim()) return 'Kontaktperson: Nachname fehlt';
    if (!contact.email.trim() || !contact.email.includes('@')) return 'Kontaktperson: Gültige E-Mail erforderlich';
    if (!contact.telefon.trim()) return 'Kontaktperson: Telefonnummer fehlt';
    if (!agb) return 'Bitte Reisebedingungen akzeptieren';
    return '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) { setFormError(err); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    setFormError(''); setSubmitting(true);
    try {
      const res = await fetch('/api/booking', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tripVg: trip.vg, travelers, contact, notes }) });
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

          {/* Preise pro Person */}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'vorname',  label: 'Vorname',  type: 'text',  ph: 'Vorname' },
                  { key: 'nachname', label: 'Nachname', type: 'text',  ph: 'Nachname' },
                  { key: 'email',    label: 'E-Mail',   type: 'email', ph: 'E-Mail' },
                  { key: 'telefon',  label: 'Telefon',  type: 'tel',   ph: 'Telefon' },
                ].map(({ key, label, type, ph }) => (
                  <div key={key}>
                    <label style={labelStyle}>{label}</label>
                    <input type={type} value={contact[key as keyof typeof contact]} onChange={(e) => setContact((p) => ({ ...p, [key]: e.target.value }))} placeholder={ph} style={inputStyle} required />
                  </div>
                ))}
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

            <div style={{ borderTop: '1px solid #F0EADF', paddingTop: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '14px', color: '#9A9082' }}>Gesamtsumme</span>
              <span style={{ fontFamily: "'Newsreader', serif", fontSize: '32px', color: '#16242B', lineHeight: 1 }}>{totalPrice.toLocaleString('de-DE')} €</span>
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
              {submitting ? 'Wird gesendet…' : 'Jetzt buchen'}
            </button>

            <p style={{ fontSize: '12px', color: '#9A9082', textAlign: 'center', marginTop: '10px' }}>Zahlung später bequem per Überweisung</p>
          </div>
        </aside>
      </div>
    </form>
  );
}
