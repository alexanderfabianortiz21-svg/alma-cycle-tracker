import { useEffect, useMemo, useState } from 'react';
import { buildTimeline, status, todayISO, PHASES } from './cycle.js';
import { useStore } from './store.js';
import { dict, detectLang } from './i18n.js';
import Today from './Today.jsx';
import Calendar from './Calendar.jsx';
import Insights from './Insights.jsx';
import You from './You.jsx';
import LogSheet from './LogSheet.jsx';
import Onboarding from './Onboarding.jsx';
import Petals from './Petals.jsx';
import { IconToday, IconCalendar, IconChart, IconUser } from './Icons.jsx';

const TABS = [['today', IconToday], ['calendar', IconCalendar], ['insights', IconChart], ['you', IconUser]];

export default function App() {
  const store = useStore();
  const { data } = store;
  const lang = data.settings.lang || detectLang();
  const t = dict[lang];
  const setLang = (l) => store.updateSettings({ lang: l });

  const [today, setToday] = useState(todayISO);
  const [tab, setTab] = useState('today');
  const [sheet, setSheet] = useState(null);
  const [burst, setBurst] = useState(0);

  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  useEffect(() => {
    const id = setInterval(() => setToday(todayISO()), 60_000);
    return () => clearInterval(id);
  }, []);

  const tl = useMemo(() => buildTimeline(data.logs, data.settings, today), [data.logs, data.settings, today]);
  const st = useMemo(() => status(tl, today), [tl, today]);
  const phase = st?.phase || 'menstrual';

  if (!data.onboarded || !tl || !st) {
    return (
      <div className="stage">
        <Onboarding t={t} lang={lang} setLang={setLang} onSample={store.loadSample} onDone={(v) => { store.finishOnboarding(v); setBurst((b) => b + 1); }} />
        <Petals burst={burst} />
      </div>
    );
  }

  const startPeriod = () => { store.setLog(today, { flow: 'medium' }); setBurst((b) => b + 1); };
  const onSheetChange = (patch) => {
    if (patch.flow && patch.flow !== 'none' && !data.logs[sheet]?.flow) setBurst((b) => b + 1);
    store.setLog(sheet, patch);
  };

  return (
    <div className="stage">
      <div className="app" data-phase={phase}>
        <div className="bgs">{PHASES.map((p) => <i key={p} data-p={p} className={p === phase ? 'on' : ''} />)}</div>

        <main className="view" key={tab}>
          {tab === 'today' && <Today t={t} lang={lang} st={st} logs={data.logs} today={today} onLog={setSheet} onPeriodStart={startPeriod} />}
          {tab === 'calendar' && <Calendar t={t} lang={lang} tl={tl} logs={data.logs} today={today} onPick={setSheet} />}
          {tab === 'insights' && <Insights t={t} tl={tl} logs={data.logs} />}
          {tab === 'you' && (
            <You t={t} lang={lang} setLang={setLang} settings={data.settings} onSettings={store.updateSettings}
              onExport={store.exportJson} onImport={store.importJson} onSample={store.loadSample} onReset={() => { store.reset(); setTab('today'); }} />
          )}
        </main>

        <nav className="nav" style={{ '--i': TABS.findIndex(([k]) => k === tab) }} aria-label="Main">
          <span className="pill" aria-hidden="true" />
          {TABS.map(([k, Icon]) => (
            <button key={k} className={tab === k ? 'on' : ''} aria-current={tab === k ? 'page' : undefined} onClick={() => setTab(k)}>
              <Icon /><span>{t.nav[k]}</span>
            </button>
          ))}
        </nav>

        {sheet && <LogSheet t={t} lang={lang} date={sheet} today={today} log={data.logs[sheet]} onChange={onSheetChange} onClose={() => setSheet(null)} />}
      </div>
      <Petals burst={burst} />
    </div>
  );
}
