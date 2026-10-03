// Authorized Viewer dashboard (SDD §5.1 User.role = "Authorized Viewer")
// — a read-only list of accounts the viewer is permitted to see.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/icons';
import { Card, Badge, Loading, EmptyState } from '../../components/common/ui';
import { getAuthorizedCases } from '../../services/api';
import { formatDate, initials } from '../../utils/format';

export default function ViewerDashboardPage() {
  const [cases, setCases] = useState(null);

  useEffect(() => { getAuthorizedCases().then(setCases); }, []);

  if (!cases) return <Loading label="Loading authorized users…" />;

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Monitored users</h1>
          <p className="sub mb-0">Read-only view — accounts that have authorized you to see their results.</p>
        </div>
      </div>
      {!cases.length ? (
        <Card>
          <EmptyState icon="users" title="No authorized users"
            text="When a user authorizes you to view their monitoring data, they will appear here." />
        </Card>
      ) : (
        <div className="grid-3">
          {cases.map((c) => (
            <Link key={c.id} to={`/viewer/users/${c.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Card className="card-hover">
                <div className="flex items-center gap-2 mb-2">
                  <span className="avatar">{initials(c.name)}</span>
                  <div>
                    <b>{c.name}</b>
                    <div className="small muted">since {formatDate(c.since)}</div>
                  </div>
                  <span style={{ marginLeft: 'auto' }}><Badge level={c.lastLevel} /></span>
                </div>
                <div className="flex between items-center">
                  <span className="small muted">{c.analyses} analyses</span>
                  <span className="small" style={{ color: 'var(--teal-700)', fontWeight: 600 }}>
                    View detail <Icon name="chevronRight" size={13} style={{ verticalAlign: -2 }} />
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
      <p className="small muted mt-3">
        <Icon name="lock" size={13} style={{ verticalAlign: -2 }} /> Viewers see results only — never raw submissions — and cannot submit or modify anything.
      </p>
    </div>
  );
}
