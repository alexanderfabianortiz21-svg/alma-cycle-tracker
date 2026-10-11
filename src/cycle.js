// Pure cycle logic. No React, no storage. Everything is derived from the daily logs.
const pad = (n) => String(n).padStart(2, '0');
export const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d, 12); };
export const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return iso(d); };
export const diffDays = (a, b) => Math.round((parse(b) - parse(a)) / 86400000);
export const todayISO = () => iso(new Date());

export const FLOWS = ['light', 'medium', 'heavy'];
export const PHASES = ['menstrual', 'follicular', 'ovulation', 'luteal'];
const LUTEAL_DAYS = 14;
const hasFlow = (log) => Boolean(log && FLOWS.includes(log.flow));
const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));

/** Groups consecutive flow days into periods. A single skipped day (spotting gap) stays in the same period. */
export function derivePeriods(logs) {
  const days = Object.keys(logs).filter((d) => hasFlow(logs[d])).sort();
  const periods = [];
  for (const d of days) {
    const last = periods[periods.length - 1];
    if (last && diffDays(last.end, d) <= 2) last.end = d;
    else periods.push({ start: d, end: d });
  }
  return periods.map((p) => ({ ...p, length: diffDays(p.start, p.end) + 1 }));
}

function makeCycle(start, length, periodLen, predicted) {
  const ovDay = clamp(length - LUTEAL_DAYS, periodLen + 3, Math.max(periodLen + 3, length - 3));
  const ovulation = addDays(start, ovDay - 1);
  return {
    start, length, periodLen, predicted, ovDay, ovulation,
    fertileStart: addDays(ovulation, -5),
    fertileEnd: addDays(ovulation, 1),
  };
}

export function phaseOf(c, day) {
  if (day <= c.periodLen) return 'menstrual';
  if (day < c.ovDay - 1) return 'follicular';
  if (day <= c.ovDay + 1) return 'ovulation';
  return 'luteal';
}

/** Builds actual cycles from logged periods plus six predicted ones. Returns null with no data. */
export function buildTimeline(logs, settings, today = todayISO()) {
  const periods = derivePeriods(logs);
  if (!periods.length) return null;
  const starts = periods.map((p) => p.start);
  const gaps = [];
  for (let i = 1; i < starts.length; i++) gaps.push(diffDays(starts[i - 1], starts[i]));
  const valid = gaps.filter((g) => g >= 15 && g <= 60).slice(-6);
  const avgCycle = valid.length >= 2 ? Math.round(mean(valid)) : settings.cycleLength;
  const lens = periods.map((p) => p.length).filter((l) => l >= 1 && l <= 10).slice(-6);
  const avgPeriod = periods.length >= 2 ? clamp(Math.round(mean(lens)), 2, 10) : settings.periodLength;

  const lastStart = starts[starts.length - 1];
  const expected = addDays(lastStart, avgCycle);
  const late = expected < today ? diffDays(expected, today) : 0;
  const nextStart = late ? addDays(today, 1) : expected;

  const cycles = periods.map((p, i) => {
    const next = i < periods.length - 1 ? starts[i + 1] : nextStart;
    return makeCycle(p.start, diffDays(p.start, next), p.length, false);
  });
  let s = nextStart;
  for (let k = 0; k < 6; k++) { cycles.push(makeCycle(s, avgCycle, avgPeriod, true)); s = addDays(s, avgCycle); }

  return {
    periods, starts, gaps: valid, avgCycle, avgPeriod, cycles, expected, late, lastStart, today,
    range: valid.length ? Math.max(...valid) - Math.min(...valid) : 0,
  };
}

export function cycleAt(tl, date) {
  for (const c of tl.cycles) {
    const day = diffDays(c.start, date) + 1;
    if (day >= 1 && day <= c.length) return { cycle: c, day };
  }
  return null;
}

export function classify(tl, date, logs) {
  const out = { logged: hasFlow(logs[date]), predictedPeriod: false, fertile: false, ovulation: false, phase: null, day: null };
  if (!tl) return out;
  const hit = cycleAt(tl, date);
  if (!hit) return out;
  const { cycle: c, day } = hit;
  out.day = day;
  out.phase = phaseOf(c, day);
  out.predictedPeriod = c.predicted && day <= c.periodLen;
  const plausible = c.length >= 15;
  out.ovulation = plausible && date === c.ovulation;
  out.fertile = plausible && date >= c.fertileStart && date <= c.fertileEnd;
  return out;
}

export function status(tl, today = todayISO()) {
  if (!tl) return null;
  const hit = cycleAt(tl, today);
  if (!hit) return null;
  const { cycle, day } = hit;
  return {
    cycle, cycleDay: day, phase: phaseOf(cycle, day),
    daysUntil: diffDays(today, tl.expected), late: tl.late,
    inFertile: today >= cycle.fertileStart && today <= cycle.fertileEnd,
    daysToOvulation: diffDays(today, cycle.ovulation),
  };
}

/** Counts symptoms and moods per phase for insights. */
export function patternStats(tl, logs) {
  const symptoms = {};
  const moods = {};
  const bump = (bucket, key, phase) => {
    const e = (bucket[key] ||= { total: 0, byPhase: {} });
    e.total += 1;
    e.byPhase[phase] = (e.byPhase[phase] || 0) + 1;
  };
  for (const [date, log] of Object.entries(logs)) {
    const info = classify(tl, date, logs);
    if (!info.phase || info.cycle?.predicted) continue;
    (log.symptoms || []).forEach((s) => bump(symptoms, s, info.phase));
    if (log.mood) bump(moods, log.mood, info.phase);
  }
  const rank = (bucket) => Object.entries(bucket)
    .map(([key, v]) => ({ key, total: v.total, topPhase: Object.entries(v.byPhase).sort((a, b) => b[1] - a[1])[0][0] }))
    .sort((a, b) => b.total - a.total);
  return { symptoms: rank(symptoms), moods: rank(moods) };
}
