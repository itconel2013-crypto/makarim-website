/**
 * Darstellung einer Rechtsseite (Impressum/AGB/Datenschutz).
 *
 * Der Text kommt als REINER TEXT aus dem CMS — kein HTML, kein Markdown. Das
 * Eingabefeld ist bewusst ein schlichtes Textfeld: Rechtstexte werden aus einer
 * Anwaltsvorlage eingefügt, und niemand soll dabei Auszeichnungen lernen müssen.
 *
 * Damit 15.000 Zeichen Reisebedingungen trotzdem lesbar sind, erkennt diese
 * Komponente die Gliederung am Text selbst (siehe gliedere): Abschnittsüberschriften,
 * Unterziffern und Tabellenzeilen. Es wird NIE etwas am Inhalt geändert — nur
 * daran, wie er aussieht. Erkennt die Heuristik nichts, steht da ein normaler
 * Absatz; schlimmstenfalls sieht es aus wie vorher.
 */

type Block =
  | { art: 'ueberschrift'; text: string }
  | { art: 'absatz'; nummer?: string; text: string }
  | { art: 'tabelle'; zeilen: { links: string; rechts: string }[] };

/** Trennzeichen der Tabellenzeilen („Über 60 Tage vor Abreise — 20 %"). */
const SPALTE = ' — ';

/**
 * „5. Rücktritt und Kündigung durch Makarim" ist eine Überschrift,
 * „5. Mai 2027 ist der Abreisetag." nicht. Unterschieden wird an drei Merkmalen:
 * kurz, beginnt nach der Nummer groß, endet nicht wie ein Satz.
 */
function istUeberschrift(zeile: string): boolean {
  if (zeile.length > 80) return false;
  if (/[.,;:]$/.test(zeile)) return false;
  return /^\d{1,2}\.\s+[A-ZÄÖÜ]/.test(zeile);
}

/**
 * Überschrift ohne Nummer („Veranstalter und Geltungsbereich", im Impressum
 * „Vertreten durch"). Hier ist die Verwechslungsgefahr größer, deshalb streng:
 * kurz, mehrere Wörter, groß beginnend, KEINE Ziffer und KEIN Doppelpunkt.
 * Damit bleiben „Anton-Hehn-Straße 5" und „Telefon: +49 …" normale Zeilen.
 */
function istUeberschriftOhneNummer(zeile: string): boolean {
  if (zeile.length > 60) return false;
  if (/[.,;:]/.test(zeile)) return false;
  if (/\d/.test(zeile)) return false;
  const woerter = zeile.split(/\s+/);
  if (woerter.length < 2 || woerter.length > 6) return false;
  return /^[A-ZÄÖÜ]/.test(zeile);
}

/** „4.4 Abweichend von …" → Nummer getrennt, damit sie hervorgehoben werden kann. */
function unterziffer(zeile: string): { nummer: string; rest: string } | null {
  const m = zeile.match(/^(\d{1,2}\.\d{1,2})\s+(.*)$/s);
  return m ? { nummer: m[1], rest: m[2] } : null;
}

export function gliedere(text: string): Block[] {
  const zeilen = text.split('\n').map((z) => z.trim());
  const blocks: Block[] = [];

  for (let i = 0; i < zeilen.length; i++) {
    const z = zeilen[i];
    if (!z) continue;

    // Tabelle: mindestens zwei aufeinanderfolgende Zeilen mit Trennzeichen.
    if (z.includes(SPALTE)) {
      const lauf: string[] = [];
      let j = i;
      while (j < zeilen.length && zeilen[j].includes(SPALTE)) lauf.push(zeilen[j++]);
      if (lauf.length >= 2) {
        blocks.push({
          art: 'tabelle',
          zeilen: lauf.map((r) => {
            const k = r.indexOf(SPALTE);
            return { links: r.slice(0, k).trim(), rechts: r.slice(k + SPALTE.length).trim() };
          }),
        });
        i = j - 1;
        continue;
      }
    }

    // Die allererste Zeile ist in der Praxis der Firmenname direkt unter der
    // Seitenüberschrift — die soll keine Abschnittsüberschrift werden.
    if (istUeberschrift(z) || (blocks.length > 0 && istUeberschriftOhneNummer(z))) {
      blocks.push({ art: 'ueberschrift', text: z });
      continue;
    }

    const u = unterziffer(z);
    blocks.push(u ? { art: 'absatz', nummer: u.nummer, text: u.rest } : { art: 'absatz', text: z });
  }

  return blocks;
}

export function LegalPage({ title, text }: { title: string; text?: string }) {
  const body = (text ?? '').trim();
  const blocks = body ? gliedere(body) : [];

  return (
    <main className="min-h-screen bg-page">
      <section className="py-section">
        <div className="container-max" style={{ maxWidth: '820px' }}>
          <h1 className="font-serif font-normal text-ink mb-8" style={{ fontSize: 'clamp(28px, 4vw, 40px)', lineHeight: '1.15' }}>
            {title}
          </h1>

          {blocks.length > 0 ? (
            <div className="text-body" style={{ fontSize: '15.5px', lineHeight: 1.75 }}>
              {blocks.map((b, i) => {
                if (b.art === 'ueberschrift') {
                  return (
                    <h2
                      key={i}
                      className="font-serif font-normal text-ink"
                      style={{
                        fontSize: '21px',
                        lineHeight: 1.3,
                        margin: i === 0 ? '0 0 14px' : '34px 0 14px',
                        paddingBottom: '8px',
                        borderBottom: '1px solid #EAE3D8',
                      }}
                    >
                      {b.text}
                    </h2>
                  );
                }

                if (b.art === 'tabelle') {
                  return (
                    <div key={i} style={{ margin: '0 0 18px' }}>
                      {b.zeilen.map((r, k) => (
                        <div
                          key={k}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: '20px',
                            padding: '8px 0',
                            borderBottom: '1px solid #F0EADF',
                            // Erste Zeile ist die Kopfzeile der Staffel.
                            fontWeight: k === 0 ? 600 : 400,
                            color: k === 0 ? '#16242B' : undefined,
                          }}
                        >
                          <span>{r.links}</span>
                          <span
                            style={{
                              // Werte („20 %") nie umbrechen; die Kopfzeile dagegen schon —
                              // sonst drückt sie am Handy die linke Spalte zusammen.
                              whiteSpace: k === 0 ? 'normal' : 'nowrap',
                              textAlign: 'right',
                              fontVariantNumeric: 'tabular-nums',
                              color: '#16242B',
                              fontWeight: 600,
                            }}
                          >
                            {r.rechts}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }

                return (
                  <p key={i} style={{ margin: '0 0 14px' }}>
                    {b.nummer && (
                      <strong style={{ color: '#16242B', fontWeight: 600 }}>{b.nummer} </strong>
                    )}
                    {b.text}
                  </p>
                );
              })}
            </div>
          ) : (
            <div className="rounded-card bg-white p-8" style={{ border: '1px solid #EAE3D8' }}>
              <p className="text-body-light" style={{ fontSize: '15px', lineHeight: 1.7 }}>
                Diese Angaben werden derzeit ergänzt.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
