# Implementation Plan: Full-Screen Frog Celebration & Frog Favicon

**Branch**: `013-frog-celebration-favicon` | **Date**: 2026-07-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/013-frog-celebration-favicon/spec.md`

## Summary

Two small, independent UI changes. (1) The frog-kind celebration in `Celebration.tsx` moves from a small 280×280 Lottie burst positioned at the checkbox's click coordinates to a full-viewport-fixed overlay, letting the ribbon animation scale up to fill the viewport (contained, not distorted or cropped) — the regular "task" kind and the existing reduced-motion `SoftRing` fallback are both untouched. (2) The static `favicon.ico` is replaced by a generated `app/icon.tsx` using Next.js's documented `ImageResponse` (`next/og`) file convention, rendering the 🐸 emoji — confirmed against this installed version's own docs, not a fork divergence, and emoji rendering is a first-class built-in option (`emoji: 'twemoji'` by default).

## Technical Context

**Language/Version**: TypeScript 5, React 19, Next.js 16 (App Router) — unchanged.

**Primary Dependencies**: No new dependencies. Reuses `lottie-react` (already rendering the existing ribbon/confetti Lottie assets) and Framer Motion (already used for `SoftRing`) for the celebration change; uses `next/og`'s `ImageResponse`, which ships as part of the already-installed `next` package, for the favicon.

**Storage**: N/A — no data, no persistence involved in either change.

**Testing**: No automated suite (project convention). Gate = `tsc --noEmit` + `eslint --max-warnings=0` clean, then manual verification against `quickstart.md` in the browser preview (including `prefers-reduced-motion` and a mobile-width viewport check for the celebration, and a real tab-icon check for the favicon).

**Target Platform**: Modern desktop + mobile web browsers, client-rendered.

**Project Type**: Single Next.js web app (no backend).

**Performance Goals**: Negligible — no new assets, no new network requests; `icon.tsx` is a build/request-time generated image Next.js already caches per its own icon-route handling, same mechanism used for any Next.js-generated icon.

**Constraints**: `prefers-reduced-motion` must still be honored for the frog celebration (Principle IV) — achieved by leaving the existing `SoftRing` reduced-motion path completely untouched (see research.md Decision 2); no new dependencies (Principle VI); MUI/theme untouched (neither change touches a themed component).

**Scale/Scope**: Two tightly scoped edits: `src/components/Celebration.tsx` (frog-kind sizing/positioning only) and a new `src/app/icon.tsx` replacing `src/app/favicon.ico`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Assessment |
|---|---|
| I. Calm Technology | PASS — a bigger celebration for the day's one designated "frog" reinforces the app's own "swallow the frog first" framing rather than adding noise; it's still a brief, self-clearing, positive moment, not an urgency/attention-grabbing pattern. |
| II. Subtle Gamification, Not Scoreboards | PASS — no score/number introduced; this is purely a bigger version of an existing organic visual reward for the app's one already-special task, consistent with how "frog" completions already get more (leaves/frogs) than regular tasks per feature 008. |
| III. Local-First & Private | PASS — no data, no network, no new storage. |
| IV. Accessibility | PASS — `prefers-reduced-motion` handling is fully preserved (the reduced-motion path is untouched, FR-003); celebration overlay is already `aria-hidden` and `pointerEvents: "none"` (unchanged) so it never traps focus or blocks interaction (FR-004). |
| V. Design System Discipline | PASS — no MUI component touched; the celebration overlay and favicon are both outside MUI's remit, consistent with how the existing celebration system already works. |
| VI. Simplicity & Performance (YAGNI) | PASS — no new dependencies, no new asset files; reuses the existing ribbon Lottie asset just resized, and Next.js's own documented icon-generation convention for the favicon rather than hand-rolling icon files. |
| VII. Sound Is Calm & Shared | N/A — no audio involved in either change. |

No violations. No complexity to track.

## Project Structure

### Documentation (this feature)

```text
specs/013-frog-celebration-favicon/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md         # Phase 1 output
├── quickstart.md         # Phase 1 output
├── contracts/
│   └── celebration-frog-kind-contract.md   # Celebration.tsx's frog-kind rendering contract
├── checklists/
│   └── requirements.md  # from /speckit-specify
└── tasks.md              # Phase 2 (/speckit-tasks — not created here)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── Celebration.tsx     # EDIT — LottieBurst: when item.kind === "frog", render
│                             #        inside a position:fixed, inset:0, flex-centered
│                             #        overlay (not absolutely positioned at item.x/item.y)
│                             #        sized to fill the viewport (contained, not
│                             #        distorted); "task" kind and SoftRing unchanged
└── app/
    ├── favicon.ico          # REMOVE — superseded by icon.tsx
    └── icon.tsx              # NEW — default-exports a function using ImageResponse
                                #        from next/og, rendering the 🐸 emoji;
                                #        exports `size`/`contentType` per Next.js's
                                #        documented icon-generation convention
```

**Structure Decision**: Single Next.js web app. Both changes are minimal, targeted edits — one function's rendering branch in an existing component, and one new file replacing one static asset, using a documented first-class Next.js convention. No new modules, no new dependencies.

## Key design decisions (detail in research.md)

- **Full-screen frog celebration = fixed-viewport overlay + contained scaling, not a literal edge-to-edge square stretch**: since the ribbon asset is square (400×400) and viewports aren't, "full width" is interpreted as filling the viewport as large as possible without distortion or cropping (Lottie's default `preserveAspectRatio` "meet" behavior inside a `position: fixed; inset: 0` flex-centered container) — reads as full-screen/prominent without looking stretched or clipped on any aspect ratio.
- **Reduced-motion path is untouched**: `SoftRing` keeps its existing small, click-positioned appearance for every kind including "frog" when `prefers-reduced-motion` is set — this already satisfies FR-003 (a non-full-motion alternative) with zero new code, and is the more conservative, spec-aligned choice (Principle IV favors minimal motion, not a scaled-up ring).
- **Favicon via `ImageResponse`, not a hand-authored asset**: uses this installed Next.js version's documented `app/icon.tsx` convention (verified against `node_modules/next/dist/docs`, not assumed from training data per `AGENTS.md`'s warning) — the `ImageResponse`'s built-in `emoji: 'twemoji'` default handles colored emoji rendering correctly out of the box, no extra config needed.
- **Remove `favicon.ico` rather than keep both**: having both a static `favicon.ico` and a generated `icon.tsx` risks browser-inconsistent icon selection (FR-007 requires one consistent icon across surfaces) — one clear source avoids that ambiguity.

## Complexity Tracking

> No Constitution violations requiring justification.
