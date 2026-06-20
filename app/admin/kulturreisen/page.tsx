'use client';

import { useState } from 'react';
import { useCMS } from '@/components/cms/CMSProvider';
import { PublishBar } from '@/components/cms/PublishBar';
import { TripCardCMS } from '@/components/cms/TripCardCMS';
import { LivePreviewPane } from '@/components/cms/LivePreviewPane';
import { ReisenPreview } from '@/components/cms/previews/ReisenPreview';
import { Trip } from '@/lib/content-schema';

const FILTER_TABS = [
  { key: 'all',   label: 'Alle' },
  { key: 'draft', label: 'Entwürfe' },
] as const;

type Filter = typeof FILTER_TABS[number]['key'];

export default function KulturreisенManager() {
  const { store, updateSection } = useCMS();
  const [filter, setFilter] = useState<Filter>('all');
  if (!store) return null;

  const kulturreisen = store.c.trips.filter((t: Trip) => t.category === 'kulturreisen');
  const trips = filter === 'draft'
    ? kulturreisen.filter((t: Trip) => t.published === false)
    : kulturreisen;

  const kulturDraftCount = kulturreisen.filter((t: Trip) => t.published === false).length;

  const addKulturreise = () => {
    const id = `kr-${Date.now()}`;
    const newTrip: Trip = {
      vg: id,
      name: 'Neue Kulturreise',
      title: 'Neue Kulturreise',
      slug: id,
      category: 'kulturreisen',
      typ: 'Kulturreisen',
      description: '',
      text: '',
      date: '',
      nights: 0,
      price: 0,
      status: 'verfügbar',
      startseite: false,
      published: false,
      seats: 0,
      waitlist: false,
      hotels: [],
      program: [],
    };
    updateSection('trips', [...store.c.trips, newTrip]);
    setFilter('all');
  };

  return (
    <>
      <PublishBar title="Kulturreisen" subtitle={`${kulturreisen.length} Reisen`} showCRMSync />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-auto">
          {/* Filter tabs + Add button */}
          <div className="px-7 pt-5 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1 flex-wrap">
              {FILTER_TABS.map(({ key, label }) => {
                const active = filter === key;
                const count = key === 'draft' ? kulturDraftCount : kulturreisen.length;
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
              onClick={addKulturreise}
              className="px-4 py-2 rounded-button text-sm font-medium transition-colors"
              style={{ backgroundColor: '#C2724A', color: 'white', border: 'none', cursor: 'pointer' }}
            >
              + Neue Kulturreise
            </button>
          </div>

          {/* Trip cards */}
          <main className="p-7 space-y-4">
            {trips.length === 0 ? (
              <div className="text-center py-16 rounded-card bg-white" style={{ border: '1px solid #EAE3D8' }}>
                <p className="text-body-light text-sm">Keine Kulturreisen in dieser Ansicht.</p>
              </div>
            ) : (
              trips.map((trip) => <TripCardCMS key={trip.vg} trip={trip} />)
            )}
          </main>
        </div>

        <LivePreviewPane url="makarim-reisen.de/kulturreisen" fill noScale>
          <ReisenPreview />
        </LivePreviewPane>
      </div>
    </>
  );
}
