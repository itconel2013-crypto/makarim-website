'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trip, Brand } from '@/lib/content-schema';

interface Traveler {
  anrede: string;
  vorname: string;
  nachname: string;
  geburtstag: string;
  zimmer: string;
}

const defaultTraveler = (): Traveler => ({
  anrede: 'Herr',
  vorname: '',
  nachname: '',
  geburtstag: '',
  zimmer: 'DZ',
});

const roomOptions = [
  { value: 'EZ', label: 'Einzelzimmer' },
  { value: 'DZ', label: 'Doppelzimmer' },
  { value: 'DZ+', label: 'Doppelzimmer Haram-Blick' },
];

interface BookingFormProps {
  trip: Trip;
  brand: Brand;
}

export function BookingForm({ trip, brand }: BookingFormProps) {
  const router = useRouter();

  const [travelers, setTravelers] = useState<Traveler[]>([defaultTraveler()]);
  const [contact, setContact] = useState({ vorname: '', nachname: '', email: '', telefon: '' });
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  function updateTraveler(idx: number, field: keyof Traveler, value: string) {
    setTravelers((prev) => prev.map((t, i) => (i === idx ? { ...t, [field]: value } : t)));
  }

  function addTraveler() {
    setTravelers((prev) => [...prev, defaultTraveler()]);
  }

  function removeTraveler(idx: number) {
    if (travelers.length <= 1) return;
    setTravelers((prev) => prev.filter((_, i) => i !== idx));
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
    if (!contact.email.trim() || !contact.email.includes('@'))
      return 'Kontaktperson: Gültige E-Mail-Adresse erforderlich';
    if (!contact.telefon.trim()) return 'Kontaktperson: Telefonnummer fehlt';
    return '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) {
      setFormError(err);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setFormError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/booking', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ tripVg: trip.vg, travelers, contact, notes }),
      });
      if (!res.ok) {
        const data = await res.json();
        setFormError(data.error ?? 'Versand fehlgeschlagen — bitte erneut versuchen.');
        setSubmitting(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      router.push(`/${trip.category}/${trip.slug}/confirm`);
    } catch {
      setFormError('Netzwerkfehler — bitte erneut versuchen.');
      setSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10 max-w-3xl">

      {/* ── Fehler-Banner ───────────────────────────────────────────── */}
      {formError && (
        <div
          className="flex items-center gap-3 px-5 py-4 rounded-card"
          style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}
        >
          <span style={{ color: '#DC2626', fontSize: '18px', flexShrink: 0 }}>!</span>
          <p className="text-sm font-medium" style={{ color: '#991B1B' }}>{formError}</p>
        </div>
      )}

      {/* ── Preise pro Person ───────────────────────────────────────── */}
      <section>
        <h2
          className="font-serif font-normal text-ink mb-5"
          style={{ fontSize: '22px' }}
        >
          Preise pro Person
        </h2>
        <div className="overflow-hidden rounded-card" style={{ border: '1px solid #EAE3D8' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#16242B', color: 'white' }}>
                <th className="text-left px-5 py-4 font-medium">Zimmerkategorie</th>
                <th className="text-right px-5 py-4 font-medium tabular-nums">Preis p. P.</th>
              </tr>
            </thead>
            <tbody>
              {roomOptions.map((opt, i) => (
                <tr
                  key={opt.value}
                  style={{ borderTop: i > 0 ? '1px solid #EAE3D8' : undefined, backgroundColor: i % 2 === 0 ? '#FDFCF9' : 'white' }}
                >
                  <td className="px-5 py-3 text-body-dark">{opt.label}</td>
                  <td className="px-5 py-3 text-right font-semibold text-ink tabular-nums">
                    ab €{(trip.price + i * 150).toLocaleString('de-DE')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-body-light mt-2">Preise ohne Flug. Verbindliche Preise nach Buchungsbestätigung.</p>
      </section>

      {/* ── Reisende ────────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif font-normal text-ink" style={{ fontSize: '22px' }}>
            Reisende ({travelers.length})
          </h2>
          <button
            type="button"
            onClick={addTraveler}
            className="text-sm font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
          >
            + Person hinzufügen
          </button>
        </div>

        <div className="space-y-6">
          {travelers.map((t, idx) => (
            <div
              key={idx}
              className="p-6 rounded-card bg-white"
              style={{ border: '1px solid #EAE3D8' }}
            >
              <div className="flex items-center justify-between mb-5">
                <p className="font-medium text-ink text-sm">Person {idx + 1}</p>
                {travelers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTraveler(idx)}
                    className="text-xs text-body-light hover:text-primary transition-colors"
                  >
                    Entfernen
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Anrede */}
                <div>
                  <label className="block text-xs font-medium text-body-dark mb-1.5 uppercase tracking-wide" style={{ fontSize: '11px' }}>
                    Anrede
                  </label>
                  <select
                    value={t.anrede}
                    onChange={(e) => updateTraveler(idx, 'anrede', e.target.value)}
                    className="w-full px-4 py-3 rounded-button text-sm text-ink bg-white"
                    style={{ border: '1px solid #E2DBCF', outline: 'none' }}
                    required
                  >
                    <option value="Herr">Herr</option>
                    <option value="Frau">Frau</option>
                    <option value="Divers">Divers</option>
                  </select>
                </div>

                {/* Zimmer */}
                <div>
                  <label className="block text-xs font-medium text-body-dark mb-1.5 uppercase tracking-wide" style={{ fontSize: '11px' }}>
                    Zimmerkategorie
                  </label>
                  <select
                    value={t.zimmer}
                    onChange={(e) => updateTraveler(idx, 'zimmer', e.target.value)}
                    className="w-full px-4 py-3 rounded-button text-sm text-ink bg-white"
                    style={{ border: '1px solid #E2DBCF', outline: 'none' }}
                    required
                  >
                    {roomOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                {/* Vorname */}
                <div>
                  <label className="block text-xs font-medium text-body-dark mb-1.5 uppercase tracking-wide" style={{ fontSize: '11px' }}>
                    Vorname
                  </label>
                  <input
                    type="text"
                    value={t.vorname}
                    onChange={(e) => updateTraveler(idx, 'vorname', e.target.value)}
                    placeholder="Mustafa"
                    className="w-full px-4 py-3 rounded-button text-sm text-ink bg-white placeholder:text-body-light"
                    style={{ border: '1px solid #E2DBCF', outline: 'none' }}
                    required
                  />
                </div>

                {/* Nachname */}
                <div>
                  <label className="block text-xs font-medium text-body-dark mb-1.5 uppercase tracking-wide" style={{ fontSize: '11px' }}>
                    Nachname
                  </label>
                  <input
                    type="text"
                    value={t.nachname}
                    onChange={(e) => updateTraveler(idx, 'nachname', e.target.value)}
                    placeholder="Al-Farisi"
                    className="w-full px-4 py-3 rounded-button text-sm text-ink bg-white placeholder:text-body-light"
                    style={{ border: '1px solid #E2DBCF', outline: 'none' }}
                    required
                  />
                </div>

                {/* Geburtstag */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-body-dark mb-1.5 uppercase tracking-wide" style={{ fontSize: '11px' }}>
                    Geburtsdatum
                  </label>
                  <input
                    type="date"
                    value={t.geburtstag}
                    onChange={(e) => updateTraveler(idx, 'geburtstag', e.target.value)}
                    className="w-full sm:w-auto px-4 py-3 rounded-button text-sm text-ink bg-white tabular-nums"
                    style={{ border: '1px solid #E2DBCF', outline: 'none' }}
                    required
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Kontaktperson ───────────────────────────────────────────── */}
      <section>
        <h2 className="font-serif font-normal text-ink mb-5" style={{ fontSize: '22px' }}>
          Kontaktperson
        </h2>
        <div
          className="p-6 rounded-card bg-white"
          style={{ border: '1px solid #EAE3D8' }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'vorname', label: 'Vorname', type: 'text', placeholder: 'Mustafa' },
              { key: 'nachname', label: 'Nachname', type: 'text', placeholder: 'Al-Farisi' },
              { key: 'email', label: 'E-Mail', type: 'email', placeholder: 'mustafa@example.de' },
              { key: 'telefon', label: 'Telefon', type: 'tel', placeholder: '+49 170 …' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-body-dark mb-1.5 uppercase tracking-wide" style={{ fontSize: '11px' }}>
                  {label}
                </label>
                <input
                  type={type}
                  value={contact[key as keyof typeof contact]}
                  onChange={(e) => setContact((p) => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full px-4 py-3 rounded-button text-sm text-ink bg-white placeholder:text-body-light"
                  style={{ border: '1px solid #E2DBCF', outline: 'none' }}
                  required
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Anmerkungen ─────────────────────────────────────────────── */}
      <section>
        <h2 className="font-serif font-normal text-ink mb-5" style={{ fontSize: '22px' }}>
          Anmerkungen <span className="text-body-light font-sans text-base font-normal">(optional)</span>
        </h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Besondere Wünsche, Fragen oder Hinweise…"
          className="w-full px-4 py-3 rounded-card text-sm text-ink bg-white placeholder:text-body-light resize-none"
          style={{ border: '1px solid #E2DBCF', outline: 'none', maxWidth: '100%' }}
        />
      </section>

      {/* ── Submit ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center font-medium text-white transition-colors disabled:opacity-60"
          style={{
            backgroundColor: '#C2724A',
            height: '54px',
            borderRadius: '13px',
            padding: '0 40px',
            fontSize: '16px',
            minWidth: '220px',
          }}
        >
          {submitting ? 'Wird gesendet…' : 'Anfrage absenden'}
        </button>
        <p className="text-xs text-body-light pt-3 max-w-xs">
          Unverbindliche Anfrage. Wir melden uns innerhalb von 24 Stunden bei dir.
        </p>
      </div>
    </form>
  );
}
