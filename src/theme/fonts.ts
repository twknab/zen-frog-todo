import { Bricolage_Grotesque, Manrope } from "next/font/google";

/**
 * Body: Manrope — clean, modern, highly legible (kept for readability).
 * Heading: Bricolage Grotesque — quirky, condensed-leaning display with
 * real personality (cool without Syne's wide/stretched glyph proportions).
 * (Experiment branch — see the bold/brighter theme exploration.)
 */
export const zenBodyFont = Manrope({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const zenHeadingFont = Bricolage_Grotesque({
  weight: ["600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});
