<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project rules

This is a **Spec Kit** (spec-driven development) project. The Claude integration is
installed under `.claude/`; do not delete or hand-edit those managed files.

## The constitution is binding

`.specify/memory/constitution.md` is the source of truth for this codebase. Read it
before proposing or writing any feature code, and treat its principles as hard
constraints, not suggestions. In particular:

- **Calm, non-judgmental UX** — no shame UI, no anxiety loops, no scoreboards.
- **Day Garden & Night Camp** — dual worlds on one day-cycle (see constitution
  *Product Model* and `docs/product-model.md`). Day is work-primary (bonsai + frogs +
  wilt in the work window). Night is bonus (separate ledger; fireflies / campfire /
  stars / moon; frogs participate). Bonsai sleeps outside work hours; UI stays
  usable; atmosphere may dim but MUST NOT force light↔dark Appearance. Work window
  defaults to 8 AM–5 PM local, user-configurable in Options (AM/PM UI).
- **Local-first & private** — on-device storage only for v1; no backend, auth, or
  telemetry unless a spec explicitly opts in.
- **Accessibility is not optional** — keyboard + screen-reader support, `prefers-reduced-motion`
  fallbacks, WCAG AA contrast (including under night dim/overlay).
- **MUI must be re-themed**, never used stock; motion via Framer Motion, used sparingly.
- **YAGNI / simplicity** — don't build for hypothetical future scale.

If a request conflicts with the constitution, flag it before implementing.

## Spec-driven workflow

Every feature moves through the Spec Kit flow, in order. Use the corresponding skills:

1. `/speckit-specify` — write/update the spec
2. `/speckit-clarify` — resolve ambiguities (as needed)
3. `/speckit-plan` — produce the implementation plan
4. `/speckit-tasks` — generate the dependency-ordered task list
5. `/speckit-implement` — execute the tasks

Related skills: `/speckit-analyze`, `/speckit-checklist`, `/speckit-converge`,
`/speckit-constitution`, `/speckit-taskstoissues`.

- Feature artifacts live in `specs/<NNN-feature-name>/` (`spec.md`, `plan.md`,
  `tasks.md`, etc.). The active feature is tracked in `.specify/feature.json`.
- Don't jump straight to code for a new feature — start from the spec.
- Any change touching visual design (color, spacing, motion) must be checked against
  the constitution's calm-UX and design-system principles before being marked done.
- Any change touching day/night realms, wilt windows, work hours, or garden summaries
  must honor the Day Garden & Night Camp product model in the constitution.

## Managing the Spec Kit integration

The Claude integration is already installed and healthy. **Do not run
`specify init --here`** on this populated repo. To add another agent or refresh
managed files, use the non-destructive commands instead:

```bash
specify integration status     # read-only health check
specify integration upgrade    # diff-aware refresh, preserves local edits
specify integration install <agent>
```
