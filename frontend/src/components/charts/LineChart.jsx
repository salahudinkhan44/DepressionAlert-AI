// Lightweight SVG line/area chart — risk & sentiment trends (FR-10).
export default function LineChart({ data, xKey = 'date', yKey = 'score', height = 200, color = 'var(--teal-600)', max = 100, labels }) {
  if (!data?.length) return null;
  const W = 600, H = height, P = { t: 14, r: 10, b: 22, l: 30 };
  const iw = W - P.l - P.r, ih = H - P.t - P.b;
  const x = (i) => P.l + (data.length === 1 ? iw / 2 : (i / (data.length - 1)) * iw);
  const y = (v) => P.t + ih - (Math.max(0, Math.min(max, v)) / max) * ih;
  const pts = data.map((d, i) => `${x(i)},${y(d[yKey])}`).join(' ');
  const area = `${P.l},${P.t + ih} ${pts} ${P.l + iw},${P.t + ih}`;
  const fmtX = labels || ((d) => new Date(d[xKey]).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img" aria-label="Trend chart">
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1={P.l} x2={P.l + iw} y1={P.t + ih * g} y2={P.t + ih * g} stroke="#eef2f7" strokeWidth="1" />
      ))}
      <line x1={P.l} x2={P.l + iw} y1={y(70)} y2={y(70)} stroke="var(--high)" strokeWidth="1" strokeDasharray="5 5" opacity=".55" />
      <text x={P.l + iw} y={y(70) - 5} textAnchor="end" fontSize="9" fill="var(--high)">high-risk threshold</text>
      <polygon points={area} fill={color} opacity=".10" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(d[yKey])} r="3.4" fill="#fff" stroke={color} strokeWidth="2.2">
            <title>{`${fmtX(d)} — ${d[yKey]}`}</title>
          </circle>
          {(i === 0 || i === data.length - 1 || i % Math.ceil(data.length / 6) === 0) && (
            <text x={x(i)} y={H - 6} textAnchor="middle" fontSize="9.5" fill="var(--ink-300)">{fmtX(d)}</text>
          )}
        </g>
      ))}
    </svg>
  );
}
