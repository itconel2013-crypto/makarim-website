'use client';

import { useState } from 'react';
import { useCMS } from '@/components/cms/CMSProvider';
import { PublishBar } from '@/components/cms/PublishBar';
import { TripCardCMS } from '@/components/cms/TripCardCMS';
import { LivePreviewPane } from '@/components/cms/LivePreviewPane';
import { ReisenPreview } from '@/components/cms/previews/ReisenPreview';
import { Trip } from '@/lib/content-schema';
import { moveTripInList } from '@/lib/utils';
import { useDeleteTrip } from '@/components/cms/useDeleteTrip';

const FILTER_TABS = [
  { key: 'all',          label: 'Alle' },
  { key: 'umrah',        label: 'Umrah' },
  { key: 'hajj',         label: 'Hajj' },
  { key: 'kulturreisen', label: 'Kulturreisen' },
  { key: 'draft',        label: 'Entwürfe' },
] as const;

type Filter = typeof FILTER_TABS[number]['key'];

function filterTrips(trips: Trip[], filter: Filter): Trip[] {
  if (filter === 'all')    return trips;
  if (filter === 'draft')  return trips.filter((t) => t.published === false);
  return trips.filter((t) => t.category === filter);
}

function newTrip(category: 'umrah' | 'hajj' | 'kulturreisen'): Trip {
  const id = `${category.slice(0, 2)}-${Date.now()}`;
  const typMap = { umrah: 'Umrah', hajj: 'Hajj', kulturreisen: 'Kulturreisen' } as const;
  return {
    vg: id, name: 'Neue Reise', title: 'Neue Reise', slug: id,
    category, typ: typMap[category], description: '', text: '',
    date: '', nights: 0, price: 0, status: 'verfügbar',
    startseite: false, published: false, seats: 0, waitlist: false,
    hotels: [], program: [],
  };
}

export default function ReisenManager() {
  const { store, draftCount, updateSection } = useCMS();
  const [filter, setFilter] = useState<Filter>('all');
  // Hook muss vor dem frühen Return stehen (Regeln der Hooks).
  const { requestDelete, dialog } = useDeleteTrip(store?.c.trips ?? [], updateSection);
  if (!store) return null;

  const trips = filterTrips(store.c.trips, filter);

  const addTrip = () => {
    const cat = (filter === 'all' || filter === 'draft') ? 'umrah' : filter;
    updateSection('trips', [...store.c.trips, newTrip(cat)]);
  };

  const moveTrip = (vg: string, dir: 'up' | 'down') => {
    updateSection('trips', moveTripInList(store.c.trips, trips, vg, dir));
  };

  return (
    <>
      <PublishBar title="Reisen" subtitle={`${store.c.trips.length} Reisen gesamt`} showCRMSync />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-auto">
          {/* Filter tabs + Add button */}
          <div className="px-7 pt-5 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1 flex-wrap">
              {FILTER_TABS.map(({ key, label }) => {
                const active = filter === key;
                const count = key === 'draft' ? draftCount
                  : key === 'all' ? store.c.trips.length
                  : store.c.trips.filter((t) => t.category === key).length;
                return (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className="px-4 py-2 rounded-button text-sm font-medium transition-colors flex items-center gap-2"
                    style={{
                      backgroundColor: active ? '#16242B' : 'white',
                      color: active ? 'white' : '#5A5448',
                      border: '1px solid',
                      borderColor: active ? '#16242B' : '#E2DBCF',
                    }}
                  >
                    {label}
                    <span
                      className="font-mono text-xs rounded-full px-1.5"
                      style={{
                        backgroundColor: active ? 'rgba(255,255,255,0.2)' : '#F4F1EA',
                        color: active ? 'white' : '#9A9082',
                      }}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={addTrip}
              className="px-4 py-2 rounded-button text-sm font-medium transition-colors"
              style={{ backgroundColor: '#C2724A', color: 'white', border: 'none', cursor: 'pointer' }}
            >
              + Neue Reise
            </button>
          </div>

          {/* Trip cards */}
          <main className="p-7 space-y-4">
            {trips.length === 0 ? (
              <div className="text-center py-16 rounded-card bg-white" style={{ border: '1px solid #EAE3D8' }}>
                <p className="text-body-light text-sm">Keine Reisen in dieser Ansicht.</p>
              </div>
            ) : (
              trips.map((trip, idx) => (
                <TripCardCMS
                  key={trip.vg}
                  trip={trip}
                  onMoveUp={() => moveTrip(trip.vg, 'up')}
                  onMoveDown={() => moveTrip(trip.vg, 'down')}
                  canMoveUp={idx > 0}
                  canMoveDown={idx < trips.length - 1}
                  onDelete={() => requestDelete(trip)}
                />
              ))
            )}
          </main>
        </div>

        <LivePreviewPane url="makarim.de/umrah-reisen" fill noScale>
          <ReisenPreview />
        </LivePreviewPane>
      </div>

      {/* Bestätigungs-Dialog beim Löschen (eigenes Fenster, keine Browser-Meldung) */}
      {dialog}
    </>
  );
}
