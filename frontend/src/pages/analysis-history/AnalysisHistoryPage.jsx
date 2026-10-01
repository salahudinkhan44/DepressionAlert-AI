// Analysis History (SRS UC-6, FR-14) — previous results ordered by date:
// date, risk score, risk level, sentiment; click a row for detail.
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../components/icons';
import { Card, Badge, EmptyState, Loading, ScorePill } from '../../components/common/ui';
import { useAppData } from '../../context/AppDataContext';
import { formatDateTime } from '../../utils/format';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'Low', label: 'Low' },
  { id: 'Moderate', label: 'Moderate' },
  { id: 'High', label: 'High' },
];

export default function AnalysisHistoryPage() {
  const { analyses } = useAppData();
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  const rows = useMemo(
    () => (analyses || []).filter((a) => filter === 'all' || a.riskLevel === filter),
    [analyses, filter]
  );

  if (!analyses) return <Loading label="Loading history…" />;

  return (
    <div>
      <div className="flex between items-center mb-3 wrap gap-1">
        <div className="tabs">
          {FILTERS.map((f) => (
            <button key={f.id} className={filter === f.id ? 'active' : ''} onClick={() => setFilter(f.id)}>
              {f.label}
            </button>
          ))}
        </div>
        <Link to="/daily-log" className="btn btn-soft btn-sm"><Icon name="plus" size={14} /> New evaluation</Link>
      </div>

      {!analyses.length ? (
        <Card>
          <EmptyState icon="file" title="No previous analyses"
            text="Your evaluation history will appear here once you complete your first analysis."
            action={<Link to="/daily-log" className="btn btn-primary">Get Depression Evaluation</Link>} />
        </Card>
      ) : !rows.length ? (
        <Card><EmptyState icon="filter" title="Nothing at this level" text="No analyses match the selected risk-level filter." /></Card>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th><th>Excerpt</th><th>Source</th><th>Sentiment</th><th>Risk score</th><th>Level</th><th />
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} className="clickable" onClick={() => navigate(`/analysis/${a.id}`)}>
                  <td className="nowrap">{formatDateTime(a.date)}</td>
                  <td style={{ maxWidth: 280 }}>
                    <span className="muted small" style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {a.excerpt}
                    </span>
                  </td>
                  <td><span className="badge badge-neutral">{a.source}</span></td>
                  <td className="mono">{a.sentiment}</td>
                  <td><ScorePill score={a.riskScore} /></td>
                  <td><Badge level={a.riskLevel} /></td>
                  <td><Icon name="chevronRight" size={15} className="muted" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
