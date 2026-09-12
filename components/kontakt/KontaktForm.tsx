'use client';

import { useState } from 'react';
import { LEAD_SOURCES, LEAD_SOURCE_OTHER } from '@/lib/lead-source';

type Status = 'idle' | 'sending' | 'success' | 'error';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  fontSize: '15px',
  border: '1px solid #D4CDBE',
  borderRadius: '10px',
  backgroundColor: 'white',
  color: '#16242B',
  outline: 'none',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 500,
  marginBottom: '6px',
  color: '#5A5448',
};

export function KontaktForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [form, setForm] = useState({ name: '', email: '', phone: '', interesse: 'Allgemeine Anfrage', message: '', leadSource: '', leadSourceText: '' });
  const [errorText, setErrorText] = useState('');
  // Honeypot: für Menschen unsichtbar, Bots füllen so ein Feld reflexhaft aus.
  // Ist es befüllt, verwirft der Server die Anfrage stillschweigend.
  const [honeypot, setHoneypot] = useState('');

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorText('');
    try {
      const res = await fetch('/api/kontakt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, website: honeypot }),
      });
      if (res.ok) { setStatus('success'); return; }
      // Bei der Bremse (429) und bei Prüffehlern sagt der Server, was los ist —
      // das ist hilfreicher als ein pauschales „etwas ist schiefgelaufen".
      const data = await res.json().catch(() => ({}));
      setErrorText(data.error ?? '');
      setStatus('error');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="p-8 rounded-card text-center" style={{ backgroundColor: '#EAF5EE', border: '1px solid #B7DFC5' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>✓</div>
        <h3 className="font-serif font-normal text-ink mb-2" style={{ fontSize: '20px' }}>Nachricht gesendet!</h3>
        <p style={{ fontSize: '15px', color: '#5A5448' }}>Wir melden uns so schnell wie möglich bei dir.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <h2 className="font-serif font-normal text-ink mb-6" style={{ fontSize: '22px' }}>
        Schreib uns eine Nachricht
      </h2>

      {/* Name */}
      <div>
        <label style={labelStyle}>Name</label>
        <input
          required
          value={form.name}
          onChange={set('name')}
          placeholder="Vor- und Nachname"
          style={inputStyle}
        />
      </div>

      {/* E-Mail + Telefon nebeneinander */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label style={labelStyle}>E-Mail</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder="dein@email.de"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>
            Telefon <span style={{ color: '#9A9082', fontWeight: 400 }}>(optional)</span>
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={set('phone')}
            placeholder="+49 ..."
            style={inputStyle}
          />
        </div>
      </div>

      {/* Betreff */}
      <div>
        <label style={labelStyle}>Betreff</label>
        <select value={form.interesse} onChange={set('interesse')} style={inputStyle}>
          <option value="Allgemeine Anfrage">Allgemeine Anfrage</option>
          <option value="Umrah">Umrah</option>
          <option value="Hajj">Hajj</option>
          <option value="Kulturreisen">Kulturreisen</option>
          <option value="Buchungsanfrage">Buchungsanfrage</option>
        </select>
      </div>

      {/* Nachricht */}
      <div>
        <label style={labelStyle}>Nachricht</label>
        <textarea
          required
          rows={5}
          value={form.message}
          onChange={set('message')}
          placeholder="Wie können wir dir helfen?"
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>

      {/* Wie bist du auf uns aufmerksam geworden? — freiwillig, steht bewusst
          ganz unten, damit es den Weg zur Nachricht nicht ausbremst. */}
      <div>
        <label style={labelStyle}>
          Wie bist du auf uns aufmerksam geworden? <span style={{ color: '#9A9082', fontWeight: 400 }}>(optional)</span>
        </label>
        <select value={form.leadSource} onChange={set('leadSource')} style={inputStyle}>
          <option value="">Bitte auswählen …</option>
          {LEAD_SOURCES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        {form.leadSource === LEAD_SOURCE_OTHER && (
          <input
            value={form.leadSourceText}
            onChange={set('leadSourceText')}
            maxLength={200}
            placeholder="Erzähl uns gerne, wie du uns gefunden hast"
            style={{ ...inputStyle, marginTop: '8px' }}
          />
        )}
      </div>

      {/* Honeypot — per aria-hidden und tabIndex auch für Screenreader und
          Tastatur unerreichbar, damit er nur Bots und niemanden sonst betrifft. */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}>
        <label>
          Webseite (bitte frei lassen)
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </label>
      </div>

      {status === 'error' && (
        <p style={{ fontSize: '14px', color: '#C0392B' }}>
          {errorText || 'Etwas ist schiefgelaufen. Bitte versuche es erneut.'}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        style={{
          width: '100%',
          height: '50px',
          backgroundColor: status === 'sending' ? '#9A9082' : '#C2724A',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: 500,
          cursor: status === 'sending' ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s',
        }}
      >
        {status === 'sending' ? 'Wird gesendet …' : 'Nachricht senden'}
      </button>
    </form>
  );
}
