// Semicircle gauge for the Digital Sentiment / depression risk score.
import { riskColor, riskLevel } from '../../utils/format';

export default function RiskGauge({ score = 0, size = 190, label }) {
  const level = riskLevel(score);
  const color = riskColor(level);
  const r = 74, C = Math.PI * r;
  const frac = Math.max(0, Math.min(100, score)) / 100;
  return (
    <div className="gauge-wrap">
      <svg width={size} height={size * 0.62} viewBox="0 0 180 104" role="img" aria-label={`Risk score ${score} of 100`}>
        <path d="M16 96 A74 74 0 0 1 164 96" fill="none" stroke="#eef2f7" strokeWidth="14" strokeLinecap="round" />
        <path d="M16 96 A74 74 0 0 1 164 96" fill="none" stroke={color} strokeWidth="14" strokeLinecap="round"
          strokeDasharray={`${frac * C} ${C}`} style={{ transition: 'stroke-dasharray .8s ease' }} />
        <text x="90" y="78" textAnchor="middle" fontSize="34" fontWeight="800" fill="var(--ink-900)">{score}</text>
        <text x="90" y="95" textAnchor="middle" fontSize="10" fill="var(--ink-400)">of 100</text>
      </svg>
      {label !== false && <span className={`badge badge-dot badge-${level.toLowerCase()}`}>{level} risk</span>}
    </div>
  );
}
