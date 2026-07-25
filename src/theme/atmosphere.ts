/**
 * Garden atmosphere — soft layered washes + grain per palette / appearance.
 * Used by GardenBackdrop; kept separate from MUI palette tokens so CssBaseline
 * still owns the flat fallback color while atmosphere sits behind content.
 */

import { normalizePaletteId, type ColorMode, type PaletteId } from "./theme";

export type GardenAtmosphere = {
  /** Soft radial / linear layers stacked behind content (comma-joined CSS). */
  wash: string;
  /** Optional second-layer organic blob positions (CSS backgrounds). */
  mist: string;
  /** Grain opacity — keep low for calm performance. */
  grainOpacity: number;
};

const grainSvg = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160">
    <filter id="n">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
    <rect width="100%" height="100%" filter="url(#n)" opacity="0.55"/>
  </svg>`,
);

/** Shared noise tile — SVG data URI, no network asset. */
export const GARDEN_GRAIN_URL = `url("data:image/svg+xml,${grainSvg}")`;

type AtmospherePair = { light: GardenAtmosphere; dark: GardenAtmosphere };

function pair(
  light: Omit<GardenAtmosphere, "grainOpacity"> & { grainOpacity?: number },
  dark: Omit<GardenAtmosphere, "grainOpacity"> & { grainOpacity?: number },
): AtmospherePair {
  return {
    light: { grainOpacity: 0.04, ...light },
    dark: { grainOpacity: 0.055, ...dark },
  };
}

const atmospheres: Record<PaletteId, AtmospherePair> = {
  natural: pair(
    {
      wash: [
        "radial-gradient(ellipse 85% 65% at 8% 0%, rgba(147, 180, 154, 0.16), transparent 55%)",
        "radial-gradient(ellipse 70% 55% at 95% 90%, rgba(185, 140, 91, 0.12), transparent 55%)",
        "radial-gradient(ellipse 50% 40% at 55% 35%, rgba(251, 249, 244, 0.5), transparent 60%)",
        "linear-gradient(165deg, #F8F5EE 0%, #F6F3EC 45%, #F3EFE6 100%)",
      ].join(", "),
      mist: "radial-gradient(ellipse 55% 40% at 28% 65%, rgba(227, 223, 211, 0.55), transparent 70%)",
      grainOpacity: 0.035,
    },
    {
      wash: [
        "radial-gradient(ellipse 80% 60% at 10% 5%, rgba(143, 181, 151, 0.12), transparent 55%)",
        "radial-gradient(ellipse 65% 50% at 95% 85%, rgba(210, 168, 120, 0.1), transparent 55%)",
        "radial-gradient(ellipse 40% 30% at 50% 40%, rgba(236, 231, 219, 0.04), transparent 60%)",
        "linear-gradient(168deg, #1E1B17 0%, #1B1916 55%, #201C18 100%)",
      ].join(", "),
      mist: "radial-gradient(ellipse 50% 35% at 30% 70%, rgba(143, 181, 151, 0.06), transparent 65%)",
      grainOpacity: 0.05,
    },
  ),

  prism: pair(
    {
      wash: [
        "radial-gradient(ellipse 95% 75% at 8% 5%, rgba(185, 120, 255, 0.32), transparent 55%)",
        "radial-gradient(ellipse 70% 55% at 92% 12%, rgba(14, 155, 184, 0.22), transparent 52%)",
        "radial-gradient(ellipse 80% 60% at 78% 92%, rgba(225, 29, 107, 0.16), transparent 58%)",
        "radial-gradient(ellipse 55% 45% at 22% 78%, rgba(22, 163, 74, 0.14), transparent 55%)",
        "linear-gradient(160deg, #F8F4FF 0%, #F5F2FF 40%, #FFF5FB 100%)",
      ].join(", "),
      mist: [
        "radial-gradient(circle at 25% 35%, rgba(251, 140, 90, 0.1), transparent 38%)",
        "radial-gradient(circle at 80% 60%, rgba(185, 120, 255, 0.12), transparent 42%)",
      ].join(", "),
      grainOpacity: 0.045,
    },
    {
      wash: [
        "radial-gradient(ellipse 90% 70% at 12% 8%, rgba(180, 90, 255, 0.28), transparent 58%)",
        "radial-gradient(ellipse 70% 60% at 88% 18%, rgba(52, 217, 232, 0.22), transparent 55%)",
        "radial-gradient(ellipse 75% 55% at 70% 88%, rgba(251, 111, 146, 0.2), transparent 60%)",
        "radial-gradient(ellipse 50% 40% at 30% 70%, rgba(74, 222, 128, 0.14), transparent 55%)",
        "linear-gradient(165deg, #1a1230 0%, #141021 45%, #1c1435 100%)",
      ].join(", "),
      mist: [
        "radial-gradient(circle at 20% 40%, rgba(251, 191, 36, 0.08), transparent 35%)",
        "radial-gradient(circle at 75% 55%, rgba(180, 90, 255, 0.1), transparent 40%)",
      ].join(", "),
      grainOpacity: 0.07,
    },
  ),

  violethour: pair(
    {
      wash: [
        "radial-gradient(ellipse 90% 70% at 12% 8%, rgba(123, 107, 168, 0.18), transparent 58%)",
        "radial-gradient(ellipse 65% 50% at 88% 80%, rgba(196, 163, 90, 0.1), transparent 55%)",
        "radial-gradient(ellipse 45% 35% at 60% 25%, rgba(95, 143, 110, 0.08), transparent 50%)",
        "linear-gradient(170deg, #F6F3FA 0%, #F3F0F8 50%, #EFEAF6 100%)",
      ].join(", "),
      mist: "radial-gradient(ellipse 45% 35% at 35% 55%, rgba(228, 223, 240, 0.7), transparent 70%)",
    },
    {
      wash: [
        "radial-gradient(ellipse 85% 65% at 15% 10%, rgba(123, 107, 168, 0.28), transparent 60%)",
        "radial-gradient(ellipse 70% 55% at 90% 75%, rgba(42, 36, 80, 0.55), transparent 55%)",
        "radial-gradient(ellipse 50% 40% at 55% 30%, rgba(168, 154, 212, 0.1), transparent 50%)",
        "linear-gradient(175deg, #1a1632 0%, #16122A 50%, #1c1735 100%)",
      ].join(", "),
      mist: "radial-gradient(ellipse 40% 30% at 40% 60%, rgba(181, 168, 212, 0.08), transparent 70%)",
    },
  ),

  webring: pair(
    {
      wash: [
        "radial-gradient(ellipse 85% 65% at 8% 5%, rgba(21, 122, 44, 0.14), transparent 55%)",
        "radial-gradient(ellipse 70% 55% at 95% 15%, rgba(196, 30, 106, 0.14), transparent 52%)",
        "radial-gradient(ellipse 75% 55% at 80% 92%, rgba(14, 155, 184, 0.16), transparent 58%)",
        "linear-gradient(160deg, #FAF7EC 0%, #F7F4E8 45%, #F2EEF8 100%)",
      ].join(", "),
      mist: [
        "radial-gradient(circle at 25% 40%, rgba(60, 184, 74, 0.12), transparent 38%)",
        "radial-gradient(circle at 78% 58%, rgba(224, 74, 138, 0.12), transparent 42%)",
      ].join(", "),
      grainOpacity: 0.05,
    },
    {
      wash: [
        "radial-gradient(ellipse 80% 60% at 10% 8%, rgba(93, 222, 106, 0.24), transparent 55%)",
        "radial-gradient(ellipse 70% 55% at 92% 20%, rgba(255, 107, 181, 0.22), transparent 55%)",
        "radial-gradient(ellipse 65% 50% at 70% 90%, rgba(62, 232, 255, 0.2), transparent 58%)",
        "linear-gradient(165deg, #1a1e34 0%, #14182A 50%, #1c1838 100%)",
      ].join(", "),
      mist: [
        "radial-gradient(circle at 30% 45%, rgba(255, 208, 74, 0.1), transparent 35%)",
        "radial-gradient(circle at 75% 60%, rgba(62, 232, 255, 0.12), transparent 40%)",
      ].join(", "),
      grainOpacity: 0.065,
    },
  ),

  goldhour: pair(
    {
      wash: [
        "radial-gradient(ellipse 95% 70% at 50% -5%, rgba(232, 168, 90, 0.32), transparent 55%)",
        "radial-gradient(ellipse 70% 55% at 8% 85%, rgba(224, 112, 85, 0.14), transparent 55%)",
        "radial-gradient(ellipse 60% 45% at 92% 75%, rgba(212, 154, 58, 0.16), transparent 55%)",
        "linear-gradient(165deg, #FFF8F0 0%, #FFF4E8 45%, #FFEDE0 100%)",
      ].join(", "),
      mist: "radial-gradient(ellipse 55% 40% at 35% 50%, rgba(255, 220, 180, 0.55), transparent 70%)",
      grainOpacity: 0.035,
    },
    {
      wash: [
        "radial-gradient(ellipse 90% 70% at 50% 0%, rgba(232, 137, 90, 0.32), transparent 55%)",
        "radial-gradient(ellipse 70% 55% at 10% 80%, rgba(232, 192, 106, 0.16), transparent 55%)",
        "radial-gradient(ellipse 55% 45% at 90% 70%, rgba(194, 78, 50, 0.18), transparent 55%)",
        "linear-gradient(170deg, #2c1c12 0%, #241810 50%, #2a1a14 100%)",
      ].join(", "),
      mist: "radial-gradient(ellipse 50% 35% at 40% 55%, rgba(240, 192, 96, 0.1), transparent 65%)",
      grainOpacity: 0.05,
    },
  ),

  tideglass: pair(
    {
      wash: [
        "radial-gradient(ellipse 90% 70% at 12% 8%, rgba(62, 207, 190, 0.24), transparent 55%)",
        "radial-gradient(ellipse 65% 50% at 88% 85%, rgba(46, 143, 168, 0.16), transparent 55%)",
        "radial-gradient(ellipse 45% 35% at 55% 30%, rgba(200, 232, 226, 0.6), transparent 55%)",
        "linear-gradient(170deg, #F0FBF8 0%, #E8F8F4 50%, #E0F4F0 100%)",
      ].join(", "),
      mist: "radial-gradient(ellipse 50% 40% at 30% 60%, rgba(200, 232, 226, 0.65), transparent 70%)",
      grainOpacity: 0.035,
    },
    {
      wash: [
        "radial-gradient(ellipse 85% 65% at 15% 10%, rgba(62, 207, 190, 0.26), transparent 58%)",
        "radial-gradient(ellipse 70% 55% at 90% 80%, rgba(90, 184, 212, 0.2), transparent 55%)",
        "radial-gradient(ellipse 50% 40% at 55% 35%, rgba(122, 232, 255, 0.1), transparent 50%)",
        "linear-gradient(175deg, #122c30 0%, #0E2428 50%, #143438 100%)",
      ].join(", "),
      mist: "radial-gradient(ellipse 45% 35% at 35% 60%, rgba(110, 224, 212, 0.1), transparent 65%)",
      grainOpacity: 0.05,
    },
  ),

  borealis: pair(
    {
      wash: [
        "radial-gradient(ellipse 100% 70% at 20% 0%, rgba(46, 184, 106, 0.28), transparent 55%)",
        "radial-gradient(ellipse 80% 60% at 85% 15%, rgba(90, 108, 255, 0.28), transparent 52%)",
        "radial-gradient(ellipse 75% 55% at 70% 95%, rgba(224, 64, 160, 0.22), transparent 58%)",
        "radial-gradient(ellipse 50% 40% at 10% 70%, rgba(74, 222, 128, 0.16), transparent 55%)",
        "linear-gradient(160deg, #F0F7FF 0%, #EEF6FF 40%, #F8F0FF 100%)",
      ].join(", "),
      mist: [
        "radial-gradient(circle at 30% 40%, rgba(129, 140, 248, 0.14), transparent 40%)",
        "radial-gradient(circle at 75% 55%, rgba(244, 114, 182, 0.12), transparent 42%)",
      ].join(", "),
      grainOpacity: 0.045,
    },
    {
      wash: [
        "radial-gradient(ellipse 95% 70% at 15% 5%, rgba(74, 222, 128, 0.28), transparent 55%)",
        "radial-gradient(ellipse 80% 60% at 90% 20%, rgba(129, 140, 248, 0.32), transparent 52%)",
        "radial-gradient(ellipse 70% 55% at 60% 90%, rgba(244, 114, 182, 0.26), transparent 58%)",
        "radial-gradient(ellipse 45% 35% at 25% 60%, rgba(251, 191, 36, 0.1), transparent 50%)",
        "linear-gradient(165deg, #0c1430 0%, #0A1028 45%, #141028 100%)",
      ].join(", "),
      mist: [
        "radial-gradient(circle at 25% 45%, rgba(74, 222, 128, 0.12), transparent 38%)",
        "radial-gradient(circle at 80% 50%, rgba(192, 132, 252, 0.14), transparent 40%)",
      ].join(", "),
      grainOpacity: 0.065,
    },
  ),

  mirrorball: pair(
    {
      wash: [
        "radial-gradient(ellipse 90% 70% at 10% 5%, rgba(255, 45, 149, 0.28), transparent 55%)",
        "radial-gradient(ellipse 75% 55% at 95% 20%, rgba(255, 216, 74, 0.28), transparent 52%)",
        "radial-gradient(ellipse 70% 55% at 75% 95%, rgba(192, 132, 252, 0.24), transparent 58%)",
        "radial-gradient(ellipse 50% 40% at 20% 75%, rgba(60, 207, 90, 0.18), transparent 55%)",
        "linear-gradient(155deg, #FFF5FA 0%, #FFF0F8 40%, #FFF8EF 100%)",
      ].join(", "),
      mist: [
        "radial-gradient(circle at 35% 35%, rgba(255, 216, 74, 0.16), transparent 38%)",
        "radial-gradient(circle at 70% 65%, rgba(255, 45, 149, 0.14), transparent 42%)",
      ].join(", "),
      grainOpacity: 0.05,
    },
    {
      wash: [
        "radial-gradient(ellipse 90% 70% at 12% 8%, rgba(255, 45, 149, 0.32), transparent 55%)",
        "radial-gradient(ellipse 75% 55% at 90% 18%, rgba(255, 216, 74, 0.26), transparent 52%)",
        "radial-gradient(ellipse 70% 55% at 65% 92%, rgba(192, 132, 252, 0.28), transparent 58%)",
        "radial-gradient(ellipse 45% 35% at 25% 65%, rgba(74, 222, 128, 0.16), transparent 50%)",
        "linear-gradient(165deg, #220E28 0%, #1A0A1E 45%, #2A1030 100%)",
      ].join(", "),
      mist: [
        "radial-gradient(circle at 30% 40%, rgba(255, 216, 74, 0.12), transparent 36%)",
        "radial-gradient(circle at 78% 58%, rgba(255, 45, 149, 0.14), transparent 40%)",
      ].join(", "),
      grainOpacity: 0.07,
    },
  ),

  sugarrush: pair(
    {
      wash: [
        "radial-gradient(ellipse 95% 70% at 15% 0%, rgba(255, 107, 181, 0.3), transparent 55%)",
        "radial-gradient(ellipse 75% 55% at 90% 25%, rgba(107, 184, 255, 0.28), transparent 52%)",
        "radial-gradient(ellipse 70% 55% at 55% 95%, rgba(94, 207, 154, 0.2), transparent 58%)",
        "linear-gradient(160deg, #FFF5FA 0%, #FFF0F6 40%, #F0F7FF 100%)",
      ].join(", "),
      mist: [
        "radial-gradient(circle at 28% 40%, rgba(255, 154, 208, 0.2), transparent 40%)",
        "radial-gradient(circle at 72% 60%, rgba(107, 184, 255, 0.16), transparent 42%)",
      ].join(", "),
      grainOpacity: 0.04,
    },
    {
      wash: [
        "radial-gradient(ellipse 90% 70% at 12% 8%, rgba(255, 107, 181, 0.28), transparent 55%)",
        "radial-gradient(ellipse 75% 55% at 88% 22%, rgba(107, 184, 255, 0.26), transparent 52%)",
        "radial-gradient(ellipse 65% 50% at 60% 90%, rgba(94, 207, 154, 0.18), transparent 58%)",
        "linear-gradient(165deg, #2A1430 0%, #221028 45%, #281830 100%)",
      ].join(", "),
      mist: [
        "radial-gradient(circle at 30% 45%, rgba(255, 107, 181, 0.12), transparent 38%)",
        "radial-gradient(circle at 75% 55%, rgba(107, 184, 255, 0.12), transparent 40%)",
      ].join(", "),
      grainOpacity: 0.06,
    },
  ),

  starfruit: pair(
    {
      wash: [
        "radial-gradient(ellipse 95% 70% at 10% 5%, rgba(168, 85, 247, 0.28), transparent 55%)",
        "radial-gradient(ellipse 75% 55% at 92% 18%, rgba(244, 114, 182, 0.24), transparent 52%)",
        "radial-gradient(ellipse 70% 55% at 70% 92%, rgba(74, 222, 128, 0.16), transparent 58%)",
        "radial-gradient(ellipse 45% 35% at 40% 40%, rgba(251, 191, 36, 0.12), transparent 50%)",
        "linear-gradient(160deg, #F8F4FF 0%, #F4EEFF 40%, #FFF0F8 100%)",
      ].join(", "),
      mist: [
        "radial-gradient(circle at 25% 35%, rgba(192, 132, 252, 0.16), transparent 40%)",
        "radial-gradient(circle at 78% 60%, rgba(244, 114, 182, 0.14), transparent 42%)",
      ].join(", "),
      grainOpacity: 0.045,
    },
    {
      wash: [
        "radial-gradient(ellipse 100% 75% at 15% 0%, rgba(168, 85, 247, 0.34), transparent 55%)",
        "radial-gradient(ellipse 80% 60% at 90% 15%, rgba(244, 114, 182, 0.28), transparent 52%)",
        "radial-gradient(ellipse 70% 55% at 55% 95%, rgba(74, 222, 128, 0.18), transparent 58%)",
        "radial-gradient(ellipse 40% 30% at 45% 45%, rgba(251, 191, 36, 0.12), transparent 48%)",
        "linear-gradient(165deg, #160C22 0%, #100818 45%, #1A1028 100%)",
      ].join(", "),
      mist: [
        "radial-gradient(circle at 28% 40%, rgba(192, 132, 252, 0.14), transparent 38%)",
        "radial-gradient(circle at 75% 55%, rgba(244, 114, 182, 0.12), transparent 40%)",
      ].join(", "),
      grainOpacity: 0.07,
    },
  ),

  firefly: pair(
    {
      wash: [
        "radial-gradient(ellipse 90% 65% at 20% 5%, rgba(124, 222, 58, 0.28), transparent 55%)",
        "radial-gradient(ellipse 70% 50% at 88% 30%, rgba(240, 192, 32, 0.24), transparent 52%)",
        "radial-gradient(ellipse 60% 45% at 55% 90%, rgba(32, 168, 144, 0.18), transparent 58%)",
        "linear-gradient(165deg, #F6FBEA 0%, #F2F8E8 45%, #E8F4E0 100%)",
      ].join(", "),
      mist: [
        "radial-gradient(circle at 30% 40%, rgba(124, 222, 58, 0.16), transparent 38%)",
        "radial-gradient(circle at 70% 55%, rgba(240, 192, 32, 0.12), transparent 40%)",
      ].join(", "),
      grainOpacity: 0.045,
    },
    {
      wash: [
        "radial-gradient(ellipse 95% 70% at 18% 0%, rgba(124, 222, 58, 0.32), transparent 55%)",
        "radial-gradient(ellipse 70% 55% at 90% 25%, rgba(240, 192, 32, 0.22), transparent 52%)",
        "radial-gradient(ellipse 55% 40% at 50% 85%, rgba(62, 224, 192, 0.16), transparent 55%)",
        "linear-gradient(170deg, #0E2014 0%, #0A1810 45%, #122418 100%)",
      ].join(", "),
      mist: [
        "radial-gradient(circle at 35% 45%, rgba(124, 222, 58, 0.14), transparent 36%)",
        "radial-gradient(circle at 75% 50%, rgba(255, 208, 64, 0.1), transparent 40%)",
      ].join(", "),
      grainOpacity: 0.065,
    },
  ),

  tropic: pair(
    {
      wash: [
        "radial-gradient(ellipse 95% 70% at 12% 0%, rgba(240, 138, 32, 0.3), transparent 55%)",
        "radial-gradient(ellipse 75% 55% at 90% 20%, rgba(255, 77, 141, 0.22), transparent 52%)",
        "radial-gradient(ellipse 70% 50% at 60% 95%, rgba(46, 154, 74, 0.18), transparent 58%)",
        "linear-gradient(160deg, #FFF9F0 0%, #FFF6E8 40%, #FFEFE0 100%)",
      ].join(", "),
      mist: [
        "radial-gradient(circle at 28% 35%, rgba(255, 176, 80, 0.18), transparent 40%)",
        "radial-gradient(circle at 75% 60%, rgba(255, 77, 141, 0.12), transparent 42%)",
      ].join(", "),
      grainOpacity: 0.04,
    },
    {
      wash: [
        "radial-gradient(ellipse 90% 70% at 15% 5%, rgba(240, 138, 32, 0.3), transparent 55%)",
        "radial-gradient(ellipse 75% 55% at 88% 22%, rgba(255, 107, 168, 0.24), transparent 52%)",
        "radial-gradient(ellipse 65% 50% at 55% 92%, rgba(74, 222, 128, 0.16), transparent 58%)",
        "linear-gradient(165deg, #241808 0%, #1A1408 45%, #2A1C10 100%)",
      ].join(", "),
      mist: [
        "radial-gradient(circle at 30% 40%, rgba(255, 176, 80, 0.12), transparent 38%)",
        "radial-gradient(circle at 72% 58%, rgba(255, 107, 168, 0.12), transparent 40%)",
      ].join(", "),
      grainOpacity: 0.06,
    },
  ),

  emberglow: pair(
    {
      wash: [
        "radial-gradient(ellipse 100% 70% at 50% -5%, rgba(232, 90, 32, 0.28), transparent 55%)",
        "radial-gradient(ellipse 70% 55% at 10% 80%, rgba(212, 136, 24, 0.18), transparent 55%)",
        "radial-gradient(ellipse 60% 45% at 90% 70%, rgba(176, 40, 32, 0.16), transparent 55%)",
        "linear-gradient(170deg, #FFF6F0 0%, #F8F0E8 45%, #F0E4D8 100%)",
      ].join(", "),
      mist: "radial-gradient(ellipse 55% 40% at 40% 50%, rgba(255, 180, 120, 0.4), transparent 70%)",
      grainOpacity: 0.04,
    },
    {
      wash: [
        "radial-gradient(ellipse 95% 70% at 50% 0%, rgba(255, 106, 40, 0.34), transparent 55%)",
        "radial-gradient(ellipse 70% 55% at 8% 85%, rgba(255, 176, 32, 0.18), transparent 55%)",
        "radial-gradient(ellipse 55% 45% at 92% 65%, rgba(255, 80, 64, 0.2), transparent 55%)",
        "linear-gradient(175deg, #1C1008 0%, #140C08 45%, #221410 100%)",
      ].join(", "),
      mist: [
        "radial-gradient(circle at 40% 45%, rgba(255, 140, 60, 0.14), transparent 40%)",
        "radial-gradient(circle at 70% 60%, rgba(255, 80, 40, 0.1), transparent 42%)",
      ].join(", "),
      grainOpacity: 0.065,
    },
  ),

  frostbloom: pair(
    {
      wash: [
        "radial-gradient(ellipse 95% 70% at 15% 0%, rgba(106, 176, 232, 0.26), transparent 55%)",
        "radial-gradient(ellipse 70% 55% at 90% 25%, rgba(200, 160, 232, 0.2), transparent 52%)",
        "radial-gradient(ellipse 60% 45% at 55% 90%, rgba(90, 154, 122, 0.14), transparent 58%)",
        "linear-gradient(165deg, #F5F9FD 0%, #F0F6FC 45%, #E8F0F8 100%)",
      ].join(", "),
      mist: [
        "radial-gradient(circle at 30% 40%, rgba(180, 220, 255, 0.45), transparent 40%)",
        "radial-gradient(circle at 75% 55%, rgba(216, 190, 245, 0.25), transparent 42%)",
      ].join(", "),
      grainOpacity: 0.035,
    },
    {
      wash: [
        "radial-gradient(ellipse 90% 70% at 12% 5%, rgba(106, 176, 232, 0.28), transparent 55%)",
        "radial-gradient(ellipse 70% 55% at 88% 20%, rgba(200, 160, 232, 0.22), transparent 52%)",
        "radial-gradient(ellipse 55% 40% at 50% 88%, rgba(94, 207, 154, 0.12), transparent 55%)",
        "linear-gradient(170deg, #101C28 0%, #0C1824 45%, #142430 100%)",
      ].join(", "),
      mist: [
        "radial-gradient(circle at 28% 45%, rgba(106, 176, 232, 0.12), transparent 38%)",
        "radial-gradient(circle at 72% 55%, rgba(200, 160, 232, 0.1), transparent 40%)",
      ].join(", "),
      grainOpacity: 0.055,
    },
  ),

  sakura: pair(
    {
      wash: [
        "radial-gradient(ellipse 95% 70% at 18% 0%, rgba(232, 120, 160, 0.26), transparent 55%)",
        "radial-gradient(ellipse 70% 55% at 90% 30%, rgba(192, 96, 144, 0.16), transparent 52%)",
        "radial-gradient(ellipse 60% 45% at 50% 92%, rgba(106, 170, 112, 0.14), transparent 58%)",
        "linear-gradient(160deg, #FFF7FA 0%, #FFF2F6 45%, #FFF0F4 100%)",
      ].join(", "),
      mist: [
        "radial-gradient(circle at 32% 40%, rgba(255, 180, 200, 0.35), transparent 40%)",
        "radial-gradient(circle at 70% 58%, rgba(232, 120, 160, 0.14), transparent 42%)",
      ].join(", "),
      grainOpacity: 0.035,
    },
    {
      wash: [
        "radial-gradient(ellipse 90% 70% at 15% 5%, rgba(232, 120, 160, 0.28), transparent 55%)",
        "radial-gradient(ellipse 70% 55% at 88% 25%, rgba(208, 128, 176, 0.2), transparent 52%)",
        "radial-gradient(ellipse 55% 40% at 50% 90%, rgba(106, 170, 112, 0.12), transparent 55%)",
        "linear-gradient(170deg, #24141C 0%, #1E1018 45%, #2C1824 100%)",
      ].join(", "),
      mist: [
        "radial-gradient(circle at 30% 42%, rgba(232, 120, 160, 0.12), transparent 38%)",
        "radial-gradient(circle at 75% 55%, rgba(208, 128, 176, 0.1), transparent 40%)",
      ].join(", "),
      grainOpacity: 0.055,
    },
  ),
};

export function getGardenAtmosphere(
  palette: PaletteId,
  mode: ColorMode,
): GardenAtmosphere {
  const id = normalizePaletteId(palette);
  const pairForPalette = atmospheres[id] ?? atmospheres.natural;
  return mode === "dark" ? pairForPalette.dark : pairForPalette.light;
}
