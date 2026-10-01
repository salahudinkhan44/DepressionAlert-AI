// Alerts / notifications (SRS UC-8, FR-11; SDD 5.1 Alert entity).
// Status lifecycle: New -> Viewed | Dismissed.
import { Link } from 'react-router-dom';
import Icon from '../../components/icons';
import { Card, EmptyState, Loading, Tag } from '../../components/common/ui';
import { useAppData } from '../../context/AppDataContext';
import { formatDateTime } from '../../utils/format';

const STATUS_TONE = { New: 'high', Viewed: 'info', Dismissed: 'neutral' };

export default function AlertsPage() {
  const { alerts, setAlertStatus } = useAppData();
  if (alerts === null) return <Loading label="Loading alerts…" />;

  return (
    <div>
      {!alerts.length ? (
        <Card>
          <EmptyState icon="bell" title="No alerts"
            text="Alerts appear here when an analysis result crosses the high-risk threshold."
            action={<Link to="/daily-log" className="btn btn-primary">Run an evaluation</Link>} />
        </Card>
      ) : (
        alerts.map((a) => (
          <div key={a.id} className="list-row" style={{ alignItems: 'flex-start' }}>
            <span className="feed-icon" style={{ background: a.status === 'New' ? 'var(--high-bg)' : '#f1f5f9', color: a.status === 'New' ? 'var(--high)' : 'var(--ink-400)' }}>
              <Icon name="bell" size={17} />
            </span>
            <div className="grow">
              <div className="flex items-center gap-1 wrap">
                <b className="small">High-risk pattern detected</b>
                <Tag tone={STATUS_TONE[a.status] === 'high' ? 'high' : STATUS_TONE[a.status]}>{a.status}</Tag>
              </div>
              <p className="small muted mb-1" style={{ marginTop: '.25rem' }}>{a.message}</p>
              <span className="small muted">{formatDateTime(a.createdAt)}</span>
            </div>
            <div className="flex gap-1 wrap">
              <Link to={`/analysis/${a.analysisId}`} className="btn btn-ghost btn-sm">View result</Link>
              <Link to="/crisis-support" className="btn btn-soft btn-sm">Resources</Link>
              {a.status === 'New' && (
                <>
                  <button className="btn btn-ghost btn-sm" onClick={() => setAlertStatus(a.id, 'Viewed')}>Mark viewed</button>
                  <button className="btn btn-danger-soft btn-sm" onClick={() => setAlertStatus(a.id, 'Dismissed')}>Dismiss</button>
                </>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
