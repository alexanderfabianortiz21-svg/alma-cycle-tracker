import { useRef, useState } from 'react';
import { IconLock, IconDownload, IconUpload, IconTrash, IconSparkle, IconMinus, IconPlus } from './Icons.jsx';

function Stepper({ label, value, min, max, unit, onChange }) {
  return (
    <div className="stepper">
      <span>{label}</span>
      <div>
        <button className="icon-btn" onClick={() => onChange(Math.max(min, value - 1))} aria-label={`- ${label}`}><IconMinus width={18} height={18} /></button>
        <strong>{value} <small>{unit}</small></strong>
        <button className="icon-btn" onClick={() => onChange(Math.min(max, value + 1))} aria-label={`+ ${label}`}><IconPlus width={18} height={18} /></button>
      </div>
    </div>
  );
}

export default function You({ t, lang, setLang, settings, onSettings, onExport, onImport, onSample, onReset }) {
  const fileRef = useRef(null);
  const [msg, setMsg] = useState('');
  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 2600); };

  const download = () => {
    const blob = new Blob([onExport()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alma-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || file.size > 2_000_000) return;
    flash(onImport(await file.text()) ? t.you.importOk : t.you.importErr);
  };

  return (
    <div className="you">
      <h1 className="reveal">{t.you.title}</h1>

      <section className="privacy reveal" style={{ '--d': '80ms' }}>
        <span className="lock-orb"><IconLock width={26} height={26} /></span>
        <h2>{t.you.privacyTitle}</h2>
        <p>{t.you.privacyText}</p>
      </section>

      <section className="card reveal" style={{ '--d': '160ms' }}>
        <h2>{t.you.cycleSettings}</h2>
        <Stepper label={t.you.cycleLength} value={settings.cycleLength} min={20} max={45} unit={t.you.days} onChange={(v) => onSettings({ cycleLength: v })} />
        <Stepper label={t.you.periodLength} value={settings.periodLength} min={2} max={10} unit={t.you.days} onChange={(v) => onSettings({ periodLength: v })} />
        <p className="muted small">{t.you.cycleHint}</p>
        <div className="lang-row">
          <span>{t.you.language}</span>
          <div className="seg2" role="group" aria-label={t.you.language}>
            {['en', 'es'].map((l) => <button key={l} className={lang === l ? 'on' : ''} aria-pressed={lang === l} onClick={() => setLang(l)}>{l === 'en' ? 'English' : 'Español'}</button>)}
          </div>
        </div>
      </section>

      <section className="card reveal" style={{ '--d': '240ms' }}>
        <h2>{t.you.data}</h2>
        <div className="actions">
          <button className="row-btn" onClick={download}><IconDownload width={20} height={20} /> {t.you.export}</button>
          <button className="row-btn" onClick={() => fileRef.current?.click()}><IconUpload width={20} height={20} /> {t.you.import}</button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={pick} />
          <button className="row-btn" onClick={() => window.confirm(t.you.sampleConfirm) && onSample()}><IconSparkle width={20} height={20} /> {t.you.sample}</button>
          <button className="row-btn danger" onClick={() => window.confirm(t.you.deleteConfirm) && onReset()}><IconTrash width={20} height={20} /> {t.you.delete}</button>
        </div>
        {msg && <p className="flash" role="status">{msg}</p>}
      </section>

      <p className="fine reveal" style={{ '--d': '320ms' }}>{t.disclaimer}</p>
    </div>
  );
}
