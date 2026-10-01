// Settings — the preventive-action panels referenced by the Dashboard
// (SDD 8.2): Mute Keywords, Enable Feed Filter, Schedule Nightly Pause.
import { useEffect, useState } from 'react';
import Icon from '../../components/icons';
import { Card, FormField, Loading, Toggle } from '../../components/common/ui';
import { useAppData } from '../../context/AppDataContext';
import { useToast } from '../../context/ToastContext';

export default function SettingsPage() {
  const { settings, saveSettings } = useAppData();
  const toast = useToast();
  const [kw, setKw] = useState('');

  useEffect(() => {
    if (location.hash) document.querySelector(location.hash)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  if (!settings) return <Loading label="Loading settings…" />;

  const addKeyword = (e) => {
    e.preventDefault();
    const word = kw.trim().toLowerCase();
    if (!word) return;
    if (settings.muteKeywords.includes(word)) { toast.info(`"${word}" is already muted.`); return; }
    saveSettings({ muteKeywords: [...settings.muteKeywords, word] });
    setKw('');
    toast.success(`"${word}" added to muted keywords.`);
  };

  const removeKeyword = (word) => {
    saveSettings({ muteKeywords: settings.muteKeywords.filter((k) => k !== word) });
  };

  const savePause = (patch) => {
    saveSettings({ nightlyPause: { ...settings.nightlyPause, ...patch } });
    toast.success('Nightly pause updated.');
  };

  return (
    <div className="dash-grid">
      <div className="col-7 flex" style={{ flexDirection: 'column', gap: '1.25rem' }}>
        <Card id="mute" title="Mute Keywords" action={<Icon name="mute" size={18} className="muted" />}>
          <p className="muted small">Hide feed content containing these words — helpful when certain topics spike your sentiment alerts.</p>
          <form onSubmit={addKeyword} className="flex gap-1 mb-2">
            <input className="input" placeholder="Add a keyword…" value={kw} onChange={(e) => setKw(e.target.value)} />
            <button className="btn btn-primary" type="submit"><Icon name="plus" size={15} /></button>
          </form>
          <div className="flex gap-1 wrap">
            {settings.muteKeywords.map((k) => (
              <span key={k} className="chip">{k}
                <button onClick={() => removeKeyword(k)} aria-label={`Remove ${k}`}><Icon name="x" size={12} /></button>
              </span>
            ))}
            {!settings.muteKeywords.length && <span className="small muted">No muted keywords yet.</span>}
          </div>
        </Card>

        <Card id="filter" title="Enable Feed Filter" action={<Icon name="filter" size={18} className="muted" />}>
          <div className="setting-row">
            <div className="setting-info">
              <b className="small">Filter negative-dense content</b>
              <div className="small muted">Deprioritize posts with heavy negative-emotion vocabulary in your monitored feed.</div>
            </div>
            <Toggle checked={settings.feedFilter} onChange={(v) => { saveSettings({ feedFilter: v }); toast.success(v ? 'Feed filter enabled.' : 'Feed filter disabled.'); }} />
          </div>
        </Card>
      </div>

      <Card className="col-5" id="pause" title="Schedule Nightly Pause">
        <p className="muted small">Pause sentiment monitoring and alerts overnight so late-night scrolling doesn't skew your patterns.</p>
        <div className="setting-row">
          <div className="setting-info">
            <b className="small">Nightly pause</b>
            <div className="small muted">Monitoring quiets between these hours.</div>
          </div>
          <Toggle checked={settings.nightlyPause.enabled} onChange={(v) => savePause({ enabled: v })} />
        </div>
        <div className="grid-2">
          <FormField label="From">
            <input type="time" value={settings.nightlyPause.start}
              onChange={(e) => savePause({ start: e.target.value })} disabled={!settings.nightlyPause.enabled} />
          </FormField>
          <FormField label="Until">
            <input type="time" value={settings.nightlyPause.end}
              onChange={(e) => savePause({ end: e.target.value })} disabled={!settings.nightlyPause.enabled} />
          </FormField>
        </div>
        {settings.nightlyPause.enabled && (
          <div className="alert alert-info mt-1">
            <Icon name="moon" size={16} />
            <span className="small">Monitoring will pause nightly {settings.nightlyPause.start} → {settings.nightlyPause.end}.</span>
          </div>
        )}
      </Card>
    </div>
  );
}
