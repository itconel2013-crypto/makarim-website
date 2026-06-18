'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { CMSStore, CMSContent } from '@/lib/content-schema';

interface CMSContextValue {
  store: CMSStore | null;
  saving: boolean;
  lastSaved: Date | null;
  updateSection: (section: keyof CMSContent, data: any) => void;
  updateTrip: (vg: string, data: any) => void;
  publishAll: () => void;
  draftCount: number;
}

const CMSContext = createContext<CMSContextValue | null>(null);

export function useCMS() {
  const ctx = useContext(CMSContext);
  if (!ctx) throw new Error('useCMS must be used within CMSProvider');
  return ctx;
}

async function apiFetch(body: any) {
  const res = await fetch('/api/content', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Save failed');
  return res.json();
}

export function CMSProvider({ initialStore, children }: { initialStore: CMSStore; children: React.ReactNode }) {
  const [store, setStore] = useState<CMSStore>(initialStore);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const draftCount = store.c.trips.filter((t) => t.published === false).length;

  const scheduleSave = useCallback((updated: CMSStore) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      try {
        await apiFetch({ c: updated.c, media: updated.media });
        setLastSaved(new Date());
      } catch (e) {
        console.error('Auto-save failed:', e);
      } finally {
        setSaving(false);
      }
    }, 800);
  }, []);

  const updateSection = useCallback(
    (section: keyof CMSContent, data: any) => {
      setStore((prev) => {
        const updated: CMSStore = {
          ...prev,
          c: { ...prev.c, [section]: data },
        };
        scheduleSave(updated);
        return updated;
      });
    },
    [scheduleSave]
  );

  const updateTrip = useCallback(
    (vg: string, data: any) => {
      setStore((prev) => {
        const trips = prev.c.trips.map((t) =>
          t.vg === vg ? { ...t, ...data } : t
        );
        const updated: CMSStore = { ...prev, c: { ...prev.c, trips } };
        scheduleSave(updated);
        return updated;
      });
    },
    [scheduleSave]
  );

  const publishAll = useCallback(() => {
    setStore((prev) => {
      const trips = prev.c.trips.map((t) =>
        t.published === false ? { ...t, published: true } : t
      );
      const updated: CMSStore = { ...prev, c: { ...prev.c, trips } };
      scheduleSave(updated);
      return updated;
    });
  }, [scheduleSave]);

  return (
    <CMSContext.Provider value={{ store, saving, lastSaved, updateSection, updateTrip, publishAll, draftCount }}>
      {children}
    </CMSContext.Provider>
  );
}
