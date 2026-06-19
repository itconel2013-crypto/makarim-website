'use client';

import { useCMS } from '@/components/cms/CMSProvider';
import { PublishBar } from '@/components/cms/PublishBar';
import { Field, TextInput, FormSection } from '@/components/cms/FormEditor';
import { LivePreviewPane } from '@/components/cms/LivePreviewPane';
import { KontaktPreview } from '@/components/cms/previews/KontaktPreview';
import { Brand, BankDetails, CTA } from '@/lib/content-schema';

export default function KontaktFooterEditor() {
  const { store, updateSection } = useCMS();
  if (!store) return null;

  const brand = store.c.brand;
  const cta   = store.c.cta;

  const updBrand = (patch: Partial<Brand>) => updateSection('brand', { ...brand, ...patch });
  const updBank  = (patch: Partial<BankDetails>) =>
    updateSection('brand', { ...brand, bank: { ...brand.bank, ...patch } });
  const updCta   = (patch: Partial<CTA>) => updateSection('cta', { ...cta, ...patch });

  return (
    <>
      <PublishBar title="Kontakt & Footer" subtitle="Telefon, Adresse, Bankverbindung, CTA" />
      <div className="flex flex-1 overflow-hidden">
      <main className="flex-1 overflow-auto p-8">
        <div style={{ maxWidth: '560px' }}>

        <FormSection title="Kontaktdaten">
          <Field label="Telefon">
            <TextInput value={brand.phone} onChange={(v) => updBrand({ phone: v })} placeholder="+49 178 …" />
          </Field>
          <Field label="WhatsApp" hint="Ohne + oder Leerzeichen, z.B. 4917812345678">
            <TextInput value={brand.whatsapp} onChange={(v) => updBrand({ whatsapp: v })} />
          </Field>
          <Field label="E-Mail">
            <TextInput value={brand.email} onChange={(v) => updBrand({ email: v })} />
          </Field>
          <Field label="Instagram" hint="@handle oder vollständige URL">
            <TextInput value={brand.instagram} onChange={(v) => updBrand({ instagram: v })} />
          </Field>
        </FormSection>

        <FormSection title="Adresse">
          <Field label="Zeile 1">
            <TextInput value={brand.address1} onChange={(v) => updBrand({ address1: v })} placeholder="Musterstraße 12" />
          </Field>
          <Field label="Zeile 2">
            <TextInput value={brand.address2} onChange={(v) => updBrand({ address2: v })} placeholder="12345 Berlin" />
          </Field>
        </FormSection>

        <FormSection title="Bankverbindung">
          <Field label="Kontoinhaber">
            <TextInput value={brand.bank.inhaber} onChange={(v) => updBank({ inhaber: v })} />
          </Field>
          <Field label="IBAN">
            <TextInput value={brand.bank.iban} onChange={(v) => updBank({ iban: v })} placeholder="DE00 0000 0000 0000 0000 00" />
          </Field>
          <Field label="BIC">
            <TextInput value={brand.bank.bic} onChange={(v) => updBank({ bic: v })} />
          </Field>
          <Field label="Bankname">
            <TextInput value={brand.bank.name} onChange={(v) => updBank({ name: v })} />
          </Field>
        </FormSection>

        <FormSection title="CTA-Band">
          <Field label="Überschrift">
            <TextInput value={cta.headline} onChange={(v) => updCta({ headline: v })} />
          </Field>
          <Field label="Unterzeile">
            <TextInput value={cta.sub} onChange={(v) => updCta({ sub: v })} />
          </Field>
          <Field label="Button: Anrufen">
            <TextInput value={cta.btnCall} onChange={(v) => updCta({ btnCall: v })} />
          </Field>
          <Field label="Button: Schreiben">
            <TextInput value={cta.btnWrite} onChange={(v) => updCta({ btnWrite: v })} />
          </Field>
        </FormSection>

        </div>
      </main>
      <LivePreviewPane url="makarim-reisen.de/#footer" fill noScale>
        <KontaktPreview />
      </LivePreviewPane>
      </div>
    </>
  );
}
