import type { Metadata } from 'next';
import '@/styles/globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import { RefCapture } from '@/components/layout/RefCapture';

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
        <RefCapture />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
