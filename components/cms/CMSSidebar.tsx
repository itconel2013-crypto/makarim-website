'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

const navItems = [
  { href: '/admin',               label: 'Übersicht',       icon: '◈' },
  { href: '/admin/startseite',    label: 'Startseite',      icon: '⌂' },
  { href: '/admin/kategorien',    label: 'Kategorien',      icon: '◫' },
  { href: '/admin/reisen',        label: 'Reisen',          icon: '✦' },
  { href: '/admin/kulturreisen',  label: 'Kulturreisen',    icon: '◎' },
  { href: '/admin/faq',           label: 'FAQ',             icon: '?' },
  { href: '/admin/ueber-uns',     label: 'Über uns',        icon: '◉' },
  { href: '/admin/seo',           label: 'SEO',             icon: '⌕' },
  { href: '/admin/mediathek',     label: 'Mediathek',       icon: '⊞' },
  { href: '/admin/kontakt-footer',label: 'Kontakt & Footer',icon: '✉' },
  { href: '/admin/buchungen',     label: 'Buchungen',       icon: '▤' },
  { href: '/admin/buchungsmail', label: 'Buchungs-E-Mail', icon: '✉' },
];

export function CMSSidebar() {
  const pathname = usePathname();
  const router   = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  return (
    <aside
      className="flex flex-col flex-shrink-0"
      style={{ width: '240px', backgroundColor: '#16242B', minHeight: '100vh' }}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div style={{ lineHeight: 1 }}>
          <span style={{ fontFamily: "'Newsreader', serif", fontSize: '20px', fontWeight: 400, color: 'white', letterSpacing: '0.01em' }}>
            Labbayk<span style={{ color: '#C2724A', fontWeight: 600 }}>ONE</span>
          </span>
        </div>
        <p className="font-mono mt-1" style={{ fontSize: '10px', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.35)' }}>
          CMS SUITE
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4">
        <p className="font-mono uppercase px-2 mb-3" style={{ fontSize: '10px', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.35)' }}>
          Inhalte
        </p>
        <ul className="space-y-0.5">
          {navItems.map(({ href, label, icon }) => {
            const active = isActive(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-button text-sm font-medium transition-colors"
                  style={{
                    color: active ? '#FFFFFF' : '#A9B4B2',
                    backgroundColor: active ? '#C2724A' : 'transparent',
                    fontWeight: active ? 600 : 500,
                  }}
                >
                  <span style={{ fontSize: '14px', opacity: active ? 1 : 0.75 }}>{icon}</span>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 text-sm mb-3 transition-colors"
          style={{ color: 'rgba(255,255,255,0.5)' }}
        >
          <span>↗</span> Website ansehen
        </Link>
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-button"
          style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}
        >
          <div
            className="flex-shrink-0 flex items-center justify-center rounded-full text-xs font-semibold text-white"
            style={{ width: '28px', height: '28px', backgroundColor: '#C2724A' }}
          >
            M
          </div>
          <span className="flex-1 text-xs truncate" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Makarim Admin
          </span>
          <button
            onClick={handleLogout}
            title="Abmelden"
            className="flex-shrink-0 text-xs transition-colors"
            style={{ color: 'rgba(255,255,255,0.35)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
          >
            ⏻
          </button>
        </div>
      </div>
    </aside>
  );
}
