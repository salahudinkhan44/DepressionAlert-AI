// Dashboard (SRS UC-3, FR-13, USE-2; SDD 8.1.1).
// Digital Sentiment Score, 7-day usage-vs-mood chart, mood-by-platform
// breakdown, preventive-action shortcuts, live sentiment monitor feed,
// and the four UC-3 options.
import { Link } from 'react-router-dom';
import Icon from '../../components/icons';
import { Card, StatCard, Badge, EmptyState, Loading, AlertBox } from '../../components/common/ui';
import RiskGauge from '../../components/charts/RiskGauge';
import BarChart, { ChartLegend } from '../../components/charts/BarChart';
import DonutChart from '../../components/charts/DonutChart';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { PLATFORM_MOOD, WEEK_IMPACT } from '../../data/mockData';
import { formatDateTime, timeAgo } from '../../utils/format';

const QUICK_ACTIONS = [
  { to: '/daily-log', icon: 'journal', title: 'Get Depression Evaluation', desc: 'Paste text or upload a CSV for analysis' },
  { to: '/analysis-result', icon: 'spark', title: 'View Risk Score', desc: 'Latest score, level and explanation' },
  { to: '/history', icon: 'file', title: 'View Analysis History', desc: 'All previous evaluation results' },
  { to: '/trends', icon: 'chart', title: 'View Behavioural Trends', desc: 'How your patterns change over time' },
];

const PREVENTIVE = [
  { icon: 'mute', label: 'Mute Keywords', to: '/settings#mute' },
  { icon: 'filter', label: 'Enable Feed Filter', to: '/settings#filter' },
  { icon: 'moon', label: 'Schedule Nightly Pause', to: '/settings#pause' },
];

const FEED_TONES = {
  high: { bg: 'var(--high-bg)', color: 'var(--high)' },
  moderate: { bg: 'var(--moderate-bg)', color: 'var(--moderate)' },
  low: { bg: 'var(--teal-50)', color: 'var(--teal-700)' },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { analyses, latest, alerts, monitor } = useAppData();

  if (!analyses) return <Loading label="Loading your dashboard…" />;

  const newAlerts = alerts.filter((a) => a.status === 'New');
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>{greeting}, {user?.name?.split(' ')[0]}</h1>
          <p className="sub mb-0">Here's your wellbeing snapshot.</p>
        </div>
        <Link to="/daily-log" className="btn btn-primary"><Icon name="plus" size={16} /> New Evaluation</Link>
      </div>

      {newAlerts.length > 0 && (
        <div className="mb-3">
          <AlertBox type="warning" icon="bell">
            <b>{newAlerts.length} new alert{newAlerts.length > 1 ? 's' : ''}.</b>{' '}
            {newAlerts[0].message}{' '}
            <Link to="/alerts" style={{ fontWeight: 700 }}>Review alerts →</Link>
          </AlertBox>
        </div>
      )}

      {!analyses.length ? (
        <Card>
          <EmptyState
            icon="journal"
            title="No analyses yet"
            text="Complete your first depression evaluation — paste a post or upload a CSV — and your risk score, trends and insights will appear here."
            action={<Link to="/daily-log" className="btn btn-primary">Start your first evaluation</Link>}
          />
        </Card>
      ) : (
        <div className="dash-grid">
          {/* Digital Sentiment Score */}
          <Card className="col-4" title="Digital Sentiment Score" action={<Badge level={latest.riskLevel} />}>
            <RiskGauge score={latest.riskScore} size={200} />
            <p className="small muted center mt-2 mb-0">
              Latest analysis · {formatDateTime(latest.date)}
            </p>
          </Card>

          {/* quick stats */}
          <div className="col-8">
            <div className="grid-3" style={{ gap: '1rem' }}>
              <StatCard label="Risk score" value={`${latest.riskScore}`} sub="of 100 · latest" icon="spark" tone="var(--teal-700)" />
              <StatCard label="Analyses" value={analyses.length} sub="total evaluations" icon="file" tone="var(--indigo-600)" />
              <StatCard label="Active alerts" value={newAlerts.length} sub="awaiting review" icon="bell" tone="var(--moderate)" />
            </div>
            <Card className="mt-2" title="Mood impact by platform">
              <DonutChart data={PLATFORM_MOOD} />
            </Card>
          </div>

          {/* 7-day chart */}
          <Card className="col-7" title="7-day impact"
            action={<ChartLegend items={[{ label: 'Screen time (h)', color: '#cbd5e1' }, { label: 'Mood score', color: 'var(--teal-600)' }]} />}>
            <BarChart data={WEEK_IMPACT} />
            <p className="small muted mt-1 mb-0">Heavier usage days correlate with lower mood scores this week.</p>
          </Card>

          {/* preventive actions */}
          <Card className="col-5" title="Preventive actions">
            {PREVENTIVE.map((p) => (
              <Link key={p.label} to={p.to} className="list-row" style={{ textDecoration: 'none', color: 'inherit' }}>
                <span className="feed-icon" style={{ background: 'var(--teal-50)', color: 'var(--teal-700)' }}><Icon name={p.icon} size={17} /></span>
                <span className="grow small" style={{ fontWeight: 600 }}>{p.label}</span>
                <Icon name="chevronRight" size={15} className="muted" />
              </Link>
            ))}
            <Link to="/detox" className="btn btn-dark btn-block mt-2">
              <Icon name="clock" size={16} /> START 30-MIN DETOX
            </Link>
          </Card>

          {/* monitor feed */}
          <Card className="col-5" title="Live sentiment monitor" action={<span className="badge badge-teal pulse">LIVE</span>}>
            {monitor.map((m) => (
              <div key={m.id} className="feed-item">
                <span className="feed-icon" style={{ background: FEED_TONES[m.tone].bg, color: FEED_TONES[m.tone].color }}>
                  <Icon name={m.icon} size={16} />
                </span>
                <div>
                  <div className="feed-text">{m.text}</div>
                  <div className="feed-time">{timeAgo(m.time)}</div>
                </div>
              </div>
            ))}
          </Card>

          {/* toolkit navigation */}
          <div className="col-7">
            <h3 className="mb-2">Your toolkit</h3>
            <div className="grid-2">
              {QUICK_ACTIONS.map((a) => (
                <Link key={a.to} to={a.to} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <Card className="card-hover feature-card" style={{ height: '100%' }}>
                    <div className="feature-icon"><Icon name={a.icon} size={20} /></div>
                    <h3 style={{ fontSize: '1rem' }}>{a.title}</h3>
                    <p className="muted small mb-0">{a.desc}</p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
