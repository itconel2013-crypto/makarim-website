'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Category } from '@/lib/content-schema';

const fallbackImages: Record<string, string> = {
  umrah: '/assets/examples/cat-umrah.jpg',
  hajj: '/assets/examples/cat-hajj.jpg',
  kulturreisen: '/assets/examples/cat-kultur.jpg',
};

interface CategoryGridProps {
  categories: Category[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <section id="kategorien" className="py-section bg-white">
      <div className="container-max">
        {/* Kicker + heading + sub */}
        <p
          className="font-mono uppercase text-center mb-4"
          style={{ fontSize: '13px', letterSpacing: '0.2em', color: '#A8542F' }}
        >
          Unsere Kategorien
        </p>
        <h2
          className="font-serif font-normal text-ink text-center mb-4"
          style={{ fontSize: 'clamp(26px, 4vw, 42px)', lineHeight: '1.2' }}
        >
          Finde deine perfekte Reise
        </h2>
        <p className="text-center mb-14 max-w-lg mx-auto" style={{ fontSize: '18px', color: '#5A5448' }}>
          Von der kleinen Pilgerfahrt bis zur großen Kulturreise — wir begleiten dich.
        </p>

        {/* 3-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((cat) => {
            const key = cat.key ?? cat.url ?? '';
            const imgSrc = cat.imageUrl || fallbackImages[key];

            return (
              <div key={key} className="group flex flex-col overflow-hidden rounded-card" style={{ boxShadow: '0 6px 22px rgba(40,30,20,0.05)' }}>
                {/* Image — aspect 4/3, clickable */}
                <Link href={`/${key}`} className="relative overflow-hidden block" style={{ aspectRatio: '4/3' }}>
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={`${cat.title} – Kategoriebild`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      style={{ display: 'block' }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-ink/20 flex items-center justify-center">
                      <span className="text-6xl">{cat.icon ?? '✈️'}</span>
                    </div>
                  )}
                </Link>

                {/* Card body */}
                <div className="flex flex-col flex-1 bg-white p-6">
                  <h3
                    className="font-serif font-normal text-ink mb-3"
                    style={{ fontSize: '24px' }}
                  >
                    {cat.title}
                  </h3>
                  <p className="text-body-sm text-body mb-6 flex-1">
                    {cat.text}
                  </p>

                  {/* Full-width terracotta button — 48px */}
                  <Link
                    href={`/${key}`}
                    className="block w-full text-center text-white font-medium transition-colors"
                    style={{
                      backgroundColor: '#C2724A',
                      height: '48px',
                      lineHeight: '48px',
                      borderRadius: '9px',
                      fontSize: '15px',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#A8542F')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#C2724A')}
                  >
                    Jetzt entdecken
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
