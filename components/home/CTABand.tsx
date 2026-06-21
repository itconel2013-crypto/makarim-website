'use client';

interface CTABandProps {
  headline: string;
  sub: string;
  primaryCTA?: { label: string; href: string };
  secondaryCTA?: { label: string; href: string };
}

export function CTABand({
  headline,
  sub,
  primaryCTA = { label: 'Anrufen', href: 'tel:+4930123456' },
  secondaryCTA = { label: 'Schreiben', href: 'mailto:hello@makarim.de' },
}: CTABandProps) {
  return (
    <section className="py-section bg-page">
      <div className="container-max">
        {/* Dark rounded band — #16242B, radius 24px */}
        <div
          className="text-center text-white px-6 py-12 sm:px-10 sm:py-16"
          style={{
            backgroundColor: '#16242B',
            borderRadius: '24px',
          }}
        >
          {/* H2 — 40px, #F4F1EA */}
          <h2
            className="font-serif font-normal mb-5"
            style={{ fontSize: 'clamp(24px, 4vw, 40px)', lineHeight: '1.2', color: '#F4F1EA' }}
          >
            {headline}
          </h2>

          {/* Sub — #9DB0AD */}
          <p className="mb-10 max-w-lg mx-auto" style={{ fontSize: '18px', color: '#9DB0AD', lineHeight: '1.7' }}>
            {sub}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={primaryCTA.href}
              className="inline-flex items-center justify-center font-medium text-white transition-colors"
              style={{
                backgroundColor: '#C2724A',
                height: '54px',
                borderRadius: '13px',
                padding: '0 32px',
                fontSize: '16px',
              }}
            >
              {primaryCTA.label}
            </a>
            <a
              href={secondaryCTA.href}
              className="inline-flex items-center justify-center font-medium text-white transition-colors"
              style={{
                height: '54px',
                borderRadius: '13px',
                padding: '0 32px',
                fontSize: '16px',
                border: '1.5px solid rgba(255,255,255,0.3)',
                backgroundColor: 'rgba(255,255,255,0.08)',
              }}
            >
              {secondaryCTA.label}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
