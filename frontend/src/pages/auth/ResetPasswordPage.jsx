// Reset Password — set a new password after following the emailed link.
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell, { PasswordInput } from './AuthShell';
import { AlertBox, FormField } from '../../components/common/ui';
import * as api from '../../services/api';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ token: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setServerError('');
    const errs = {};
    if (!form.token.trim()) errs.token = 'Enter the reset code from your email.';
    if (form.password.length < 8) errs.password = 'Use at least 8 characters.';
    if (form.confirm !== form.password) errs.confirm = 'Passwords do not match.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      await api.resetPassword(form.token.trim(), form.password);
      setDone(true);
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Choose a new password" sub="Make it strong — at least 8 characters.">
      {done ? (
        <AlertBox type="success">Password updated. Redirecting you to login…</AlertBox>
      ) : (
        <form onSubmit={submit} noValidate>
          {serverError && <div className="mb-2"><AlertBox type="danger">{serverError}</AlertBox></div>}
          <FormField label="Reset code" error={errors.token}>
            <input value={form.token} onChange={set('token')}
              placeholder="Paste the code from your email" className={errors.token ? 'invalid' : ''} />
          </FormField>
          <PasswordInput label="New password" value={form.password} onChange={set('password')} error={errors.password} />
          <FormField label="Confirm new password" error={errors.confirm}>
            <input type="password" value={form.confirm} onChange={set('confirm')}
              placeholder="Repeat new password" className={errors.confirm ? 'invalid' : ''} />
          </FormField>
          <button className="btn btn-primary btn-block btn-lg" disabled={busy}>
            {busy ? 'Updating…' : 'Update password'}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
