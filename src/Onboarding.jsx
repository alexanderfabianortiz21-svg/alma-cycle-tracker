import { useEffect, useState } from 'react';
import Ring from './Ring.jsx';
import { addDays, todayISO } from './cycle.js';
import { IconLock, IconMinus, IconPlus } from './Icons.jsx';

const PHASES = ['menstrual', 'follicular', 'ovulation', 'luteal'];
const phaseOfDemo = (d) => (d <= 5 ? 'menstrual' : d < 13 ? 'follicular' : d <= 15 ? 'ovulation' : 'luteal');

export default function Onboarding({ t, lang, setLang, onDone, onSample }) {
  const today = todayISO();
  const [start, setStart] = useState(addDays(today, -10));
  const [cycle, setCycle] = useState(28);
  const [period, setPeriod] = useState(5);
  const [demoDay, setDemoDay] = useState(3);

  useEffect(() => {
    const id = setInterval(() => setDemoDay((d) => (d >= 28 ? 1 : d + 1)), 900);
    return () => clearInterval(id);
  }, []);

  const valid = start && start <= today;
  const phase = phaseOfDemo(demoDay);

  return (
    <div className="onboard" data-phase={phase}>
      <div className="bgs">{PHASES.map((p) => <i key={p} data-p={p} className={p === phase ? 'on' : ''} />)}</div>
      <div className="onboard-in">
        <div className="lang-mini" role="group" aria-label="Language">
          {['en', 'es'].map((l) => <button key={l} className={lang === l ? 'on' : ''} aria-pressed={lang === l} onClick={() => setLang(l)}>{l.toUpperCase()}</button>)}
        </div>

        <div className="ring-wrap small reveal" style={{ '--d': '0ms' }}>
          <Ring length={28} periodLen={5} ovDay={14} day={demoDay} phase={phase} label=""><strong className="rc-num">{demoDay}</strong></Ring>
        </div>

        <h1 className="reveal" style={{ '--d': '120ms' }}>{t.onboarding.title}</h1>
        <p className="lead reveal" style={{ '--d': '180ms' }}><IconLock width={16} height={16} /> {t.onboarding.sub}</p>

        <form className="form reveal" style={{ '--d': '260ms' }} onSubmit={(e) => { e.preventDefault(); if (valid) onDone({ start, cycleLength: cycle, periodLength: period }); }}>
          <label>
            <span>{t.onboarding.last}</span>
            <input type="date" value={start} max={today} onChange={(e) => setStart(e.target.value)} required />
          </label>
          {[[t.onboarding.cycle, cycle, setCycle, 20, 45], [t.onboarding.period, period, setPeriod, 2, 10]].map(([label, value, set, min, max]) => (
            <div className="stepper" key={label}>
              <span>{label}</span>
              <div>
                <button type="button" className="icon-btn" onClick={() => set(Math.max(min, value - 1))} aria-label="-"><IconMinus width={18} height={18} /></button>
                <strong>{value} <small>{t.you.days}</small></strong>
                <button type="button" className="icon-btn" onClick={() => set(Math.min(max, value + 1))} aria-label="+"><IconPlus width={18} height={18} /></button>
              </div>
            </div>
          ))}
          <button className="btn primary wide" type="submit" disabled={!valid}>{t.onboarding.start}</button>
          <button className="btn text wide" type="button" onClick={onSample}>{t.onboarding.sample}</button>
        </form>
        <p className="fine reveal" style={{ '--d': '340ms' }}>{t.disclaimer}</p>
      </div>
    </div>
  );
}
