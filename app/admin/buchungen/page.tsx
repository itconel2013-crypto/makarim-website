'use client';

import { useEffect, useState, useCallback } from 'react';

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  neu:        { bg: '#EAF0E8', color: '#3E6B52' },
  bestaetigt: { bg: '#EEF4FF', color: '#2B4EAA' },
  storniert:  { bg: '#FEF2F2', color: '#991B1B' },
};

export default function BuchungenPage() {
  const [rows, setRows]       = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/bookings');
    if (res.ok) setRows(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function archive(id: number) {
    await fetch('/api/admin/bookings', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    setRows((r) => r.filter((x) => x.id !== id));
  }

  async function archiveAllSynced() {
    if (!confirm('Alle übermittelten Buchungen aus der Liste entfernen? (Bleiben in der DB gespeichert)')) return;
    await fetch('/api/admin/bookings', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ all: true }) });
    setRows((r) => r.filter((x) => !x.crm_synced));
  }

  const syncedCount = rows.filter((r) => r.crm_synced).length;

  return (
    <main className="min-h-screen bg-page py-10">
      <div className="container-max">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
          <h1 className="font-serif font-normal text-ink" style={{ fontSize: '32px' }}>Buchungen</h1>
          {syncedCount > 0 && (
            <button
              onClick={archiveAllSynced}
              style={{ fontSize: '13px', color: '#9A9082', border: '1px solid #EAE3D8', borderRadius: '9px', padding: '7px 14px', backgroundColor: 'white', cursor: 'pointer' }}
            >
              🟢 {syncedCount} übermittelte archivieren
            </button>
          )}
        </div>
        <p className="text-body-light text-sm mb-8">{rows.length} Einträge</p>

        {loading ? (
          <p className="text-body-light text-sm">Lädt…</p>
        ) : rows.length === 0 ? (
          <div className="rounded-card bg-white border border-[#EAE3D8] p-12 text-center text-body-light">
            Keine aktiven Buchungen vorhanden.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {rows.map((row: any) => {
              const payload  = JSON.parse(row.payload ?? '{}');
              const contact  = payload.contact ?? {};
              const travelers: any[] = payload.travelers ?? [];
              const pill     = STATUS_COLORS[row.status] ?? STATUS_COLORS.neu;
              return (
                <div key={row.id} style={{ background: '#fff', border: '1px solid #EAE3D8', borderRadius: '14px', padding: '20px 24px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: '#9A9082' }}>#{row.id}</span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#16242B' }}>{contact.vorname} {contact.nachname}</span>
                    <span style={{ fontSize: '13px', color: '#5A5448' }}>{contact.email}</span>
                    {contact.telefon && <span style={{ fontSize: '13px', color: '#5A5448' }}>{contact.telefon}</span>}
                    <span style={{ fontSize: '12px', fontWeight: 600, borderRadius: '20px', padding: '3px 10px', backgroundColor: pill.bg, color: pill.color }}>
                      {row.status}
                    </span>
                    <button
                      onClick={() => archive(row.id)}
                      title="Aus Liste entfernen (bleibt in DB)"
                      style={{ marginLeft: 'auto', fontSize: '12px', color: '#C9B8A8', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#A8542F')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#C9B8A8')}
                    >
                      ✕ archivieren
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', fontSize: '13px', color: '#6B6457', alignItems: 'center' }}>
                    <span><strong style={{ color: '#16242B' }}>Reise:</strong> {row.trip_vg}</span>
                    <span><strong style={{ color: '#16242B' }}>Reisende:</strong> {travelers.length}</span>
                    <span><strong style={{ color: '#16242B' }}>Datum:</strong> {new Date(row.created_at).toLocaleString('de-DE')}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 600, borderRadius: '20px', padding: '3px 10px', backgroundColor: row.crm_synced ? '#EAF0E8' : '#FFFBEA', color: row.crm_synced ? '#3E6B52' : '#92610A' }}>
                      {row.crm_synced ? '🟢 übermittelt' : '🟡 wird nachgeliefert'}
                    </span>
                  </div>

                  {travelers.length > 0 && (
                    <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {travelers.map((t: any, i: number) => (
                        <span key={i} style={{ fontSize: '12px', backgroundColor: '#F4F1EA', borderRadius: '8px', padding: '4px 10px', color: '#5A5448' }}>
                          {t.vorname} {t.nachname} · {t.geburtstag}
                        </span>
                      ))}
                    </div>
                  )}
                  {payload.notes && <p style={{ marginTop: '8px', fontSize: '13px', color: '#9A9082', fontStyle: 'italic' }}>{payload.notes}</p>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
