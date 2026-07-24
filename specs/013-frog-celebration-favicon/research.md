# Phase 0 Research: Full-Screen Frog Celebration & Frog Favicon

No `NEEDS CLARIFICATION` markers remain in the Technical Context — both changes are small enough that direct inspection of the installed codebase and this Next.js version's own docs fully resolved the open questions.

## Decision 1: "Full width" = viewport-fixed, aspect-preserving containment, not a literal square stretch

**Decision**: When `item.kind === "frog"`, `LottieBurst` renders inside a `position: fixed; inset: 0; display: flex; align-items: center; justify-content: center` container (replacing the current `position: absolute; left/top: item.x/item.y` centered-on-click-point approach) sized to `width: 100%; height: 100%` (or a large percentage), relying on Lottie's default `preserveAspectRatio="xMidYMid meet"` behavior to scale the square 400×400 ribbon asset as large as it can go without being cropped or distorted by a non-square viewport.

**Rationale**: The ribbon asset is square; a literal "stretch to 100vw width" on a typical desktop viewport (e.g. 1200×800) would make it 1200×1200 — taller than the screen, overflowing top and bottom. "Meet" containment (the standard SVG/Lottie scaling mode) instead scales the asset to the *smaller* of the two available dimensions, so it's always fully visible, centered, and as large as the viewport allows — which is what "full screen and full width" reads as in practice (dominant, screen-filling, not literally edge-to-edge in one axis while overflowing the other).

**Alternatives considered**: Literally setting `width: 100vw` and letting height follow the aspect ratio (potential vertical overflow/scroll) — rejected, would look broken on most desktop aspect ratios and could introduce unwanted page scroll during the celebration. Cropping the asset to force a non-square fill — rejected, distorts/clips the existing ribbon artwork unnecessarily for a purely cosmetic ask.

## Decision 2: Reduced-motion fallback stays exactly as-is

**Decision**: `SoftRing` is not modified. It continues to render its existing small ring at `item.x`/`item.y` for every celebration kind, including "frog," when `prefers-reduced-motion` is set.

**Rationale**: Principle IV calls for animation to fall back to "instant or minimal-motion states" under reduced motion — a small, brief ring is already exactly that, and scaling it up to full-screen would work against the spirit of the preference (a large-format animation is still a large-format animation, reduced-motion users are opting out of visual spectacle, not just speed). This also means FR-003 is satisfied with zero new code.

**Alternatives considered**: A full-screen but static/non-animated "frog" indicator for reduced motion — rejected as unnecessary scope for a preference that's specifically about minimizing motion, not about celebration size; the existing small ring already communicates completion.

## Decision 3: Favicon via Next.js's documented `icon.tsx` + `ImageResponse` convention

**Decision**: Delete `src/app/favicon.ico`; add `src/app/icon.tsx` default-exporting a function that returns `new ImageResponse(<div>🐸</div>, { ...size })`, with `export const size = { width: 32, height: 32 }` and `export const contentType = "image/png"`.

**Rationale**: Directly confirmed against this installed Next.js version's own documentation (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/app-icons.md`) — the `icon.(js|ts|tsx)` file convention using `ImageResponse` from `next/og` is documented exactly as it is in upstream Next.js, so despite `AGENTS.md`'s general warning about assuming stock behavior in this fork, this specific convention isn't diverged. `ImageResponse` additionally has a built-in `emoji` option (default `'twemoji'`, confirmed in `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/image-response.md`) specifically so emoji render as their real colored glyphs rather than a monochrome/tofu fallback — no extra configuration needed for correct frog-emoji rendering.

**Alternatives considered**: Hand-authoring a new `favicon.ico` binary containing a frog image — rejected, requires an external image-editing step outside the codebase and doesn't render live emoji glyphs as crisply/consistently as `ImageResponse`'s emoji handling; also can't be produced or verified by code alone. Keeping both `favicon.ico` and `icon.tsx` side by side — rejected per FR-007 (one consistent icon), since browsers can pick inconsistently between multiple declared icons.

## Confirmed: no new dependency needed for either change

`lottie-react` and `framer-motion` (celebration) and `next/og`'s `ImageResponse` (favicon) are all already available via the installed `next` and existing `package.json` dependencies — nothing new to add.
