// Privacy Policy — reflects SEC-1..SEC-7 and the consent model.
import { Card } from '../../components/common/ui';

const SECTIONS = [
  {
    t: 'What we collect',
    b: 'Only what you explicitly provide: your name, email, a salted password hash, the text you paste, and CSV files you upload. Uploaded CSV files are held temporarily during validation and discarded once their rows are stored as individual submissions.',
  },
  {
    t: 'Consent-based processing',
    b: 'No data is collected automatically. Analysis begins only after you grant data-processing consent, and you can revoke it at any time from Privacy & Profile. Revoking stops all further processing immediately.',
  },
  {
    t: 'What we store',
    b: 'Your submissions, cleaned/processed text, analysis results (risk score and level), behavioral pattern summaries, and alerts — each record tied to your account only.',
  },
  {
    t: 'Who can see your data',
    b: 'You, and any Authorized Viewer you explicitly permit. Data is isolated per account; other users can never access your submissions, results, alerts or history.',
  },
  {
    t: 'Security',
    b: 'All traffic is encrypted in transit over HTTPS/TLS 1.2+. Passwords use salted one-way hashing. Sessions are terminated securely on logout and expired tokens are rejected.',
  },
  {
    t: 'Your rights',
    b: 'You can review your analysis history, revoke consent, and request deletion of your data at any time from the Privacy & Profile page.',
  },
];

export default function PrivacyPolicyPage() {
  return (
    <section className="section" style={{ maxWidth: 780 }}>
      <div className="section-head">
        <span className="eyebrow">Legal</span>
        <h1>Privacy Policy</h1>
        <p className="muted">How DepressionAlert AI handles your data — in plain language.</p>
      </div>
      <Card>
        {SECTIONS.map((s) => (
          <div key={s.t} className="mb-3">
            <h3>{s.t}</h3>
            <p className="muted small">{s.b}</p>
          </div>
        ))}
      </Card>
    </section>
  );
}
