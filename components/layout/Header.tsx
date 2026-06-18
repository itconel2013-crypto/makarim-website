'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/umrah',        label: 'Umrah' },
  { href: '/hajj',         label: 'Hajj' },
  { href: '/kulturreisen', label: 'Kulturreisen' },
  { href: '/ueber-uns',    label: 'Über uns' },
  { href: '/faq',          label: 'FAQ' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname        = usePathname();

  // Close menu on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-border-light">
        <div className="container-max flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/assets/makarim_soultreat.png"
              alt="Makarim Reisen"
              height={48}
              width={160}
              className="h-12 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6" style={{ fontSize: '16.5px', color: '#3F4A44' }}>
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="hover:text-primary-dark transition-colors"
                style={{ color: pathname.startsWith(href) ? '#A8542F' : '#3F4A44' }}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Kontakt CTA */}
          <Link
            href="/kontakt"
            className="hidden md:inline-flex items-center justify-center font-medium text-white transition-colors"
            style={{
              backgroundColor: '#C2724A',
              height: '40px',
              borderRadius: '10px',
              padding: '0 20px',
              fontSize: '15px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#A8542F')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#C2724A')}
          >
            Kontakt
          </Link>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-ink"
            aria-label={open ? 'Menü schließen' : 'Menü öffnen'}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? (
              /* X icon */
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <line x1="2" y1="2" x2="20" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="20" y1="2" x2="2" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              /* Hamburger icon */
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <rect y="3"  width="22" height="2" rx="1" fill="currentColor" />
                <rect y="10" width="22" height="2" rx="1" fill="currentColor" />
                <rect y="17" width="22" height="2" rx="1" fill="currentColor" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-30"
          style={{ backgroundColor: 'rgba(22,36,43,0.96)', backdropFilter: 'blur(4px)' }}
          onClick={() => setOpen(false)}
        >
          <nav
            className="flex flex-col items-center justify-center h-full gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="py-4 px-8 text-2xl font-serif font-normal text-center transition-colors"
                style={{ color: pathname.startsWith(href) ? '#C2724A' : 'rgba(255,255,255,0.9)' }}
              >
                {label}
              </Link>
            ))}

            {/* Divider */}
            <div className="w-12 my-4" style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.15)' }} />

            {/* CTA */}
            <Link
              href="/umrah/umrah-luxus-2026/booking"
              className="inline-flex items-center justify-center font-medium text-white"
              style={{ backgroundColor: '#C2724A', height: '52px', borderRadius: '13px', padding: '0 32px', fontSize: '16px' }}
            >
              Jetzt buchen
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
