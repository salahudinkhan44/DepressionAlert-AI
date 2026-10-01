// Authorized Viewer — read-only detail for one authorized user:
// latest score/level, risk trend and recent results. No editing (SEC-5).
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Icon from '../../components/icons';
import { Card, Badge, EmptyState, Loading, StatCard, ScorePill } from '../../components/common/ui';
import RiskGauge from '../../components/charts/RiskGauge';
import LineChart from '../../components/charts/LineChart';
import { getCaseDetail } from '../../services/api';
import { formatDateTime, initials } from '../../utils/format';

export default function ViewerCasePage() {
  const { id } = useParams();
  const [detail, setDetail] = useState(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    getCaseDetail(id).then((d) => (d ? setDetail(d) : setMissing(true)));
  }, [id]);

  if (missing) {
    return (
      <Card>
        <EmptyState icon="users" title="Not authorized"
          text="This account is not on your authorized list — or it doesn't exist."
          action={<Link to="/viewer" className="btn btn-primary">Back to monitored users</Link>} />
      </Card>
    );
  }
  if (!detail) return <Loading label="Loading case…" />;

  const latest = detail.analyses[0];
  const series = [...detail.analyses].sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((a) => ({ date: a.date, score: a.riskScore }));

  return (
    <div>
      <div className="page-head">
        <div className="flex items-center gap-2">
          <span className="avatar avatar-lg">{initials(detail.name)}</span>
          <div>
            <h1 className="mb-0">{detail.name}</h1>
            <p className="sub mb-0">Authorized viewer access · read-only</p>
          </div>
        </div>
        <Badge level={detail.lastLevel} >Latest: {detail.lastLevel}</Badge>
      </div>

      <div className="dash-grid">
        <Card className="col-4" title="Latest risk score">
          {latest ? <RiskGauge score={latest.riskScore} size={200} /> : <EmptyState icon="spark" title="No data" text="No analyses yet." />}
          {latest && <p className="small muted center mb-0">{formatDateTime(latest.date)}</p>}
        </Card>
        <div className="col-8">
          <div className="grid-3" style={{ gap: '1rem' }}>
            <StatCard label="Analyses" value={detail.analyses.length} icon="file" tone="var(--indigo-600)" />
            <StatCard label="High-risk results" value={detail.analyses.filter((a) => a.riskLevel === 'High').length} icon="warning" tone="var(--high)" />
            <StatCard label="Latest sentiment" value={latest?.sentiment ?? '—'} icon="chart" tone="var(--teal-700)" />
          </div>
          <Card className="mt-2" title="Risk trajectory">
            <LineChart data={series} />
          </Card>
        </div>
        <Card className="col-12" title="Recent results">
          <div className="table-wrap" style={{ border: 0 }}>
            <table className="table">
              <thead><tr><th>Date</th><th>Risk score</th><th>Level</th><th>Sentiment</th></tr></thead>
              <tbody>
                {detail.analyses.slice(0, 8).map((a) => (
                  <tr key={a.id}>
                    <td>{formatDateTime(a.date)}</td>
                    <td><ScorePill score={a.riskScore} /></td>
                    <td><Badge level={a.riskLevel} /></td>
                    <td className="mono">{a.sentiment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
