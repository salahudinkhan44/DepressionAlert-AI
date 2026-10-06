// Daily Log / Depression Evaluation (SRS UC-4, FR-4..FR-8; SDD 8.1.2).
//   Row 1: New depression evaluation (full width)
//   Row 2: Linguistic Marker Analysis | Post & Comment Deep Dive
//   Row 3: Emotional Tone (full width)
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
const MIN_CHARS = 10;

// Scoped styles for the new layout + evaluation card
const LOCAL_CSS = `
.dash-grid .col-full { grid-column: 1 / -1; }

.eval-card { position: relative; overflow: hidden; }
.eval-card::before {
  content: ''; position: absolute; inset: 0 0 auto 0; height: 4px;
  background: linear-gradient(90deg, #0f766e, #14b8a6 55%, #6366f1);
}
.eval-body {
  display: grid; gap: 28px;
  grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr);
  align-items: stretch;
}
@media (max-width: 900px) { .eval-body { grid-template-columns: minmax(0, 1fr); } }

.eval-card .textarea {
  min-height: 210px; padding: 16px 18px; font-size: .98rem; line-height: 1.6;
  background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px;
  transition: border-color .15s, box-shadow .15s, background .15s; resize: vertical;
}
.eval-card .textarea:focus {
  outline: none; background: #fff; border-color: #14b8a6;
  box-shadow: 0 0 0 4px rgba(20, 184, 166, .15);
}
.eval-card .textarea.invalid { border-color: #dc2626; box-shadow: 0 0 0 4px rgba(220, 38, 38, .10); }

.eval-foot { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-top: 14px; flex-wrap: wrap; }
.eval-count {
  display: inline-flex; align-items: center; gap: 10px;
  font-size: .8rem; color: #64748b;
}
.eval-count .bar { width: 90px; height: 6px; border-radius: 99px; background: #e2e8f0; overflow: hidden; }
.eval-count .bar i { display: block; height: 100%; background: linear-gradient(90deg, #14b8a6, #0f766e); transition: width .2s; }

.eval-btn {
  display: inline-flex; align-items: center; gap: 8px; border: 0; cursor: pointer;
  padding: 12px 24px; border-radius: 12px; font-weight: 600; font-size: .95rem; color: #fff;
  background: linear-gradient(135deg, #0f766e, #14b8a6);
  box-shadow: 0 8px 20px -8px rgba(15, 118, 110, .7);
  transition: transform .15s, box-shadow .15s, filter .15s;
}
.eval-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 12px 24px -8px rgba(15, 118, 110, .8); }
.eval-btn:focus-visible { outline: 3px solid rgba(20, 184, 166, .45); outline-offset: 2px; }
.eval-btn:disabled { opacity: .55; cursor: not-allowed; box-shadow: none; filter: grayscale(.3); }

.eval-side {
  display: flex; flex-direction: column; gap: 18px; padding: 22px; border-radius: 16px;
  background: linear-gradient(160deg, #f0fdfa 0%, #eef2ff 100%);
  border: 1px solid #ccfbf1;
}
.eval-side h4 { margin: 0; font-size: .95rem; }
.eval-steps { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 14px; }
.eval-steps li { display: flex; gap: 12px; align-items: flex-start; font-size: .85rem; line-height: 1.45; color: #475569; }
.eval-steps b { display: block; color: #0f172a; font-size: .88rem; margin-bottom: 1px; }
.eval-steps .n {
  flex: none; width: 26px; height: 26px; border-radius: 50%;
  display: grid; place-items: center; font-size: .78rem; font-weight: 700;
  background: #fff; color: #0f766e; border: 1.5px solid #99f6e4;
}
.eval-privacy {
  margin-top: auto; display: flex; gap: 10px; align-items: flex-start;
  padding: 12px 14px; border-radius: 12px; background: rgba(255, 255, 255, .75);
  font-size: .78rem; color: #475569; line-height: 1.45;
}
.eval-privacy svg { flex: none; color: #0f766e; margin-top: 1px; }
`;

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
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const progress = Math.min(100, (text.trim().length / 120) * 100); // fills at ~120 chars

  const submitManual = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!text.trim()) errs.text = 'Please enter some text to analyze.';
    else if (text.trim().length < MIN_CHARS) errs.text = `Please write a little more (at least ${MIN_CHARS} characters).`;
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
      <style>{LOCAL_CSS}</style>

      {consentBlocked && (
        <div className="mb-3">
          <AlertBox type="warning" icon="shield">
            <b>Consent required.</b> Grant data-processing consent on the{' '}
            <Link to="/privacy">Privacy &amp; Profile</Link> page before submitting text (FR-3).
          </AlertBox>
        </div>
      )}

      <div className="dash-grid">
        {/* ================= ROW 1 — submission panel ================= */}
        <Card className="col-full eval-card" title="New depression evaluation"
          action={<Tabs active={tab} onChange={setTab}
            tabs={[{ id: 'text', label: 'Submit Text' }, { id: 'csv', label: 'Upload CSV' }]} />}>

          {tab === 'text' && (
            <div className="eval-body">
              <form onSubmit={submitManual} noValidate>
                <FormField
                  label="Paste a social-media post, comment or journal entry"
                  error={errors.text}
                >
                  <textarea className={`textarea ${errors.text ? 'invalid' : ''}`}
                    placeholder="e.g. Lately I've been feeling…"
                    value={text} onChange={(e) => setText(e.target.value)}
                    disabled={consentBlocked || busy} />
                </FormField>
                <div className="eval-foot">
                  <span className="eval-count">
                    <span className="bar"><i style={{ width: `${progress}%` }} /></span>
                    {wordCount} {wordCount === 1 ? 'word' : 'words'}
                  </span>
                  <button className="eval-btn" disabled={busy || consentBlocked}>
                    {busy
                      ? <><span className="spinner" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,.3)' }} /> Analyzing…</>
                      : <><Icon name="spark" size={16} /> Analyze text</>}
                  </button>
                </div>
              </form>

              <aside className="eval-side">
                <h4>How it works</h4>
                <ol className="eval-steps">
                  <li><span className="n">1</span><span><b>Share your text</b>Paste a post, comment or journal entry.</span></li>
                  <li><span className="n">2</span><span><b>We look for patterns</b>Language markers and emotional tone are measured.</span></li>
                  <li><span className="n">3</span><span><b>Review your result</b>See a risk level, key indicators and next steps.</span></li>
                </ol>
                <div className="eval-privacy">
                  <Icon name="shield" size={16} />
                  <span>Only text you choose to share is analyzed. Nothing is collected automatically.</span>
                </div>
              </aside>
            </div>
          )}

          {/* {tab === 'csv' && (
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
          )} */}
        </Card>

        {/* ================= ROW 2 — markers + deep dive ================= */}
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

        <Card className="col-6" title="Post &amp; Comment Deep Dive"
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

        {/* ================= ROW 3 — emotional tone ================= */}
        <Card className="col-full" title="Emotional Tone"
          action={<span className="small muted">last {Math.min(14, analyses.length)} analyses</span>}>
          {analyses.length ? (
            <VolatilityTimeline analyses={analyses} />
          ) : (
            <EmptyState icon="chart" title="No timeline yet" text="Your emotional tone history builds as you submit evaluations." />
          )}
        </Card>
      </div>
    </div>
  );
}