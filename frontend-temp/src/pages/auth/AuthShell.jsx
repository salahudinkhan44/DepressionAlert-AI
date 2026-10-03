// Shared two-panel auth layout — brand story on the left, form on right.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/icons';
import { Brand } from '../../components/layout/PublicLayout';

export default function AuthShell({ title, sub, children, footer }) {
  return (
    <div className="auth-wrap">
      <aside className="auth-aside">
        <Brand />
        <div>
          <p className="quote">
            "Technology serving as an early warning system — so no one has to struggle
            in silence because help came too late."
          </p>
          <p className="small" style={{ opacity: .7 }}>
            Consent-based · Private by design · Built to complement professional care
          </p>
        </div>
        <div className="flex gap-2 wrap">
          {['Consent first', 'Your data, your control', 'Advisory insights'].map((t) => (
            <span key={t} className="chip" style={{ background: 'rgba(255,255,255,.1)', border: 0, color: '#cbd5e1' }}>{t}</span>
          ))}
        </div>
      </aside>
      <main className="auth-main">
        <div className="auth-card">
          <div className="auth-logo"><Brand /></div>
          <h1>{title}</h1>
          <p className="muted mb-3">{sub}</p>
          {children}
          {footer && <p className="small muted center mt-3">{footer}</p>}
          <p className="small muted center mt-3">
            <Link to="/">← Back to home</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export function PasswordInput({ value, onChange, error, label = 'Password', name = 'password', placeholder = '••••••••' }) {
  const [show, setShow] = useState(false);
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input id={name} name={name} type={show ? 'text' : 'password'} value={value}
          onChange={onChange} placeholder={placeholder} className={error ? 'invalid' : ''}
          style={{ paddingRight: '2.6rem' }} autoComplete="current-password" />
        <button type="button" className="icon-btn" aria-label="Toggle password visibility"
          style={{ position: 'absolute', right: 4, top: 4, width: 30, height: 30, border: 0 }}
          onClick={() => setShow(!show)}>
          <Icon name={show ? 'eyeOff' : 'eye'} size={15} />
        </button>
      </div>
      {error && <div className="error"><Icon name="warning" size={13} /> {error}</div>}
    </div>
  );
}
