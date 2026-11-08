import type { Metadata } from 'next';
import { loadContent } from '@/lib/db';
import { LegalPage } from '@/components/website/LegalPage';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const content = await loadContent();
  return pageMetadata({
    title: `Datenschutz | ${content.c.seo.siteName}`,
    description: 'Wie wir mit deinen Daten umgehen: Erhebung, Zweck, Speicherdauer und deine Rechte.',
    path: '/datenschutz',
    image: content.c.home?.heroUrl,
    siteName: content.c.seo.siteName,
  });
}

export default async function DatenschutzPage() {
  const content = await loadContent();
  return <LegalPage title="Datenschutzerklärung" text={content.c.legal?.datenschutz} />;
}
