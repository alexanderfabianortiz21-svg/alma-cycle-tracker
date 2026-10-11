import { useMemo } from 'react';
import { patternStats } from './cycle.js';
import { useCount } from './hooks.js';
import Ring from './Ring.jsx';

function Stat({ label, value, unit }) {
  const n = useCount(value, 1000);
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{Math.round(n)}<small> {unit}</small></strong>
    </div>
  );
}

export default function Insights({ t, tl, logs }) {
  const stats = useMemo(() => patternStats(tl, logs), [tl, logs]);

  if (tl.periods.length < 2) {
    return (
      <div className="insights">
        <h1 className="reveal">{t.insights.title}</h1>
        <div className="empty reveal" style={{ '--d': '100ms' }}>
          <div className="mini-ring"><Ring length={28} periodLen={5} ovDay={14} day={1} phase="menstrual" label=""><span /></Ring></div>
          <h2>{t.insights.emptyTitle}</h2>
          <p>{t.insights.emptySub}</p>
        </div>
      </div>
    );
  }

  const gaps = tl.gaps.slice(-6);
  const max = Math.max(...gaps, tl.avgCycle) + 4;
  const H = 120;
  const irregular = gaps.some((g) => g < 21 || g > 35) || tl.range > 9;

  return (
    <div className="insights">
      <h1 className="reveal">{t.insights.title}</h1>

      <div className="stats reveal" style={{ '--d': '80ms' }}>
        <Stat label={t.insights.avgCycle} value={tl.avgCycle} unit={t.insights.days} />
        <Stat label={t.insights.avgPeriod} value={tl.avgPeriod} unit={t.insights.days} />
      </div>
      <p className="regularity reveal" style={{ '--d': '140ms' }}>{tl.range <= 7 ? t.insights.regular : t.insights.varies(tl.range)}</p>

      <section className="card reveal" style={{ '--d': '200ms' }}>
        <h2>{t.insights.chart}</h2>
        <svg className="bars" viewBox={`0 0 ${gaps.length * 52 + 8} ${H + 30}`} role="img" aria-label={t.insights.chart}>
          <line x1="0" x2="100%" y1={H - (tl.avgCycle / max) * H} y2={H - (tl.avgCycle / max) * H} className="avg-line" />
          {gaps.map((g, i) => {
            const h = (g / max) * H;
            return (
              <g key={i} transform={`translate(${i * 52 + 10} 0)`}>
                <rect x="0" y={H - h} width="34" height={h} rx="10" className="bar" style={{ animationDelay: `${i * 90}ms` }} />
                <text x="17" y={H + 20} textAnchor="middle">{g}</text>
              </g>
            );
          })}
        </svg>
      </section>

      {[['symptoms', stats.symptoms, t.sym], ['moods', stats.moods, t.mood]].map(([key, list, names], n) => (
        <section className="card reveal" style={{ '--d': `${280 + n * 80}ms` }} key={key}>
          <h2>{t.insights[key]}</h2>
          {list.length === 0 ? <p className="muted">{t.insights.noPatterns}</p> : (
            <ul className="pattern">
              {list.slice(0, 4).map((s, i) => (
                <li key={s.key}>
                  <div className="row"><b>{names[s.key]}</b><span>{t.insights.mostly(t.phases[s.topPhase].toLowerCase())}</span></div>
                  <div className="track"><i className={s.topPhase} style={{ width: `${(s.total / list[0].total) * 100}%`, animationDelay: `${i * 90}ms` }} /></div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      {irregular && <p className="note reveal" style={{ '--d': '460ms' }}>{t.insights.irregular}</p>}
      <p className="fine">{t.disclaimer}</p>
    </div>
  );
}
