'use client';

import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const from         = searchParams.get('from') ?? '/admin';

  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push(from);
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error ?? 'Anmeldung fehlgeschlagen');
      }
    } catch {
      setError('Verbindungsfehler — bitte erneut versuchen');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: '#16242B' }}
    >
      <div className="w-full max-w-sm mx-4">
        {/* Logo */}
        <div className="text-center mb-10">
          <Image
            src="/assets/makarim_soultreat.png"
            alt="Makarim Reisen"
            width={160}
            height={48}
            className="h-12 w-auto object-contain mx-auto brightness-0 invert opacity-90"
          />
          <p className="font-mono mt-3" style={{ fontSize: '11px', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
            Content Manager
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-card p-8"
          style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <h1 className="text-white font-semibold text-lg mb-6">Anmelden</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.55)', letterSpacing: '0.08em' }}>
                PASSWORT
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoFocus
                required
                className="w-full px-4 py-3 rounded-button text-white text-sm"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  border: error ? '1px solid #E05252' : '1px solid rgba(255,255,255,0.15)',
                  outline: 'none',
                }}
              />
              {error && (
                <p className="mt-2 text-sm" style={{ color: '#F08080' }}>{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full font-medium text-white transition-colors"
              style={{
                backgroundColor: loading || !password ? '#7A4830' : '#C2724A',
                height: '48px',
                borderRadius: '10px',
                fontSize: '15px',
                cursor: loading || !password ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Anmelden…' : 'Anmelden'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Makarim Reisen · CMS v1.0
        </p>
      </div>
    </div>
  );
}
