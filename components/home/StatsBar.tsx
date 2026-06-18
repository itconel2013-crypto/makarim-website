interface StatItem {
  value: string;
  label: string;
}

interface StatsBarProps {
  stats: StatItem[];
}

export function StatsBar({ stats }: StatsBarProps) {
  return (
    <section className="bg-white" style={{ borderBottom: '1px solid #EAE3D8' }}>
      <div className="container-max">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center py-8 px-4 text-center"
              style={{ borderRight: i < stats.length - 1 ? '1px solid #EAE3D8' : undefined }}
            >
              <span
                className="font-serif font-normal text-ink"
                style={{ fontSize: '38px', lineHeight: '1.1' }}
              >
                {stat.value}
              </span>
              <span
                className="font-mono uppercase mt-1"
                style={{ fontSize: '11px', letterSpacing: '0.12em', color: '#9A9082' }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
