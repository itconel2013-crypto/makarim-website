import { Trip } from '@/lib/content-schema';
import { groupTripsByYear } from '@/lib/utils';
import { TripCard } from './TripCard';

const GRID = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8';

/** Die Kopfzeile ist sticky (h-16 = 64px) — Anker müssen darunter landen, nicht dahinter. */
const ANCHOR_OFFSET = '84px';

function anchorId(year: number): string {
  return `jahr-${year}`;
}

function TripGrid({ trips }: { trips: Trip[] }) {
  return (
    <div className={GRID}>
      {trips.map((trip) => (
        <TripCard key={trip.vg} trip={trip} />
      ))}
    </div>
  );
}

/**
 * Reiseliste einer Rubrik, nach Jahrgang gegliedert.
 *
 * Die Gliederung erscheint NUR, wenn tatsächlich mehrere Jahrgänge vorliegen —
 * bei einem einzigen Jahr wäre eine „2026"-Überschrift über einer Liste, die
 * ohnehin nur aus 2026 besteht, reines Rauschen. Dann sieht die Seite exakt aus
 * wie vorher.
 *
 * Die Jahreszahlen sind echte <h2> und damit auch für Suchmaschinen die Struktur
 * der Seite („Umrah 2027").
 */
export function TripYearSections({ trips }: { trips: Trip[] }) {
  const groups = groupTripsByYear(trips);
  const withYear = groups.filter((g) => g.year !== null);

  if (withYear.length < 2) return <TripGrid trips={trips} />;

  return (
    <>
      {/* Sprungleiste — nimmt nichts weg, verkürzt nur den Weg nach unten. */}
      <nav
        aria-label="Nach Jahr springen"
        className="flex flex-wrap items-center gap-2 mb-10"
      >
        <span style={{ fontSize: '13px', color: '#9A9082' }}>Springe zu</span>
        {withYear.map((group) => (
          <a
            key={group.year}
            href={`#${anchorId(group.year!)}`}
            // Ohne aria-label liest ein Screenreader „20263" — Jahr und Anzahl
            // verschmelzen, weil sie nur optisch durch einen Abstand getrennt sind.
            aria-label={`${group.year}: ${group.trips.length} ${group.trips.length === 1 ? 'Reise' : 'Reisen'}`}
            className="hover:bg-primary hover:text-white transition-colors"
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: '#A8542F',
              backgroundColor: '#F2E8DF',
              borderRadius: '16px',
              padding: '6px 15px',
              textDecoration: 'none',
            }}
          >
            {group.year}
            <span aria-hidden="true" style={{ opacity: 0.55, margin: '0 5px' }}>·</span>
            <span aria-hidden="true" style={{ opacity: 0.75 }}>{group.trips.length}</span>
          </a>
        ))}
      </nav>

      {groups.map((group, i) => (
        <section
          key={group.year ?? 'ohne-jahr'}
          id={group.year !== null ? anchorId(group.year) : undefined}
          style={{ scrollMarginTop: ANCHOR_OFFSET, marginTop: i === 0 ? 0 : '56px' }}
        >
          {/* Reisen ohne erkennbares Jahr hängen ohne Überschrift hinten dran —
              lieber unbeschriftet sichtbar als unter einer falschen Jahreszahl. */}
          {group.year !== null && (
            <div className="flex items-baseline gap-4 mb-7">
              <h2
                className="font-serif font-normal text-ink"
                style={{ fontSize: 'clamp(24px, 3vw, 32px)', lineHeight: 1, margin: 0 }}
              >
                {group.year}
              </h2>
              <span style={{ flex: 1, height: '1px', backgroundColor: '#E2DBCF' }} />
              <span
                className="font-mono uppercase"
                style={{ fontSize: '11px', letterSpacing: '0.12em', color: '#9A9082' }}
              >
                {group.trips.length} {group.trips.length === 1 ? 'Reise' : 'Reisen'}
              </span>
            </div>
          )}

          <TripGrid trips={group.trips} />
        </section>
      ))}
    </>
  );
}
