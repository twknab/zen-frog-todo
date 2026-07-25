"use client";

import Box from "@mui/material/Box";
import {
  GARDEN_GRAIN_URL,
  getGardenAtmosphere,
  getHighContrastAtmosphere,
} from "@/theme/atmosphere";
import type { ColorMode, PaletteId } from "@/theme/theme";

type GardenBackdropProps = {
  palette: PaletteId;
  mode: ColorMode;
  /** When true, use the simplified High Contrast atmosphere (018). */
  highContrast?: boolean;
};

/**
 * Fixed, non-interactive atmosphere behind app content.
 * Layers: wash gradients → soft mist → subtle SVG grain.
 * Honors calm UX — no motion; grain is static CSS.
 */
export default function GardenBackdrop({
  palette,
  mode,
  highContrast = false,
}: GardenBackdropProps) {
  const atmosphere = highContrast
    ? getHighContrastAtmosphere(mode)
    : getGardenAtmosphere(palette, mode);

  return (
    <Box
      aria-hidden
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: atmosphere.wash,
          backgroundColor: "background.default",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: atmosphere.mist,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          opacity: atmosphere.grainOpacity,
          backgroundImage: GARDEN_GRAIN_URL,
          backgroundRepeat: "repeat",
          backgroundSize: "160px 160px",
          mixBlendMode: mode === "dark" ? "soft-light" : "multiply",
        }}
      />
    </Box>
  );
}
