/**
 * Garden atmosphere — soft layered washes + grain per palette / appearance.
 * Used by GardenBackdrop; kept separate from MUI palette tokens so CssBaseline
 * still owns the flat fallback color while atmosphere sits behind content.
 */

import type { ColorMode, PaletteId } from "./theme";

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

export function getGardenAtmosphere(
  palette: PaletteId,
  mode: ColorMode,
): GardenAtmosphere {
  const dark = mode === "dark";

  if (palette === "vibrant") {
    // Kicked-up experiment: richer multi-hue psychedelic wash. Dial back if loud.
    return {
      wash: dark
        ? [
            "radial-gradient(ellipse 90% 70% at 12% 8%, rgba(180, 90, 255, 0.28), transparent 58%)",
            "radial-gradient(ellipse 70% 60% at 88% 18%, rgba(52, 217, 232, 0.22), transparent 55%)",
            "radial-gradient(ellipse 75% 55% at 70% 88%, rgba(251, 111, 146, 0.2), transparent 60%)",
            "radial-gradient(ellipse 50% 40% at 30% 70%, rgba(74, 222, 128, 0.14), transparent 55%)",
            "linear-gradient(165deg, #1a1230 0%, #141021 45%, #1c1435 100%)",
          ].join(", ")
        : [
            "radial-gradient(ellipse 95% 75% at 8% 5%, rgba(185, 120, 255, 0.32), transparent 55%)",
            "radial-gradient(ellipse 70% 55% at 92% 12%, rgba(14, 155, 184, 0.22), transparent 52%)",
            "radial-gradient(ellipse 80% 60% at 78% 92%, rgba(225, 29, 107, 0.16), transparent 58%)",
            "radial-gradient(ellipse 55% 45% at 22% 78%, rgba(22, 163, 74, 0.14), transparent 55%)",
            "linear-gradient(160deg, #F8F4FF 0%, #F5F2FF 40%, #FFF5FB 100%)",
          ].join(", "),
      mist: dark
        ? [
            "radial-gradient(circle at 20% 40%, rgba(251, 191, 36, 0.08), transparent 35%)",
            "radial-gradient(circle at 75% 55%, rgba(180, 90, 255, 0.1), transparent 40%)",
          ].join(", ")
        : [
            "radial-gradient(circle at 25% 35%, rgba(251, 140, 90, 0.1), transparent 38%)",
            "radial-gradient(circle at 80% 60%, rgba(185, 120, 255, 0.12), transparent 42%)",
          ].join(", "),
      grainOpacity: dark ? 0.07 : 0.045,
    };
  }

  if (palette === "dusk") {
    return {
      wash: dark
        ? [
            "radial-gradient(ellipse 85% 65% at 15% 10%, rgba(123, 107, 168, 0.28), transparent 60%)",
            "radial-gradient(ellipse 70% 55% at 90% 75%, rgba(42, 36, 80, 0.55), transparent 55%)",
            "radial-gradient(ellipse 50% 40% at 55% 30%, rgba(168, 154, 212, 0.1), transparent 50%)",
            "linear-gradient(175deg, #1a1632 0%, #16122A 50%, #1c1735 100%)",
          ].join(", ")
        : [
            "radial-gradient(ellipse 90% 70% at 12% 8%, rgba(123, 107, 168, 0.18), transparent 58%)",
            "radial-gradient(ellipse 65% 50% at 88% 80%, rgba(196, 163, 90, 0.1), transparent 55%)",
            "radial-gradient(ellipse 45% 35% at 60% 25%, rgba(95, 143, 110, 0.08), transparent 50%)",
            "linear-gradient(170deg, #F6F3FA 0%, #F3F0F8 50%, #EFEAF6 100%)",
          ].join(", "),
      mist: dark
        ? "radial-gradient(ellipse 40% 30% at 40% 60%, rgba(181, 168, 212, 0.08), transparent 70%)"
        : "radial-gradient(ellipse 45% 35% at 35% 55%, rgba(228, 223, 240, 0.7), transparent 70%)",
      grainOpacity: dark ? 0.055 : 0.04,
    };
  }

  if (palette === "guestbook") {
    // Retro web energy — lime / magenta / cyan washes at calm opacities.
    return {
      wash: dark
        ? [
            "radial-gradient(ellipse 80% 60% at 10% 8%, rgba(93, 222, 106, 0.22), transparent 55%)",
            "radial-gradient(ellipse 70% 55% at 92% 20%, rgba(255, 107, 181, 0.2), transparent 55%)",
            "radial-gradient(ellipse 65% 50% at 70% 90%, rgba(62, 232, 255, 0.18), transparent 58%)",
            "linear-gradient(165deg, #1a1e34 0%, #14182A 50%, #1c1838 100%)",
          ].join(", ")
        : [
            "radial-gradient(ellipse 85% 65% at 8% 5%, rgba(21, 122, 44, 0.12), transparent 55%)",
            "radial-gradient(ellipse 70% 55% at 95% 15%, rgba(196, 30, 106, 0.12), transparent 52%)",
            "radial-gradient(ellipse 75% 55% at 80% 92%, rgba(14, 155, 184, 0.14), transparent 58%)",
            "linear-gradient(160deg, #FAF7EC 0%, #F7F4E8 45%, #F2EEF8 100%)",
          ].join(", "),
      mist: dark
        ? [
            "radial-gradient(circle at 30% 45%, rgba(255, 208, 74, 0.08), transparent 35%)",
            "radial-gradient(circle at 75% 60%, rgba(62, 232, 255, 0.1), transparent 40%)",
          ].join(", ")
        : [
            "radial-gradient(circle at 25% 40%, rgba(60, 184, 74, 0.1), transparent 38%)",
            "radial-gradient(circle at 78% 58%, rgba(224, 74, 138, 0.1), transparent 42%)",
          ].join(", "),
      grainOpacity: dark ? 0.065 : 0.05,
    };
  }

  if (palette === "sunlily") {
    // Warm golden-hour sun / horizon glow.
    return {
      wash: dark
        ? [
            "radial-gradient(ellipse 90% 70% at 50% 0%, rgba(232, 137, 90, 0.28), transparent 55%)",
            "radial-gradient(ellipse 70% 55% at 10% 80%, rgba(232, 192, 106, 0.14), transparent 55%)",
            "radial-gradient(ellipse 55% 45% at 90% 70%, rgba(194, 78, 50, 0.16), transparent 55%)",
            "linear-gradient(170deg, #2c1c12 0%, #241810 50%, #2a1a14 100%)",
          ].join(", ")
        : [
            "radial-gradient(ellipse 95% 70% at 50% -5%, rgba(232, 168, 90, 0.28), transparent 55%)",
            "radial-gradient(ellipse 70% 55% at 8% 85%, rgba(224, 112, 85, 0.12), transparent 55%)",
            "radial-gradient(ellipse 60% 45% at 92% 75%, rgba(212, 154, 58, 0.14), transparent 55%)",
            "linear-gradient(165deg, #FFF8F0 0%, #FFF4E8 45%, #FFEDE0 100%)",
          ].join(", "),
      mist: dark
        ? "radial-gradient(ellipse 50% 35% at 40% 55%, rgba(240, 192, 96, 0.08), transparent 65%)"
        : "radial-gradient(ellipse 55% 40% at 35% 50%, rgba(255, 220, 180, 0.55), transparent 70%)",
      grainOpacity: dark ? 0.05 : 0.035,
    };
  }

  if (palette === "tidepool") {
    // Cool aquatic seafoam / turquoise wash.
    return {
      wash: dark
        ? [
            "radial-gradient(ellipse 85% 65% at 15% 10%, rgba(62, 207, 190, 0.22), transparent 58%)",
            "radial-gradient(ellipse 70% 55% at 90% 80%, rgba(90, 184, 212, 0.18), transparent 55%)",
            "radial-gradient(ellipse 50% 40% at 55% 35%, rgba(122, 232, 255, 0.08), transparent 50%)",
            "linear-gradient(175deg, #122c30 0%, #0E2428 50%, #143438 100%)",
          ].join(", ")
        : [
            "radial-gradient(ellipse 90% 70% at 12% 8%, rgba(62, 207, 190, 0.2), transparent 55%)",
            "radial-gradient(ellipse 65% 50% at 88% 85%, rgba(46, 143, 168, 0.14), transparent 55%)",
            "radial-gradient(ellipse 45% 35% at 55% 30%, rgba(200, 232, 226, 0.6), transparent 55%)",
            "linear-gradient(170deg, #F0FBF8 0%, #E8F8F4 50%, #E0F4F0 100%)",
          ].join(", "),
      mist: dark
        ? "radial-gradient(ellipse 45% 35% at 35% 60%, rgba(110, 224, 212, 0.08), transparent 65%)"
        : "radial-gradient(ellipse 50% 40% at 30% 60%, rgba(200, 232, 226, 0.65), transparent 70%)",
      grainOpacity: dark ? 0.05 : 0.035,
    };
  }

  // Natural — soft moss / clay / parchment atmosphere
  return {
    wash: dark
      ? [
          "radial-gradient(ellipse 80% 60% at 10% 5%, rgba(143, 181, 151, 0.12), transparent 55%)",
          "radial-gradient(ellipse 65% 50% at 95% 85%, rgba(210, 168, 120, 0.1), transparent 55%)",
          "radial-gradient(ellipse 40% 30% at 50% 40%, rgba(236, 231, 219, 0.04), transparent 60%)",
          "linear-gradient(168deg, #1E1B17 0%, #1B1916 55%, #201C18 100%)",
        ].join(", ")
      : [
          "radial-gradient(ellipse 85% 65% at 8% 0%, rgba(147, 180, 154, 0.16), transparent 55%)",
          "radial-gradient(ellipse 70% 55% at 95% 90%, rgba(185, 140, 91, 0.12), transparent 55%)",
          "radial-gradient(ellipse 50% 40% at 55% 35%, rgba(251, 249, 244, 0.5), transparent 60%)",
          "linear-gradient(165deg, #F8F5EE 0%, #F6F3EC 45%, #F3EFE6 100%)",
        ].join(", "),
    mist: dark
      ? "radial-gradient(ellipse 50% 35% at 30% 70%, rgba(143, 181, 151, 0.06), transparent 65%)"
      : "radial-gradient(ellipse 55% 40% at 28% 65%, rgba(227, 223, 211, 0.55), transparent 70%)",
    grainOpacity: dark ? 0.05 : 0.035,
  };
}
