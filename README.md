# Alma: Private Cycle Tracker

A privacy-first menstrual cycle and wellness tracker. Alma has **no accounts and no server**: everything you log stays in your browser.

## Features
- **Phase ring**: your whole cycle as four animated phases (menstrual, follicular, ovulation, luteal) with a glowing marker for today; the app's colours shift with your phase
- Predictions for the next period, fertile window and estimated ovulation, learned from your own history (falls back to your settings until there is enough data)
- Calendar with logged periods, predictions, fertile window and ovulation
- Daily log: flow, symptoms, mood and notes
- Insights: cycle and period averages, regularity, last cycles chart, symptoms and moods by phase
- Phase-based wellness tips, with clear disclaimers (Alma is not a medical device or a method of contraception)
- Backup and restore (JSON export/import), sample data, and one-tap delete of everything
- English and Spanish (auto-detected), responsive, `prefers-reduced-motion` support

## How predictions work
- Periods are grouped from days with logged flow (one skipped day is tolerated)
- Cycle length is the average of your last six valid cycles (15 to 60 days); period length is the average of your last periods
- Ovulation is estimated about 14 days before the next period; the fertile window is the 5 days before ovulation plus ovulation day and the day after
- If a period is late, Alma reports the delay instead of guessing

## Privacy
Data lives in `localStorage` under the key `alma:v1`. Nothing is uploaded, tracked or shared.

## Tech stack
React 18, Vite, plain CSS and SVG (no UI or chart libraries)

## Run locally
```bash
npm install
npm run dev
```

## Build and deploy
```bash
npm run build      # outputs the static site to dist/
```
Deploy `dist/` on any static host (Netlify, Vercel, Render Static Site, GitHub Pages).
On Render: New > Static Site, build command `npm install && npm run build`, publish directory `dist`.

## Disclaimer
Alma gives estimates based on what you log. It is not a medical device or a method of contraception, and it does not replace advice from a healthcare professional.
