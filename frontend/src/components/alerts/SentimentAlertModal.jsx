// Sentiment Alert modal (SRS UC-8, FR-11/FR-12; SDD 8.1.3).
// Non-alarming explanation + two actions:
//   "Take a 30-min break" -> Alert status = Viewed, opens detox session
//   "Dismiss"             -> Alert status = Dismissed
import { useNavigate } from 'react-router-dom';
import Modal from '../common/Modal';
import Icon from '../icons';
import { useAppData } from '../../context/AppDataContext';

export default function SentimentAlertModal({ alert }) {
  const { setAlertStatus } = useAppData();
  const navigate = useNavigate();
  if (!alert) return null;

  const takeBreak = async () => {
    await setAlertStatus(alert.id, 'Viewed');
    navigate('/detox');
  };
  const dismiss = () => setAlertStatus(alert.id, 'Dismissed');
  const viewResources = async () => {
    await setAlertStatus(alert.id, 'Viewed');
    navigate('/crisis-support');
  };

  return (
    <Modal open onClose={dismiss} title="">
      <div className="center">
        <div className="feed-icon" style={{ width: 56, height: 56, margin: '0 auto 1rem', background: 'var(--moderate-bg)', color: 'var(--moderate)' }}>
          <Icon name="heart" size={26} />
        </div>
        <h2>We noticed a pattern</h2>
        <p className="muted" style={{ fontSize: '.92rem' }}>
          {alert.message}
        </p>
        <p className="small muted">
          This is an early-awareness insight, not a diagnosis. Small steps help —
          a short break, a breathing exercise, or a conversation with someone you trust.
        </p>
        <div className="flex gap-1 mt-3" style={{ flexDirection: 'column' }}>
          <button className="btn btn-primary btn-block" onClick={takeBreak}>
            <Icon name="clock" size={16} /> Take a 30-min break
          </button>
          <button className="btn btn-soft btn-block" onClick={viewResources}>
            <Icon name="heart" size={16} /> View crisis-support resources
          </button>
          <button className="btn btn-ghost btn-block" onClick={dismiss}>Dismiss</button>
        </div>
      </div>
    </Modal>
  );
}
