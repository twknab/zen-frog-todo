# Frog Garden Constitution
<!-- A calm, Zen/Tao-influenced, gamified TODO app -->

## Core Principles

### I. Calm Technology (Zen & Tao Influence)
The app follows *wu wei* (effortless action) and *ma* (negative space) as design values, not decoration. Screens favor generous whitespace over density; motion is slow, organic, and easing-based rather than snappy or attention-grabbing. Wabi-sabi applies to the product's emotional stance: an incomplete task, a broken streak, or a missed day is never surfaced as failure. There is no shame UI — no red badges, no "you're behind" language, no guilt-based copy. Notifications, if any, are opt-in and worded as gentle invitations, never urgency cues.

### II. Subtle Gamification, Not Scoreboards
Progress is rewarded through organic, visual feedback (a garden/bonsai that grows) rather than points, ranks, or leaderboards. Numeric stats (streak counts, completion totals) MAY exist but MUST be secondary — tucked into an opt-in view, never the first thing the user sees. No mechanic may be designed primarily to maximize time-on-app or re-engagement through anxiety (no streak-loss countdowns, no punitive resets that erase visual progress abruptly). Positive reinforcement must never depend on comparison to other users, since this is a local single-player experience.

### III. Local-First & Private
All user data (tasks, reflections, garden state, settings) is stored on-device (localStorage/IndexedDB) for v1. No account creation, no server-side persistence, and no analytics/telemetry beyond what a user explicitly opts into. Data export/import (JSON) MUST be available so the user is never locked in. Any future move to cloud sync requires an explicit, separately-designed opt-in — it is not a default assumption for this codebase.

### IV. Accessibility Is Not Optional
Every interactive element MUST be keyboard-operable and screen-reader labelled. All animation MUST respect `prefers-reduced-motion` by falling back to instant or minimal-motion states — the zen aesthetic must degrade gracefully, not break, for users who disable motion. Color palettes, however muted, MUST meet WCAG AA contrast for text and interactive elements.

### V. Design System Discipline
Material UI (MUI) is the component base, but the constitution requires it be re-themed, not used out of the box: a muted, nature-inspired palette; flattened or soft shadows instead of heavy Material elevation; generous spacing; rounded, organic corners; restrained motion authored through Framer Motion rather than MUI's default ripple/transition patterns. Any new component must be checked against this theme before it's considered "done" — a component that looks like default Material Design is a defect, not a stopping point.

### VI. Simplicity & Performance (YAGNI)
v1 has no backend, no auth, and no multi-device sync — features MUST NOT be built in anticipation of these. Bundle size and interaction latency are treated as UX properties of a "calm" app: a slow or janky app cannot be zen. Prefer the simplest mechanism that satisfies a requirement; defer architecture for hypothetical future scale.

## Technology Constraints

- **Framework**: Next.js (App Router, TypeScript).
- **UI components**: Material UI (MUI), themed per Principle V.
- **Animation**: Framer Motion, used sparingly and only where it reinforces the calm/organic feel (task completion ripple, garden growth, breathing idle states).
- **Persistence**: Browser-local only (localStorage/IndexedDB) for v1; JSON export/import for portability. No server, no database, no authentication in v1.
- **Testing**: Component/unit tests for core task logic (CRUD, Frog Mode enforcement, streak/garden state transitions) are expected; visual/animation code is exempt from strict TDD but must not break `prefers-reduced-motion` fallbacks.

## Development Workflow

- Every feature proceeds through the Spec Kit flow: `/speckit-specify` → `/speckit-clarify` (as needed) → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`.
- Any change that touches visual design (color, spacing, motion) must be checked against Principles I and V before being marked complete.
- Any change that adds a gamification mechanic must be checked against Principle II — if a reviewer can't explain how it avoids being a scoreboard or an anxiety loop, it is not ready.

## Governance

This constitution supersedes ad-hoc preferences during implementation. Amendments require an explicit note in the PR/commit describing what changed and why, and a version bump below. Complexity that violates Principle VI (e.g., introducing a backend, an account system, or a scoring leaderboard) must be justified against a real, stated requirement — not speculative future need.

**Version**: 1.0.0 | **Ratified**: 2026-07-01 | **Last Amended**: 2026-07-01
