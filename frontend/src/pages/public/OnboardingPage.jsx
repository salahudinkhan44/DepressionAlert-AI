// 3-slide onboarding flow (Get Started) — introduces the core loop:
// submit text -> AI analysis -> early awareness & support.
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../components/icons';

const SLIDES = [
  {
    icon: 'journal',
    title: 'Share your words, your way',
    text: 'Paste a social-media post directly or upload a CSV of past posts. Nothing is collected automatically — you decide what gets analyzed, only after granting consent.',
  },
  {
    icon: 'brain',
    title: 'AI reads the patterns',
    text: 'Our NLP engine extracts sentiment and linguistic markers — first-person focus, absolutist language, negative-emotion words — and a trained model produces a 0–100 risk score.',
  },
  {
    icon: 'heart',
    title: 'Support when it matters',
    text: 'Track trends on your dashboard, get a calm alert if risk climbs, and reach crisis helplines and coping tools in one tap. Advisory insight — never a diagnosis.',
  },
];

export default function OnboardingPage() {
  const [i, setI] = useState(0);
  const navigate = useNavigate();
  const last = i === SLIDES.length - 1;
  const slide = SLIDES[i];

  return (
    <div className="onboard-wrap">
      <div className="onboard-card anim-in" key={i}>
        <div className="onboard-visual">
          <Icon name={slide.icon} size={86} strokeWidth={1.2} />
        </div>
        <h1 style={{ fontSize: '1.7rem' }}>{slide.title}</h1>
        <p className="muted" style={{ maxWidth: 440, margin: '0 auto' }}>{slide.text}</p>
        <div className="onboard-dots">
          {SLIDES.map((_, d) => <span key={d} className={d === i ? 'active' : ''} />)}
        </div>
        <div className="flex gap-1" style={{ justifyContent: 'center' }}>
          {last ? (
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
              Get Started <Icon name="arrowRight" size={17} />
            </button>
          ) : (
            <>
              <button className="btn btn-ghost" onClick={() => navigate('/register')}>Skip</button>
              <button className="btn btn-primary" onClick={() => setI(i + 1)}>
                Next <Icon name="arrowRight" size={16} />
              </button>
            </>
          )}
        </div>
        <p className="small muted mt-3">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
