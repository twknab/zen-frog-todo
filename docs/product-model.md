# Frog Garden — Product Model

Canonical product shape for what we are building. Binding detail lives in
[`.specify/memory/constitution.md`](../.specify/memory/constitution.md)
(**v2.1.0+**, section *Product Model: Day Garden & Night Camp*). This page is the
human-readable picture.

## Promise

A calm, work-centric garden by day. A warm, rewarding night camp after hours.
Two worlds. One day-cycle. Never shame, never lockout.

## Day Garden (primary)

- **Metaphor:** tend the bonsai.
- **When:** inside the user's **work window** (default **8 AM – 5 PM** local;
  configurable in Options with AM/PM controls; browser timezone).
- **Progress:** bonsai grows; frog friends gather.
- **Stakes:** soft wilt only during idle time *inside* the work window —
  bounded, recoverable, non-shaming.
- **Role:** the center of the product. Work comes first.

## Night Camp (bonus)

- **Metaphor:** sit by the fire.
- **When:** outside the work window. Bonsai is **asleep** — no new day growth
  from completions; credit goes to a **separate night ledger**.
- **Progress theater (≈4–5 stages):** fireflies, a growing campfire, stars,
  a filling moon — the night scene advances as the user still finishes things.
- **Frogs participate:** day frogs carry into camp (more day frogs ⇒ more night
  frogs present); night activity can involve frogs with night trinkets
  (e.g. fireflies).
- **Tone:** vibe-up and reward for lingering / personal / late focus — never
  “you should be asleep,” never a blocked UI.
- **Atmosphere:** dim / overlay wash only. **Never** force light↔dark Appearance.

## One cycle

Day Garden and Night Camp share the manual **"Start a new day"** boundary —
not calendar midnight. Both archive together; unfinished tasks carry over.
Summaries (standup, Grove, archive) show **both worlds**, clearly differentiated:
day as garden stage, night as camp scene poetry — not twin scoreboards.

## What we are not shaping

- Night as a lockout or “come back tomorrow”
- Forcing dark mode at night
- Night as a louder scoreboard than the bonsai
- Wilt anxiety overnight

## Dev testing

Dev tools are the **primary** way to exercise Night Camp (parity with Simulate +1h idle).
Controls live on the Bonsai card Dev strip with existing day tools.

| Control | Expected |
|---|---|
| **Force night** | Night atmosphere + camp. Completions → night ledger only; bonsai sleeps. Simulate +1h idle → **no wilt**. |
| **Force day** | Day atmosphere. Completions → Day Garden. Simulate +1h idle → wilt as today. |
| **Follow clock** | Realm from work window + local clock only. |
| **Complete focus session** | Routes to day or night ledger based on **effective** realm (forced or clock). |
| **Reset** | Clears **both** Day Garden and Night Camp for the cycle. |

Rules:

- Forcing a realm **never** changes Appearance and **never** blocks the UI.
- When Dev tools are **off**, any stored override is **ignored** (Follow clock).
- Turning Dev tools back on **may** restore the last override for convenience.
- One shared realm resolver — forced and clock-derived night/day must behave identically for growth, wilt, and atmosphere.
