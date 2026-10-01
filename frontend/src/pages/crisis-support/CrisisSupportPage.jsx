// Crisis Support & Resources (SRS UC-8, FR-12; SDD 8.1.4):
// helplines + emergency contacts, coping toolkit (breathing / meditation /
// mood audio), and a learning library.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/icons';
import { Card, PageHeader } from '../../components/common/ui';
import Modal from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { CRISIS_RESOURCES } from '../../data/mockData';

const TOOL_TONES = {
  teal: { bg: 'var(--teal-50)', color: 'var(--teal-700)' },
  indigo: { bg: 'var(--indigo-100)', color: 'var(--indigo-600)' },
  amber: { bg: 'var(--moderate-bg)', color: 'var(--moderate)' },
};

export default function CrisisSupportPage() {
  const [article, setArticle] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();
  const { helplines, toolkit, articles } = CRISIS_RESOURCES;

  const runTool = (tool) => {
    if (tool.kind === 'breathing') navigate('/crisis-support/breathing');
    else toast.info(`${tool.title} would open an embedded media resource here.`);
  };

  return (
    <div>
      {/* emergency banner */}
      <div className="crisis-hero mb-3">
        <div className="flex between items-center wrap gap-2">
          <div>
            <h2 style={{ color: '#fff', marginBottom: '.25rem' }}>In immediate danger or crisis?</h2>
            <p className="mb-0" style={{ opacity: .9, fontSize: '.92rem' }}>
              You matter. If you're thinking about harming yourself, please reach out now — support is free and confidential.
            </p>
          </div>
          <a href="tel:1122" className="btn" style={{ background: '#fff', color: 'var(--high)', fontWeight: 800 }}>
            <Icon name="phone" size={16} /> Call 1122
          </a>
        </div>
      </div>

      <div className="dash-grid">
        <Card className="col-7" title="Helplines & emergency contacts">
          <div className="grid-2">
            {helplines.map((h) => (
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
        </Card>

        <Card className="col-5" title="Immediate steps">
          <div className="setting-row"><div className="setting-info"><b className="small">Move to a safer space</b><div className="small muted">Step away from anything you could use to hurt yourself.</div></div><span className="step-num" style={{ width: 26, height: 26, fontSize: '.8rem' }}>1</span></div>
          <div className="setting-row"><div className="setting-info"><b className="small">Tell one person</b><div className="small muted">Text or call someone you trust — a friend, family member, or helpline.</div></div><span className="step-num" style={{ width: 26, height: 26, fontSize: '.8rem' }}>2</span></div>
          <div className="setting-row"><div className="setting-info"><b className="small">Try a grounding tool</b><div className="small muted">Use the breathing exercise below or step outside for air.</div></div><span className="step-num" style={{ width: 26, height: 26, fontSize: '.8rem' }}>3</span></div>
          <div className="setting-row"><div className="setting-info"><b className="small">Plan professional support</b><div className="small muted">Book time with a counselor or doctor — these signals deserve care.</div></div><span className="step-num" style={{ width: 26, height: 26, fontSize: '.8rem' }}>4</span></div>
        </Card>

        {/* coping toolkit */}
        <div className="col-12">
          <h3 className="mb-2">Coping toolkit</h3>
          <div className="grid-3">
            {toolkit.map((t) => (
              <Card key={t.id} className="tool-card card-hover">
                <span className="tool-icon" style={{ background: TOOL_TONES[t.tone].bg, color: TOOL_TONES[t.tone].color }}>
                  <Icon name={t.icon} size={22} />
                </span>
                <h3 style={{ fontSize: '1rem' }}>{t.title}</h3>
                <p className="muted small" style={{ flex: 1 }}>{t.desc}</p>
                <button className="btn btn-soft btn-sm" style={{ alignSelf: 'flex-start' }} onClick={() => runTool(t)}>
                  {t.action} <Icon name="arrowRight" size={13} />
                </button>
              </Card>
            ))}
          </div>
        </div>

        {/* learning library */}
        <Card className="col-12" title="Learning library"
          action={<span className="small muted">sentiment tracking & AI in mental health</span>}>
          {articles.map((a) => (
            <div key={a.id} className="article-item" onClick={() => setArticle(a)}>
              <span className="article-thumb" style={{ background: 'var(--teal-50)', color: 'var(--teal-700)' }}>
                <Icon name="book" size={20} />
              </span>
              <div>
                <div className="article-title" style={{ fontWeight: 600 }}>{a.title}</div>
                <div className="small muted">{a.category} · {a.readTime} read</div>
              </div>
              <Icon name="chevronRight" size={16} className="muted" style={{ marginLeft: 'auto', alignSelf: 'center' }} />
            </div>
          ))}
        </Card>
      </div>

      <Modal open={!!article} onClose={() => setArticle(null)} title={article?.title} wide>
        {article && (
          <>
            <p className="small muted">{article.category} · {article.readTime} read</p>
            <p className="muted">{article.body}</p>
          </>
        )}
      </Modal>
    </div>
  );
}
