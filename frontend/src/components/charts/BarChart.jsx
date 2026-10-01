// 7-day usage-vs-mood grouped bar chart (SDD 8.1.1).
export default function BarChart({ data, height = 200 }) {
  if (!data?.length) return null;
  const W = 600, H = height, P = { t: 12, r: 8, b: 22, l: 26 };
  const iw = W - P.l - P.r, ih = H - P.t - P.b;
  const maxUsage = Math.max(...data.map((d) => d.usage), 1);
  const slot = iw / data.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img" aria-label="Usage vs mood chart">
      {[0.25, 0.5, 0.75, 1].map((g) => (
        <line key={g} x1={P.l} x2={P.l + iw} y1={P.t + ih - ih * g} y2={P.t + ih - ih * g} stroke="#eef2f7" />
      ))}
      {data.map((d, i) => {
        const cx = P.l + i * slot + slot / 2;
        const uh = (d.usage / maxUsage) * ih * 0.9;
        const mh = (d.mood / 100) * ih * 0.9;
        return (
          <g key={d.day}>
            <rect x={cx - 15} y={P.t + ih - uh} width="13" height={uh} rx="4" fill="#cbd5e1">
              <title>{`${d.day}: ${d.usage}h usage`}</title>
            </rect>
            <rect x={cx + 2} y={P.t + ih - mh} width="13" height={mh} rx="4" fill="var(--teal-600)">
              <title>{`${d.day}: mood ${d.mood}/100`}</title>
            </rect>
            <text x={cx - 3} y={H - 6} textAnchor="middle" fontSize="10" fill="var(--ink-400)">{d.day}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function ChartLegend({ items }) {
  return (
    <div className="flex gap-3 wrap small muted">
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-1">
          <span style={{ width: 10, height: 10, borderRadius: 3, background: i.color, display: 'inline-block' }} />
          {i.label}
        </span>
      ))}
    </div>
  );
}
