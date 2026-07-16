/**
 * Darstellung einer Rechtsseite (Impressum/AGB/Datenschutz). Der Text kommt aus
 * dem CMS und wird als reiner Text mit erhaltenen Absätzen ausgegeben (kein HTML).
 * Ist noch kein Text hinterlegt, erscheint ein neutraler Platzhalter.
 */
export function LegalPage({ title, text }: { title: string; text?: string }) {
  const body = (text ?? '').trim();

  return (
    <main className="min-h-screen bg-page">
      <section className="py-section">
        <div className="container-max" style={{ maxWidth: '820px' }}>
          <h1 className="font-serif font-normal text-ink mb-8" style={{ fontSize: 'clamp(28px, 4vw, 40px)', lineHeight: '1.15' }}>
            {title}
          </h1>

          {body ? (
            <div
              className="text-body"
              style={{ fontSize: '15.5px', lineHeight: 1.75, whiteSpace: 'pre-line' }}
            >
              {body}
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
