import Ring from './Ring.jsx';
import { useCount } from './hooks.js';
import { IconLock, IconBolt, IconHeart, IconLeaf, IconDrop } from './Icons.jsx';

const TIP_ICONS = [IconBolt, IconHeart, IconLeaf];
const TIP_KEYS = ['energy', 'mood', 'care'];

export default function Today({ t, lang, st, logs, today, onLog, onPeriodStart }) {
  const day = useCount(st ? st.cycleDay : 0, 1300);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? t.morning : hour < 19 ? t.afternoon : t.evening;
  const rawDate = new Intl.DateTimeFormat(lang, { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  const dateText = rawDate.charAt(0).toUpperCase() + rawDate.slice(1);
  const flowToday = logs[today]?.flow;
  const c = st.cycle;

  const chips = [];
  if (st.late) chips.push({ k: 'late', text: t.periodLate(st.late), cls: 'warn' });
  else chips.push({ k: 'next', text: t.periodIn(st.daysUntil), cls: 'main' });
  if (st.inFertile) chips.push({ k: 'fert', text: t.fertileNow, cls: 'fert' });
  else if (st.phase !== 'menstrual' && st.daysToOvulation > 0 && st.daysToOvulation <= 14) chips.push({ k: 'ov', text: t.ovulationIn(st.daysToOvulation), cls: 'fert' });

  return (
    <div className="today">
      <header className="top reveal" style={{ '--d': '0ms' }}>
        <div className="top-row">
          <p className="date">{dateText}</p>
          <span className="badge-lock"><IconLock width={14} height={14} /> {t.private}</span>
        </div>
        <h1>{greeting}</h1>
      </header>

      <div className="ring-wrap reveal" style={{ '--d': '120ms' }}>
        <Ring length={c.length} periodLen={c.periodLen} ovDay={c.ovDay} day={st.cycleDay} phase={st.phase} label={`${t.cycleDay} ${st.cycleDay}, ${t.phases[st.phase]}`}>
          <span className="rc-label">{t.cycleDay}</span>
          <strong className="rc-num">{Math.round(day)}</strong>
          <span className="rc-phase">{t.phases[st.phase]}</span>
        </Ring>
      </div>

      <div className="chips reveal" style={{ '--d': '260ms' }}>
        {chips.map((chip) => <span key={chip.k} className={`chip ${chip.cls}`}>{chip.text}</span>)}
      </div>

      <div className="cta reveal" style={{ '--d': '340ms' }}>
        <button className="btn primary" onClick={() => onLog(today)}>{t.logToday}</button>
        {!flowToday && <button className="btn ghost" onClick={onPeriodStart}><IconDrop width={18} height={18} /> {t.periodStarted}</button>}
      </div>

      <section className="phase-card reveal" style={{ '--d': '420ms' }}>
        <h2>{t.headline[st.phase]}</h2>
        <ul>
          {t.tips[st.phase].map((text, i) => {
            const Icon = TIP_ICONS[i];
            return (
              <li key={i}>
                <span className="tip-icon"><Icon width={18} height={18} /></span>
                <div><b>{t.tipTitles[TIP_KEYS[i]]}</b><p>{text}</p></div>
              </li>
            );
          })}
        </ul>
      </section>

      <p className="fine reveal" style={{ '--d': '500ms' }}>{t.disclaimer}</p>
    </div>
  );
}
