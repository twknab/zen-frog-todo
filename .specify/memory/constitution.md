<!--
SYNC IMPACT REPORT
==================
Version change: 2.0.0 → 2.1.0 (MINOR — new Product Model section + Principle II/V
  guidance for Day Garden & Night Camp; no removal or redefinition that breaks
  prior MUST constraints). Later amended in-place for Dev Mode realm-testing
  expectations under Product Model (still 2.1.0; additive clarification).
Modified principles:
  - Principle II "Subtle Gamification, Not Scoreboards" — EXPANDED. Organic visual
    progress now explicitly includes two sibling worlds (Day Garden bonsai/frogs
    and Night Camp trinkets). Night is bonus reward energy, never a scoreboard,
    never shame for late work. Wilt remains day-window-only.
  - Principle V "Design System Discipline" — EXPANDED. Clock-driven night
    atmosphere MUST be overlay/dim only; MUST NOT force light↔dark Appearance.
Added sections:
  - "Product Model: Day Garden & Night Camp" — binding product decisions for
    work window, dual ledgers, night scene stages, summaries, and cycle bounds.
Removed sections: none.
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ reviewed — Constitution Check remains
    generic; product-model gates are read from this file at plan time.
  - .specify/templates/spec-template.md ✅ reviewed — no mandatory section change.
  - .specify/templates/tasks-template.md ✅ reviewed — no change required.
Runtime docs:
  - README.md ✅ updated — Product model + highlights point at Day/Night vision.
  - docs/product-model.md ✅ added — canonical narrative of locked decisions.
  - AGENTS.md ✅ updated — agents must honor Day/Night product model.
Follow-up TODOs:
  - Spec Kit `/speckit-specify` for Night Camp + configurable work window
    (implementation not started; constitution/docs only in this amendment).
-->

# Frog Garden Constitution
<!-- A calm, Zen/Tao-influenced, gamified TODO app -->

## Core Principles

### I. Calm Technology (Zen & Tao Influence)
The app follows *wu wei* (effortless action) and *ma* (negative space) as design values, not decoration. Screens favor generous whitespace over density; motion is slow, organic, and easing-based rather than snappy or attention-grabbing. Wabi-sabi applies to the product's emotional stance: an incomplete task, a broken streak, or a missed day is never surfaced as failure. There is no shame UI — no red badges, no "you're behind" language, no guilt-based copy. Notifications, if any, are opt-in and worded as gentle invitations, never urgency cues. Working late MUST never be framed as failure or urgency; Night Camp (see Product Model) exists to vibe the user *up*, not to police their clock.

### II. Subtle Gamification, Not Scoreboards
Progress is rewarded primarily through organic, visual feedback rather than points, ranks, or leaderboards. The product's visual progress language is **two sibling worlds**:

- **Day Garden** — the work-centric bonsai and frog friends (primary).
- **Night Camp** — after-hours trinkets and atmosphere (bonus; fireflies, campfire, stars, moon, night frogs).

Numeric stats (streak counts, completion totals) MAY exist but MUST be secondary — tucked into an opt-in view, never the first thing the user sees, and never framed as guilt. Positive reinforcement MUST never depend on comparison to other users, since this is a local single-player experience. Night Camp stages MUST read as scene poetry (embers → fire → blaze, moon fill, star field) more than numeric counters.

Gentle *stakes* are allowed. A mechanic MAY use bounded loss-aversion as a motivator — for example a plant that wilts during inactivity — PROVIDED it is: (a) **bounded** — there is a floor; loss is never total or irrecoverable; (b) **recoverable** — the user can restore lost ground simply by resuming normal use; (c) **non-shaming** — no alarm/red styling, no guilt or "you're slipping" language (defers to Principle I); and (d) **validated by product testing** — such a mechanic is a *hypothesis* about what motivates, to be confirmed with real user feedback and softened or removed if testing shows it causes anxiety rather than gentle momentum. Wilt and similar stakes MUST apply only inside the user's **work window** (day); overnight / Night Camp hours MUST NOT wilt the bonsai.

Still prohibited outright: leaderboards or social comparison, shaming language or alarm UI, and dark patterns whose primary purpose is to inflate time-on-app or re-engagement through manipulation.

### III. Local-First & Private
All user data (tasks, reflections, garden state, night ledger, settings) is stored on-device (localStorage/IndexedDB) for v1. No account creation, no server-side persistence, and no analytics/telemetry beyond what a user explicitly opts into. Data export/import (JSON) MUST be available so the user is never locked in. Any future move to cloud sync requires an explicit, separately-designed opt-in — it is not a default assumption for this codebase.

### IV. Accessibility Is Not Optional
Every interactive element MUST be keyboard-operable and screen-reader labelled. All animation MUST respect `prefers-reduced-motion` by falling back to instant or minimal-motion states — the zen aesthetic must degrade gracefully, not break, for users who disable motion. Color palettes, however muted, MUST meet WCAG AA contrast for text and interactive elements. Night dim/overlay MUST preserve AA contrast for interactive chrome and text; atmosphere never sacrifices readability.

### V. Design System Discipline
Material UI (MUI) is the component base, but the constitution requires it be re-themed, not used out of the box: a muted, nature-inspired palette; flattened or soft shadows instead of heavy Material elevation; generous spacing; rounded, organic corners; restrained motion authored through Framer Motion rather than MUI's default ripple/transition patterns. Any new component must be checked against this theme before it's considered "done" — a component that looks like default Material Design is a defect, not a stopping point.

**Appearance vs atmosphere:** light/dark Appearance is the user's choice and MUST remain under their control. Clock-driven Night Camp atmosphere (dim wash, stars, fireflies, campfire) MUST be implemented as overlay / ambience on top of the chosen Appearance. The app MUST NEVER force a light↔dark theme toggle because the clock says it is night.

### VI. Simplicity & Performance (YAGNI)
v1 has no backend, no auth, and no multi-device sync — features MUST NOT be built in anticipation of these. Bundle size and interaction latency are treated as UX properties of a "calm" app: a slow or janky app cannot be zen. Prefer the simplest mechanism that satisfies a requirement; defer architecture for hypothetical future scale.

### VII. Sound Is Calm & Shared
Audio is an extension of Calm Technology (Principle I), not an exception to it. Sound MUST be off or opt-in by default and MUST NOT play unprompted on load. Every sound MUST be gentle — soft, short, and easing in/out — never startling, jarring, or attention-grabbing. Audio MUST be synthesized locally with the Web Audio API rather than shipping or streaming external audio assets, keeping the app offline-capable (Principle III) and free of licensing burden (Principle VI). All sound effects MUST share a single, reused `AudioContext` — creating a new `AudioContext` per sound is prohibited (it exhausts the browser's context limit and caused a real raking-lag regression). The app MUST honor quiet/reduced expectations (a clear mute or per-sound toggle, and no audio when the user has opted out).

## Product Model: Day Garden & Night Camp

This section is binding product shape — not a speculative wishlist. Features that touch day/night, wilt windows, or garden summaries MUST comply.

### Two worlds, one day-cycle

| | **Day Garden** (primary) | **Night Camp** (bonus) |
|---|---|---|
| Metaphor | Tend the bonsai | Sit by the fire |
| When | Inside the user's work window | Outside the work window |
| Progress | Bonsai leaves + frog friends | Camp stages: fireflies, campfire, stars, moon; frogs participate |
| Idle stakes | Soft wilt (bounded, recoverable) | None — bonsai is asleep |
| Role | Work-centric core | After-hours vibe-up and reward |

- **Day is centered.** Frog Garden is a work-centric app; Night Camp is bonus / personal / linger energy — warmer and rewarding, never a second scoreboard that overshadows the bonsai.
- **The UI MUST remain fully usable at night.** Night is a skin + ledger + ornaments, never a lockout, modal, or "come back in the morning."
- **Bonsai sleeps at night.** Completions outside the work window MUST NOT grow the bonsai (no new day leaves/frogs from those events). Day's tree rests; credit goes to the night ledger instead.
- **Separate night ledger.** Night completions advance Night Camp stages. Day and night progress are sibling ledgers, clearly differentiated in summaries (standup/tooltip, Grove, archive) — same surfaces, distinct worlds, not duplicated identical meters.
- **Frogs live in both worlds.** Day frogs carry into the night scene (more day frogs ⇒ more frogs present at camp). Night ledger progress also involves frogs in night-specific ways (e.g. catching / eating fireflies). Frogs are companions across realms, not day-only decoration.
- **One cycle until "Start a new day".** Day Garden and Night Camp ledgers are bound to the manual day-cycle (not calendar midnight). Crossing midnight during night does not reset ledgers; "Start a new day" archives both and begins fresh. Unfinished tasks still carry over.

### Work window

- Default work window: **08:00–17:00 local** (8 AM – 5 PM), using the browser's timezone via local `Date` (no separate TZ picker required for v1).
- The user MUST be able to set their work window in **Options**. The control SHOULD present **AM/PM** times for humans and convert to 24-hour local hours for storage and wilt/night logic.
- The work window drives: (1) when wilt may apply, (2) when the bonsai accepts growth vs sleeps, (3) when Night Camp atmosphere and night-ledger credit are active.
- Copy around the setting MUST stay calm (e.g. hours the garden gently minds idle time) — never "you should be working now."

### Night Camp scene (v1 depth)

Night Camp advances through roughly **4–5 discrete stages** as the night ledger grows (exact thresholds belong in the feature spec). Visual vocabulary for v1:

- Fireflies appear and multiply
- A little campfire grows (embers → small fire → cozy blaze)
- Stars populate
- Moon grows / fills
- Frogs participate in the night scene (presence scaled by day frogs + night activity)

Atmosphere: dim / overlay wash consistent with Principle V — never force Appearance mode.

### Summaries & differentiation

Wherever day progress is summarized, Night Camp MUST be representable as a **sibling, differentiated** beat (poetic stage labels over raw counts). Best UX matters: two worlds should be obvious at a glance without cluttering the day-primary chrome.

### Dev Mode realm testing

Dev tools MUST be able to **Force night**, **Force day**, or **Follow clock** so Night Camp is testable without waiting on the wall clock (parity with Simulate +1h idle). A forced realm MUST use the same growth routing, wilt eligibility, and atmosphere rules as a clock-derived realm of that type. Force MUST NOT change Appearance or block the UI. When Dev tools are off, any stored override MUST be ignored. Dev Reset MUST clear both Day Garden and Night Camp for the cycle. While effective realm is night, Simulate +1h idle MUST NOT wilt; while day, simulate idle keeps today’s day-wilt Dev behavior.

## Technology Constraints

- **Framework**: Next.js (App Router, TypeScript).
- **UI components**: Material UI (MUI), themed per Principle V.
- **Animation**: Framer Motion, used sparingly and only where it reinforces the calm/organic feel (task completion ripple, garden growth, night ornaments, breathing idle states).
- **Audio**: Web Audio API only, synthesized in-browser (no audio files); one shared `AudioContext` (Principle VII).
- **Persistence**: Browser-local only (localStorage/IndexedDB) for v1; JSON export/import for portability. No server, no database, no authentication in v1.
- **Verification**: The gate for "done" is a clean `tsc --noEmit` and a clean `eslint` run, plus manual verification in the browser preview against the feature's acceptance scenarios (including `prefers-reduced-motion` fallbacks). Automated component/unit tests for core logic (task CRUD, Frog Mode eligibility, garden/streak/night-ledger state transitions) are encouraged and welcome, but are not currently the release gate — do not claim tests exist where they do not.

## Development Workflow

- Every feature proceeds through the Spec Kit flow: `/speckit-specify` → `/speckit-clarify` (as needed) → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`.
- Any change that touches visual design (color, spacing, motion) must be checked against Principles I and V before being marked complete.
- Any change that adds a gamification mechanic must be checked against Principle II — if a reviewer can't explain how it avoids being a scoreboard or an anxiety loop, it is not ready.
- Any change that adds or changes sound must be checked against Principle VII.
- Any change that touches day/night realms, wilt windows, work hours, or garden summaries must be checked against the **Product Model: Day Garden & Night Camp** section.
- **No silent spec drift**: any feature built directly in code without first going through specify/plan/tasks MUST be documented retroactively — a `spec.md` and `tasks.md` under `specs/NNN-<feature>/` — before it is considered complete. `/speckit-converge` SHOULD be run periodically to reconcile the codebase against the specs and append any undocumented work, so the `specs/` directory stays an accurate record of what the app actually does.

## Governance

This constitution supersedes ad-hoc preferences during implementation. Amendments require an explicit note in the PR/commit describing what changed and why, and a version bump below. Complexity that violates Principle VI (e.g., introducing a backend, an account system, or a scoring leaderboard) must be justified against a real, stated requirement — not speculative future need.

**Version**: 2.1.0 | **Ratified**: 2026-07-01 | **Last Amended**: 2026-07-25
