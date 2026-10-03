// Privacy & Profile (SRS §6.1, SEC-2/3/5): account details, password
// change, data-processing consent grant/revoke, and data rights info.
import { useState } from 'react';
import Icon from '../../components/icons';
import { Card, PageHeader, FormField, AlertBox, Toggle, Tag } from '../../components/common/ui';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { updateProfile, updateConsent, changePassword } from '../../services/api';
import { initials, formatDate } from '../../utils/format';

export default function PrivacyProfilePage() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [busyProfile, setBusyProfile] = useState(false);
  const [busyPw, setBusyPw] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    const errs = {};
    if (profile.name.trim().length < 2) errs.name = 'Enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) errs.email = 'Enter a valid email.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusyProfile(true);
    const updated = await updateProfile(profile);
    await refreshUser(updated);
    setBusyProfile(false);
    toast.success('Profile updated.');
  };

  const changePw = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!pw.current) errs.current = 'Enter your current password.';
    if (pw.next.length < 8) errs.next = 'Use at least 8 characters.';
    if (pw.next !== pw.confirm) errs.confirm = 'Passwords do not match.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusyPw(true);
    try {
      await changePassword(pw.current, pw.next);
      setPw({ current: '', next: '', confirm: '' });
      toast.success('Password changed.');
    } catch (err) {
      setErrors({ current: err.message });
    } finally {
      setBusyPw(false);
    }
  };

  const toggleConsent = async (grant) => {
    if (!grant) { setConfirmRevoke(true); return; }
    const updated = await updateConsent(true);
    await refreshUser(updated);
    toast.success('Consent granted — you can submit text for analysis.');
  };

  const revoke = async () => {
    const updated = await updateConsent(false);
    await refreshUser(updated);
    setConfirmRevoke(false);
    toast.info('Consent revoked. No further text will be processed.');
  };

  return (
    <div>
      <div className="dash-grid">
        {/* profile */}
        <Card className="col-5" title="Profile">
          <div className="flex items-center gap-2 mb-3">
            <span className="avatar avatar-lg">{initials(user?.name)}</span>
            <div>
              <b>{user?.name}</b>
              <div className="small muted">{user?.email}</div>
              <Tag tone="teal">{user?.role}</Tag>
            </div>
          </div>
          <form onSubmit={saveProfile} noValidate>
            <FormField label="Full name" error={errors.name}>
              <input value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} className={errors.name ? 'invalid' : ''} />
            </FormField>
            <FormField label="Email address" error={errors.email}>
              <input type="email" value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} className={errors.email ? 'invalid' : ''} />
            </FormField>
            <div className="setting-row" style={{ paddingTop: 0 }}>
              <span className="small muted">Member since</span>
              <b className="small">{formatDate(user?.createdAt)}</b>
            </div>
            <button className="btn btn-primary" disabled={busyProfile}>{busyProfile ? 'Saving…' : 'Save changes'}</button>
          </form>
        </Card>

        <div className="col-7 flex" style={{ flexDirection: 'column', gap: '1.25rem' }}>
          {/* consent */}
          <Card title="Data-processing consent"
            action={<Tag tone={user?.consentGiven ? 'low' : 'neutral'}>{user?.consentGiven ? 'Granted' : 'Revoked'}</Tag>}>
            <p className="muted small">
              DepressionAlert AI analyzes only text you submit, and only while consent is granted
              (SEC-2). Nothing is collected automatically — no feeds, no scraping, no background
              monitoring.
            </p>
            <div className="setting-row">
              <div className="setting-info">
                <b className="small">Allow text analysis</b>
                <div className="small muted">Submit posts and CSV files for depression-risk evaluation.</div>
              </div>
              <Toggle checked={!!user?.consentGiven} onChange={toggleConsent} />
            </div>
            {!user?.consentGiven && (
              <AlertBox type="warning">Submissions are disabled while consent is revoked.</AlertBox>
            )}
          </Card>

          {/* password */}
          <Card title="Change password">
            <form onSubmit={changePw} noValidate>
              <div className="grid-3" style={{ gap: '1rem' }}>
                <FormField label="Current" error={errors.current}>
                  <input type="password" value={pw.current} onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))} className={errors.current ? 'invalid' : ''} />
                </FormField>
                <FormField label="New" error={errors.next}>
                  <input type="password" value={pw.next} onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))} className={errors.next ? 'invalid' : ''} />
                </FormField>
                <FormField label="Confirm" error={errors.confirm}>
                  <input type="password" value={pw.confirm} onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))} className={errors.confirm ? 'invalid' : ''} />
                </FormField>
              </div>
              <button className="btn btn-ghost" disabled={busyPw}>{busyPw ? 'Updating…' : 'Update password'}</button>
              <p className="hint mt-1 mb-0" style={{ fontSize: '.78rem' }}>
                Passwords are stored as salted one-way hashes — never plaintext (SEC-3).
              </p>
            </form>
          </Card>

          {/* your data */}
          <Card title="Your data">
            <div className="setting-row"><div className="setting-info"><b className="small">Data isolation</b><div className="small muted">Only you (and viewers you authorize) can see your submissions, results and alerts (SEC-5).</div></div><Icon name="lock" size={18} className="muted" /></div>
            <div className="setting-row"><div className="setting-info"><b className="small">Encrypted in transit</b><div className="small muted">All communication uses HTTPS/TLS 1.2+ (SEC-1).</div></div><Icon name="shield" size={18} className="muted" /></div>
            <div className="setting-row"><div className="setting-info"><b className="small">CSV retention</b><div className="small muted">Uploaded files are discarded after their rows are stored (SDD §5).</div></div><Icon name="trash" size={18} className="muted" /></div>
          </Card>
        </div>
      </div>

      <Modal open={confirmRevoke} onClose={() => setConfirmRevoke(false)} title="Revoke consent?">
        <p className="muted small">
          Revoking stops all further processing of submitted text immediately. Your existing
          analysis history is kept until you delete it. You can re-grant consent anytime.
        </p>
        <div className="flex gap-1 mt-2">
          <button className="btn btn-danger-soft" onClick={revoke}>Yes, revoke consent</button>
          <button className="btn btn-ghost" onClick={() => setConfirmRevoke(false)}>Keep consent</button>
        </div>
      </Modal>
    </div>
  );
}
