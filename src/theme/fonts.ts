import { Bricolage_Grotesque, Manrope, Zen_Maru_Gothic } from "next/font/google";

/**
 * Body: Manrope — clean, modern, highly legible (all palettes).
 * Calm headings (Natural / Dusk / Sunlily / Tide Pool): Zen Maru Gothic.
 * Display headings (Vibrant / Guestbook): Bricolage Grotesque.
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
