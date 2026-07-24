import { Manrope, Syne } from "next/font/google";

/**
 * Body: Manrope — clean, modern, highly legible (kept for readability).
 * Heading: Syne — a quirky, wide, design-forward display face with a
 * psychedelic-modern art vibe, for bold and distinctive headings.
 * (Experiment branch — see the bold/brighter theme exploration.)
 */
export const zenBodyFont = Manrope({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const zenHeadingFont = Syne({
  weight: ["600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});
