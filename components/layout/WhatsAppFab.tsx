'use client';

import { useEffect, useLayoutEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

/** Ruheposition des Buttons: Abstand zu unterem und rechtem Rand, Größe. */
const EDGE = 24;
const SIZE = 60;
/** Luft zwischen angehobenem Button und der Oberkante der freizuhaltenden Leiste. */
const GAP = 16;
/** Bis zu dieser Scrolltiefe gilt „ganz oben" — danach zurück in die Ecke. */
const TOP_ZONE = 40;
/** Erst nach dieser Zeit gleitet der Button bei Positionswechseln (siehe `smooth`). */
const SMOOTH_AFTER_MS = 300;

// useLayoutEffect rechnet vor dem ersten Zeichnen (kein sichtbares Springen), gibt
// beim Server-Rendering aber eine Warnung aus — dort genügt useEffect.
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Schwebender WhatsApp-Button.
 *
 * Buchungsseiten: komplett ausgeblendet. Er würde (fixed bottom-right) den
 * Buchungs-CTA überdecken — am Handy die fixierte Buchungsleiste unten, auf dem
 * Desktop den "Jetzt buchen"-Button in der rechten Zusammenfassung (Klasse
 * `on-booking`, Regel in globals.css).
 *
 * Startseite: Die Zahlenleiste steht dort ohne Scrollen im Blick — auf manchen
 * Bildschirmen (vor allem kleinen Handys) direkt am unteren Rand, und dann läge der
 * Button genau auf „100 % aus einer Hand". Solange man ganz oben steht, weicht er
 * deshalb aus und gleitet beim Scrollen zurück in die Ecke:
 *   1. Verdeckt er in der Ecke keinen Text der Leiste → bleibt er dort (Desktop,
 *      Tablet, größere Handys).
 *   2. Sonst hebt er sich über die Leiste (`[data-fab-avoid]`) — mit GAP Abstand,
 *      oder mittig in der Lücke zu den Buttons im Bild (`[data-fab-ceiling]`), wenn
 *      der Abstand dort sonst auf „Über uns" läge.
 *   3. Ist die Lücke selbst für den Button zu klein (sehr kleine Handys mit
 *      eingeblendeten Browserleisten), gibt es keine freie Stelle: Er bliebe auf
 *      „Über uns" liegen, und ein Tipp dort öffnete WhatsApp. Dann wartet er
 *      unsichtbar, bis man ein Stück scrollt. WhatsApp ist ein Hauptkontaktweg —
 *      dieser Fall betrifft deshalb bewusst nur Bildschirme ohne jede Alternative.
 */
export function WhatsAppFab({ number }: { number: string }) {
  const pathname = usePathname();
  const onBooking = !!pathname && pathname.endsWith('/booking');
  const onHome = pathname === '/';

  const [lift, setLift] = useState(0);
  // Startseite: Der Server kennt die Bildschirmgröße nicht und würde den Button in
  // der Ecke ausliefern — also auf der Zahl. Bis seine Position im Browser feststeht,
  // bleibt er dort unsichtbar und blendet dann ein, statt sichtbar hochzurutschen.
  // Andere Seiten: sofort sichtbar wie immer. (Server und Browser starten mit
  // demselben Wert, weil usePathname auf beiden Seiten gleich antwortet.)
  const [placed, setPlaced] = useState(!onHome);
  // Fall 3 oben: keine freie Stelle → unsichtbar, bis gescrollt wird.
  const [noSpot, setNoSpot] = useState(false);
  // Die erste Platzierung soll springen, nicht gleiten — sonst sähe man trotz
  // Einblenden eine Bewegung. Gleiten erst danach (Scrollen, Drehen).
  const [smooth, setSmooth] = useState(false);

  useIsoLayoutEffect(() => {
    setSmooth(false);
    const smoothTimer = window.setTimeout(() => setSmooth(true), SMOOTH_AFTER_MS);

    if (!onHome) {
      setLift(0);
      setNoSpot(false);
      setPlaced(true);
      return () => window.clearTimeout(smoothTimer);
    }

    /** Anhebung in px — oder null, wenn es keine freie Stelle gibt (Fall 3). */
    const compute = (): number | null => {
      // Weiter unten auf der Seite (der Normalfall beim Scrollen) nichts messen.
      if (window.scrollY > TOP_ZONE) return 0;
      const avoid = document.querySelector<HTMLElement>('[data-fab-avoid]');
      if (!avoid) return 0;

      const w = window.innerWidth;
      const h = window.innerHeight;
      // Wo der Button in Ruheposition säße:
      const fab = { left: w - EDGE - SIZE, right: w - EDGE, top: h - EDGE - SIZE, bottom: h - EDGE };

      // Gemessen wird gegen die TEXTE der Leiste, nicht gegen ihren Kasten — sonst
      // würde er auch dort ausweichen, wo nur weiße Fläche unter ihm liegt.
      const coversText = Array.from(avoid.querySelectorAll('span')).some((el) => {
        const r = el.getBoundingClientRect();
        return r.left < fab.right && r.right > fab.left && r.top < fab.bottom && r.bottom > fab.top;
      });
      if (!coversText) return 0;                                   // Fall 1

      const statsTop = avoid.getBoundingClientRect().top;
      let fabBottomY = statsTop - GAP;                              // Fall 2, Normalfall
      const ceiling = document.querySelector<HTMLElement>('[data-fab-ceiling]');
      if (ceiling) {
        const ceilingBottom = ceiling.getBoundingClientRect().bottom;
        const gap = statsTop - ceilingBottom;
        if (gap < SIZE) return null;                                // Fall 3
        if (gap < SIZE + 2 * GAP) {
          fabBottomY = ceilingBottom + (gap + SIZE) / 2;            // Fall 2, mittig
        }
      }
      return Math.max(0, Math.round(h - EDGE - fabBottomY));
    };

    // Bewusst direkt im Ereignis statt über requestAnimationFrame: Unten auf der
    // Seite kostet ein Aufruf nur das Lesen von scrollY, und React verwirft
    // unveränderte Werte ohne neues Rendern.
    const update = () => {
      const next = compute();
      setNoSpot(next === null);
      if (next !== null) setLift(next);
    };

    update();
    setPlaced(true);
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.clearTimeout(smoothTimer);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [onHome]);

  const visible = placed && !noSpot;

  return (
    <a
      href={number ? `https://wa.me/${number}` : '#'}
      target="_blank"
      rel="noreferrer"
      aria-label="WhatsApp schreiben"
      className={`wa-fab${onBooking ? ' on-booking' : ''}`}
      style={{
        position: 'fixed',
        bottom: `${EDGE + lift}px`,
        right: `${EDGE}px`,
        width: `${SIZE}px`,
        height: `${SIZE}px`,
        borderRadius: '50%',
        backgroundColor: '#25D366',
        boxShadow: '0 8px 24px rgba(37,211,102,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        // visibility zusätzlich zu opacity: ein unsichtbarer Button darf auch per
        // Tastatur nicht erreichbar sein.
        opacity: visible ? 1 : 0,
        visibility: visible ? 'visible' : 'hidden',
        transition: smooth ? 'bottom 0.25s ease, opacity 0.2s ease' : 'opacity 0.2s ease',
      }}
    >
      <svg width="30" height="30" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
      </svg>
    </a>
  );
}
