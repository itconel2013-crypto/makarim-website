import { BookingTermsConfig } from '@/lib/content-schema';

/**
 * „Zahlung & Stornierung" auf der Buchungsseite.
 *
 * Warum der Block hier steht und nicht nur in der AGB: Bei Pauschalreisen müssen
 * Zahlungsmodalitäten und Rücktrittsbedingungen VOR der verbindlichen
 * Buchungserklärung vorliegen. Praktisch ist „was zahle ich jetzt, was später,
 * was wenn ich absagen muss" ohnehin die letzte offene Frage vor dem Absenden.
 * Die AGB bleibt die verbindliche Langfassung, dies ist die Kurzfassung an der
 * Stelle, wo die Entscheidung fällt.
 *
 * KEINE VORGABEWERTE: Alle Angaben kommen aus dem CRM (mit dem Reise-Push) oder
 * aus dem CMS (/admin/zahlungsbedingungen, je Reise übersteuerbar). Ist nichts
 * gepflegt, rendert die Buchungsseite diesen Block gar nicht erst — ein
 * ausgedachter Stornosatz wäre schlimmer als gar keine Angabe.
 */

interface BookingTermsProps {
  /** Bereits aufgelöste Bedingungen (Reise über global) — siehe resolveBookingTerms. */
  terms: BookingTermsConfig;
  /** Anzahl Reisender — für die Hochrechnung der Gesamt-Anzahlung. */
  travelerCount: number;
  /** false (z. B. Hajj über Nusuk) → keine Euro-Beträge anzeigen. */
  priceAvailable: boolean;
  /** Vorreservierung: noch keine Zahlung fällig, eigener Hinweis. */
  isVorreservierung?: boolean;
}

const rowLabel: React.CSSProperties = {
  fontSize: '11px', fontWeight: 600, letterSpacing: '0.07em',
  textTransform: 'uppercase', color: '#6B6457', marginBottom: '6px',
};

export function BookingTerms({ terms, travelerCount, priceAvailable, isVorreservierung = false }: BookingTermsProps) {
  const euro = (n: number) => n.toLocaleString('de-DE') + ' €';
  const deposit = terms.depositPerPerson;
  const showDepositAmount = priceAvailable && typeof deposit === 'number' && deposit > 0;
  const depositTotal = showDepositAmount ? deposit * Math.max(1, travelerCount) : 0;
  const tiers = terms.cancellation ?? [];

  return (
    <div
      style={{
        border: '1px solid #EAE3D8',
        borderRadius: '14px',
        padding: '22px',
        backgroundColor: '#FBF9F4',
        boxShadow: '0 2px 8px rgba(40,30,20,0.04)',
      }}
    >
      {isVorreservierung ? (
        <p style={{ fontSize: '14px', color: '#5A5448', lineHeight: 1.65, margin: 0 }}>
          Dies ist eine <strong style={{ color: '#16242B' }}>unverbindliche Vorreservierung</strong>. Es ist
          jetzt keine Zahlung nötig. Sobald die Reise feststeht, melden wir uns mit allen Angaben zu
          Anzahlung und Zahlungsfristen.
        </p>
      ) : (
        <>
          {/* Anzahlung — nur wenn etwas dazu gepflegt ist. */}
          {(showDepositAmount || terms.depositDue) && (
            <div style={{ marginBottom: '18px' }}>
              <p style={rowLabel}>Anzahlung</p>
              {showDepositAmount ? (
                <p style={{ fontSize: '15px', color: '#16242B', margin: '0 0 2px', fontWeight: 500 }}>
                  {euro(deposit!)} pro Person
                  {travelerCount > 1 && (
                    <span style={{ color: '#6B6457', fontWeight: 400 }}>
                      {' · '}{euro(depositTotal)} für {travelerCount} Personen
                    </span>
                  )}
                </p>
              ) : (
                // Reise ohne öffentlichen Preis: niemals „0 €", sondern ein Hinweis.
                <p style={{ fontSize: '15px', color: '#16242B', margin: '0 0 2px', fontWeight: 500 }}>
                  Höhe teilen wir dir mit der Buchungsbestätigung mit
                </p>
              )}
              {terms.depositDue && (
                <p style={{ fontSize: '13.5px', color: '#6B6457', margin: 0 }}>{terms.depositDue}</p>
              )}
            </div>
          )}

          {/* Restzahlung */}
          {terms.balanceDue && (
            <div style={{ marginBottom: '18px' }}>
              <p style={rowLabel}>Restzahlung</p>
              <p style={{ fontSize: '15px', color: '#16242B', margin: 0, fontWeight: 500 }}>{terms.balanceDue}</p>
            </div>
          )}

          {/* Stornobedingung als Freitext — im CRM als „Abweichend" gepflegt.
              Dann gibt es keine Staffel, sondern einen Absatz. */}
          {tiers.length === 0 && terms.cancellationText && (
            <div style={{ marginBottom: '18px' }}>
              <p style={rowLabel}>Wenn du stornieren musst</p>
              <p style={{ fontSize: '14px', color: '#5A5448', margin: 0, lineHeight: 1.65, whiteSpace: 'pre-line' }}>
                {terms.cancellationText}
              </p>
              {terms.note && (
                <p style={{ fontSize: '12.5px', color: '#9A9082', margin: '8px 0 0', lineHeight: 1.55 }}>{terms.note}</p>
              )}
            </div>
          )}

          {/* Stornostaffel */}
          {tiers.length > 0 && (
            <div style={{ marginBottom: '18px' }}>
              <p style={rowLabel}>Wenn du stornieren musst</p>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {tiers.map((c, i) => (
                  <li
                    key={`${c.when}-${i}`}
                    style={{
                      display: 'flex', justifyContent: 'space-between', gap: '16px',
                      fontSize: '14px', color: '#5A5448',
                      padding: '7px 0', borderBottom: '1px solid #F0EADF',
                    }}
                  >
                    <span>{c.when}</span>
                    <span style={{ color: '#16242B', fontWeight: 600, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                      {c.fee}
                    </span>
                  </li>
                ))}
              </ul>
              {terms.note && (
                <p style={{ fontSize: '12.5px', color: '#9A9082', margin: '8px 0 0', lineHeight: 1.55 }}>{terms.note}</p>
              )}
            </div>
          )}
        </>
      )}

      <p
        style={{
          fontSize: '13px', color: '#6B6457', margin: 0,
          paddingTop: isVorreservierung ? '14px' : '2px',
          borderTop: isVorreservierung ? '1px solid #F0EADF' : 'none',
        }}
      >
        Es gelten unsere{' '}
        <a href="/agb" target="_blank" rel="noreferrer" style={{ color: '#A8542F', textDecoration: 'underline' }}>
          vollständigen Reisebedingungen
        </a>
        .
      </p>
    </div>
  );
}
