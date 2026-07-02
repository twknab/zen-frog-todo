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

const zenLight: ZenPalette = {
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

const zenDark: ZenPalette = {
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
      h1: { fontFamily: headingFontFamily, fontWeight: 500, letterSpacing: 0.2 },
      h2: { fontFamily: headingFontFamily, fontWeight: 500, letterSpacing: 0.2 },
      h3: { fontFamily: headingFontFamily, fontWeight: 500 },
      h4: { fontFamily: headingFontFamily, fontWeight: 500 },
      h5: { fontFamily: headingFontFamily, fontWeight: 500 },
      h6: { fontFamily: headingFontFamily, fontWeight: 600 },
      body1: { lineHeight: 1.7 },
      body2: { lineHeight: 1.7 },
      button: { fontWeight: 600, textTransform: "none" },
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
