import { Bricolage_Grotesque, Manrope, Zen_Maru_Gothic } from "next/font/google";

/**
 * Body: Manrope — clean, modern, highly legible (all palettes).
 * Calm headings (Quiet Grove / Violet Hour / Golden Hour / Tideglass /
 * Frostbloom / Sakura Drift): Zen Maru Gothic.
 * Display headings (Acid Bloom / Web Ring / Borealis / Mirrorball /
 * Sugar Rush / Starfruit / Firefly / Tropic Punch / Emberglow):
 * Bricolage Grotesque.
 *
 * Fonts are referenced via `.style.fontFamily` in `createZenTheme`; importing
 * this module (through the theme) registers the Next.js `@font-face` rules.
 */
export const zenBodyFont = Manrope({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const zenHeadingFontNatural = Zen_Maru_Gothic({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const zenHeadingFontVibrant = Bricolage_Grotesque({
  weight: ["600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
  preload: true,
});
