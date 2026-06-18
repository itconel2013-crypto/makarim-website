'use client';

import Link from 'next/link';

interface HeroSectionProps {
  kicker: string;
  headline: string;
  sub: string;
  heroImage?: string;
}

export function HeroSection({ kicker, headline, sub, heroImage }: HeroSectionProps) {
  return (
    <section className="relative w-full flex items-center justify-center overflow-hidden" style={{ minHeight: '88vh' }}>
      {/* Background image */}
      {heroImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
          aria-hidden="true"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-ink to-teal" aria-hidden="true" />
      )}

      {/* Gradient overlay — spec: rgba(20,14,8,0.32) → rgba(20,14,8,0.62) */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg, rgba(20,14,8,0.32) 0%, rgba(20,14,8,0.62) 100%)' }}
        aria-hidden="true"
      />

      {/* Content — max 760px */}
      <div className="relative z-10 text-center text-white px-gutter w-full" style={{ maxWidth: '760px', margin: '0 auto' }}>
        {/* Kicker — mono, 13px, letter-spacing .2em, #F0CDA8 */}
        <p
          className="font-mono uppercase mb-6"
          style={{ fontSize: '13px', letterSpacing: '0.2em', color: '#F0CDA8' }}
        >
          {kicker}
        </p>

        {/* H1 — Newsreader 62px / 1.05 */}
        <h1
          className="font-serif font-normal text-white mb-6"
          style={{ fontSize: 'clamp(36px, 6vw, 62px)', lineHeight: '1.05' }}
        >
          {headline}
        </h1>

        {/* Sub — 18px, rgba(255,255,255,.92) */}
        <p
          className="mb-12 leading-relaxed"
          style={{ fontSize: '18px', color: 'rgba(255,255,255,0.92)' }}
        >
          {sub}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {/* Primary — terracotta, 54px tall, radius 13px */}
          <a
            href="#kategorien"
            className="inline-flex items-center justify-center font-sans font-medium text-white transition-colors"
            style={{
              backgroundColor: '#C2724A',
              height: '54px',
              borderRadius: '13px',
              padding: '0 32px',
              fontSize: '16px',
            }}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('kategorien')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          >
            Reisen entdecken
          </a>

          {/* Secondary — translucent white border */}
          <Link
            href="/ueber-uns"
            className="inline-flex items-center justify-center font-sans font-medium text-white transition-colors"
            style={{
              height: '54px',
              borderRadius: '13px',
              padding: '0 32px',
              fontSize: '16px',
              border: '1.5px solid rgba(255,255,255,0.55)',
              backgroundColor: 'rgba(255,255,255,0.12)',
            }}
          >
            Mehr erfahren
          </Link>
        </div>
      </div>
    </section>
  );
}
