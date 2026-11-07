'use client';

import { useCMS } from '@/components/cms/CMSProvider';
import { PublishBar } from '@/components/cms/PublishBar';
import { FormSection } from '@/components/cms/FormEditor';
import { BookingTermsEditor } from '@/components/cms/BookingTermsEditor';
import { Brand, BookingTermsConfig, hasBookingTerms } from '@/lib/content-schema';

export default function ZahlungsbedingungenEditor() {
  const { store, updateSection } = useCMS();
  if (!store) return null;

  const brand = store.c.brand;
  const terms: BookingTermsConfig = brand.bookingTerms ?? {};
  const aktiv = hasBookingTerms(terms);

  const onChange = (next: BookingTermsConfig) =>
    updateSection('brand', { ...brand, bookingTerms: next } as Brand);

  // Reisen mit eigener, abweichender Staffel — damit niemand hier etwas ändert
  // und sich wundert, warum es bei einzelnen Reisen nicht ankommt.
  const abweichend = store.c.trips.filter((t) => hasBookingTerms(t.bookingTerms));

  return (
    <>
      <PublishBar title="Zahlung & Storno" subtitle="Angaben auf der Buchungsseite — vor dem Absenden sichtbar" />
      <main className="flex-1 overflow-auto p-8">
        <div style={{ maxWidth: '600px' }}>

          <div
            className="mb-6 text-body-sm"
            style={{ background: '#EFF4F6', border: '1px solid #CBDCE3', borderRadius: '10px', padding: '14px 16px', color: '#2C4E5A', lineHeight: 1.6 }}
          >
            <strong>Normalerweise ist hier nichts zu tun.</strong> Die Zahlungs- und Stornobedingungen
            pflegt ihr im CRM; sie kommen mit jeder Reise automatisch auf die Buchungsseite. Diese Seite
            ist nur das Auffangnetz: Was hier steht, gilt für Reisen, zu denen das CRM nichts schickt.
          </div>

          <div
            className="mb-6 text-body-sm"
            style={{ background: '#FFFBEA', border: '1px solid #F0E0B0', borderRadius: '10px', padding: '14px 16px', color: '#6B5620', lineHeight: 1.6 }}
          >
            <strong>Falls ihr doch etwas eintragt:</strong> Diese Angaben sieht der Kunde, bevor er
            verbindlich bucht — sie müssen mit euren Reisebedingungen übereinstimmen. Im Zweifel vom Anwalt
            oder Verband bestätigen lassen.
          </div>

          <div
            className="mb-6 text-body-sm"
            style={{
              background: aktiv ? '#EAF0E8' : '#F4F1EA',
              border: `1px solid ${aktiv ? '#C3D8C3' : '#E2DBCF'}`,
              borderRadius: '10px', padding: '12px 16px',
              color: aktiv ? '#3E6B52' : '#6B6457', lineHeight: 1.6,
            }}
          >
            {aktiv ? (
              <>● Hier ist etwas gepflegt. Diese Werte greifen <strong>nur bei Reisen, zu denen das CRM
              nichts schickt</strong> — überall sonst gilt das CRM.</>
            ) : (
              <>● Hier ist nichts gepflegt — das ist der Normalfall. Es gilt, was das CRM zu jeder Reise
              schickt. Schickt das CRM zu einer Reise nichts, bleibt der Block dort <strong>unsichtbar</strong>.</>
            )}
          </div>

          <FormSection title="Für alle Reisen">
            <BookingTermsEditor terms={terms} onChange={onChange} />
          </FormSection>

          {abweichend.length > 0 && (
            <div className="text-body-sm text-body" style={{ background: '#F4F1EA', borderRadius: '10px', padding: '12px 16px', lineHeight: 1.6 }}>
              <strong>{abweichend.length} {abweichend.length === 1 ? 'Reise hat' : 'Reisen haben'} eigene Bedingungen</strong>{' '}
              und folgen diesen Werten nicht: {abweichend.map((t) => t.title).join(', ')}. Ändern lässt sich
              das in der jeweiligen Reise unter „Reisen" → Abschnitt „Zahlung & Storno".
            </div>
          )}

        </div>
      </main>
    </>
  );
}
