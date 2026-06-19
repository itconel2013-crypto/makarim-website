'use client';

interface LivePreviewPaneProps {
  url?: string;
  children: React.ReactNode;
  outerWidth?: number;
  fill?: boolean;
}

const SCALE = 0.27;

export function LivePreviewPane({ url = 'makarim-reisen.de', children, outerWidth = 360, fill = false }: LivePreviewPaneProps) {
  const OUTER_W = outerWidth;
  const INNER_W = Math.round(OUTER_W / SCALE);
  return (
    <div
      className="flex flex-col overflow-auto"
      style={{
        ...(fill ? { flex: 1, minWidth: 0 } : { width: `${OUTER_W + 24}px`, flexShrink: 0 }),
        backgroundColor: '#E8E3DB',
        borderLeft: '1px solid #D5CEBC',
        padding: '16px 12px',
      }}
    >
      <p className="font-mono text-center mb-3" style={{ fontSize: '10px', letterSpacing: '0.1em', color: '#9A9082', textTransform: 'uppercase' }}>
        Live-Vorschau
      </p>

      {/* Browser shell — centered when fill=true */}
      <div style={fill ? { display: 'flex', justifyContent: 'center' } : undefined}>
        <div className="rounded-card overflow-hidden" style={{ width: `${OUTER_W}px`, boxShadow: '0 4px 20px rgba(0,0,0,0.18)', border: '1px solid #BDB8AF' }}>
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
          <div style={{ width: `${OUTER_W}px`, overflow: 'hidden', position: 'relative', backgroundColor: '#F4F1EA' }}>
            <div style={{ width: `${INNER_W}px`, transform: `scale(${SCALE})`, transformOrigin: 'top left' }}>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
