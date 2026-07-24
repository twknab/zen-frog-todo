import { createTheme, type Shadows, type Theme } from "@mui/material/styles";
import {
  zenBodyFont,
  zenHeadingFontNatural,
  zenHeadingFontVibrant,
} from "./fonts";

export type ColorMode = "light" | "dark";

/** Visual garden palette — orthogonal to light/dark appearance. */
export type PaletteId = "natural" | "vibrant" | "dusk";

export const PALETTE_IDS: readonly PaletteId[] = ["natural", "vibrant", "dusk"] as const;

export function normalizePaletteId(value: unknown): PaletteId {
  if (value === "natural" || value === "vibrant" || value === "dusk") {
    return value;
  }
  return "natural";
}

/**
 * Zen palettes — token bags shared across Natural / Vibrant / Dusk.
 * No pure black/white; Natural stays muted (constitution Principle V default).
 */
type ZenPalette = {
  bgDefault: string;
  bgPaper: string;
  ink: string;
  inkSoft: string;
  mist: string;
  tooltipBg: string;
  moss: string;
  mossLight: string;
  mossDark: string;
  clay: string;
  clayLight: string;
  clayDark: string;
  rust: string;
  ochre: string;
  dusk: string;
  contrastText: string;
};

/** Pre-experiment muted constitution palette (Natural). */
const naturalLight: ZenPalette = {
  bgDefault: "#F6F3EC",
  bgPaper: "#FBF9F4",
  ink: "#33302A",
  inkSoft: "#6B665C",
  mist: "#E3DFD3",
  tooltipBg: "#33302A",
  moss: "#6B8F71",
  mossLight: "#93B49A",
  mossDark: "#4F6E55",
  clay: "#B98C5B",
  clayLight: "#D2AC81",
  clayDark: "#8C6A41",
  rust: "#B1554A",
  ochre: "#C79A4B",
  dusk: "#7A93A6",
  contrastText: "#FFFFFF",
};

const naturalDark: ZenPalette = {
  bgDefault: "#1B1916",
  bgPaper: "#24211C",
  ink: "#ECE7DB",
  inkSoft: "#A9A395",
  mist: "rgba(236, 231, 219, 0.12)",
  tooltipBg: "#38342D",
  moss: "#8FB597",
  mossLight: "#B0CDB5",
  mossDark: "#5E8266",
  clay: "#D2A878",
  clayLight: "#E4C6A0",
  clayDark: "#A67C4E",
  rust: "#D9796B",
  ochre: "#DCB566",
  dusk: "#8FA9BD",
  contrastText: "#20201C",
};

/**
 * Neon garden (Vibrant) — from bold-psychedelic experiment / PR #11 inspiration.
 * Opt-in only; Natural remains default (Principle V compatibility).
 */
const vibrantLight: ZenPalette = {
  bgDefault: "#F5F2FF",
  bgPaper: "#FFFFFF",
  ink: "#231C33",
  inkSoft: "#5B5470",
  mist: "#E7E1F5",
  tooltipBg: "#231C33",
  moss: "#16A34A",
  mossLight: "#4ADE80",
  mossDark: "#15803D",
  clay: "#EA6F3D",
  clayLight: "#FB8C5A",
  clayDark: "#C2521F",
  rust: "#E11D6B",
  ochre: "#E0930B",
  dusk: "#0E9BB8",
  contrastText: "#FFFFFF",
};

const vibrantDark: ZenPalette = {
  bgDefault: "#141021",
  bgPaper: "#1E192E",
  ink: "#F2EDFB",
  inkSoft: "#ADA4C4",
  mist: "rgba(198, 180, 245, 0.14)",
  tooltipBg: "#2A2340",
  moss: "#4ADE80",
  mossLight: "#86EFAC",
  mossDark: "#22C55E",
  clay: "#FB8C5A",
  clayLight: "#FDBA8C",
  clayDark: "#EA6F3D",
  rust: "#FB6F92",
  ochre: "#FBBF24",
  dusk: "#34D9E8",
  contrastText: "#141021",
};

/**
 * Dusk — calm night-garden: indigo/violet surfaces, lilac mist, muted gold,
 * moss green retained for frog identity.
 */
const duskLight: ZenPalette = {
  bgDefault: "#F3F0F8",
  bgPaper: "#FAF8FC",
  ink: "#2A2450",
  inkSoft: "#6A6288",
  mist: "#E4DFF0",
  tooltipBg: "#2A2450",
  moss: "#5F8F6E",
  mossLight: "#87B094",
  mossDark: "#457556",
  clay: "#C4A35A",
  clayLight: "#D9C07E",
  clayDark: "#9A7E3F",
  rust: "#B06A78",
  ochre: "#C4A35A",
  dusk: "#7B6BA8",
  contrastText: "#FFFFFF",
};

const duskDark: ZenPalette = {
  bgDefault: "#16122A",
  bgPaper: "#1F1A36",
  ink: "#EDE7F8",
  inkSoft: "#B5A8D4",
  mist: "rgba(198, 180, 245, 0.14)",
  tooltipBg: "#2C2548",
  moss: "#8FB597",
  mossLight: "#B0CDB5",
  mossDark: "#5E8266",
  clay: "#D4B56A",
  clayLight: "#E6CF96",
  clayDark: "#A88C42",
  rust: "#D4899A",
  ochre: "#D4B56A",
  dusk: "#A89AD4",
  contrastText: "#16122A",
};

const tokensByPalette: Record<PaletteId, { light: ZenPalette; dark: ZenPalette }> = {
  natural: { light: naturalLight, dark: naturalDark },
  vibrant: { light: vibrantLight, dark: vibrantDark },
  dusk: { light: duskLight, dark: duskDark },
};

const bodyFontFamily = `${zenBodyFont.style.fontFamily}, "Helvetica Neue", Arial, sans-serif`;

function headingFontFamilyFor(palette: PaletteId): string {
  const heading =
    palette === "vibrant" ? zenHeadingFontVibrant : zenHeadingFontNatural;
  return `${heading.style.fontFamily}, ${bodyFontFamily}`;
}

/** A soft, low-opacity shadow scale — never a hard drop shadow. */
function buildZenShadows(mode: ColorMode): Shadows {
  const rgb = mode === "dark" ? "0, 0, 0" : "51, 48, 42";
  const opacityBoost = mode === "dark" ? 0.05 : 0;
  const shadows: string[] = ["none"];
  for (let level = 1; level <= 24; level += 1) {
    const blur = 4 + level * 1.4;
    const spread = Math.min(1 + level * 0.15, 6);
    const opacity = Math.min(0.03 + level * 0.004 + opacityBoost, 0.28);
    shadows.push(
      `0px ${Math.round(level * 0.4)}px ${Math.round(blur)}px ${spread}px rgba(${rgb}, ${opacity.toFixed(3)})`,
    );
  }
  return shadows as unknown as Shadows;
}

export function createZenTheme(
  mode: ColorMode,
  palette: PaletteId = "natural",
): Theme {
  const pair = tokensByPalette[normalizePaletteId(palette)];
  const zen = mode === "dark" ? pair.dark : pair.light;
  const headingFontFamily = headingFontFamilyFor(palette);
  const vibrantHeading = palette === "vibrant";

  return createTheme({
    palette: {
      mode,
      background: {
        default: zen.bgDefault,
        paper: zen.bgPaper,
      },
      primary: {
        main: zen.moss,
        light: zen.mossLight,
        dark: zen.mossDark,
        contrastText: zen.contrastText,
      },
      secondary: {
        main: zen.clay,
        light: zen.clayLight,
        dark: zen.clayDark,
        contrastText: zen.contrastText,
      },
      error: { main: zen.rust },
      warning: { main: zen.ochre },
      success: { main: zen.moss },
      info: { main: zen.dusk },
      text: {
        primary: zen.ink,
        secondary: zen.inkSoft,
      },
      divider: zen.mist,
    },
    shape: {
      borderRadius: 16,
    },
    shadows: buildZenShadows(mode),
    typography: {
      fontFamily: bodyFontFamily,
      h1: {
        fontFamily: headingFontFamily,
        fontWeight: vibrantHeading ? 800 : 700,
        letterSpacing: vibrantHeading ? -0.2 : 0,
      },
      h2: {
        fontFamily: headingFontFamily,
        fontWeight: vibrantHeading ? 800 : 700,
        letterSpacing: vibrantHeading ? -0.15 : 0,
      },
      h3: { fontFamily: headingFontFamily, fontWeight: 700 },
      h4: {
        fontFamily: headingFontFamily,
        fontWeight: 700,
        letterSpacing: vibrantHeading ? -0.1 : 0,
      },
      h5: { fontFamily: headingFontFamily, fontWeight: 700 },
      h6: { fontFamily: headingFontFamily, fontWeight: 700 },
      body1: { lineHeight: 1.7 },
      body2: { lineHeight: 1.7 },
      button: { fontWeight: 700, textTransform: "none" },
    },
    transitions: {
      easing: {
        easeInOut: "cubic-bezier(0.22, 1, 0.36, 1)",
        easeOut: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
    components: {
      MuiButtonBase: {
        defaultProps: {
          disableRipple: true,
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: 999,
            paddingInline: 20,
            paddingBlock: 10,
            transition: "background-color 200ms ease, transform 200ms ease",
            "&:active": {
              transform: "scale(0.98)",
            },
          },
        },
      },
      MuiIconButton: {
        defaultProps: {
          disableRipple: true,
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 24,
            border: `1px solid ${zen.mist}`,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            fontWeight: 500,
          },
        },
      },
      MuiAppBar: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: {
            backgroundColor: zen.bgDefault,
            color: zen.ink,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: zen.tooltipBg,
            borderRadius: 10,
          },
        },
      },
    },
  });
}

/** Default (Natural light) theme for any static consumers. */
export const zenTheme = createZenTheme("light", "natural");
