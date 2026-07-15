<!--
SYNC IMPACT REPORT
==================
Version change: 1.1.0 → 2.0.0 (MAJOR — redefinition of a MUST-level constraint in a core principle)
Modified principles:
  - Principle II "Subtle Gamification, Not Scoreboards" — REDEFINED. The former blanket ban on
    loss-aversion / "punitive resets that erase visual progress abruptly" is relaxed: gentle,
    bounded, recoverable, non-shaming stakes (e.g. a wilting plant) are now PERMITTED as
    motivators, treated as hypotheses to be validated by product testing rather than forbidden
    up front. Leaderboards/social comparison, shaming/alarm UI, and manipulative engagement
    dark patterns remain prohibited. (Prompted by the 006-growing-bonsai wilt decision.)
Previously (1.1.0 → still current): Principle VII (Sound) + honest-verification + anti-drift
  governance remain unchanged.
Added/Removed sections: none.
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ reviewed — generic "Constitution Check" gate,
    no hardcoded principle list; no change required.
  - .specify/templates/spec-template.md ✅ reviewed — no constitution-coupled mandatory
    sections affected; no change required.
  - .specify/templates/tasks-template.md ✅ reviewed — no change required.
Downstream: specs/006-growing-bonsai — the analyze CRITICAL finding X1 (aggressive wilt vs old
  Principle II) is RESOLVED by this amendment; the wilt is now permitted subject to product
  testing. The spec's FR-007 wording (C1) is corrected separately.
Follow-up TODOs: none.
-->

# Frog Garden Constitution
<!-- A calm, Zen/Tao-influenced, gamified TODO app -->

## Core Principles

### I. Calm Technology (Zen & Tao Influence)
The app follows *wu wei* (effortless action) and *ma* (negative space) as design values, not decoration. Screens favor generous whitespace over density; motion is slow, organic, and easing-based rather than snappy or attention-grabbing. Wabi-sabi applies to the product's emotional stance: an incomplete task, a broken streak, or a missed day is never surfaced as failure. There is no shame UI — no red badges, no "you're behind" language, no guilt-based copy. Notifications, if any, are opt-in and worded as gentle invitations, never urgency cues.

### II. Subtle Gamification, Not Scoreboards
Progress is rewarded primarily through organic, visual feedback (a garden/bonsai that grows) rather than points, ranks, or leaderboards. Numeric stats (streak counts, completion totals) MAY exist but MUST be secondary — tucked into an opt-in view, never the first thing the user sees, and never framed as guilt. Positive reinforcement MUST never depend on comparison to other users, since this is a local single-player experience.

Gentle *stakes* are allowed. A mechanic MAY use bounded loss-aversion as a motivator — for example a plant that wilts during inactivity — PROVIDED it is: (a) **bounded** — there is a floor; loss is never total or irrecoverable; (b) **recoverable** — the user can restore lost ground simply by resuming normal use; (c) **non-shaming** — no alarm/red styling, no guilt or "you're slipping" language (defers to Principle I); and (d) **validated by product testing** — such a mechanic is a *hypothesis* about what motivates, to be confirmed with real user feedback and softened or removed if testing shows it causes anxiety rather than gentle momentum.

Still prohibited outright: leaderboards or social comparison, shaming language or alarm UI, and dark patterns whose primary purpose is to inflate time-on-app or re-engagement through manipulation.

### III. Local-First & Private
All user data (tasks, reflections, garden state, settings) is stored on-device (localStorage/IndexedDB) for v1. No account creation, no server-side persistence, and no analytics/telemetry beyond what a user explicitly opts into. Data export/import (JSON) MUST be available so the user is never locked in. Any future move to cloud sync requires an explicit, separately-designed opt-in — it is not a default assumption for this codebase.

### IV. Accessibility Is Not Optional
Every interactive element MUST be keyboard-operable and screen-reader labelled. All animation MUST respect `prefers-reduced-motion` by falling back to instant or minimal-motion states — the zen aesthetic must degrade gracefully, not break, for users who disable motion. Color palettes, however muted, MUST meet WCAG AA contrast for text and interactive elements.

### V. Design System Discipline
Material UI (MUI) is the component base, but the constitution requires it be re-themed, not used out of the box: a muted, nature-inspired palette; flattened or soft shadows instead of heavy Material elevation; generous spacing; rounded, organic corners; restrained motion authored through Framer Motion rather than MUI's default ripple/transition patterns. Any new component must be checked against this theme before it's considered "done" — a component that looks like default Material Design is a defect, not a stopping point.

### VI. Simplicity & Performance (YAGNI)
v1 has no backend, no auth, and no multi-device sync — features MUST NOT be built in anticipation of these. Bundle size and interaction latency are treated as UX properties of a "calm" app: a slow or janky app cannot be zen. Prefer the simplest mechanism that satisfies a requirement; defer architecture for hypothetical future scale.

### VII. Sound Is Calm & Shared
Audio is an extension of Calm Technology (Principle I), not an exception to it. Sound MUST be off or opt-in by default and MUST NOT play unprompted on load. Every sound MUST be gentle — soft, short, and easing in/out — never startling, jarring, or attention-grabbing. Audio MUST be synthesized locally with the Web Audio API rather than shipping or streaming external audio assets, keeping the app offline-capable (Principle III) and free of licensing burden (Principle VI). All sound effects MUST share a single, reused `AudioContext` — creating a new `AudioContext` per sound is prohibited (it exhausts the browser's context limit and caused a real raking-lag regression). The app MUST honor quiet/reduced expectations (a clear mute or per-sound toggle, and no audio when the user has opted out).

## Technology Constraints

- **Framework**: Next.js (App Router, TypeScript).
- **UI components**: Material UI (MUI), themed per Principle V.
- **Animation**: Framer Motion, used sparingly and only where it reinforces the calm/organic feel (task completion ripple, garden growth, breathing idle states).
- **Audio**: Web Audio API only, synthesized in-browser (no audio files); one shared `AudioContext` (Principle VII).
- **Persistence**: Browser-local only (localStorage/IndexedDB) for v1; JSON export/import for portability. No server, no database, no authentication in v1.
- **Verification**: The gate for "done" is a clean `tsc --noEmit` and a clean `eslint` run, plus manual verification in the browser preview against the feature's acceptance scenarios (including `prefers-reduced-motion` fallbacks). Automated component/unit tests for core logic (task CRUD, Frog Mode eligibility, garden/streak state transitions) are encouraged and welcome, but are not currently the release gate — do not claim tests exist where they do not.

## Development Workflow

- Every feature proceeds through the Spec Kit flow: `/speckit-specify` → `/speckit-clarify` (as needed) → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`.
- Any change that touches visual design (color, spacing, motion) must be checked against Principles I and V before being marked complete.
- Any change that adds a gamification mechanic must be checked against Principle II — if a reviewer can't explain how it avoids being a scoreboard or an anxiety loop, it is not ready.
- Any change that adds or changes sound must be checked against Principle VII.
- **No silent spec drift**: any feature built directly in code without first going through specify/plan/tasks MUST be documented retroactively — a `spec.md` and `tasks.md` under `specs/NNN-<feature>/` — before it is considered complete. `/speckit-converge` SHOULD be run periodically to reconcile the codebase against the specs and append any undocumented work, so the `specs/` directory stays an accurate record of what the app actually does.

## Governance

This constitution supersedes ad-hoc preferences during implementation. Amendments require an explicit note in the PR/commit describing what changed and why, and a version bump below. Complexity that violates Principle VI (e.g., introducing a backend, an account system, or a scoring leaderboard) must be justified against a real, stated requirement — not speculative future need.

**Version**: 2.0.0 | **Ratified**: 2026-07-01 | **Last Amended**: 2026-07-02
