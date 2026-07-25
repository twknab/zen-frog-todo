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
  createHighContrastTheme,
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

type HighContrastContextValue = {
  highContrast: boolean;
  setHighContrast: (next: boolean) => void;
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

const HighContrastContext = createContext<HighContrastContextValue>({
  highContrast: false,
  setHighContrast: () => {},
});

/** Read/set the active light/dark appearance from anywhere in the tree. */
export function useColorMode() {
  return useContext(ColorModeContext);
}

/** Read/set the active garden palette from anywhere in the tree. */
export function useGardenPalette() {
  return useContext(GardenPaletteContext);
}

/** Read/set the High Contrast override (018) from anywhere in the tree. */
export function useHighContrast() {
  return useContext(HighContrastContext);
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
  const [highContrast, setHighContrast] = usePersistentState<boolean>(
    "frog-garden:high-contrast-v1",
    false,
  );
  const palette = normalizePaletteId(rawPalette);

  // HC override sits above PaletteId — stored palette is preserved but ignored
  // visually while High Contrast is on.
  const theme = useMemo(
    () =>
      highContrast
        ? createHighContrastTheme(mode)
        : createZenTheme(mode, palette),
    [highContrast, mode, palette],
  );

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

  const highContrastValue = useMemo<HighContrastContextValue>(
    () => ({
      highContrast,
      setHighContrast: (next) => setHighContrast(Boolean(next)),
    }),
    [highContrast, setHighContrast],
  );

  return (
    <AppRouterCacheProvider options={{ key: "mui" }}>
      <ColorModeContext.Provider value={colorMode}>
        <GardenPaletteContext.Provider value={gardenPalette}>
          <HighContrastContext.Provider value={highContrastValue}>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <GardenBackdrop
                palette={palette}
                mode={mode}
                highContrast={highContrast}
              />
              <Box sx={{ position: "relative", zIndex: 1, minHeight: "100%" }}>
                <CelebrationProvider>{children}</CelebrationProvider>
              </Box>
            </ThemeProvider>
          </HighContrastContext.Provider>
        </GardenPaletteContext.Provider>
      </ColorModeContext.Provider>
    </AppRouterCacheProvider>
  );
}
