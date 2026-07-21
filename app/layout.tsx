import type { Metadata } from 'next';
import Script from 'next/script';
import '@/styles/globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import { RefCapture } from '@/components/layout/RefCapture';

// Umami-Webanalyse (self-hosted auf Railway, EU-Region) — cookielos & DSGVO-
// freundlich: keine Cookies, keine personenbezogenen Daten → kein Consent-Banner.
// Ausgeliefert über die eigene Subdomain analytics.makarim.de (First-Party →
// wird von Adblockern seltener geblockt als die *.up.railway.app-Adresse).
const UMAMI_SRC = 'https://analytics.makarim.de/script.js';
const UMAMI_WEBSITE_ID = 'af405f8b-c139-490e-a5a4-710706cb7d9c';

// Render public pages per-request (always reflect live CMS content, and avoid
// baking stale build-time data — the SQLite volume isn't mounted at build).
// Speed now comes from the in-process content cache in lib/db.ts, not from a
// 13 MB re-read per request, plus images served as cached files (not base64).
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.makarim.de'),
  title: 'Makarim – Pilgerreisen mit Seele',
  description: 'Entdecke spirituelle Pilgerreisen zu den heiligen Stätten und islamische Kulturreisen.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen flex flex-col">
        <Script
          src={UMAMI_SRC}
          data-website-id={UMAMI_WEBSITE_ID}
          strategy="afterInteractive"
        />
        <RefCapture />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
