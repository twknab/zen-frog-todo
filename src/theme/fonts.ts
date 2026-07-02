import { Manrope, Zen_Maru_Gothic } from "next/font/google";

export const zenBodyFont = Manrope({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const zenHeadingFont = Zen_Maru_Gothic({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});
