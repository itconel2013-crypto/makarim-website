import { loadBookings } from '@/lib/db';

export const dynamic = 'force-dynamic';

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  neu:         { bg: '#EAF0E8', color: '#3E6B52' },
  bestaetigt:  { bg: '#EEF4FF', color: '#2B4EAA' },
  storniert:   { bg: '#FEF2F2', color: '#991B1B' },
};

export default function BuchungenPage() {
  const rows = loadBookings();

  return (
    <main className="min-h-screen bg-page py-10">
      <div className="container-max">
        <h1 className="font-serif font-normal text-ink mb-2" style={{ fontSize: '32px' }}>Buchungen</h1>
        <p className="text-body-light text-sm mb-8">{rows.length} Einträge</p>

        {rows.length === 0 ? (
          <div className="rounded-card bg-white border border-[#EAE3D8] p-12 text-center text-body-light">
            Noch keine Buchungen vorhanden.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {rows.map((row: any) => {
              const payload = JSON.parse(row.payload ?? '{}');
              const contact = payload.contact ?? {};
              const travelers: any[] = payload.travelers ?? [];
              const pill = STATUS_COLORS[row.status] ?? STATUS_COLORS.neu;
              return (
                <div
                  key={row.id}
                  style={{ background: '#fff', border: '1px solid #EAE3D8', borderRadius: '14px', padding: '20px 24px' }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: '#9A9082' }}>#{row.id}</span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#16242B' }}>
                      {contact.vorname} {contact.nachname}
                    </span>
                    <span style={{ fontSize: '13px', color: '#5A5448' }}>{contact.email}</span>
                    {contact.telefon && <span style={{ fontSize: '13px', color: '#5A5448' }}>{contact.telefon}</span>}
                    <span
                      style={{ fontSize: '12px', fontWeight: 600, borderRadius: '20px', padding: '3px 10px', backgroundColor: pill.bg, color: pill.color, marginLeft: 'auto' }}
                    >
                      {row.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', fontSize: '13px', color: '#6B6457' }}>
                    <span><strong style={{ color: '#16242B' }}>Reise:</strong> {row.trip_vg}</span>
                    <span><strong style={{ color: '#16242B' }}>Reisende:</strong> {travelers.length}</span>
                    <span><strong style={{ color: '#16242B' }}>E-Mail:</strong> {row.email_sent ? '✓ gesendet' : '✗ ausstehend'}</span>
                    <span><strong style={{ color: '#16242B' }}>Datum:</strong> {new Date(row.created_at).toLocaleString('de-DE')}</span>
                  </div>

                  {travelers.length > 0 && (
                    <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {travelers.map((t: any, i: number) => (
                        <span
                          key={i}
                          style={{ fontSize: '12px', backgroundColor: '#F4F1EA', borderRadius: '8px', padding: '4px 10px', color: '#5A5448' }}
                        >
                          {t.vorname} {t.nachname} · {t.geburtstag}
                        </span>
                      ))}
                    </div>
                  )}

                  {payload.notes && (
                    <p style={{ marginTop: '8px', fontSize: '13px', color: '#9A9082', fontStyle: 'italic' }}>{payload.notes}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
