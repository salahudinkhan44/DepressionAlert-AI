// Forgot Password — request a reset link (email delivery is a Phase-2
// backend concern; this shows the complete frontend flow).
import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthShell from './AuthShell';
import { AlertBox, FormField } from '../../components/common/ui';
import * as api from '../../services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address.');
      return;
    }
    setBusy(true);
    try {
      await api.requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Reset your password"
      sub="Enter your account email and we'll send you a reset link."
      footer={<>Remembered it? <Link to="/login">Back to login</Link></>}
    >
      {sent ? (
        <AlertBox type="success">
          If an account exists for <b>{email}</b>, a reset link is on its way.
          Check your inbox — the link expires soon.{' '}
          <Link to="/reset-password">I have a reset code</Link>
        </AlertBox>
      ) : (
        <form onSubmit={submit} noValidate>
          <FormField label="Email address" error={error}>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" className={error ? 'invalid' : ''} autoComplete="email" />
          </FormField>
          <button className="btn btn-primary btn-block btn-lg" disabled={busy}>
            {busy ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
