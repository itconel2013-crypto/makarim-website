'use client';

interface TrustCardItem {
  icon: string;
  title: string;
  description: string;
}

interface TrustCardsProps {
  cards: TrustCardItem[];
}

export function TrustCards({ cards }: TrustCardsProps) {
  return (
    <section className="py-section bg-page">
      <div className="container-max">
        {/* Kicker */}
        <p
          className="font-mono uppercase text-center mb-4"
          style={{ fontSize: '13px', letterSpacing: '0.2em', color: '#A8542F' }}
        >
          Warum wir
        </p>

        {/* Section heading */}
        <h2
          className="font-serif font-normal text-ink text-center mb-14"
          style={{ fontSize: '42px', lineHeight: '1.2' }}
        >
          Vier gute Gründe, mit uns zu reisen
        </h2>

        {/* 4-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className="bg-white rounded-card p-7 flex flex-col"
              style={{
                border: '1px solid #EAE3D8',
                boxShadow: '0 6px 22px rgba(40,30,20,0.05)',
              }}
            >
              {/* Badge "01", "02" … */}
              <div
                className="font-mono font-semibold mb-5 flex-shrink-0 flex items-center justify-center"
                style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#F5EAE1', fontSize: '13px', color: '#C2724A', letterSpacing: '0.05em' }}
              >
                {String(idx + 1).padStart(2, '0')}
              </div>

              {/* Title — terracotta, Newsreader */}
              <h3
                className="font-serif font-normal mb-3"
                style={{ fontSize: '20px', color: '#C2724A', lineHeight: '1.25' }}
              >
                {card.title}
              </h3>

              {/* Body */}
              {card.description && (
                <p className="text-sm leading-relaxed" style={{ color: '#6B6457' }}>
                  {card.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
