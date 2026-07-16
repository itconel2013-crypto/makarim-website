import type { Metadata } from 'next';
import { loadContent } from '@/lib/db';
import { LegalPage } from '@/components/website/LegalPage';

export async function generateMetadata(): Promise<Metadata> {
  const content = await loadContent();
  return { title: `Datenschutz | ${content.c.seo.siteName}` };
}

export default async function DatenschutzPage() {
  const content = await loadContent();
  return <LegalPage title="Datenschutzerklärung" text={content.c.legal?.datenschutz} />;
}
