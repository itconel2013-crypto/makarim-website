import { loadContent } from '@/lib/db';

export const metadata = { title: 'FAQ — Makarim Reisen' };

export default async function FAQPage() {
  const content = await loadContent();
  const faq = content.c.faq;

  return (
    <main>
      <section className="py-section" style={{ backgroundColor: '#F4F1EA' }}>
        <div className="container-max" style={{ maxWidth: '820px' }}>
          <p className="font-mono uppercase mb-4" style={{ fontSize: '13px', letterSpacing: '0.2em', color: '#A8542F' }}>
            Häufige Fragen
          </p>
          <h1 className="font-serif font-normal text-ink mb-14" style={{ fontSize: 'clamp(28px, 4vw, 44px)', lineHeight: '1.15' }}>
            Wir haben Antworten
          </h1>

          <div className="space-y-3">
            {faq.map((item, i) => (
              <details
                key={i}
                className="group bg-white rounded-card overflow-hidden"
                style={{ border: '1px solid #EAE3D8' }}
              >
                <summary
                  className="flex items-center justify-between px-7 py-5 cursor-pointer list-none font-serif font-normal text-ink"
                  style={{ fontSize: '18px' }}
                >
                  <span>{item.q}</span>
                  <span className="text-primary text-xl ml-4 flex-shrink-0 transition-transform group-open:rotate-45">+</span>
                </summary>
                <div className="px-7 pb-6 text-body" style={{ fontSize: '15px', lineHeight: '1.7', borderTop: '1px solid #EAE3D8', paddingTop: '20px' }}>
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
