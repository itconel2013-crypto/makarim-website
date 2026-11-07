'use client';

import Link from 'next/link';

interface HeroSectionProps {
  kicker: string;
  headline: string;
  sub: string;
  heroImage?: string;
  /** Text des zweiten Buttons — aus dem CMS (home.btnS). */
  btnSecondary?: string;
}

export function HeroSection({ kicker, headline, sub, heroImage, btnSecondary }: HeroSectionProps) {
  return (
    // Höhe kommt aus globals.css (.hero-section): 60 % der Bildschirmhöhe, damit die
    // Zahlenleiste darunter ohne Scrollen im Blick steht (früher 88vh). Dort liegen
    // auch die Sonderregeln für niedrige Laptops und kleine Handys.
    // `hero-section` / `hero-sub` sind die Ansatzpunkte dafür.
    <section className="hero-section relative w-full flex items-center justify-center overflow-hidden py-8">
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

      {/* Content — max 760px.
          Auf dem Handy bewusst verdichtet (knappere Abstände, schmalerer Rand,
          Buttons nebeneinander), damit Bild und zweizeilige Zahlenleiste zusammen in
          den ersten Bildschirm passen. Ab sm: gelten wieder die Desktop-Maße. */}
      <div
        // data-fab-ceiling: Unterkante dieses Blocks (= Buttons) begrenzt nach oben,
        // wohin der WhatsApp-Button ausweichen darf (siehe WhatsAppFab).
        data-fab-ceiling
        className="relative z-10 text-center text-white px-5 sm:px-gutter w-full"
        style={{ maxWidth: '760px', margin: '0 auto' }}
      >
        {/* Kicker — mono, 13px, letter-spacing .2em, #F0CDA8 */}
        <p
          className="font-mono uppercase mb-4 sm:mb-6"
          style={{ fontSize: '13px', letterSpacing: '0.2em', color: '#F0CDA8' }}
        >
          {kicker}
        </p>

        {/* H1 — Newsreader 62px / 1.05.
            text-balance verteilt die Zeilen gleichmäßig — sonst bleibt je nach
            Breite ein einzelnes Wort („Stätten") allein in der zweiten Zeile. */}
        <h1
          className="font-serif font-normal text-white mb-4 sm:mb-6 text-balance"
          style={{ fontSize: 'clamp(32px, 6vw, 62px)', lineHeight: '1.05' }}
        >
          {headline}
        </h1>

        {/* Sub — 18px, rgba(255,255,255,.92); auf dem Handy 16px */}
        <p
          className="hero-sub mb-8 sm:mb-12 leading-relaxed"
          style={{ fontSize: 'clamp(16px, 2.2vw, 18px)', color: 'rgba(255,255,255,0.92)' }}
        >
          {sub}
        </p>

        {/* CTA Buttons — nebeneinander; flex-wrap bricht nur um, wenn ein langer
            Button-Text aus dem CMS nicht mehr in eine Zeile passt. */}
        <div className="flex flex-row flex-wrap gap-3 sm:gap-4 justify-center">
          {/* Primary — terracotta, 54px tall, radius 13px */}
          <a
            href="#kategorien"
            className="inline-flex items-center justify-center font-sans font-medium text-white transition-colors h-12 sm:h-[54px] px-5 sm:px-8 text-[15px] sm:text-base"
            style={{
              backgroundColor: '#C2724A',
              borderRadius: '13px',
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
            className="inline-flex items-center justify-center font-sans font-medium text-white transition-colors h-12 sm:h-[54px] px-5 sm:px-8 text-[15px] sm:text-base"
            style={{
              borderRadius: '13px',
              border: '1.5px solid rgba(255,255,255,0.55)',
              backgroundColor: 'rgba(255,255,255,0.12)',
            }}
          >
            {btnSecondary || 'Über uns'}
          </Link>
        </div>
      </div>
    </section>
  );
}
