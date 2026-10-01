// Contact — frontend-only form (delivery wiring is a backend concern).
import { useState } from 'react';
import Icon from '../../components/icons';
import { Card, FormField, AlertBox } from '../../components/common/ui';
import { useToast } from '../../context/ToastContext';

export default function ContactPage() {
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', topic: 'General question', message: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    if (form.name.trim().length < 2) errs.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email.';
    if (form.message.trim().length < 10) errs.message = 'Tell us a bit more (10+ characters).';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setSent(true);
      toast.success('Message sent — we will get back to you soon.');
    }, 700);
  };

  return (
    <section className="section" style={{ maxWidth: 900 }}>
      <div className="section-head">
        <span className="eyebrow">Contact</span>
        <h1>Talk to the team</h1>
        <p className="muted">Questions about the project, the research, or the evaluation? Send a message.</p>
      </div>
      <div className="grid-2" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
        <Card>
          {sent ? (
            <AlertBox type="success">
              Thanks, {form.name.split(' ')[0]} — your message has been received. We typically
              respond within a couple of days.
            </AlertBox>
          ) : (
            <form onSubmit={submit} noValidate>
              <div className="grid-2">
                <FormField label="Name" error={errors.name}>
                  <input value={form.name} onChange={set('name')} className={errors.name ? 'invalid' : ''} />
                </FormField>
                <FormField label="Email" error={errors.email}>
                  <input type="email" value={form.email} onChange={set('email')} className={errors.email ? 'invalid' : ''} />
                </FormField>
              </div>
              <FormField label="Topic">
                <select value={form.topic} onChange={set('topic')}>
                  <option>General question</option>
                  <option>Project / research inquiry</option>
                  <option>Privacy &amp; data request</option>
                  <option>Feedback</option>
                </select>
              </FormField>
              <FormField label="Message" error={errors.message}>
                <textarea className="textarea" value={form.message} onChange={set('message')}
                  placeholder="How can we help?" />
              </FormField>
              <button className="btn btn-primary" disabled={busy}>{busy ? 'Sending…' : 'Send message'}</button>
            </form>
          )}
        </Card>
        <div className="flex gap-2" style={{ flexDirection: 'column' }}>
          <Card className="card-pad-sm">
            <div className="flex gap-2 items-center">
              <span className="feed-icon" style={{ background: 'var(--teal-50)', color: 'var(--teal-700)' }}><Icon name="mail" size={18} /></span>
              <div><b className="small">Project inbox</b><div className="small muted">Via FYP supervisor, CS Department</div></div>
            </div>
          </Card>
          <Card className="card-pad-sm">
            <div className="flex gap-2 items-center">
              <span className="feed-icon" style={{ background: 'var(--indigo-100)', color: 'var(--indigo-600)' }}><Icon name="globe" size={18} /></span>
              <div><b className="small">COMSATS University Islamabad</b><div className="small muted">Abbottabad Campus</div></div>
            </div>
          </Card>
          <AlertBox type="warning" icon="heart">
            <b>In distress?</b> This inbox is not monitored for crises. Please use the helplines
            listed on the support page instead.
          </AlertBox>
        </div>
      </div>
    </section>
  );
}
