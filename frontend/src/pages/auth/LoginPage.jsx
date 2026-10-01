// Login Interface (SRS UC-2, FR-2). Validates credentials, creates an
// authenticated session, redirects to the Dashboard.
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthShell, { PasswordInput } from './AuthShell';
import { AlertBox, FormField } from '../../components/common/ui';
import Icon from '../../components/icons';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address.';
    if (!form.password) errs.password = 'Enter your password.';
    setErrors(errs);
    return !Object.keys(errs).length;
  };

  const submit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setBusy(true);
    try {
      const user = await login(form.email, form.password);
      const dest = location.state?.from || (user.role === 'Authorized Viewer' ? '/viewer' : '/dashboard');
      navigate(dest, { replace: true });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      sub="Log in to review your sentiment trends and continue monitoring."
      footer={<>New to DepressionAlert AI? <Link to="/register">Create an account</Link></>}
    >
      {serverError && <div className="mb-2"><AlertBox type="danger">{serverError}</AlertBox></div>}
      <form onSubmit={submit} noValidate>
        <FormField label="Email address" error={errors.email}>
          <input type="email" value={form.email} onChange={set('email')}
            placeholder="you@example.com" className={errors.email ? 'invalid' : ''}
            autoComplete="email" />
        </FormField>
        <PasswordInput value={form.password} onChange={set('password')} error={errors.password} />
        <div className="flex between items-center mb-2">
          <span />
          <Link to="/forgot-password" className="small">Forgot password?</Link>
        </div>
        <button className="btn btn-primary btn-block btn-lg" disabled={busy}>
          {busy ? <span className="spinner" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,.3)' }} /> : <Icon name="logout" size={16} style={{ transform: 'scaleX(-1)' }} />}
          {busy ? 'Signing in…' : 'Log in'}
        </button>
      </form>
      <div className="alert alert-info mt-3">
        <Icon name="info" size={16} />
        <div className="small">
          <b>Demo accounts</b> — user: <span className="mono">demo@depalert.ai / demo1234</span> ·
          viewer: <span className="mono">viewer@depalert.ai / viewer1234</span>
        </div>
      </div>
    </AuthShell>
  );
}
