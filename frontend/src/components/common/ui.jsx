// Shared UI primitives — consistent design-system building blocks.
import Icon from '../icons';
import { riskClass } from '../../utils/format';

export function Card({ title, action, children, className = '', pad, ...rest }) {
  return (
    <section className={`card ${className}`} {...rest}>
      {(title || action) && (
        <div className="card-title">
          <h3>{title}</h3>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function PageHeader({ title, sub, children }) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        {sub && <p className="sub mb-0">{sub}</p>}
      </div>
      {children && <div className="flex gap-1 items-center wrap">{children}</div>}
    </div>
  );
}

export function Badge({ level, children }) {
  return <span className={`badge badge-dot ${riskClass(level)}`}>{children || level}</span>;
}

export function Tag({ tone = 'neutral', children }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function StatCard({ label, value, sub, icon, tone }) {
  return (
    <div className="card card-pad-sm card-hover">
      <div className="flex items-center gap-2">
        {icon && (
          <span className="feed-icon" style={{ background: `${tone}18`, color: tone }}><Icon name={icon} size={18} /></span>
        )}
        <div className="stat">
          <span className="stat-label">{label}</span>
          <span className="stat-value">{value}</span>
          {sub && <span className="stat-sub">{sub}</span>}
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ icon = 'info', title, text, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon"><Icon name={icon} size={30} /></div>
      <h3>{title}</h3>
      <p className="muted" style={{ maxWidth: 380, margin: '0 auto 1rem' }}>{text}</p>
      {action}
    </div>
  );
}

export function Loading({ label = 'Loading…' }) {
  return (
    <div className="loading-center" role="status">
      <div className="flex items-center gap-2 muted"><span className="spinner" /> {label}</div>
    </div>
  );
}

export function AlertBox({ type = 'info', icon, children }) {
  const icons = { info: 'info', success: 'check', warning: 'warning', danger: 'warning' };
  return (
    <div className={`alert alert-${type}`}>
      <Icon name={icon || icons[type]} size={17} />
      <div>{children}</div>
    </div>
  );
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map((t) => (
        <button key={t.id} role="tab" aria-selected={active === t.id}
          className={active === t.id ? 'active' : ''} onClick={() => onChange(t.id)}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-1" style={{ cursor: 'pointer' }}>
      <span className="toggle">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="track" />
      </span>
      {label && <span className="small" style={{ fontWeight: 600 }}>{label}</span>}
    </label>
  );
}

export function FormField({ label, hint, error, children }) {
  return (
    <div className="field">
      {label && <label>{label}</label>}
      {children}
      {hint && !error && <div className="hint">{hint}</div>}
      {error && <div className="error"><Icon name="warning" size={13} /> {error}</div>}
    </div>
  );
}

export function Meter({ label, value, color = 'var(--teal-600)', suffix = '%' }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="meter">
      <div className="meter-head"><b>{label}</b><span className="muted mono">{value}{suffix}</span></div>
      <div className="bar"><span style={{ width: `${pct * 2.5 > 100 ? 100 : pct * 2.5}%`, background: color }} /></div>
    </div>
  );
}

export function ScorePill({ score }) {
  return <span className="score-pill mono">{score}<small>/100</small></span>;
}
