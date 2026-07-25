# Checklist: Visual & Accessibility — 015 Garden Critter & Bonsai

**Purpose**: Manual unit-tests for calm visual + a11y acceptance  
**Created**: 2026-07-25  
**Feature**: [spec.md](../spec.md)

## Visual calm

- [x] Ground frogs larger/wider but pot remains readable at MAX_FROGS
- [x] Tree more present but not a mural; card layout intact
- [x] Frog-fruit multi-color, theme-aware, not neon/garish
- [x] No pink blossom dots remain as blossom reward
- [x] Wilt: tree/leaves wilt; frogs + fruit stay cheerful

## Accessibility

- [x] Bonsai still single `role="img"` with stage label
- [x] Critters/fruit decorative (no extra interactive tabs)
- [x] `prefers-reduced-motion`: instant/minimal appear; nothing invisible
- [x] Theme light/dark: fruit and leaves remain calm and legible enough as decoration

## Verification gate

- [x] `tsc --noEmit` clean
- [x] eslint clean on touched files
