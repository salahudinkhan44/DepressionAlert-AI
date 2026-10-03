// Guided breathing exercise (SDD 8.1.4 "START SESSION") — box breathing
// with an animated circle: inhale 4s, hold 4s, exhale 4s, hold 4s.
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/icons';
import { Card } from '../../components/common/ui';
import { useToast } from '../../context/ToastContext';
import { logActivity } from '../../services/api';

const PHASES = [
  { label: 'Breathe in', cls: 'in' },
  { label: 'Hold', cls: 'hold' },
  { label: 'Breathe out', cls: 'out' },
  { label: 'Hold', cls: 'hold' },
];
const PHASE_SECS = 4;
const CYCLE_SECS = PHASES.length * PHASE_SECS;

export default function BreathingExercisePage() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0); // seconds into the session
  const toast = useToast();
  const timer = useRef(null);

  useEffect(() => {
    if (!running) { clearInterval(timer.current); return undefined; }
    timer.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(timer.current);
  }, [running]);

  const phase = Math.floor(elapsed / PHASE_SECS) % PHASES.length;
  const phaseLeft = PHASE_SECS - (elapsed % PHASE_SECS);
  const cycles = Math.floor(elapsed / CYCLE_SECS);
  const cur = PHASES[phase];

  const stop = () => {
    setRunning(false);
    if (cycles > 0) {
      logActivity(`Completed ${cycles} breathing cycle${cycles > 1 ? 's' : ''}`);
      toast.success(`Session logged — ${cycles} cycle${cycles > 1 ? 's' : ''} completed. Well done.`);
    }
    setElapsed(0);
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <Card>
        <div className="center">
          <h2>Guided breathing</h2>
          <p className="muted small">Box breathing — four equal sides of {PHASE_SECS} seconds. Follow the circle and let your shoulders drop.</p>
        </div>
        <div className="breath-stage">
          <div className={`breath-circle ${running ? cur.cls : ''}`}>
            {running ? `${cur.label} · ${phaseLeft}` : 'Ready?'}
          </div>
        </div>
        <div className="center mb-2">
          <span className="badge badge-teal">{cycles} cycle{cycles === 1 ? '' : 's'} completed</span>
        </div>
        <div className="flex gap-1" style={{ justifyContent: 'center' }}>
          {!running ? (
            <button className="btn btn-primary btn-lg" onClick={() => setRunning(true)}>
              <Icon name="play" size={16} /> {elapsed ? 'Resume' : 'START SESSION'}
            </button>
          ) : (
            <button className="btn btn-dark btn-lg" onClick={stop}>
              <Icon name="pause" size={16} /> End session
            </button>
          )}
        </div>
        <p className="small muted center mt-3 mb-0">
          A few slow cycles can lower acute stress. <Link to="/crisis-support">Back to resources</Link>
        </p>
      </Card>
    </div>
  );
}
