'use client';

import { useCMS } from '@/components/cms/CMSProvider';
import { PublishBar } from '@/components/cms/PublishBar';
import { Field, TextInput, FormSection } from '@/components/cms/FormEditor';
import { Brand, BookingPageConfig, defaultBookingPage } from '@/lib/content-schema';

export default function BuchungBestaetigungEditor() {
  const { store, updateSection } = useCMS();
  if (!store) return null;

  const brand = store.c.brand;
  const bp: BookingPageConfig = brand.bookingPage ?? {};
  const d = defaultBookingPage;

  const upd = (patch: Partial<BookingPageConfig>) =>
    updateSection('brand', { ...brand, bookingPage: { ...bp, ...patch } } as Brand);

  return (
    <>
      <PublishBar title="Buchungsseite" subtitle="Text der Bestätigungsseite im Browser nach dem Buchen" />
      <main className="flex-1 overflow-auto p-8">
        <div style={{ maxWidth: '600px' }}>

          <p className="mb-6 text-body-sm text-body" style={{ background: '#F4F1EA', borderRadius: '10px', padding: '12px 16px' }}>
            Platzhalter: <strong>{'{reise}'}</strong> wird durch den Reisetitel ersetzt,{' '}
            <strong>{'{vg}'}</strong> durch die Vorgangsnummer (z. B. VG 2026-8001).
          </p>

          <FormSection title="Kopfbereich">
            <Field label="Überschrift">
              <TextInput value={bp.heading ?? ''} onChange={(v) => upd({ heading: v })} placeholder={d.heading} />
            </Field>
            <Field label="Einleitungstext" hint="{reise} = Reisetitel">
              <TextInput value={bp.intro ?? ''} onChange={(v) => upd({ intro: v })} multiline rows={3} placeholder={d.intro} />
            </Field>
          </FormSection>

          <FormSection title="Nächste Schritte">
            <Field label="Überschrift der Schritte">
              <TextInput value={bp.stepsTitle ?? ''} onChange={(v) => upd({ stepsTitle: v })} placeholder={d.stepsTitle} />
            </Field>

            <Field label="Schritt 1 — Titel">
              <TextInput value={bp.step1Title ?? ''} onChange={(v) => upd({ step1Title: v })} placeholder={d.step1Title} />
            </Field>
            <Field label="Schritt 1 — Text">
              <TextInput value={bp.step1Text ?? ''} onChange={(v) => upd({ step1Text: v })} multiline rows={2} placeholder={d.step1Text} />
            </Field>

            <Field label="Schritt 2 — Titel">
              <TextInput value={bp.step2Title ?? ''} onChange={(v) => upd({ step2Title: v })} placeholder={d.step2Title} />
            </Field>
            <Field label="Schritt 2 — Text" hint="{vg} = Vorgangsnummer">
              <TextInput value={bp.step2Text ?? ''} onChange={(v) => upd({ step2Text: v })} multiline rows={2} placeholder={d.step2Text} />
            </Field>

            <Field label="Schritt 3 — Titel">
              <TextInput value={bp.step3Title ?? ''} onChange={(v) => upd({ step3Title: v })} placeholder={d.step3Title} />
            </Field>
            <Field label="Schritt 3 — Text">
              <TextInput value={bp.step3Text ?? ''} onChange={(v) => upd({ step3Text: v })} multiline rows={2} placeholder={d.step3Text} />
            </Field>
          </FormSection>

        </div>
      </main>
    </>
  );
}
