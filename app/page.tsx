'use server';

import type { Metadata } from 'next';
import { loadContent } from '@/lib/db';
import { HeroSection } from '@/components/home/HeroSection';
import { StatsBar } from '@/components/home/StatsBar';
import { TrustCards } from '@/components/home/TrustCards';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { TripCardGrid } from '@/components/home/TripCardGrid';
import { CTABand } from '@/components/home/CTABand';

export async function generateMetadata(): Promise<Metadata> {
  const content = await loadContent();
  const seo = content.c.seo.home;
  return {
    title: seo?.title ?? content.c.seo.siteName,
    description: seo?.desc ?? content.c.seo.defaultDesc,
  };
}

export default async function Home() {
  const content = await loadContent();

  const featuredTrips = content.c.trips.filter(
    (trip) => trip.startseite === true && trip.published !== false
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: content.c.brand.address1,
    description: content.c.seo.defaultDesc,
    telephone: content.c.brand.phone,
    email: content.c.brand.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: content.c.brand.address2,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    <main>
      {/* Hero Section */}
      <HeroSection
        kicker={content.c.home.kicker}
        headline={content.c.home.headline}
        sub={content.c.home.sub}
        heroImage={content.c.home.heroUrl}
      />

      {/* Stats Bar — 40+, 10.000+, 300+, 100% */}
      {content.c.home.stats && content.c.home.stats.length > 0 && (
        <StatsBar stats={content.c.home.stats} />
      )}

      {/* Trust Cards */}
      <TrustCards
        cards={content.c.home.trust.map((card) => ({
          icon: card.value,
          title: card.value,
          description: card.label,
        }))}
      />

      {/* Category Grid */}
      <CategoryGrid categories={content.c.categories} />

      {/* Featured Trips */}
      <TripCardGrid
        trips={featuredTrips}
        title="Empfohlene Reisen"
        description="Unsere beliebtesten und exklusivsten Angebote"
      />

      {/* CTA Band */}
      <CTABand
        headline={content.c.cta.headline}
        sub={content.c.cta.sub}
        primaryCTA={{
          label: content.c.cta.btnCall,
          href: `tel:${content.c.brand.phone}`,
        }}
        secondaryCTA={{
          label: content.c.cta.btnWrite,
          href: `mailto:${content.c.brand.email}`,
        }}
      />
    </main>
    </>
  );
}
