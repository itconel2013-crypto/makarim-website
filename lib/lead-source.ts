/**
 * „Wie bist du auf uns aufmerksam geworden?"
 *
 * Freiwillige Angabe im Buchungs- und im Kontaktformular. Sie schließt die Lücke,
 * die das Partner-Tracking (?ref=) offen lässt: Wer über eine Empfehlung aus der
 * Familie oder aus der Moschee kommt, tippt die Adresse direkt ein und sieht in
 * jeder Statistik wie Direktverkehr aus. Genau dieser Kanal ist bei uns aber
 * vermutlich der stärkste — messbar wird er nur, wenn wir fragen.
 *
 * WICHTIG: Gespeichert wird der stabile `value`, nicht das Label. So bleiben
 * Auswertungen über Jahre vergleichbar, auch wenn jemand später die Beschriftung
 * umformuliert. Das CRM wertet auf denselben Werten aus.
 */
export const LEAD_SOURCES = [
  { value: 'empfehlung',        label: 'Empfehlung' },
  { value: 'instagram',         label: 'Instagram' },
  { value: 'google',            label: 'Google' },
  { value: 'whatsapp_facebook', label: 'WhatsApp oder Facebook' },
  { value: 'moschee',           label: 'Moschee oder Gemeinde' },
  { value: 'wiederkehrer',      label: 'Ich war schon einmal mit euch unterwegs' },
  { value: 'sonstiges',         label: 'Sonstiges' },
] as const;

export type LeadSourceValue = (typeof LEAD_SOURCES)[number]['value'];

/** Nur bei „Sonstiges" wird ein Freitextfeld eingeblendet. */
export const LEAD_SOURCE_OTHER: LeadSourceValue = 'sonstiges';

const VALUES = new Set<string>(LEAD_SOURCES.map((s) => s.value));

/**
 * Datenvertrag an der Serverkante: Der Wert kommt vom Client und wird hier gegen
 * die Liste geprüft. Unbekannt oder leer → undefined (das Feld ist freiwillig,
 * eine Buchung darf daran niemals scheitern).
 */
export function cleanLeadSource(value: unknown): LeadSourceValue | undefined {
  return typeof value === 'string' && VALUES.has(value) ? (value as LeadSourceValue) : undefined;
}

/** Freitext zu „Sonstiges": getrimmt und hart begrenzt, sonst undefined. */
export function cleanLeadSourceText(text: unknown): string | undefined {
  if (typeof text !== 'string') return undefined;
  const clean = text.trim().slice(0, 200);
  return clean.length > 0 ? clean : undefined;
}

/** Anzeige-Label zu einem gespeicherten Wert (für Admin-Listen und Mails). */
export function leadSourceLabel(value?: string | null): string {
  return LEAD_SOURCES.find((s) => s.value === value)?.label ?? '';
}
