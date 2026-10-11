import { useMemo, useState } from 'react';
import { classify, iso, addDays } from './cycle.js';
import { IconChevronL, IconChevronR } from './Icons.jsx';

export default function Calendar({ t, lang, tl, logs, today, onPick }) {
  const now = new Date();
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [dir, setDir] = useState(1);
  const weekStart = lang === 'es' ? 1 : 0;

  const rawMonth = new Intl.DateTimeFormat(lang, { month: 'long', year: 'numeric' }).format(new Date(ym.y, ym.m, 1));
  const monthName = rawMonth.charAt(0).toUpperCase() + rawMonth.slice(1);
  const weekdays = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2024, 0, 7 + ((weekStart + i) % 7)); // Jan 7 2024 is a Sunday
    return new Intl.DateTimeFormat(lang, { weekday: 'narrow' }).format(d);
  }), [lang, weekStart]);

  const cells = useMemo(() => {
    const first = new Date(ym.y, ym.m, 1);
    const lead = (first.getDay() - weekStart + 7) % 7;
    const count = new Date(ym.y, ym.m + 1, 0).getDate();
    const out = Array.from({ length: lead }, () => null);
    for (let d = 1; d <= count; d++) out.push(iso(new Date(ym.y, ym.m, d, 12)));
    return out;
  }, [ym, weekStart]);

  const fmt = (d) => new Intl.DateTimeFormat(lang, { month: 'short', day: 'numeric' }).format(new Date(`${d}T12:00:00`));
  const upcoming = tl.cycles.find((c) => c.length >= 15 && c.fertileEnd >= today);
  const summary = [
    { k: 'period', label: t.summary.nextPeriod, text: `${fmt(tl.expected)} – ${fmt(addDays(tl.expected, tl.avgPeriod - 1))}` },
    upcoming && { k: 'fertile', label: t.summary.fertile, text: `${fmt(upcoming.fertileStart)} – ${fmt(upcoming.fertileEnd)}` },
    upcoming && { k: 'ov', label: t.summary.ovulation, text: fmt(upcoming.ovulation) },
  ].filter(Boolean);

  const go = (delta) => {
    setDir(delta);
    setYm(({ y, m }) => { const n = new Date(y, m + delta, 1); return { y: n.getFullYear(), m: n.getMonth() }; });
  };

  return (
    <div className="calendar">
      <header className="cal-head reveal" style={{ '--d': '0ms' }}>
        <button className="icon-btn" onClick={() => go(-1)} aria-label={t.prevMonth}><IconChevronL /></button>
        <h1 key={`${ym.y}-${ym.m}`} className="month" style={{ '--dir': dir }}>{monthName}</h1>
        <button className="icon-btn" onClick={() => go(1)} aria-label={t.nextMonth}><IconChevronR /></button>
      </header>

      <div className="week reveal" style={{ '--d': '80ms' }}>{weekdays.map((w, i) => <span key={i}>{w}</span>)}</div>

      <div className="grid" key={`${ym.y}-${ym.m}`} style={{ '--dir': dir }}>
        {cells.map((date, i) => {
          if (!date) return <span key={`b${i}`} />;
          const info = classify(tl, date, logs);
          const log = logs[date];
          const detail = Boolean(log && (log.symptoms?.length || log.mood || log.note));
          const cls = ['day', info.logged && 'period', !info.logged && info.predictedPeriod && 'pred', info.fertile && 'fertile', info.ovulation && 'ov', date === today && 'today', date > today && 'future'].filter(Boolean).join(' ');
          return (
            <button key={date} className={cls} onClick={() => onPick(date)} style={{ '--i': i % 7 }}>
              <span className="num">{Number(date.slice(8))}</span>
              {detail && <i className="mark" />}
            </button>
          );
        })}
      </div>

      <ul className="legend reveal" style={{ '--d': '200ms' }}>
        <li><i className="lg period" />{t.legend.period}</li>
        <li><i className="lg pred" />{t.legend.predicted}</li>
        <li><i className="lg fertile" />{t.legend.fertile}</li>
        <li><i className="lg ov" />{t.legend.ovulation}</li>
      </ul>
      <p className="fine center">{t.tapDay}</p>

      <section className="card summary reveal" style={{ '--d': '280ms' }}>
        <h2>{t.summary.title}</h2>
        <ul>
          {summary.map((r) => (
            <li key={r.k}><i className={`lg ${r.k === 'period' ? 'period' : r.k === 'fertile' ? 'fertile' : 'ov'}`} /><span>{r.label}</span><b>{r.text}</b></li>
          ))}
        </ul>
      </section>
    </div>
  );
}
