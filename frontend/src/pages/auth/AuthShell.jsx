// Shared auth layout — a single centred card (login, register, reset).
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/icons';
import { Brand } from '../../components/layout/PublicLayout';

export default function AuthShell({ title, sub, children, footer }) {
  return (
    <div className="auth-wrap .auth-wrap { min-height: 100vh; display: flex; }
.auth-main { flex: 1; display: flex; align-items: center; justify-content: center; padding: 2.5rem 1.5rem; }">
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