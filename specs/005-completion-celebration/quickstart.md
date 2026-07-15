# Quickstart / Validation Guide: Task-completion celebration

A manual validation guide (the effect is visual; the constitution exempts animation from
strict TDD). Each scenario maps to the behavior contract in
[`contracts/celebration-ui-contract.md`](./contracts/celebration-ui-contract.md) and the
success criteria in [`spec.md`](./spec.md).

## Prerequisites

- Dependencies installed (`npm install` / `yarn`).
- At least a couple of tasks present in the task list plus a designated frog.

## Run

```bash
npm run dev
# open the printed http://localhost:3000
```

## Validation scenarios

### 1. Task-list completion (C-1, C-2, SC-001, SC-002)

1. Check off a task in the task list.
2. **Expect**: a brief celebratory burst originates at the checkbox and fades within ~1s.
3. After it fades, inspect the area (and the DOM) — **expect** nothing left behind and no
   layout shift.

### 2. Frog completion (C-1)

1. Check off the frog in the frog card.
2. **Expect**: the same celebratory burst plays for the frog.

### 3. No celebration on un-complete (C-3, SC-001)

1. Un-check a completed task.
2. **Expect**: no animation at all.

### 4. Action is not blocked (C-4, SC-005)

1. Check a task and immediately observe its state.
2. **Expect**: the task is marked complete instantly; the animation does not gate or delay it.

### 5. Reduced-motion fallback (C-5, SC-003)

1. Enable reduced motion at the OS level:
   - macOS: System Settings → Accessibility → Display → **Reduce motion**.
   - Or emulate in DevTools: Rendering panel → **Emulate CSS `prefers-reduced-motion: reduce`**.
2. Reload, then complete a task.
3. **Expect**: a single soft, minimal-motion acknowledgement (e.g. one gentle ring) — **not**
   a multi-particle spray.

### 6. Rapid successive completions (C-9, SC-004)

1. Quickly check off 5 tasks in a row.
2. **Expect**: 5 independent acknowledgements, no visible jank, and no leftover elements in
   the DOM after they finish.

### 7. Containment on small/scrolled viewports (edge cases)

1. Narrow the window / scroll, then complete a task near an edge.
2. **Expect**: the burst stays visually contained, introduces no horizontal scroll, and never
   permanently covers or blocks controls (the overlay ignores pointer input).

### 8. Calm / no-scoreboard check (C-6, C-7, Principles I & II)

1. Complete several tasks.
2. **Expect**: muted theme-matched colors and gentle motion; **no** counts, streaks, points,
   ranks, comparisons, flashing, or guilt/urgency messaging anywhere.

## Reconciliation check (existing implementation)

Because a celebration already exists in the codebase, also confirm the shipped behavior
matches this spec — in particular C-3 (no effect on un-complete), C-5 (reduced-motion), and
C-8 (overlay is `pointer-events: none` / decorative). Note any divergence for `/speckit-tasks`.
