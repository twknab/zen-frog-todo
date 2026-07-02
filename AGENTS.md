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
- **Local-first & private** — on-device storage only for v1; no backend, auth, or
  telemetry unless a spec explicitly opts in.
- **Accessibility is not optional** — keyboard + screen-reader support, `prefers-reduced-motion`
  fallbacks, WCAG AA contrast.
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

## Managing the Spec Kit integration

The Claude integration is already installed and healthy. **Do not run
`specify init --here`** on this populated repo. To add another agent or refresh
managed files, use the non-destructive commands instead:

```bash
specify integration status     # read-only health check
specify integration upgrade    # diff-aware refresh, preserves local edits
specify integration install <agent>
```
