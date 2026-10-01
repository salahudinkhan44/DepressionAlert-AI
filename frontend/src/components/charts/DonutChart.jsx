// Donut chart — mood-impact-by-platform breakdown (SDD 8.1.1).
export default function DonutChart({ data, size = 150, thickness = 22 }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = (size - thickness) / 2;
  const C = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex items-center gap-3 wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Platform mood breakdown">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eef2f7" strokeWidth={thickness} />
        {data.map((d) => {
          const frac = d.value / total;
          const el = (
            <circle key={d.name} cx={size / 2} cy={size / 2} r={r} fill="none"
              stroke={d.color} strokeWidth={thickness}
              strokeDasharray={`${frac * C} ${C}`} strokeDashoffset={-offset * C}
              transform={`rotate(-90 ${size / 2} ${size / 2})`} strokeLinecap="butt">
              <title>{`${d.name}: ${d.value}%`}</title>
            </circle>
          );
          offset += frac;
          return el;
        })}
        <text x="50%" y="48%" textAnchor="middle" fontSize="20" fontWeight="800" fill="var(--ink-900)">{total}%</text>
        <text x="50%" y="62%" textAnchor="middle" fontSize="9" fill="var(--ink-400)">tracked activity</text>
      </svg>
      <div className="flex" style={{ flexDirection: 'column', gap: '.45rem' }}>
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1 small">
            <span style={{ width: 10, height: 10, borderRadius: 3, background: d.color, flex: 'none' }} />
            <span className="muted" style={{ minWidth: 82 }}>{d.name}</span>
            <b className="mono">{d.value}%</b>
          </div>
        ))}
      </div>
    </div>
  );
}
