"use client";

import Box from "@mui/material/Box";
import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  DEV_MODE_KEY,
  REALM_OVERRIDE_KEY,
  normalizeRealmOverride,
  resolveRealm,
  useWorkWindow,
  type RealmOverride,
} from "@/lib/gardenRealm";
import { usePersistentState } from "@/lib/storage";
import {
  GARDEN_GRAIN_URL,
  getGardenAtmosphere,
} from "@/theme/atmosphere";
import type { ColorMode, PaletteId } from "@/theme/theme";

type GardenBackdropProps = {
  palette: PaletteId;
  mode: ColorMode;
};

/**
 * Fixed, non-interactive atmosphere behind app content.
 * Layers: wash → mist → grain → optional night dim (017).
 * Night dim never forces Appearance; reads effective realm itself.
 */
export default function GardenBackdrop({ palette, mode }: GardenBackdropProps) {
  const atmosphere = getGardenAtmosphere(palette, mode);
  const reduce = useReducedMotion();
  const { workWindow } = useWorkWindow();
  const [devMode] = usePersistentState(DEV_MODE_KEY, false);
  const [realmOverride] = usePersistentState<RealmOverride>(REALM_OVERRIDE_KEY, null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, [workWindow, devMode, realmOverride]);

  const realm = resolveRealm({
    now,
    window: workWindow,
    override: normalizeRealmOverride(realmOverride),
    devToolsEnabled: devMode,
  });
  const isNight = realm === "night";

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
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          bgcolor: "rgba(8, 12, 28, 0.28)",
          opacity: isNight ? 1 : 0,
          transition: reduce ? "none" : "opacity 700ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />
    </Box>
  );
}
