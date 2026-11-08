import type { Metadata } from 'next';
import { loadContent } from '@/lib/db';
import { LegalPage } from '@/components/website/LegalPage';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const content = await loadContent();
  return pageMetadata({
    title: `Impressum | ${content.c.seo.siteName}`,
    description: 'Anbieterkennzeichnung, Anschrift und Kontakt von Makarim Reisen.',
    path: '/impressum',
    image: content.c.home?.heroUrl,
    siteName: content.c.seo.siteName,
  });
}

export default async function ImpressumPage() {
  const content = await loadContent();
  return <LegalPage title="Impressum" text={content.c.legal?.impressum} />;
}
