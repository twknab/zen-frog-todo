"use client";

import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { CelebrationProvider } from "@/components/Celebration";
import { usePersistentState } from "@/lib/storage";
import { createZenTheme, type ColorMode } from "./theme";

type ColorModeContextValue = {
  mode: ColorMode;
  toggleColorMode: () => void;
};

const ColorModeContext = createContext<ColorModeContextValue>({
  mode: "dark",
  toggleColorMode: () => {},
});

/** Read/toggle the active light/dark color mode from anywhere in the tree. */
export function useColorMode() {
  return useContext(ColorModeContext);
}

export default function ThemeRegistry({ children }: { children: ReactNode }) {
  // Dark is the default; the choice is persisted locally (constitution
  // Principle III — on-device only, no backend).
  const [mode, setMode] = usePersistentState<ColorMode>(
    "frog-garden:color-mode-v1",
    "dark",
  );

  const theme = useMemo(() => createZenTheme(mode), [mode]);
  const colorMode = useMemo<ColorModeContextValue>(
    () => ({
      mode,
      toggleColorMode: () =>
        setMode((current) => (current === "dark" ? "light" : "dark")),
    }),
    [mode, setMode],
  );

  return (
    <AppRouterCacheProvider options={{ key: "mui" }}>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <CelebrationProvider>{children}</CelebrationProvider>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </AppRouterCacheProvider>
  );
}
