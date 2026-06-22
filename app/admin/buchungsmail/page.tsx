'use client';

import { useCMS } from '@/components/cms/CMSProvider';
import { PublishBar } from '@/components/cms/PublishBar';
import { Field, TextInput, FormSection } from '@/components/cms/FormEditor';
import { Brand, BookingEmailConfig } from '@/lib/content-schema';

export default function BuchungsMailEditor() {
  const { store, updateSection } = useCMS();
  if (!store) return null;

  const brand = store.c.brand;
  const be: BookingEmailConfig = brand.bookingEmail ?? {};

  const upd = (patch: Partial<BookingEmailConfig>) =>
    updateSection('brand', { ...brand, bookingEmail: { ...be, ...patch } } as Brand);

  return (
    <>
      <PublishBar title="Buchungs-E-Mail" subtitle="Text der Bestätigungs-E-Mail an den Kunden" />
      <main className="flex-1 overflow-auto p-8">
        <div style={{ maxWidth: '600px' }}>

          <FormSection title="Einleitungstext">
            <Field label="Text nach der Anrede">
              <TextInput
                value={be.intro ?? ''}
                onChange={(v) => upd({ intro: v })}
                multiline
                rows={4}
                placeholder="vielen Dank für Ihre Buchungsanfrage…"
              />
            </Field>
          </FormSection>

          <FormSection title="Nächste Schritte">
            <Field label="Schritt 1 — Titel">
              <TextInput value={be.step1Title ?? ''} onChange={(v) => upd({ step1Title: v })} placeholder="Wir bestätigen Ihre Anfrage" />
            </Field>
            <Field label="Schritt 1 — Text">
              <TextInput value={be.step1Text ?? ''} onChange={(v) => upd({ step1Text: v })} multiline rows={2} placeholder="Sie erhalten innerhalb von 24 Stunden…" />
            </Field>

            <Field label="Schritt 2 — Titel">
              <TextInput value={be.step2Title ?? ''} onChange={(v) => upd({ step2Title: v })} placeholder="Anzahlung überweisen" />
            </Field>
            <Field label="Schritt 2 — Text">
              <TextInput value={be.step2Text ?? ''} onChange={(v) => upd({ step2Text: v })} multiline rows={2} placeholder="Nach Bestätigung überweisen Sie…" />
            </Field>

            <Field label="Schritt 3 — Titel">
              <TextInput value={be.step3Title ?? ''} onChange={(v) => upd({ step3Title: v })} placeholder="Reiseunterlagen" />
            </Field>
            <Field label="Schritt 3 — Text">
              <TextInput value={be.step3Text ?? ''} onChange={(v) => upd({ step3Text: v })} multiline rows={2} placeholder="Ca. 4 Wochen vor Reisebeginn…" />
            </Field>
          </FormSection>

        </div>
      </main>
    </>
  );
}
