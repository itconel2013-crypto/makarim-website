import { loadContent } from '@/lib/db';
import { WhatsAppFab } from './WhatsAppFab';

export default async function WhatsAppButton() {
  const store = await loadContent();
  const whatsapp = store?.c?.brand?.whatsapp ?? '';
  const number = whatsapp.replace(/[^0-9]/g, '');

  return <WhatsAppFab number={number} />;
}
