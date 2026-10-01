// Help & FAQ — grounded in the SRS functional requirements.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/icons';
import { Card } from '../../components/common/ui';
import { FAQS, CRISIS_RESOURCES } from '../../data/mockData';

export default function HelpPage() {
  const [open, setOpen] = useState(0);
  return (
    <section className="section" style={{ maxWidth: 860 }}>
      <div className="section-head">
        <span className="eyebrow">Help center</span>
        <h1>Frequently asked questions</h1>
        <p className="muted">Everything about how DepressionAlert AI works, what it analyzes, and how your data is handled.</p>
      </div>

      <Card className="mb-3">
        {FAQS.map((f, i) => (
          <div key={i} style={{ borderBottom: i < FAQS.length - 1 ? '1px solid #f1f5f9' : 0 }}>
            <button
              onClick={() => setOpen(open === i ? -1 : i)}
              className="flex between items-center w-100"
              style={{ background: 'none', border: 0, padding: '1rem 0', cursor: 'pointer', textAlign: 'left', font: 'inherit', fontWeight: 600 }}
              aria-expanded={open === i}
            >
              {f.q}
              <Icon name="chevronDown" size={16} style={{ transform: open === i ? 'rotate(180deg)' : 'none', transition: '.2s', flex: 'none' }} />
            </button>
            {open === i && <p className="muted small" style={{ paddingBottom: '1rem' }}>{f.a}</p>}
          </div>
        ))}
      </Card>

      <Card title="Need someone to talk to?">
        <div className="grid-2">
          {CRISIS_RESOURCES.helplines.map((h) => (
            <div key={h.id} className="helpline-card">
              <span className="phone"><Icon name="phone" size={19} /></span>
              <div>
                <b className="small">{h.name}</b>
                <div className="mono" style={{ fontWeight: 700 }}>{h.contact}</div>
                <div className="small muted">{h.detail}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="small muted mt-2 mb-0">
          Registered users can reach the full crisis toolkit anytime from{' '}
          <Link to="/crisis-support">Crisis Support</Link>.
        </p>
      </Card>
    </section>
  );
}
