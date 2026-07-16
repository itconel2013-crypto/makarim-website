import type { Metadata } from 'next';
import { loadContent } from '@/lib/db';
import { LegalPage } from '@/components/website/LegalPage';

export async function generateMetadata(): Promise<Metadata> {
  const content = await loadContent();
  return { title: `Impressum | ${content.c.seo.siteName}` };
}

export default async function ImpressumPage() {
  const content = await loadContent();
  return <LegalPage title="Impressum" text={content.c.legal?.impressum} />;
}
