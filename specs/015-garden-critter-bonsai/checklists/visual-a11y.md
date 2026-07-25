# Checklist: Visual & Accessibility — 015 Garden Critter & Bonsai

**Purpose**: Manual unit-tests for calm visual + a11y acceptance  
**Created**: 2026-07-25  
**Feature**: [spec.md](../spec.md)

## Visual calm

- [ ] Ground frogs larger/wider but pot remains readable at MAX_FROGS
- [ ] Tree more present but not a mural; card layout intact
- [ ] Frog-fruit multi-color, theme-aware, not neon/garish
- [ ] No pink blossom dots remain as blossom reward
- [ ] Wilt: tree/leaves wilt; frogs + fruit stay cheerful

## Accessibility

- [ ] Bonsai still single `role="img"` with stage label
- [ ] Critters/fruit decorative (no extra interactive tabs)
- [ ] `prefers-reduced-motion`: instant/minimal appear; nothing invisible
- [ ] Theme light/dark: fruit and leaves remain calm and legible enough as decoration

## Verification gate

- [ ] `tsc --noEmit` clean
- [ ] eslint clean on touched files
