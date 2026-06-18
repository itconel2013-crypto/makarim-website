'use client';

import { useCMS } from '@/components/cms/CMSProvider';
import { PublishBar } from '@/components/cms/PublishBar';
import { Field, TextInput, FormSection } from '@/components/cms/FormEditor';
import { LivePreviewPane } from '@/components/cms/LivePreviewPane';
import { FAQPreview } from '@/components/cms/previews/FAQPreview';
import { FAQ } from '@/lib/content-schema';

export default function FAQEditor() {
  const { store, updateSection } = useCMS();
  if (!store) return null;

  const faq = store.c.faq;

  const updFaq = (i: number, patch: Partial<FAQ>) => {
    const updated = faq.map((f, j) => j === i ? { ...f, ...patch } : f);
    updateSection('faq', updated);
  };

  const addFaq = () => updateSection('faq', [...faq, { q: '', a: '' }]);

  const removeFaq = (i: number) => {
    if (faq.length <= 1) return;
    updateSection('faq', faq.filter((_, j) => j !== i));
  };

  return (
    <>
      <PublishBar title="FAQ" subtitle="Häufig gestellte Fragen" />
      <div className="flex flex-1 overflow-hidden">
      <main className="flex-1 p-8 overflow-auto" style={{ maxWidth: '640px' }}>
        <div className="space-y-5 mb-6">
          {faq.map((item, i) => (
            <div key={i} className="p-5 rounded-card bg-white" style={{ border: '1px solid #EAE3D8' }}>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs text-body-light">Frage {i + 1}</span>
                <button
                  onClick={() => removeFaq(i)}
                  className="text-xs text-body-light hover:text-primary transition-colors"
                >
                  Entfernen
                </button>
              </div>
              <div className="space-y-3">
                <Field label="Frage">
                  <TextInput value={item.q} onChange={(v) => updFaq(i, { q: v })} placeholder="Wer kann teilnehmen?" />
                </Field>
                <Field label="Antwort">
                  <TextInput value={item.a} onChange={(v) => updFaq(i, { a: v })} multiline rows={3} />
                </Field>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={addFaq}
          className="px-5 py-2.5 rounded-button text-sm font-medium transition-colors"
          style={{ border: '1px solid #C2724A', color: '#C2724A' }}
        >
          + Frage hinzufügen
        </button>
      </main>
      <LivePreviewPane url="makarim-reisen.de/faq">
        <FAQPreview />
      </LivePreviewPane>
      </div>
    </>
  );
}
