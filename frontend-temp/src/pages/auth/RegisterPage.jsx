// Registration Interface (SRS UC-1, FR-1). Name, email, password +
// explicit data-processing consent (FR-3, SEC-2).
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell, { PasswordInput } from './AuthShell';
import { AlertBox, FormField } from '../../components/common/ui';
import Icon from '../../components/icons';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', consent: false });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const validate = () => {
    const errs = {};
    if (form.name.trim().length < 2) errs.name = 'Please enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address.';
    if (form.password.length < 8) errs.password = 'Use at least 8 characters.';
    if (form.confirm !== form.password) errs.confirm = 'Passwords do not match.';
    if (!form.consent) errs.consent = 'Consent is required before any text can be analyzed.';
    setErrors(errs);
    return !Object.keys(errs).length;
  };

  const submit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setBusy(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password, consent: form.consent });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      sub="Start monitoring your wellbeing privately — nothing is analyzed without your consent."
      footer={<>Already registered? <Link to="/login">Log in</Link></>}
    >
      {serverError && <div className="mb-2"><AlertBox type="danger">{serverError}</AlertBox></div>}
      <form onSubmit={submit} noValidate>
        <FormField label="Full name" error={errors.name}>
          <input value={form.name} onChange={set('name')} placeholder="Your name"
            className={errors.name ? 'invalid' : ''} autoComplete="name" />
        </FormField>
        <FormField label="Email address" error={errors.email}>
          <input type="email" value={form.email} onChange={set('email')}
            placeholder="you@example.com" className={errors.email ? 'invalid' : ''} autoComplete="email" />
        </FormField>
        <PasswordInput value={form.password} onChange={set('password')} error={errors.password} />
        <FormField label="Confirm password" error={errors.confirm}>
          <input type="password" value={form.confirm} onChange={set('confirm')}
            placeholder="Repeat password" className={errors.confirm ? 'invalid' : ''} autoComplete="new-password" />
        </FormField>
        <div className="field">
          <label className="checkbox-row">
            <input type="checkbox" checked={form.consent} onChange={set('consent')} />
            <span>
              I consent to DepressionAlert AI processing text I submit for depression-risk
              analysis. I understand results are advisory only, not a diagnosis, and I can
              revoke consent anytime. (<Link to="/privacy-policy" target="_blank">Privacy policy</Link>)
            </span>
          </label>
          {errors.consent && <div className="error"><Icon name="warning" size={13} /> {errors.consent}</div>}
        </div>
        <button className="btn btn-primary btn-block btn-lg" disabled={busy}>
          {busy ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthShell>
  );
}
