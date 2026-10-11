import { useCallback, useEffect, useState } from 'react';
import { addDays, todayISO } from './cycle.js';
import { sampleLogs } from './sample.js';

const KEY = 'alma:v1';
export const SYMPTOMS = ['cramps', 'headache', 'bloating', 'fatigue', 'acne', 'backache', 'tenderBreasts', 'nausea', 'cravings'];
export const MOODS = ['happy', 'calm', 'energetic', 'anxious', 'irritable', 'sad'];
const FLOWS = ['light', 'medium', 'heavy'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const clampInt = (v, lo, hi, fallback) => (Number.isFinite(Number(v)) ? Math.min(hi, Math.max(lo, Math.round(Number(v)))) : fallback);

const defaults = () => ({ v: 1, onboarded: false, settings: { cycleLength: 28, periodLength: 5, lang: null }, logs: {} });

function cleanLog(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const log = {};
  if (FLOWS.includes(raw.flow)) log.flow = raw.flow;
  if (Array.isArray(raw.symptoms)) {
    const s = [...new Set(raw.symptoms.filter((x) => SYMPTOMS.includes(x)))];
    if (s.length) log.symptoms = s;
  }
  if (MOODS.includes(raw.mood)) log.mood = raw.mood;
  if (typeof raw.note === 'string' && raw.note.trim()) log.note = raw.note.slice(0, 500);
  return Object.keys(log).length ? log : null;
}
function cleanLogs(raw) {
  const out = {};
  if (raw && typeof raw === 'object') {
    for (const [date, log] of Object.entries(raw)) {
      const c = DATE_RE.test(date) ? cleanLog(log) : null;
      if (c) out[date] = c;
    }
  }
  return out;
}
function cleanSettings(raw = {}) {
  return {
    cycleLength: clampInt(raw.cycleLength, 20, 45, 28),
    periodLength: clampInt(raw.periodLength, 2, 10, 5),
    lang: raw.lang === 'es' || raw.lang === 'en' ? raw.lang : null,
  };
}

function load() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY));
    if (!d) return defaults();
    return { v: 1, onboarded: Boolean(d.onboarded), settings: cleanSettings(d.settings), logs: cleanLogs(d.logs) };
  } catch { return defaults(); }
}

export function useStore() {
  const [data, setData] = useState(load);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* storage unavailable */ } }, [data]);

  const setLog = useCallback((date, patch) => {
    setData((d) => {
      const merged = { ...(d.logs[date] || {}), ...patch };
      if (patch.flow === 'none') delete merged.flow;
      const logs = { ...d.logs };
      const c = cleanLog(merged);
      if (c) logs[date] = c; else delete logs[date];
      return { ...d, logs };
    });
  }, []);

  const updateSettings = useCallback((patch) => setData((d) => ({ ...d, settings: cleanSettings({ ...d.settings, ...patch }) })), []);

  const finishOnboarding = useCallback(({ start, cycleLength, periodLength }) => {
    const pattern = ['medium', 'heavy', 'medium', 'light', 'light', 'light', 'light', 'light', 'light', 'light'];
    const logs = {};
    const today = todayISO();
    for (let i = 0; i < periodLength; i++) { const day = addDays(start, i); if (day <= today) logs[day] = { flow: pattern[i] }; }
    setData((d) => ({ ...d, onboarded: true, settings: cleanSettings({ ...d.settings, cycleLength, periodLength }), logs }));
  }, []);

  const loadSample = useCallback(() => setData((d) => ({ ...d, onboarded: true, settings: cleanSettings({ ...d.settings, cycleLength: 28, periodLength: 5 }), logs: sampleLogs(todayISO()) })), []);
  const reset = useCallback(() => setData((d) => ({ ...defaults(), settings: { ...defaults().settings, lang: d.settings.lang } })), []);

  const exportJson = useCallback(() => JSON.stringify({ app: 'alma', v: 1, exportedAt: new Date().toISOString(), settings: data.settings, logs: data.logs }, null, 2), [data]);
  const importJson = useCallback((text) => {
    try {
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== 'object' || typeof parsed.logs !== 'object') return false;
      setData((d) => ({ ...d, onboarded: true, settings: cleanSettings({ ...parsed.settings, lang: d.settings.lang }), logs: cleanLogs(parsed.logs) }));
      return true;
    } catch { return false; }
  }, []);

  return { data, setLog, updateSettings, finishOnboarding, loadSample, reset, exportJson, importJson };
}
