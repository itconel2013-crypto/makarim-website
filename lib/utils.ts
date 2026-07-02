/**
 * Utility functions for API and components
 */

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  }).format(price);
}

export function formatDate(date: string): string {
  // Already pre-formatted in data, e.g., "15.–25. Juni 2026"
  return date;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncateText(text: string | undefined | null, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '…';
}

export function generateAlt(context: string, field?: string): string {
  const parts = [context];
  if (field) parts.push(field);
  return parts.join(' – ');
}

/**
 * Extract text for SEO description from marketing text
 * Clipped to ~158 chars (ideal meta description length)
 */
export function extractSEODescription(text: string, maxLength: number = 158): string {
  return truncateText(text, maxLength);
}
