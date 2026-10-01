// Sentiment Volatility timeline (SDD 8.1.2) — one bar per analysis day;
// hover shows date, sentiment score and whether a risk flag was raised.
import { useState } from 'react';
import { formatDate } from '../../utils/format';

function barColor(sentiment, flagged) {
  if (flagged) return 'var(--high)';
  if (sentiment <= -0.2) return 'var(--moderate)';
  return 'var(--teal-600)';
}

export default function VolatilityTimeline({ analyses }) {
  const [tip, setTip] = useState(null);
  if (!analyses?.length) return null;
  const items = [...analyses].sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-14);

  return (
    <div>
      <div className="vol-bars" role="img" aria-label="Sentiment volatility timeline">
        {items.map((a) => {
          const flagged = a.riskLevel === 'High';
          const h = 18 + Math.abs(a.sentiment ?? 0) * 100 + (flagged ? 15 : 0);
          return (
            <div
              key={a.id}
              className={`vol-bar ${flagged ? 'flagged' : ''}`}
              style={{ height: `${Math.min(100, h)}%`, background: barColor(a.sentiment, flagged) }}
              onMouseEnter={() => setTip(a)}
              onMouseLeave={() => setTip(null)}
              onClick={() => setTip(a)}
            />
          );
        })}
      </div>
      <div className="vol-axis">
        {items.map((a, i) => (
          <span key={a.id}>{i === 0 || i === items.length - 1 || i % 4 === 0 ? formatDate(a.date) : ''}</span>
        ))}
      </div>
      <div className="mt-2 small muted" style={{ minHeight: 22 }}>
        {tip
          ? <span><b>{formatDate(tip.date)}</b> — sentiment <b className="mono">{tip.sentiment}</b>, risk <b className="mono">{tip.riskScore}/100</b>{tip.riskLevel === 'High' ? ' — risk flag raised' : ''}</span>
          : 'Hover or tap a bar for the date, sentiment score and risk flag.'}
      </div>
    </div>
  );
}
