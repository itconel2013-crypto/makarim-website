import Image from 'next/image';
import Link from 'next/link';
import { loadContent } from '@/lib/db';

export default async function Footer() {
  const store = await loadContent();
  const brand = store?.c?.brand;

  return (
    <footer style={{ backgroundColor: '#16242B' }} className="text-white pt-14 pb-8 mt-12">
      <div className="container-max">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-10 border-b border-white/10">

          {/* Brand column */}
          <div className="md:col-span-1">
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
          <div>
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
          <div>
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

          {/* Bankverbindung */}
          <div>
            <h4 className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: '#9DB0AD' }}>
              Bankverbindung
            </h4>
            <dl className="text-sm space-y-1" style={{ color: '#9DB0AD' }}>
              <dt className="sr-only">Kontoinhaber</dt>
              <dd>{brand?.bank?.inhaber}</dd>
              <dt className="sr-only">Bank</dt>
              <dd>{brand?.bank?.name}</dd>
              <dt className="font-mono text-xs mt-2">IBAN</dt>
              <dd className="font-mono text-xs">{brand?.bank?.iban}</dd>
              <dt className="font-mono text-xs">BIC</dt>
              <dd className="font-mono text-xs">{brand?.bank?.bic}</dd>
            </dl>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ color: '#9DB0AD' }}>
          <p>© {new Date().getFullYear()} Makarim GmbH · Alle Rechte vorbehalten</p>
          <p>Pilgerreisen mit Seele</p>
        </div>
      </div>
    </footer>
  );
}
