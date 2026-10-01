// Public landing page — welcome experience, toolkit overview, how it
// works, and the advisory disclaimer (SRS §1.2, scope statement).
import { Link } from 'react-router-dom';
import Icon from '../../components/icons';
import RiskGauge from '../../components/charts/RiskGauge';
import { Card } from '../../components/common/ui';

const TOOLKIT = [
  { icon: 'journal', title: 'Depression Evaluation', desc: 'Paste a post or upload a CSV of past posts. The NLP engine cleans, tokenizes and scores the text for depressive linguistic patterns.' },
  { icon: 'spark', title: 'Risk Score & Level', desc: 'Every analysis returns a 0–100 risk score and a Low / Moderate / High level, with a plain-language explanation of the result.' },
  { icon: 'chart', title: 'Behavioural Trends', desc: 'Track how your risk score, sentiment and emotional markers shift across submissions over time.' },
  { icon: 'bell', title: 'Smart Alerts', desc: 'When a score crosses the high-risk threshold, a calm alert appears — with immediate access to crisis support.' },
  { icon: 'heart', title: 'Crisis Support Toolkit', desc: 'Helplines, breathing exercises, guided meditation and a learning library, always one click away.' },
  { icon: 'shield', title: 'Consent & Privacy', desc: 'Nothing is collected automatically. You grant — and can revoke — data-processing consent at any time.' },
];

const STEPS = [
  { title: 'Share your words', desc: 'Paste a social-media post or upload a CSV export — only after you explicitly consent.' },
  { title: 'AI analyzes the text', desc: 'The NLP pipeline extracts sentiment and linguistic markers, then a trained ML model scores the result.' },
  { title: 'See patterns early', desc: 'Your dashboard surfaces risk trends, linguistic markers and alerts — so changes never go unnoticed.' },
];

export default function LandingPage() {
  return (
    <div>
      <section className="hero">
        <div>
          <span className="badge badge-teal mb-2">AI-assisted mental-health awareness</span>
          <h1>Notice the signs.<br />Before they escalate.</h1>
          <p className="lead">
            DepressionAlert AI analyzes the social-media text you choose to share and surfaces
            early linguistic and emotional patterns associated with depression — continuously,
            privately, and always under your consent.
          </p>
          <div className="flex gap-1 mt-3 wrap">
            <Link to="/onboarding" className="btn btn-primary btn-lg">Get Started <Icon name="arrowRight" size={17} /></Link>
            <Link to="/about" className="btn btn-ghost btn-lg">Learn more</Link>
          </div>
          <p className="small muted mt-3 flex items-center gap-1">
            <Icon name="lock" size={14} /> Consent-based · Private by design · Advisory only
          </p>
        </div>
        <div className="hero-visual">
          <div className="flex between items-center mb-2">
            <span className="small" style={{ opacity: .8 }}>Digital Sentiment Score</span>
            <span className="badge" style={{ background: 'rgba(255,255,255,.15)', color: '#fff' }}>LIVE</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,.08)', borderRadius: 16, padding: '1rem' }}>
            <RiskGauge score={34} size={210} />
          </div>
          <div className="flex gap-2 mt-2 wrap">
            <span className="chip" style={{ background: 'rgba(255,255,255,.12)', border: 0, color: '#fff' }}>Sentiment trending up</span>
            <span className="chip" style={{ background: 'rgba(255,255,255,.12)', border: 0, color: '#fff' }}>12 analyses</span>
          </div>
        </div>
      </section>

      <section className="section-alt">
        <div className="section">
          <div className="section-head">
            <span className="eyebrow">The toolkit</span>
            <h2>Everything you need for continuous self-awareness</h2>
            <p className="muted">Six integrated tools turn the text you share into clear, actionable insight.</p>
          </div>
          <div className="grid-3">
            {TOOLKIT.map((t) => (
              <Card key={t.title} className="feature-card card-hover">
                <div className="feature-icon"><Icon name={t.icon} size={22} /></div>
                <h3>{t.title}</h3>
                <p className="muted small mb-0">{t.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <span className="eyebrow">How it works</span>
          <h2>Three steps to early awareness</h2>
        </div>
        <div className="grid-3">
          {STEPS.map((s, i) => (
            <Card key={s.title} className="card-hover">
              <div className="step-num">{i + 1}</div>
              <h3>{s.title}</h3>
              <p className="muted small mb-0">{s.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="disclaimer">
          <Icon name="info" size={20} style={{ flex: 'none', marginTop: 2 }} />
          <div>
            <b>Important:</b> DepressionAlert AI provides supportive early-awareness insight only.
            It does not perform medical diagnosis or treatment, and it never contacts or collects
            data automatically. All clinical decisions belong to qualified mental-health
            professionals. If you are in crisis, please use the helplines on the{' '}
            <Link to="/help">support page</Link>.
          </div>
        </div>
        <div className="center mt-4">
          <Link to="/register" className="btn btn-dark btn-lg">Create your free account</Link>
        </div>
      </section>
    </div>
  );
}
