// Daily Log / Depression Evaluation (SRS UC-4, FR-4..FR-8; SDD 8.1.2).
//   - Submit Text / Upload CSV tabs with validation + processing state
//   - Linguistic Marker Analysis panel
//   - Sentiment Volatility timeline
//   - Post & Comment Deep Dive (Social Feed / Direct Messages toggle)
import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Icon from '../../components/icons';
import { Card, Tabs, FormField, AlertBox, Badge, Meter, EmptyState, Loading } from '../../components/common/ui';
import VolatilityTimeline from '../../components/charts/VolatilityTimeline';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getPosts } from '../../services/api';
import { analyzeText } from '../../utils/mockAnalyzer';
import { formatDateTime } from '../../utils/format';
import { NEGATIVE_HINTS, ABSOLUTIST_HINTS } from './hintLexicon';

const MAX_MB = 5;

function highlightFlags(text) {
  // overlay AI-detected indicators on the user's own text (SDD 8.1.2)
  const words = text.split(/(\s+)/);
  return words.map((w, i) => {
    const clean = w.toLowerCase().replace(/[^\w']/g, '');
    if (NEGATIVE_HINTS.includes(clean)) return <mark key={i} className="flag flag-neg">{w}</mark>;
    if (ABSOLUTIST_HINTS.includes(clean)) return <mark key={i} className="flag">{w}</mark>;
    return <span key={i}>{w}</span>;
  });
}

export default function DailyLogPage() {
  const { user } = useAuth();
  const { analyses, submitText, submitCsv } = useAppData();
  const toast = useToast();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [tab, setTab] = useState('text');
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [drag, setDrag] = useState(false);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [posts, setPosts] = useState([]);
  const [feed, setFeed] = useState('feed');
  const [batchSummary, setBatchSummary] = useState(null);

  useEffect(() => { getPosts().then(setPosts); }, [analyses]);

  if (!analyses) return <Loading />;

  const consentBlocked = !user?.consentGiven;
  const latest = analyses[0];
  const filteredPosts = posts.filter((p) => p.kind === feed);

  const submitManual = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!text.trim()) errs.text = 'Please enter some text to analyze.';
    else if (text.trim().length < 10) errs.text = 'Please write a little more (at least 10 characters).';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      const analysis = await submitText(text);
      toast.success('Analysis complete — your result is ready.');
      navigate(`/analysis/${analysis.id}`);
    } catch (err) {
      setErrors({ text: err.message });
    } finally {
      setBusy(false);
    }
  };

  const pickFile = (f) => {
    setErrors({});
    setBatchSummary(null);
    if (!f) return;
    if (!/\.csv$/i.test(f.name)) { setErrors({ file: 'Only .csv files are accepted.' }); return; }
    if (f.size > MAX_MB * 1024 * 1024) { setErrors({ file: `File must be under ${MAX_MB} MB.` }); return; }
    setFile(f);
  };

  const submitFile = async () => {
    if (!file) { setErrors({ file: 'Choose a CSV file first.' }); return; }
    setBusy(true);
    try {
      const { results, skipped } = await submitCsv(file);
      setBatchSummary({ count: results.length, skipped });
      toast.success(`${results.length} post${results.length === 1 ? '' : 's'} analyzed.`);
      setFile(null);
    } catch (err) {
      setErrors({ file: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {consentBlocked && (
        <div className="mb-3">
          <AlertBox type="warning" icon="shield">
            <b>Consent required.</b> Grant data-processing consent on the{' '}
            <Link to="/privacy">Privacy &amp; Profile</Link> page before submitting text (FR-3).
          </AlertBox>
        </div>
      )}

      <div className="dash-grid">
        {/* ---------- submission panel ---------- */}
        <Card className="col-6" title="New depression evaluation"
          action={<Tabs active={tab} onChange={setTab}
            tabs={[{ id: 'text', label: 'Submit Text' }, { id: 'csv', label: 'Upload CSV' }]} />}>

          {tab === 'text' && (
            <form onSubmit={submitManual} noValidate>
              <FormField
                label="Paste a social-media post, comment or journal entry"
                hint="Only text you choose to share is analyzed. Nothing is collected automatically."
                error={errors.text}
              >
                <textarea className={`textarea ${errors.text ? 'invalid' : ''}`}
                  placeholder="e.g. Lately I've been feeling…"
                  value={text} onChange={(e) => setText(e.target.value)}
                  disabled={consentBlocked || busy} />
              </FormField>
              <div className="flex between items-center">
                <span className="small muted mono">{text.trim().split(/\s+/).filter(Boolean).length} words</span>
                <button className="btn btn-primary" disabled={busy || consentBlocked}>
                  {busy ? <><span className="spinner" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,.3)' }} /> Analyzing…</> : <><Icon name="spark" size={16} /> Analyze text</>}
                </button>
              </div>
            </form>
          )}

          {tab === 'csv' && (
            <div>
              <div
                className={`dropzone ${drag ? 'drag' : ''}`}
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => { e.preventDefault(); setDrag(false); pickFile(e.dataTransfer.files?.[0]); }}
                role="button" tabIndex={0}
              >
                <Icon name="upload" size={34} />
                <p className="mt-1 mb-0" style={{ fontWeight: 600 }}>
                  {file ? file.name : 'Drop your CSV here or click to browse'}
                </p>
                <p className="small mb-0">One post per row · max {MAX_MB} MB · .csv only</p>
                <input ref={fileRef} type="file" accept=".csv" className="hidden"
                  onChange={(e) => pickFile(e.target.files?.[0])} />
              </div>
              {errors.file && <div className="mt-2"><AlertBox type="danger">{errors.file}</AlertBox></div>}
              {batchSummary && (
                <div className="mt-2">
                  <AlertBox type="success">
                    Batch complete — <b>{batchSummary.count}</b> posts analyzed
                    {batchSummary.skipped ? `, ${batchSummary.skipped} duplicate/empty skipped` : ''}.{' '}
                    <Link to="/history">View in history →</Link>
                  </AlertBox>
                </div>
              )}
              <div className="flex between items-center mt-2">
                <span className="small muted">Empty, malformed and duplicate rows are rejected automatically (FR-6).</span>
                <button className="btn btn-primary" onClick={submitFile} disabled={!file || busy || consentBlocked}>
                  {busy ? 'Processing…' : 'Analyze CSV'}
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* ---------- linguistic marker analysis ---------- */}
        <Card className="col-6" title="Linguistic Marker Analysis"
          action={latest && <span className="small muted">from latest analysis</span>}>
          {latest ? (
            <>
              <Meter label="First-person pronoun density" value={latest.markers?.firstPersonDensity ?? 0} color="var(--indigo-600)" />
              <Meter label="Absolutist language usage" value={latest.markers?.absolutistLanguage ?? 0} color="var(--moderate)" />
              <Meter label="Negative-emotion word level" value={latest.markers?.negativeEmotionWords ?? 0} color="var(--high)" />
              <p className="small muted mb-0">
                Markers aggregated across your submissions feed the Behavioural Trends view (FR-10).
              </p>
            </>
          ) : (
            <EmptyState icon="chart" title="No markers yet" text="Run an evaluation and your linguistic markers will appear here." />
          )}
        </Card>

        {/* ---------- sentiment volatility ---------- */}
        <Card className="col-7" title="Sentiment Volatility"
          action={<span className="small muted">last {Math.min(14, analyses.length)} analyses</span>}>
          {analyses.length ? (
            <VolatilityTimeline analyses={analyses} />
          ) : (
            <EmptyState icon="chart" title="No timeline yet" text="Your sentiment timeline builds as you submit evaluations." />
          )}
        </Card>

        {/* ---------- post & comment deep dive ---------- */}
        <Card className="col-5" title="Post &amp; Comment Deep Dive"
          action={
            <div className="segmented">
              <button className={feed === 'feed' ? 'active' : ''} onClick={() => setFeed('feed')}>Social Feed</button>
              <button className={feed === 'dm' ? 'active' : ''} onClick={() => setFeed('dm')}>Direct Messages</button>
            </div>
          }>
          {filteredPosts.map((p) => {
            const a = analyzeText(p.text);
            return (
              <div key={p.id} className="post-card">
                <div className="post-meta">
                  <Icon name={p.kind === 'dm' ? 'message' : 'globe'} size={13} />
                  <b>{p.platform}</b> · {formatDateTime(p.date)}
                  <span style={{ marginLeft: 'auto' }}><Badge level={a.riskLevel} /></span>
                </div>
                <div className="post-text">{highlightFlags(p.text)}</div>
                <div className="post-indicators">
                  {a.indicators.slice(0, 2).map((ind) => (
                    <span key={ind} className="chip" style={{ fontSize: '.72rem' }}>
                      <Icon name="spark" size={11} /> {ind}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
          {!filteredPosts.length && <EmptyState icon="message" title="Nothing here" text="No posts in this channel yet." />}
        </Card>
      </div>
    </div>
  );
}
