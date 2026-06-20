import Image from 'next/image';
import Link from 'next/link';
import { loadContent } from '@/lib/db';

export default async function Footer() {
  const store = await loadContent();
  const brand = store?.c?.brand;

  return (
    <footer style={{ backgroundColor: '#16242B' }} className="text-white pt-14 pb-8 mt-12">
      <div className="container-max">
        <div className="flex flex-wrap justify-center gap-x-16 gap-y-10 pb-10 border-b border-white/10">

          {/* Brand column */}
          <div style={{ minWidth: '180px' }}>
            <Image
              src="/assets/makarim_soultreat.png"
              alt="Makarim Reisen"
              height={40}
              width={140}
              className="h-10 w-auto object-contain brightness-0 invert mb-4"
            />
            <p className="text-sm" style={{ color: '#9DB0AD', lineHeight: '1.7' }}>
              {brand?.address1}<br />
              {brand?.address2}
            </p>
          </div>

          {/* Navigation */}
          <div style={{ minWidth: '130px' }}>
            <h4 className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: '#9DB0AD' }}>
              Reisen
            </h4>
            <ul className="space-y-2 text-sm" style={{ color: '#9DB0AD' }}>
              <li><Link href="/umrah" className="hover:text-white transition-colors">Umrah</Link></li>
              <li><Link href="/hajj" className="hover:text-white transition-colors">Hajj</Link></li>
              <li><Link href="/kulturreisen" className="hover:text-white transition-colors">Kulturreisen</Link></li>
              <li><Link href="/ueber-uns" className="hover:text-white transition-colors">Über uns</Link></li>
            </ul>
          </div>

          {/* Kontakt */}
          <div style={{ minWidth: '160px' }}>
            <h4 className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: '#9DB0AD' }}>
              Kontakt
            </h4>
            <ul className="space-y-2 text-sm" style={{ color: '#9DB0AD' }}>
              {brand?.phone && (
                <li>
                  <a href={`tel:${brand.phone}`} className="hover:text-white transition-colors">
                    {brand.phone}
                  </a>
                </li>
              )}
              {brand?.email && (
                <li>
                  <a href={`mailto:${brand.email}`} className="hover:text-white transition-colors">
                    {brand.email}
                  </a>
                </li>
              )}
              {brand?.instagram && (
                <li>
                  <a href={`https://instagram.com/${brand.instagram.replace('@', '')}`} className="hover:text-white transition-colors" target="_blank" rel="noreferrer">
                    {brand.instagram}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: '#9DB0AD' }}>
              Info
            </h4>
            <ul className="space-y-2 text-sm" style={{ color: '#9DB0AD' }}>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/kontakt" className="hover:text-white transition-colors">Kontakt</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ color: '#9DB0AD' }}>
          <p>{brand?.footerCopyright ?? `© ${new Date().getFullYear()} Makarim GmbH · Alle Rechte vorbehalten`}</p>
          <p>{brand?.footerTagline ?? 'Pilgerreisen mit Seele'}</p>
        </div>
      </div>
    </footer>
  );
}
