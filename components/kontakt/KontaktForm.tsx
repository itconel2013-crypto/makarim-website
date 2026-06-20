'use client';

import { useState } from 'react';

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
  const [form, setForm] = useState({ name: '', email: '', phone: '', interesse: 'Allgemeine Anfrage', message: '' });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/kontakt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setStatus(res.ok ? 'success' : 'error');
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
      <div className="grid grid-cols-2 gap-3">
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

      {status === 'error' && (
        <p style={{ fontSize: '14px', color: '#C0392B' }}>
          Etwas ist schiefgelaufen. Bitte versuche es erneut.
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
