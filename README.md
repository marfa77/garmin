# Garmin Wellness Dashboard

Whoop-style recovery dashboard for **Garmin Venu 2** — Recovery, Strain, Sleep, Body Battery, Stress, Fitness Age.

**Live:** [https://marfa77.github.io/garmin/](https://marfa77.github.io/garmin/)

## Quick start

```bash
cd ~/Projects/Garmin/wellness-dashboard
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — runs with **demo data** until you sync Garmin.

## Sync real Garmin data

1. Copy env file and add your Garmin Connect credentials:

```bash
cp .env.example .env
```

2. Install Python deps and sync:

```bash
pip3 install -r scripts/requirements.txt
npm run sync
```

3. Refresh the dashboard — it reads `data/dashboard.json` (and copies to `public/data/` for GitHub Pages).

> Uses unofficial [python-garminconnect](https://github.com/cyberjunky/python-garminconnect). For personal use only.

## Deploy to GitHub Pages

Pushes to `main` deploy automatically via GitHub Actions.

```bash
npm run sync          # refresh data
git add public/data/dashboard.json
git commit -m "Update dashboard data"
git push origin main
```

Site URL: **https://marfa77.github.io/garmin/**

## Stack

- **Next.js 14** — static export, dark Whoop-like UI
- **Recharts** — Body Battery + Stress curves
- **Python** — Garmin ETL + scoring engine
- **TypeScript** — scoring mirror + demo data

## Metrics

| Ring | Source |
|------|--------|
| Recovery | HRV, RHR, sleep, prior strain, Body Battery |
| Strain | Workouts + steps & active calories |
| Sleep | Garmin sleep score + stages |
| + | Stress, Body Battery, VO₂ max, Fitness Age |

Coach messages are generated via **OpenRouter** (`google/gemini-2.5-flash` by default).

## Project layout

```
├── src/
│   ├── app/           # Next.js pages
│   ├── components/    # Rings, charts, coach card
│   └── lib/           # scoring, types, data loader
├── scripts/
│   ├── sync_garmin.py # Garmin Connect sync
│   └── generate-coach.mjs
├── data/              # local sync output (gitignored)
└── public/data/       # dashboard.json for Pages build
```
