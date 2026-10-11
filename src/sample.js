import { addDays, phaseOf } from './cycle.js';

function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Six months of believable demo data. Today lands around cycle day 12. */
export function sampleLogs(today) {
  const rnd = mulberry32(11);
  const logs = {};
  const lengths = [29, 27, 30, 28, 31, 28];
  let start = addDays(today, -11);
  const starts = [start];
  for (const L of lengths) { start = addDays(start, -L); starts.unshift(start); }

  const flows = ['medium', 'heavy', 'medium', 'light', 'light', 'light'];
  starts.forEach((s, i) => {
    const length = i < starts.length - 1 ? lengths[i] ?? 28 : 28;
    const periodLen = 4 + Math.floor(rnd() * 3);
    const cycle = { periodLen, ovDay: Math.max(periodLen + 3, length - 14) };
    for (let d = 0; d < length; d++) {
      const date = addDays(s, d);
      if (date > today) break;
      const phase = phaseOf(cycle, d + 1);
      const log = {};
      if (d < periodLen) log.flow = flows[d];
      const symptoms = [];
      if (phase === 'menstrual' && d < 3) { symptoms.push('cramps'); if (rnd() > 0.5) symptoms.push('backache'); if (rnd() > 0.6) symptoms.push('fatigue'); log.mood = rnd() > 0.5 ? 'calm' : 'sad'; }
      if (phase === 'ovulation' && rnd() > 0.3) log.mood = rnd() > 0.5 ? 'energetic' : 'happy';
      if (phase === 'follicular' && rnd() > 0.7) log.mood = 'happy';
      if (phase === 'luteal' && d >= length - 6) {
        if (rnd() > 0.35) symptoms.push('bloating');
        if (rnd() > 0.5) symptoms.push('tenderBreasts');
        if (rnd() > 0.7) symptoms.push('cravings');
        if (rnd() > 0.8) symptoms.push('headache');
        if (rnd() > 0.5) log.mood = rnd() > 0.5 ? 'irritable' : 'anxious';
      }
      if (symptoms.length) log.symptoms = symptoms;
      if (Object.keys(log).length) logs[date] = log;
    }
  });
  return logs;
}
