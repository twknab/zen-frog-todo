"use client";

import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { CelebrationProvider } from "@/components/Celebration";
import GardenBackdrop from "@/components/GardenBackdrop";
import { usePersistentState } from "@/lib/storage";
import {
  createZenTheme,
  normalizePaletteId,
  type ColorMode,
  type PaletteId,
} from "./theme";

type ColorModeContextValue = {
  mode: ColorMode;
  setColorMode: (next: ColorMode) => void;
  toggleColorMode: () => void;
};

type GardenPaletteContextValue = {
  palette: PaletteId;
  setPalette: (next: PaletteId) => void;
};

const ColorModeContext = createContext<ColorModeContextValue>({
  mode: "dark",
  setColorMode: () => {},
  toggleColorMode: () => {},
});

const GardenPaletteContext = createContext<GardenPaletteContextValue>({
  palette: "natural",
  setPalette: () => {},
});

/** Read/set the active light/dark appearance from anywhere in the tree. */
export function useColorMode() {
  return useContext(ColorModeContext);
}

/** Read/set the active garden palette from anywhere in the tree. */
export function useGardenPalette() {
  return useContext(GardenPaletteContext);
}

export default function ThemeRegistry({ children }: { children: ReactNode }) {
  // Dark is the default appearance; Natural is the default palette.
  // Both are persisted locally (constitution Principle III).
  const [mode, setMode] = usePersistentState<ColorMode>(
    "frog-garden:color-mode-v1",
    "dark",
  );
  const [rawPalette, setRawPalette] = usePersistentState<PaletteId>(
    "frog-garden:palette-v1",
    "natural",
  );
  const palette = normalizePaletteId(rawPalette);

  const theme = useMemo(() => createZenTheme(mode, palette), [mode, palette]);

  const colorMode = useMemo<ColorModeContextValue>(
    () => ({
      mode,
      setColorMode: (next) => setMode(next),
      toggleColorMode: () =>
        setMode((current) => (current === "dark" ? "light" : "dark")),
    }),
    [mode, setMode],
  );

  const gardenPalette = useMemo<GardenPaletteContextValue>(
    () => ({
      palette,
      setPalette: (next) => setRawPalette(normalizePaletteId(next)),
    }),
    [palette, setRawPalette],
  );

  return (
    <AppRouterCacheProvider options={{ key: "mui" }}>
      <ColorModeContext.Provider value={colorMode}>
        <GardenPaletteContext.Provider value={gardenPalette}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <GardenBackdrop palette={palette} mode={mode} />
            <Box sx={{ position: "relative", zIndex: 1, minHeight: "100%" }}>
              <CelebrationProvider>{children}</CelebrationProvider>
            </Box>
          </ThemeProvider>
        </GardenPaletteContext.Provider>
      </ColorModeContext.Provider>
    </AppRouterCacheProvider>
  );
}
