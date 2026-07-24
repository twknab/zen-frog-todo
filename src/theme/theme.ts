import { createTheme, type Shadows, type Theme } from "@mui/material/styles";
import { zenBodyFont, zenHeadingFont } from "./fonts";

export type ColorMode = "light" | "dark";

/**
 * Zen palettes — muted, nature-derived tones. No pure black/white, no
 * saturated "urgency" colors (see constitution Principle I & V). Both a light
 * and a dark surface set are defined so the whole app can be re-themed rather
 * than relying on stock MUI defaults.
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

// EXPERIMENT: a brighter, modern, lightly-psychedelic palette. Vivid spring
// green keeps the frog identity front-and-centre while warm coral + electric
// cyan/violet accents push the whole garden into neon territory. (Diverges
// from the constitution's muted-palette principle — experiment branch only.)
const zenLight: ZenPalette = {
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

const zenDark: ZenPalette = {
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

const bodyFontFamily = `${zenBodyFont.style.fontFamily}, "Helvetica Neue", Arial, sans-serif`;
const headingFontFamily = `${zenHeadingFont.style.fontFamily}, ${bodyFontFamily}`;

/** A soft, low-opacity shadow scale — never a hard drop shadow. */
function buildZenShadows(mode: ColorMode): Shadows {
  const rgb = mode === "dark" ? "0, 0, 0" : "51, 48, 42";
  const opacityBoost = mode === "dark" ? 0.05 : 0;
  const shadows: string[] = ["none"];
  for (let level = 1; level <= 24; level += 1) {
    const blur = 4 + level * 1.4;
    const spread = Math.min(1 + level * 0.15, 6);
    const opacity = Math.min(0.03 + level * 0.004 + opacityBoost, 0.28);
    shadows.push(`0px ${Math.round(level * 0.4)}px ${Math.round(blur)}px ${spread}px rgba(${rgb}, ${opacity.toFixed(3)})`);
  }
  return shadows as unknown as Shadows;
}

export function createZenTheme(mode: ColorMode): Theme {
  const zen = mode === "dark" ? zenDark : zenLight;

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
      // Mild tracking only — Syne + tight negative spacing was part of the
      // "horizontally skewed" feel; Bricolage doesn't need the squeeze.
      h1: { fontFamily: headingFontFamily, fontWeight: 800, letterSpacing: -0.2 },
      h2: { fontFamily: headingFontFamily, fontWeight: 800, letterSpacing: -0.15 },
      h3: { fontFamily: headingFontFamily, fontWeight: 700 },
      h4: { fontFamily: headingFontFamily, fontWeight: 700, letterSpacing: -0.1 },
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

/** Default (light) theme, kept as a named export for any static consumers. */
export const zenTheme = createZenTheme("light");
