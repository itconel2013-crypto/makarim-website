'use client';

import { BookingTermsConfig, CancellationTier } from '@/lib/content-schema';
import { Field, TextInput } from './FormEditor';

/**
 * Pflege der Zahlungs- und Stornobedingungen.
 *
 * Wird an zwei Stellen verwendet: global unter /admin/zahlungsbedingungen und
 * je Reise als Übersteuerung in der Reisekarte. Im Reise-Modus (`inherited`)
 * zeigen die Platzhalter den geerbten globalen Wert — leer lassen heißt dort
 * „global gilt", nicht „leer".
 */
export function BookingTermsEditor({
  terms,
  onChange,
  inherited,
}: {
  terms: BookingTermsConfig;
  onChange: (next: BookingTermsConfig) => void;
  /** Globale Werte — nur im Reise-Modus gesetzt, dienen als Platzhalter. */
  inherited?: BookingTermsConfig;
}) {
  const upd = (patch: Partial<BookingTermsConfig>) => onChange({ ...terms, ...patch });
  const tiers: CancellationTier[] = terms.cancellation ?? [];
  const setTiers = (next: CancellationTier[]) => upd({ cancellation: next });

  const ph = (v?: string, fallback?: string) => (inherited ? (v || fallback) : fallback);

  return (
    <div className="space-y-5">
      <Field label="Anzahlung je Person (€)" hint={inherited?.depositPerPerson ? `derzeit gilt: ${inherited.depositPerPerson} €` : 'nur Zahl, ohne €'}>
        <input
          type="number"
          min={0}
          step={10}
          value={terms.depositPerPerson ?? ''}
          onChange={(e) => {
            const v = e.target.value.trim();
            upd({ depositPerPerson: v === '' ? undefined : Math.max(0, Number(v)) });
          }}
          placeholder={inherited?.depositPerPerson ? String(inherited.depositPerPerson) : 'z. B. 400'}
          className="w-full px-4 py-3 rounded-button text-sm text-ink bg-white placeholder:text-body-light"
          style={{ border: '1px solid #E2DBCF', outline: 'none' }}
        />
      </Field>

      <Field label="Wann ist die Anzahlung fällig?">
        <TextInput
          value={terms.depositDue ?? ''}
          onChange={(v) => upd({ depositDue: v })}
          placeholder={ph(inherited?.depositDue, 'z. B. fällig nach unserer Buchungsbestätigung')}
        />
      </Field>

      <Field label="Wann ist die Restzahlung fällig?">
        <TextInput
          value={terms.balanceDue ?? ''}
          onChange={(v) => upd({ balanceDue: v })}
          placeholder={ph(inherited?.balanceDue, 'z. B. spätestens 30 Tage vor Abreise')}
        />
      </Field>

      {/* Stornostaffel */}
      <div>
        <label className="block font-medium text-ink mb-1.5" style={{ fontSize: '13px' }}>
          Stornostaffel
          <span className="font-normal text-body-light ml-2" style={{ fontSize: '12px' }}>
            Zeitraum und Satz, z. B. „bis 60 Tage vor Abreise" / „20 %"
          </span>
        </label>

        {tiers.length === 0 && (
          <p className="text-body-sm text-body-light mb-3">
            {inherited?.cancellation?.length
              ? `Keine eigene Staffel — es gilt die hinterlegte mit ${inherited.cancellation.length} Stufen.`
              : inherited?.cancellationText
                ? 'Keine eigene Staffel — es gilt die hinterlegte Stornobedingung (Freitext).'
                : 'Noch keine Stufe angelegt.'}
          </p>
        )}

        <div className="space-y-2 mb-3">
          {tiers.map((t, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="text"
                value={t.when}
                onChange={(e) => setTiers(tiers.map((x, j) => (j === i ? { ...x, when: e.target.value } : x)))}
                placeholder="bis 60 Tage vor Abreise"
                className="flex-1 px-3 py-2 rounded-button text-sm text-ink bg-white placeholder:text-body-light"
                style={{ border: '1px solid #E2DBCF', outline: 'none' }}
              />
              <input
                type="text"
                value={t.fee}
                onChange={(e) => setTiers(tiers.map((x, j) => (j === i ? { ...x, fee: e.target.value } : x)))}
                placeholder="20 %"
                className="px-3 py-2 rounded-button text-sm text-ink bg-white placeholder:text-body-light"
                style={{ border: '1px solid #E2DBCF', outline: 'none', width: '90px' }}
              />
              <button
                type="button"
                onClick={() => setTiers(tiers.filter((_, j) => j !== i))}
                title="Stufe entfernen"
                aria-label={`Stufe ${i + 1} entfernen`}
                className="px-2 text-body-light hover:text-ink"
                style={{ fontSize: '16px', lineHeight: 1 }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setTiers([...tiers, { when: '', fee: '' }])}
          className="text-sm font-medium"
          style={{ color: '#14617A' }}
        >
          + Stufe hinzufügen
        </button>
      </div>

      <Field label="Hinweis unter der Staffel" hint="optional">
        <TextInput
          value={terms.note ?? ''}
          onChange={(v) => upd({ note: v })}
          multiline
          rows={2}
          placeholder={ph(inherited?.note, 'z. B. Anteil des Reisepreises. Bis zum Reisebeginn kannst du jederzeit zurücktreten.')}
        />
      </Field>
    </div>
  );
}
