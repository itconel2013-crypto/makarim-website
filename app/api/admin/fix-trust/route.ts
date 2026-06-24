import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { loadContent, saveContent } from '@/lib/db';

// One-time migration: fix home.trust data on Railway
export async function POST(request: NextRequest) {
  const session = request.cookies.get('makarim_session')?.value ?? '';
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const store = await loadContent();

  store.c.home.stats = [
    { value: '40+',     label: 'Jahre Erfahrung' },
    { value: '10.000+', label: 'Pilger betreut' },
    { value: '300+',    label: 'organisierte Reisen' },
    { value: '100%',    label: 'aus einer Hand' },
  ];

  store.c.home.trust = [
    { value: 'Rundum-Sorglos-Paket',     label: 'Bei Makarim stehst Du im Mittelpunkt. Wir sorgen dafür, dass Du Dich von Anfang an wie in einer Familie willkommen und aufgehoben fühlst.' },
    { value: 'Jahrzehntelange Erfahrung', label: 'Über 40 Jahre Erfahrung in Hajj- und Umrah Reisen stehen für Vertrauen, Qualität und eine verlässliche Organisation.' },
    { value: 'Alles aus einer Hand',      label: 'Visum, Flüge, Hotels und Verpflegung – wir kümmern uns um jedes Detail. So kannst Du Dich ganz auf Deine Umrah und Deine spirituelle Erfahrung konzentrieren.' },
    { value: 'Erstklassiger Service',     label: 'Professionelles Team mit 24/7 Kontakt während Deiner gesamten Reise – organisatorisch und persönlich bestens betreut.' },
  ];

  await saveContent(store);
  revalidatePath('/', 'layout');
  return NextResponse.json({ success: true });
}
