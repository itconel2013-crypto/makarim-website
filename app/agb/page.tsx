import type { Metadata } from 'next';
import { loadContent } from '@/lib/db';
import { LegalPage } from '@/components/website/LegalPage';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const content = await loadContent();
  return pageMetadata({
    title: `AGB & Reisebedingungen | ${content.c.seo.siteName}`,
    description: 'Unsere Allgemeinen Reisebedingungen: Zahlung, Rücktritt, Leistungen und Haftung.',
    path: '/agb',
    image: content.c.home?.heroUrl,
    siteName: content.c.seo.siteName,
  });
}

export default async function AgbPage() {
  const content = await loadContent();
  return <LegalPage title="AGB & Reisebedingungen" text={content.c.legal?.agb} />;
}
