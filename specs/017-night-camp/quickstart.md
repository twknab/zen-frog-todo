# Quickstart / Manual Verification — 017 Night Camp

## Setup

```bash
npm install   # if needed
npm run dev
```

Open the app. Prefer **Dev tools** for realm testing (do not wait for real night).

## A. Work hours (Options)

1. Open **Options** → set Work hours via AM/PM (e.g. start 9:00 AM, end 5:00 PM).
2. Reload — hours persist.
3. Defaults (fresh storage): **8:00 AM – 5:00 PM**.

## B. Dev harness matrix (required)

Enable **Dev tools** on the Bonsai card.

| Step | Action | Expect |
|-----:|--------|--------|
| 1 | **Force night** | Indicator: Night Camp (forced). Dim/night atmosphere when scene exists. Appearance unchanged. |
| 2 | **Complete focus session** | Night Camp advances; bonsai leaves/frogs **do not** increase. |
| 3 | **Simulate +1h idle** | **No** additional wilt while forced night. |
| 4 | **Force day** | Indicator: Day Garden (forced). |
| 5 | **Complete focus session** | Bonsai/frogs grow as today. |
| 6 | **Simulate +1h idle** | Wilt behaves as existing day Dev tool. |
| 7 | **Follow clock** | Realm matches real work window + clock. |
| 8 | Turn **Dev tools** off (with Force night still stored) | App follows clock only — **not** stuck in night (SC-010). |
| 9 | **Reset** (Dev on) | Day Garden **and** Night Camp clear for the cycle. |

## C. Night Camp scene

1. Force night; complete several focus sessions / tasks until ~4–5 stage changes are visible (fireflies → fire → stars → moon).
2. Earn day frogs under Force day, then Force night — more frogs at camp than a low-frog baseline.
3. `prefers-reduced-motion`: ornaments appear without distracting motion; nothing invisible.
4. Dim overlay: text/controls remain readable (AA).

## D. Summaries & archive

1. Build day + night progress in one cycle.
2. Garden info / summary shows differentiated Day vs Night beats.
3. **Start a new day** → Grove entry shows Night Camp when night progress existed; empty night stays calm (no guilt).

## E. Gates

```bash
npx tsc --noEmit
```

Eslint clean on touched files. Keyboard: Force night/day/Follow clock operable; Options work hours labelled.
