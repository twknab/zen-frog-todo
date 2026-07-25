"use client";

import type { ReactNode } from "react";
import { useHyperMinimal } from "@/lib/hyperMinimal";

/**
 * Renders decorative / instructional chrome only when Hyper Minimal is off.
 * Prefer wrapping title rows and helper copy — not interactive controls.
 */
export default function Chrome({ children }: { children: ReactNode }) {
  const [hyperMinimal] = useHyperMinimal();
  if (hyperMinimal) return null;
  return children;
}
