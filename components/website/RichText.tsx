import React from 'react';

/**
 * Wandelt einfache Fett-Auszeichnung im Fließtext in echtes Fett um:
 *   *Wort*   →  <strong>Wort</strong>
 *   **Wort** →  <strong>Wort</strong>
 *
 * Bewusst minimal und sicher: Es wird KEIN HTML interpretiert
 * (kein dangerouslySetInnerHTML) — es entstehen nur Text-Knoten und <strong>.
 * Zeilenumbrüche bleiben über CSS `white-space: pre-line` am umgebenden Element
 * erhalten (die Auszeichnung wirkt nicht über Zeilengrenzen hinweg).
 */
export function RichText({ text }: { text?: string | null }) {
  if (!text) return null;

  // Tokens: **…** oder *…*  (kein * und kein Umbruch dazwischen)
  const parts = text.split(/(\*\*[^*\n]+\*\*|\*[^*\n]+\*)/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.length > 4 && part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        if (part.length > 2 && part.startsWith('*') && part.endsWith('*')) {
          return <strong key={i}>{part.slice(1, -1)}</strong>;
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </>
  );
}
