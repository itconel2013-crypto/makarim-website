'use client';

import { useCMS } from './CMSProvider';

interface PublishBarProps {
  title: string;
  subtitle?: string;
  showCRMSync?: boolean;
}

export function PublishBar({ title, subtitle, showCRMSync }: PublishBarProps) {
  const { draftCount, publishAll, saving, lastSaved } = useCMS();

  const hasDrafts = draftCount > 0;

  return (
    <header
      className="flex items-center justify-between px-7 flex-shrink-0"
      style={{ height: '60px', backgroundColor: 'white', borderBottom: '1px solid #EAE3D8' }}
    >
      {/* Left: title */}
      <div>
        <h1 className="font-semibold text-ink text-base leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-body-light">{subtitle}</p>}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-3">
        {/* Save indicator */}
        {saving && (
          <span className="text-xs text-body-light">Speichert…</span>
        )}
        {!saving && lastSaved && (
          <span className="text-xs text-body-light">
            Gespeichert {lastSaved.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}

        {/* CRM Sync (Reisen only) */}
        {showCRMSync && (
          <button
            className="flex items-center gap-1.5 px-3 py-2 rounded-button text-sm font-medium transition-colors"
            style={{ border: '1px solid #EAE3D8', color: '#5A5448', fontSize: '13px' }}
            onClick={() => alert('CRM-Synchronisation: In dieser Version manuell via API.')}
          >
            ↻ Aus CRM aktualisieren
          </button>
        )}

        {/* Publish status */}
        <div className="flex items-center gap-1.5 text-sm">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: hasDrafts ? '#E0A23C' : '#3E6B52' }}
          />
          <span style={{ color: hasDrafts ? '#956214' : '#3E6B52', fontSize: '13px' }}>
            {hasDrafts ? `${draftCount} im Entwurf` : 'Alles veröffentlicht'}
          </span>
        </div>

        {/* Publish button */}
        <button
          onClick={hasDrafts ? publishAll : undefined}
          disabled={!hasDrafts}
          className="px-4 py-2 rounded-button text-sm font-medium transition-colors"
          style={{
            backgroundColor: hasDrafts ? '#C2724A' : '#EAE3D8',
            color: hasDrafts ? 'white' : '#9A9082',
            cursor: hasDrafts ? 'pointer' : 'default',
            fontSize: '13px',
          }}
        >
          {hasDrafts ? 'Veröffentlichen' : 'Veröffentlicht ✓'}
        </button>
      </div>
    </header>
  );
}
