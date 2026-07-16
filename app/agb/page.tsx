import type { Metadata } from 'next';
import { loadContent } from '@/lib/db';
import { LegalPage } from '@/components/website/LegalPage';

export async function generateMetadata(): Promise<Metadata> {
  const content = await loadContent();
  return { title: `AGB & Reisebedingungen | ${content.c.seo.siteName}` };
}

export default async function AgbPage() {
  const content = await loadContent();
  return <LegalPage title="AGB & Reisebedingungen" text={content.c.legal?.agb} />;
}
