// Analysis Result (SRS UC-5, FR-9). Shows the latest result at
// /analysis-result and any specific result at /analysis/:id — risk score,
// level, sentiment, indicators and a brief plain-language explanation.
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Icon from '../../components/icons';
import { Card, Badge, Meter, EmptyState, Loading, AlertBox } from '../../components/common/ui';
import RiskGauge from '../../components/charts/RiskGauge';
import { useAppData } from '../../context/AppDataContext';
import { getAnalysisById } from '../../services/api';
import { analyzeText } from '../../utils/mockAnalyzer';
import { formatDateTime, riskColor } from '../../utils/format';

const EXPLAIN = {
  Low: 'Your text shows a healthy balance of sentiment and no strong depressive linguistic markers. Keep checking in — trends matter more than single scores.',
  Moderate: 'Some depression-related language patterns were detected — elevated negative-emotion words, self-focus or absolutist phrasing. Worth keeping an eye on; consider the coping tools if this persists.',
  High: 'A high concentration of depression-related linguistic markers was detected. This is an early-awareness signal, not a diagnosis — please consider the crisis-support resources and talking to someone you trust.',
};

export default function AnalysisResultPage() {
  const { id } = useParams();
  const { analyses, latest } = useAppData();
  const [result, setResult] = useState(id ? null : undefined);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (id) {
      getAnalysisById(id).then((a) => (a ? setResult(a) : setNotFound(true)));
    }
  }, [id]);

  if (!id && !analyses) return <Loading />;
  if (id && result === null) return <Loading label="Loading result…" />;

  const r = id ? result : latest;

  if (notFound || !r) {
    return (
      <Card>
        <EmptyState
          icon="spark"
          title={notFound ? 'Result not found' : 'No analysis yet'}
          text={notFound ? 'This analysis record could not be located.' : 'Complete a depression evaluation to see your risk score, level and explanation here.'}
          action={<Link to="/daily-log" className="btn btn-primary">Get Depression Evaluation</Link>}
        />
      </Card>
    );
  }

  return (
    <div className="dash-grid">
      <Card className="col-4" title="Depression risk score" action={<Badge level={r.riskLevel} />}>
        <RiskGauge score={r.riskScore} size={210} />
        <div className="mt-3">
          <div className="setting-row"><span className="small muted">Sentiment polarity</span><b className="mono">{r.sentiment}</b></div>
          <div className="setting-row"><span className="small muted">Analyzed</span><b className="small">{formatDateTime(r.date)}</b></div>
          <div className="setting-row"><span className="small muted">Source</span><b className="small">{r.source}</b></div>
          <div className="setting-row"><span className="small muted">Model version</span><b className="small mono">{r.modelVersion || 'mock-v1.0.0'}</b></div>
        </div>
      </Card>

      <div className="col-8 flex" style={{ flexDirection: 'column', gap: '1.25rem' }}>
        <Card title="What this means">
          <p className="muted mb-2">{EXPLAIN[r.riskLevel]}</p>
          {r.riskLevel === 'High' && (
            <AlertBox type="danger" icon="heart">
              Support is available — visit <Link to="/crisis-support"><b>Crisis Support &amp; Resources</b></Link> for
              helplines and coping tools.
            </AlertBox>
          )}
        </Card>

        <Card title="Detected linguistic indicators">
          <div className="flex gap-1 wrap mb-3">
            {(r.indicators || analyzeText(r.excerpt || '').indicators).map((ind) => (
              <span key={ind} className="chip"><Icon name="spark" size={12} style={{ color: 'var(--teal-700)' }} /> {ind}</span>
            ))}
          </div>
          <Meter label="First-person pronoun density" value={r.markers?.firstPersonDensity ?? 0} color="var(--indigo-600)" />
          <Meter label="Absolutist language" value={r.markers?.absolutistLanguage ?? 0} color="var(--moderate)" />
          <Meter label="Negative-emotion words" value={r.markers?.negativeEmotionWords ?? 0} color={riskColor('High')} />
        </Card>

        <Card title="Analyzed excerpt">
          <p className="muted" style={{ fontStyle: 'italic' }}>"{r.excerpt}"</p>
          <div className="flex gap-1 wrap">
            <Link to="/daily-log" className="btn btn-primary btn-sm"><Icon name="plus" size={14} /> New evaluation</Link>
            <Link to="/history" className="btn btn-ghost btn-sm">View history</Link>
            <Link to="/trends" className="btn btn-ghost btn-sm">View trends</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
