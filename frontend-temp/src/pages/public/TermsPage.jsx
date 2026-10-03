// Terms of Use — grounded strictly in the PDFs' scope & exclusions.
import { Card } from '../../components/common/ui';

const SECTIONS = [
  {
    t: '1. What this service is',
    b: 'DepressionAlert AI is a student Final Year Project that analyzes social-media text you voluntarily submit and produces advisory depression-risk indicators. It is an academic system for supportive early awareness.',
  },
  {
    t: '2. What this service is not',
    b: 'It is not a medical device and does not provide diagnosis, treatment, or clinical advice. It does not predict suicide risk, does not analyze images or video, does not use biometric data, and never contacts you or others automatically. All outputs are advisory; clinical decisions belong to qualified professionals.',
  },
  {
    t: '3. Consent and your data',
    b: 'Text is processed only after you explicitly grant data-processing consent. You may revoke consent at any time from Privacy & Profile, after which no further submissions will be accepted or processed. You may only submit text you are authorized to share.',
  },
  {
    t: '4. Acceptable use',
    b: 'Do not submit text belonging to others without authorization, malformed or abusive input intended to disrupt the service, or content unrelated to the self-monitoring purpose of the tool. Accounts may be suspended for misuse.',
  },
  {
    t: '5. Accounts and security',
    b: 'You are responsible for safeguarding your credentials. Passwords are stored as one-way salted hashes and never in plaintext. Sessions expire on logout or after inactivity.',
  },
  {
    t: '6. Academic context',
    b: 'This deployment is part of a Final Year Project evaluation at COMSATS University Islamabad, Abbottabad Campus (BSCS 2023–2027). Features and availability may change as the project evolves.',
  },
];

export default function TermsPage() {
  return (
    <section className="section" style={{ maxWidth: 780 }}>
      <div className="section-head">
        <span className="eyebrow">Legal</span>
        <h1>Terms of Use</h1>
        <p className="muted">Last updated for the FYP evaluation build.</p>
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
