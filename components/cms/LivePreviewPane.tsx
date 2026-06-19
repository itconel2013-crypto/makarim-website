'use client';

import { useRef, useState, useEffect } from 'react';

interface LivePreviewPaneProps {
  url?: string;
  children: React.ReactNode;
  outerWidth?: number;
  fill?: boolean;
}

const INNER_W = 1852; // virtual full-desktop width the preview renders at

export function LivePreviewPane({ url = 'makarim-reisen.de', children, outerWidth = 360, fill = false }: LivePreviewPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [effectiveW, setEffectiveW] = useState(fill ? outerWidth : outerWidth);

  useEffect(() => {
    if (!fill || !containerRef.current) return;
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // subtract horizontal padding (12px each side)
        setEffectiveW(Math.floor(entry.contentRect.width) - 24);
      }
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [fill]);

  const scale = effectiveW / INNER_W;

  return (
    <div
      ref={containerRef}
      className="flex flex-col overflow-auto"
      style={{
        ...(fill ? { flex: 1, minWidth: 0 } : { width: `${outerWidth + 24}px`, flexShrink: 0 }),
        backgroundColor: '#E8E3DB',
        borderLeft: '1px solid #D5CEBC',
        padding: '16px 12px',
      }}
    >
      <p className="font-mono text-center mb-3" style={{ fontSize: '10px', letterSpacing: '0.1em', color: '#9A9082', textTransform: 'uppercase' }}>
        Live-Vorschau
      </p>

      {/* Browser shell */}
      <div className="rounded-card overflow-hidden" style={{ width: `${effectiveW}px`, boxShadow: '0 4px 20px rgba(0,0,0,0.18)', border: '1px solid #BDB8AF' }}>
        {/* Chrome bar */}
        <div className="flex items-center gap-2 px-3 py-2" style={{ backgroundColor: '#2A2A2A', minHeight: '32px' }}>
          <span className="w-2.5 h-2.5 rounded-full bg-red-400 flex-shrink-0" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 flex-shrink-0" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-400 flex-shrink-0" />
          <div
            className="flex-1 mx-2 px-3 rounded font-mono text-white/60 truncate"
            style={{ backgroundColor: '#3A3A3A', fontSize: '10px', height: '18px', lineHeight: '18px' }}
          >
            {url}
          </div>
        </div>

        {/* Scaled content */}
        <div style={{ width: `${effectiveW}px`, overflow: 'hidden', position: 'relative', backgroundColor: '#F4F1EA' }}>
          <div style={{ width: `${INNER_W}px`, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
