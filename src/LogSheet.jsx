import { useEffect } from 'react';
import { SYMPTOMS, MOODS } from './store.js';
import { IconDrop } from './Icons.jsx';

const FLOW_KEYS = ['none', 'light', 'medium', 'heavy'];

export default function LogSheet({ t, lang, date, today, log = {}, onChange, onClose }) {
  const future = date > today;
  const rawTitle = new Intl.DateTimeFormat(lang, { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(`${date}T12:00:00`));
  const title = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1);
  const flow = log.flow || 'none';
  const symptoms = log.symptoms || [];

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const toggleSymptom = (s) => onChange({ symptoms: symptoms.includes(s) ? symptoms.filter((x) => x !== s) : [...symptoms, s] });

  return (
    <div className="sheet-wrap" role="dialog" aria-modal="true" aria-label={title}>
      <div className="scrim" onClick={onClose} />
      <div className="sheet">
        <div className="grab" aria-hidden="true" />
        <h2>{title}</h2>

        <h3>{t.log.flow}</h3>
        <div className="flows">
          {FLOW_KEYS.map((k, i) => (
            <button key={k} className={`flow ${flow === k ? 'on' : ''}`} disabled={future && k !== 'none'} onClick={() => onChange({ flow: k })} aria-pressed={flow === k}>
              <span className="drops">{i === 0 ? '–' : Array.from({ length: i }, (_, n) => <IconDrop key={n} width={14} height={14} />)}</span>
              {t.flow[k]}
            </button>
          ))}
        </div>
        {future && <p className="fine">{t.log.futureFlow}</p>}

        <h3>{t.log.symptoms}</h3>
        <div className="tags">
          {SYMPTOMS.map((s) => <button key={s} className={`tag ${symptoms.includes(s) ? 'on' : ''}`} aria-pressed={symptoms.includes(s)} onClick={() => toggleSymptom(s)}>{t.sym[s]}</button>)}
        </div>

        <h3>{t.log.mood}</h3>
        <div className="tags">
          {MOODS.map((m) => <button key={m} className={`tag mood ${log.mood === m ? 'on' : ''}`} aria-pressed={log.mood === m} onClick={() => onChange({ mood: log.mood === m ? null : m })}>{t.mood[m]}</button>)}
        </div>

        <h3>{t.log.notes}</h3>
        <textarea rows={2} maxLength={500} value={log.note || ''} placeholder={t.log.placeholder} onChange={(e) => onChange({ note: e.target.value })} />

        <button className="btn primary wide" onClick={onClose}>{t.log.done}</button>
      </div>
    </div>
  );
}
