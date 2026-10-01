// 30-minute digital detox timer (SDD 8.2 "START 30-MIN DETOX") —
// a guided countdown that logs the action against the current alert.
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/icons';
import { Card, AlertBox } from '../../components/common/ui';
import { useToast } from '../../context/ToastContext';
import { logActivity } from '../../services/api';

const TOTAL = 30 * 60; // 30 minutes

export default function DetoxPage() {
  const [remaining, setRemaining] = useState(TOTAL);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const timer = useRef(null);
  const toast = useToast();

  useEffect(() => {
    if (!running) { clearInterval(timer.current); return undefined; }
    timer.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(timer.current);
          setRunning(false);
          setDone(true);
          logActivity('Completed a 30-minute digital detox');
          toast.success('Detox complete — nice work stepping away.');
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(timer.current);
  }, [running, toast]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  const frac = remaining / TOTAL;
  const R = 100, C = 2 * Math.PI * R;

  const reset = () => { setRunning(false); setDone(false); setRemaining(TOTAL); };

  return (
    <div style={{ maxWidth: 620, margin: '0 auto' }}>
      <Card>
        <div className="center mb-2">
          <h2>30-minute digital detox</h2>
          <p className="muted small">
            Step away from the feed. Put the phone down, stretch, breathe, take a walk —
            we'll keep the time.
          </p>
        </div>

        {done ? (
          <div className="center anim-in">
            <div className="feed-icon" style={{ width: 72, height: 72, margin: '0 auto 1rem', background: 'var(--low-bg)', color: 'var(--low)' }}>
              <Icon name="check" size={34} />
            </div>
            <h3>Detox complete</h3>
            <p className="muted small">You gave yourself 30 minutes away from the scroll. That counts.</p>
            <div className="flex gap-1" style={{ justifyContent: 'center' }}>
              <Link to="/dashboard" className="btn btn-primary">Back to dashboard</Link>
              <button className="btn btn-ghost" onClick={reset}>Run it again</button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex" style={{ justifyContent: 'center', padding: '1rem 0' }}>
              <div style={{ position: 'relative', width: 230, height: 230 }}>
                <svg className="progress-ring" width="230" height="230" viewBox="0 0 230 230">
                  <circle cx="115" cy="115" r={R} stroke="#eef2f7" />
                  <circle cx="115" cy="115" r={R} stroke="var(--teal-600)"
                    strokeDasharray={`${frac * C} ${C}`} style={{ transition: 'stroke-dasharray .6s linear' }} />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="detox-timer">{mm}:{ss}</span>
                  <span className="small muted">{running ? 'detox in progress' : 'ready when you are'}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-1" style={{ justifyContent: 'center' }}>
              {!running ? (
                <button className="btn btn-dark btn-lg" onClick={() => setRunning(true)}>
                  <Icon name="play" size={16} /> {remaining < TOTAL ? 'Resume' : 'START 30-MIN DETOX'}
                </button>
              ) : (
                <button className="btn btn-ghost btn-lg" onClick={() => setRunning(false)}>
                  <Icon name="pause" size={16} /> Pause
                </button>
              )}
              {remaining < TOTAL && !running && (
                <button className="btn btn-ghost" onClick={reset}>Reset</button>
              )}
            </div>
            {!running && remaining === TOTAL && (
              <div className="mt-3">
                <AlertBox type="info" icon="clock">
                  Starting logs this detox against your current alert and begins the timer.
                  You can pause anytime.
                </AlertBox>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
