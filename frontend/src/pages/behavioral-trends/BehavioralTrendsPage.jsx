// Behavioural Trends (SRS UC-7, FR-10) — charts + summaries of change in
// risk score, sentiment and emotional/linguistic markers over time.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/icons';
import { Card, EmptyState, Loading, StatCard } from '../../components/common/ui';
import LineChart from '../../components/charts/LineChart';
import { getTrends } from '../../services/api';
import { useAppData } from '../../context/AppDataContext';

export default function BehavioralTrendsPage() {
  const { analyses } = useAppData();
  const [trends, setTrends] = useState(null);

  useEffect(() => { getTrends().then(setTrends); }, [analyses]);

  if (!trends || !analyses) return <Loading label="Analyzing trends…" />;

  if (trends.points.length < 2) {
    return (
      <Card>
        <EmptyState
          icon="chart"
          title="Not enough data yet"
          text="Behavioural trends compare your current and previous results. Complete a couple more evaluations to unlock this view."
          action={<Link to="/daily-log" className="btn btn-primary">Get Depression Evaluation</Link>}
        />
      </Card>
    );
  }

  const { points, markers, summary } = trends;
  const delta = summary.delta;
  const deltaTone = delta > 0 ? 'var(--high)' : delta < 0 ? 'var(--low)' : 'var(--ink-400)';
  const sentimentSeries = points.map((p) => ({ date: p.date, score: Math.round((p.sentiment + 1) * 50) }));

  return (
    <div>
      <div className="grid-4 mb-3">
        <StatCard label="Trend" value={`${delta > 0 ? '+' : ''}${delta}`} sub="score change since first analysis" icon="chart" tone={deltaTone} />
        <StatCard label="Current" value={summary.last} sub="latest risk score" icon="spark" tone="var(--teal-700)" />
        <StatCard label="Evaluations" value={summary.count} sub="analyses compared" icon="file" tone="var(--indigo-600)" />
        <StatCard label="High-risk days" value={summary.highDays} sub="score ≥ 70" icon="warning" tone="var(--high)" />
      </div>

      <div className="dash-grid">
        <Card className="col-7" title="Risk score over time">
          <LineChart data={points} />
        </Card>
        <Card className="col-5" title="Sentiment trajectory">
          <LineChart data={sentimentSeries} color="var(--indigo-600)" />
          <p className="small muted mt-1 mb-0">Sentiment polarity normalized to 0–100 (higher = more positive).</p>
        </Card>

        <Card className="col-7" title="Linguistic marker trends">
          <div className="flex gap-3 wrap small muted mb-2">
            <span className="flex items-center gap-1"><span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--indigo-600)' }} /> First-person density</span>
            <span className="flex items-center gap-1"><span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--moderate)' }} /> Absolutist language</span>
            <span className="flex items-center gap-1"><span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--high)' }} /> Negative-emotion words</span>
          </div>
          <LineChart data={markers.map((m) => ({ date: m.date, score: m.firstPersonDensity }))} color="var(--indigo-600)" max={25} />
          <LineChart data={markers.map((m) => ({ date: m.date, score: m.absolutistLanguage }))} color="var(--moderate)" max={25} />
          <LineChart data={markers.map((m) => ({ date: m.date, score: m.negativeEmotionWords }))} color="var(--high)" max={25} />
        </Card>

        <Card className="col-5" title="What changed">
          {delta > 0 ? (
            <p className="muted small">Your risk score has <b style={{ color: 'var(--high)' }}>risen {delta} points</b> since your first analysis — negative-emotion and absolutist-language markers are trending upward. If this reflects how you're feeling, the <Link to="/crisis-support">crisis-support resources</Link> can help.</p>
          ) : delta < 0 ? (
            <p className="muted small">Your risk score has <b style={{ color: 'var(--low)' }}>fallen {Math.abs(delta)} points</b> since your first analysis — a positive trajectory. Keep checking in regularly to maintain visibility.</p>
          ) : (
            <p className="muted small">Your scores are stable compared to your first analysis. Regular check-ins keep the trend meaningful.</p>
          )}
          <hr className="divider" />
          <div className="setting-row"><span className="small muted">First score</span><b className="mono">{summary.first}/100</b></div>
          <div className="setting-row"><span className="small muted">Latest score</span><b className="mono">{summary.last}/100</b></div>
          <div className="setting-row"><span className="small muted">Net change</span><b className="mono" style={{ color: deltaTone }}>{delta > 0 ? '+' : ''}{delta}</b></div>
        </Card>
      </div>
    </div>
  );
}
