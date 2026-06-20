'use client';

import { useCMS } from '@/components/cms/CMSProvider';
import { PublishBar } from '@/components/cms/PublishBar';
import { Field, TextInput } from '@/components/cms/FormEditor';
import { LivePreviewPane } from '@/components/cms/LivePreviewPane';
import { FAQPreview } from '@/components/cms/previews/FAQPreview';
import { FAQ } from '@/lib/content-schema';

export default function FAQEditor() {
  const { store, updateSection } = useCMS();
  if (!store) return null;

  const faq = store.c.faq;

  const updFaq = (i: number, patch: Partial<FAQ>) => {
    updateSection('faq', faq.map((f, j) => j === i ? { ...f, ...patch } : f));
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
        <main className="flex-1 p-8 overflow-auto">
          <div style={{ maxWidth: '560px' }}>
            <div className="space-y-5 mb-6">
              {faq.map((item, i) => (
                <div key={i} className="p-5 rounded-card bg-white" style={{ border: '1px solid #EAE3D8' }}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs text-body-light">Frage {i + 1}</span>
                    <button
                      onClick={() => removeFaq(i)}
                      className="text-xs hover:text-red-600 transition-colors"
                      style={{ color: '#9A9082' }}
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
              style={{ width: '100%', padding: '12px', fontSize: '14px', fontWeight: 500, border: '2px dashed #D4CDBE', borderRadius: '10px', backgroundColor: 'transparent', color: '#9A9082', cursor: 'pointer' }}
            >
              + Frage hinzufügen
            </button>
          </div>
        </main>
        <LivePreviewPane url="makarim-reisen.de/faq" fill noScale>
          <FAQPreview />
        </LivePreviewPane>
      </div>
    </>
  );
}
