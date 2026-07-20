'use client';

import { useRef, useState, useEffect } from 'react';

interface LivePreviewPaneProps {
  url?: string;
  children: React.ReactNode;
  outerWidth?: number;
  fill?: boolean;
  noScale?: boolean;
}

const INNER_W = 1852;

export function LivePreviewPane({ url = 'makarim.de', children, outerWidth = 360, fill = false, noScale = false }: LivePreviewPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [effectiveW, setEffectiveW] = useState(outerWidth);

  useEffect(() => {
    if (!fill || noScale || !containerRef.current) return;
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setEffectiveW(Math.floor(entry.contentRect.width) - 24);
      }
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [fill, noScale]);

  const scale = effectiveW / INNER_W;

  return (
    <div
      ref={containerRef}
      className="flex flex-col overflow-hidden"
      style={{
        ...(fill ? { flex: 1, minWidth: 0 } : { width: `${outerWidth + 24}px`, flexShrink: 0 }),
        backgroundColor: '#E5E3DD',
        borderLeft: '1px solid #DED8CC',
      }}
    >
      {/* Sticky header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 2, backgroundColor: '#E5E3DD', padding: '14px 20px 10px', borderBottom: '1px solid #DBD4C7' }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.1em', color: '#8C8576', textTransform: 'uppercase' }}>
          Live-Vorschau
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {/* Browser chrome */}
        <div style={{ background: '#F4F1EA', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 14px 40px rgba(28,24,20,0.15)', border: '1px solid #D6D1C6' }}>
          {/* Traffic lights bar */}
          <div style={{ height: '30px', background: '#EDE9E0', display: 'flex', alignItems: 'center', gap: '6px', padding: '0 12px', borderBottom: '1px solid #DED8CC' }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#E0857C', flexShrink: 0 }} />
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#E8C16B', flexShrink: 0 }} />
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#9BC08A', flexShrink: 0 }} />
            <div style={{ flex: 1, marginLeft: '8px', height: '16px', background: '#DAD5CC', borderRadius: '4px' }} />
          </div>

          {/* Content area */}
          {noScale ? (
            <div style={{ background: '#F4F1EA' }}>
              {children}
            </div>
          ) : (
            <div style={{ width: `${effectiveW}px`, overflow: 'hidden', position: 'relative', backgroundColor: '#F4F1EA' }}>
              <div style={{ width: `${INNER_W}px`, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
                {children}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
