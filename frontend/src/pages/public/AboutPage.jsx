// About — mission, approach, team, and the advisory disclaimer
// (Proposal: vision statement & objectives).
import { Link } from 'react-router-dom';
import Icon from '../../components/icons';
import { Card } from '../../components/common/ui';

const VALUES = [
  { icon: 'eye', title: 'Early detection', text: 'Depression-related linguistic and behavioural patterns are surfaced before they escalate — closing the gap between symptom onset and support.' },
  { icon: 'refresh', title: 'Continuous monitoring', text: 'Instead of one-time questionnaires, trends are tracked across submissions so change over time becomes visible.' },
  { icon: 'brain', title: 'AI-driven insight', text: 'NLP and machine-learning models detect emotional and linguistic patterns that are invisible to manual observation.' },
  { icon: 'shield', title: 'Ethics & privacy first', text: 'Strictly permission-based: no automatic collection, explicit consent, revocable anytime, per-user data isolation.' },
];

export default function AboutPage() {
  return (
    <div>
      <section className="section">
        <div className="section-head" style={{ maxWidth: 720 }}>
          <span className="eyebrow">About the project</span>
          <h1>Responsible AI for early mental-health awareness</h1>
          <p className="muted" style={{ fontSize: '1.05rem' }}>
            Depression affects over 280 million people worldwide, yet most never seek help until
            symptoms have escalated. DepressionAlert AI is a Final Year Project at COMSATS
            University Islamabad (Abbottabad Campus) exploring how natural-language processing
            can turn the words people already share into gentle, early signals — always with
            consent, never as a diagnosis.
          </p>
        </div>
        <div className="grid-2">
          {VALUES.map((v) => (
            <Card key={v.title} className="feature-card card-hover">
              <div className="feature-icon"><Icon name={v.icon} size={22} /></div>
              <h3>{v.title}</h3>
              <p className="muted small mb-0">{v.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="section-alt">
        <div className="section">
          <div className="grid-2" style={{ alignItems: 'center' }}>
            <div>
              <span className="eyebrow">What it analyzes</span>
              <h2>From text to insight</h2>
              <p className="muted">
                You submit posts manually or via CSV. The pipeline cleans and tokenizes the text,
                measures sentiment polarity, and extracts linguistic markers — first-person pronoun
                density, absolutist language, negative-emotion word frequency — then a trained
                classifier produces a 0–100 risk score and a Low / Moderate / High level.
              </p>
              <p className="muted">
                Scores of 70+ trigger a supportive alert and immediate access to crisis-support
                resources, helplines and coping tools.
              </p>
            </div>
            <Card>
              <h3 className="mb-2">Project team</h3>
              <div className="setting-row"><div><b>Muhammad Salahudin Khan</b><div className="small muted">SP23-BCS-135 · Developer</div></div></div>
              <div className="setting-row"><div><b>Muhammad Azan</b><div className="small muted">SP23-BCS-116 · Developer</div></div></div>
              <div className="setting-row"><div><b>Ms. Sara Shafique</b><div className="small muted">Project Supervisor</div></div></div>
              <div className="setting-row"><div><b>COMSATS University Islamabad</b><div className="small muted">Abbottabad Campus · BSCS 2023–2027</div></div></div>
            </Card>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="disclaimer">
          <Icon name="warning" size={20} style={{ flex: 'none', marginTop: 2 }} />
          <div>
            <b>Scope &amp; limits:</b> the system does not provide clinical diagnosis, does not
            contact monitored individuals, does not analyze images or video, does not predict
            suicide risk, and does not integrate biometric data or prescribe treatment.
          </div>
        </div>
        <div className="center mt-4">
          <Link to="/onboarding" className="btn btn-primary btn-lg">See how it works</Link>
        </div>
      </section>
    </div>
  );
}
