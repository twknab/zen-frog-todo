# Quickstart / Manual Verification: Hyper Minimal Mode

## Prerequisites

- App running locally (`npm run dev`)
- Clean or known localStorage

## Checklist

1. [ ] Fresh load: full chrome visible (Frog Garden wordmark, frog logo, tagline, card titles).
2. [ ] Open Options → enable **Hyper Minimal** → popover stays open.
3. [ ] Brand/wordmark/logo/tagline hidden; card/section titles and helper captions hidden.
4. [ ] Bonsai, frogs/critters/fruit, sand, tasks, timer still usable.
5. [ ] Flow ↔ Focus: Hyper Minimal still applied; mode switch still labeled.
6. [ ] Export / Notepad / Options still work; icon controls have accessible names.
7. [ ] Reload → Hyper Minimal still on.
8. [ ] Open Options (labels visible) → disable Hyper Minimal → chrome restored.
9. [ ] With Hyper Minimal on and empty data: Completed, Standup, Grove, and frog card (no frog) are absent — no blank shells. Task list, reflection, sand, timer, bonsai remain.
10. [ ] Complete a task / choose a frog / archive sand → corresponding panels reappear under Hyper Minimal.
11. [ ] Hyper Minimal off → empty-state helper copy returns for those panels.
12. [ ] Keyboard: tab through header + primary controls with Hyper Minimal on.
13. [ ] `tsc --noEmit` and `eslint --max-warnings=0` clean.
