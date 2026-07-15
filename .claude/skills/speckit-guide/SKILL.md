---
name: "speckit-guide"
description: "Interactive companion for the GitHub Spec Kit workflow (constitution, specify, clarify, plan, tasks, analyze, checklist, implement, converge, taskstoissues) in this repo. Runs each speckit-* skill for real, but pauses after every phase to review output and decide next steps together instead of firing all commands unattended. Use when starting a new feature spec, resuming one in progress, or wanting a guided tour of what a spec-kit command does before running it."
---

## Purpose

This is an **orchestrator**, not a replacement for the `speckit-*` skills themselves (already installed in `.claude/skills/` by the [spec-kit](https://github.com/github/spec-kit) CLI). Its job is to walk the user through them in the right order, actually invoke them via the `Skill` tool, and keep the human in the loop at every decision point. Quality of the resulting spec/plan/tasks matters more than speed — never rush past a gate to "finish the workflow."

## Step 0 — Establish context

This repo's remote is GitHub (`origin` → `github.com/twknab/zen-frog-todo`), so unlike GitLab-hosted projects, `speckit-taskstoissues` (Phase J) is fully usable here — no need to check the remote before offering it.

## Step 1 — New feature or resume?

Check `specs/` for existing feature directories. For each, note which of `spec.md`, `plan.md`, `tasks.md`, `checklists/` exist, and whether `tasks.md` has any unchecked `- [ ]` items.

- **New feature**: go to Phase A.
- **Resume**: show the user a quick status table (feature → phases completed → outstanding items) and ask which one to continue, then jump to the matching phase below rather than restarting from Phase A.
- **Just explain**: if the user only wants to understand a command before committing to a run, summarize that one phase from the table below and stop — don't invoke anything.

## The phase pipeline

| Phase | Skill | Purpose | Typical gate before moving on |
|---|---|---|---|
| A | `speckit-constitution` | Set/amend project principles (rare — once per repo, not per feature) | Only run if missing or the user is intentionally amending it |
| B | `speckit-specify` | Turn a feature description into `spec.md` (+ requirements quality checklist) | Spec reads right to the user; ≤3 `[NEEDS CLARIFICATION]` resolved |
| C | `speckit-clarify` | Ask up to 5 targeted questions, encode answers into the spec | Recommended before every `plan`; skipping needs explicit user override |
| D | `speckit-plan` | Generate `research.md`, `data-model.md`, `contracts/`, `quickstart.md` | User is happy with architecture/tech choices made in research.md |
| E | `speckit-tasks` | Generate dependency-ordered `tasks.md` by user story | User agrees with MVP scope and story breakdown |
| F | `speckit-analyze` | Read-only cross-check of spec/plan/tasks consistency | No unresolved CRITICAL findings before `implement` |
| G | `speckit-checklist` | Optional custom "unit tests for requirements" (security, a11y, perf, etc.) | Offer proactively for auth/PII/payments/public-API features |
| H | `speckit-implement` | Execute `tasks.md` | All checklists pass (or user explicitly accepts gaps) |
| I | `speckit-converge` | Diff codebase against spec/plan/tasks, append remaining work | Loop with H until outcome is "converged" |
| J | `speckit-taskstoissues` | Convert tasks to GitHub issues | Optional — dedupes against existing issues automatically |

## Execution protocol (non-negotiable)

1. **Never chain two `speckit-*` skills back to back without checking in.** After each one finishes, summarize what it produced in your own words (not just relayed completion text), and ask whether to adjust, re-run, or advance. Exception: a skill's *own* internal interaction loop (e.g. `specify`'s clarification markers, `clarify`'s question loop) is already interactive — don't add a redundant outer gate mid-skill.
2. **Sharpen the input to `speckit-specify` before running it.** If the user's feature description is a thin one-liner, ask 2-4 quick questions first (who's it for, core job-to-be-done, known constraints/out-of-scope, how we'll know it worked) and fold the answers into the description you pass in. A better `$ARGUMENTS` produces a better spec — don't just forward a vague sentence.
3. **Never silently skip `speckit-clarify`.** If the user wants to jump straight to `plan`, warn them explicitly (same as the underlying skill does) that this increases downstream rework risk, and get an explicit "yes, skip it" before proceeding.
4. **Always run `speckit-analyze` before `speckit-implement`.** It's read-only and cheap — there's no good reason to skip it. If it reports CRITICAL or HIGH findings, stop and work through remediation with the user before moving to implementation; don't just note the findings and barrel forward.
5. **Offer `speckit-checklist` proactively**, not just on request, whenever the feature touches auth, payments, PII, or a public/external API.
6. **Don't let `speckit-implement` run silently to completion on a large tasks.md.** Check in after each user-story phase completes, especially where the plan flagged an open design decision — this is a chance to catch drift early, not just a status update.
7. **After implement, run `speckit-converge` and loop** (converge → implement) until the outcome is "converged" or the user says stop. Cap at 3 converge rounds before pausing to ask the user how they want to proceed — an endless loop usually means the spec itself needs revisiting, not more converge passes.
8. **Offer `speckit-taskstoissues` once tasks exist and the user wants GitHub issue tracking for the feature.** It's safe to re-run — it dedupes against existing issues by task ID before creating new ones.
9. **Constitution is project-level, not per-feature.** Check `.specify/memory/constitution.md` once per session — if it's still full of `[PLACEHOLDER]` tokens or missing, offer to run `speckit-constitution` first; otherwise skip straight to Phase B and just mention it's already in place.

## Phase-by-phase notes

**A — Constitution**: Only surface this if the constitution looks unfilled or the user explicitly wants to amend a principle. Invoke `Skill(speckit-constitution, args=<principles or amendment request>)`.

**B — Specify**: After sharpening the description (protocol #2), invoke `Skill(speckit-specify, args=<the sharpened description>)`. Read the resulting `spec.md` and the requirements-quality checklist result yourself before reporting back — call out anything that reads generically or seems to be guessing rather than genuinely capturing the request.

**C — Clarify**: Invoke `Skill(speckit-clarify)`. This runs its own question loop with the user — just let it happen naturally in the conversation.

**D — Plan**: Ask if the user has any architecture/tech constraints to pass in before invoking `Skill(speckit-plan, args=<constraints if any>)`. Walk through `research.md` decisions with the user — this is the best point to catch a wrong technical direction before tasks get generated from it.

**E — Tasks**: Invoke `Skill(speckit-tasks)`. Confirm the proposed MVP scope (usually just User Story 1) and story priority order match what the user actually wants shipped first.

**F — Analyze**: Invoke `Skill(speckit-analyze)`. This is read-only — always safe to run. Apply protocol #4.

**G — Checklist**: If offered and accepted, invoke `Skill(speckit-checklist, args=<domain/focus>)`. Can run multiple times for different domains (`security.md`, `ux.md`, etc.) — each appends rather than overwrites.

**H — Implement**: Invoke `Skill(speckit-implement)`. Apply protocol #6.

**I — Converge**: Invoke `Skill(speckit-converge)`. If it appends tasks, loop back to H. If "converged", tell the user this feature's specified scope is done and it's ready for review/PR.

**J — Tasks to issues**: Offer once tasks exist. Invoke `Skill(speckit-taskstoissues)` if the user wants each task tracked as a GitHub issue.

## Quality bar

- Read every generated artifact yourself before summarizing it to the user — don't relay a skill's own completion message as if it were your review.
- If something reads as generic, hand-wavy, or clearly guessed rather than grounded in what the user actually described, say so and offer to re-run that phase with better input rather than letting it ride.
- The user asked for this precisely to avoid running commands blind — treat every phase boundary as a real checkpoint, not a formality.
