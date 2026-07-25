import { createTheme, type Shadows, type Theme } from "@mui/material/styles";
import {
  zenBodyFont,
  zenHeadingFontNatural,
  zenHeadingFontVibrant,
} from "./fonts";

export type ColorMode = "light" | "dark";

/**
 * Visual garden palette — orthogonal to light/dark appearance.
 *
 * Primary (`moss`) stays in the green family so ground frogs + canopy leaves
 * read as a living pile (015 split). Personality lives in surfaces, atmosphere,
 * and non-green accents (clay / rust / ochre / dusk) for canopy frog-fruit.
 */
export type PaletteId =
  | "natural"
  | "vibrant"
  | "dusk"
  | "guestbook"
  | "sunlily"
  | "tidepool"
  | "aurora"
  | "disco"
  | "floss"
  | "nebula";

export const PALETTE_IDS: readonly PaletteId[] = [
  "natural",
  "vibrant",
  "dusk",
  "guestbook",
  "sunlily",
  "tidepool",
  "aurora",
  "disco",
  "floss",
  "nebula",
] as const;

/** Display labels for Options + a11y — single source of truth. */
export const PALETTE_OPTIONS: readonly { id: PaletteId; label: string }[] = [
  { id: "natural", label: "Natural" },
  { id: "vibrant", label: "Vibrant" },
  { id: "dusk", label: "Dusk" },
  { id: "guestbook", label: "Guestbook" },
  { id: "sunlily", label: "Sunlily" },
  { id: "tidepool", label: "Tide Pool" },
  { id: "aurora", label: "Aurora" },
  { id: "disco", label: "Disco" },
  { id: "floss", label: "Cotton Floss" },
  { id: "nebula", label: "Nebula" },
] as const;

/**
 * Tiny preview dots for the Options dropdown (light-mode accent samples).
 * Order: moss-ish · warm accent · cool accent.
 */
export const PALETTE_PREVIEWS: Record<
  PaletteId,
  readonly [string, string, string]
> = {
  natural: ["#6B8F71", "#B98C5B", "#7A93A6"],
  vibrant: ["#16A34A", "#E11D6B", "#0E9BB8"],
  dusk: ["#5F8F6E", "#C4A35A", "#7B6BA8"],
  guestbook: ["#157A2C", "#C41E6A", "#0E9BB8"],
  sunlily: ["#6E8A42", "#C24E32", "#E8895A"],
  tidepool: ["#1A7A70", "#C45A5A", "#3ECFBE"],
  aurora: ["#2DB86A", "#E040A0", "#5B6CFF"],
  disco: ["#3CCF5A", "#FF2D95", "#FFD84A"],
  floss: ["#5ECF9A", "#FF6BB5", "#6BB8FF"],
  nebula: ["#4ADE80", "#C084FC", "#F472B6"],
};

export function normalizePaletteId(value: unknown): PaletteId {
  if (
    typeof value === "string" &&
    (PALETTE_IDS as readonly string[]).includes(value)
  ) {
    return value as PaletteId;
  }
  return "natural";
}

/**
 * Zen palettes — token bags shared across all garden palettes.
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
  bgDefault: "#F3EEFF",
  bgPaper: "#FFFBFF",
  ink: "#231C33",
  inkSoft: "#5B5470",
  mist: "#E4DCF8",
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
  bgDefault: "#120E1F",
  bgPaper: "#1F1830",
  ink: "#F2EDFB",
  inkSoft: "#ADA4C4",
  mist: "rgba(198, 180, 245, 0.16)",
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
  contrastText: "#120E1F",
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

/**
 * Guestbook — playful 90s-web / GeoCities garden (lime, magenta, cyan).
 * Opt-in joy; readable, not illegible neon chaos.
 */
const guestbookLight: ZenPalette = {
  bgDefault: "#F7F4E8",
  bgPaper: "#FFFCF0",
  ink: "#2A1838",
  inkSoft: "#6A4E7A",
  mist: "#E8E0F0",
  tooltipBg: "#2A1838",
  moss: "#157A2C",
  mossLight: "#3CB84A",
  mossDark: "#0F5C20",
  clay: "#C41E6A",
  clayLight: "#E04A8A",
  clayDark: "#9A1552",
  rust: "#D43A2F",
  ochre: "#E0A020",
  dusk: "#0E9BB8",
  contrastText: "#FFFFFF",
};

const guestbookDark: ZenPalette = {
  bgDefault: "#14182A",
  bgPaper: "#1C2238",
  ink: "#F5F0FF",
  inkSoft: "#B8A8D4",
  mist: "rgba(90, 220, 255, 0.12)",
  tooltipBg: "#2A3050",
  moss: "#5DDE6A",
  mossLight: "#8AF09A",
  mossDark: "#2FAF40",
  clay: "#FF6BB5",
  clayLight: "#FF9AD0",
  clayDark: "#E04090",
  rust: "#FF7A6E",
  ochre: "#FFD04A",
  dusk: "#3EE8FF",
  contrastText: "#14182A",
};

/**
 * Sunlily — golden-hour / sunset lily. Warm olive moss (ground frogs stay green);
 * apricot / coral / soft gold accents for fruit + chrome.
 */
const sunlilyLight: ZenPalette = {
  bgDefault: "#FFF4E8",
  bgPaper: "#FFF9F2",
  ink: "#3A2418",
  inkSoft: "#8A6550",
  mist: "#F0DDD0",
  tooltipBg: "#3A2418",
  moss: "#6E8A42",
  mossLight: "#92B05A",
  mossDark: "#516832",
  clay: "#C24E32",
  clayLight: "#E07055",
  clayDark: "#9A3A22",
  rust: "#B84040",
  ochre: "#C4923A",
  dusk: "#E8895A",
  contrastText: "#FFFFFF",
};

const sunlilyDark: ZenPalette = {
  bgDefault: "#241810",
  bgPaper: "#322218",
  ink: "#FFF0E0",
  inkSoft: "#D4B098",
  mist: "rgba(232, 160, 90, 0.14)",
  tooltipBg: "#403028",
  moss: "#A8C46A",
  mossLight: "#C4DC8A",
  mossDark: "#7A9A48",
  clay: "#E8895A",
  clayLight: "#F0A878",
  clayDark: "#C86840",
  rust: "#F08070",
  ochre: "#F0C060",
  dusk: "#F0A060",
  contrastText: "#241810",
};

/**
 * Tide Pool — seafoam + turquoise candy pond; fresh and cheerful.
 */
const tidepoolLight: ZenPalette = {
  bgDefault: "#E8F8F4",
  bgPaper: "#F4FCFA",
  ink: "#14353A",
  inkSoft: "#4A7075",
  mist: "#C8E8E2",
  tooltipBg: "#14353A",
  moss: "#1A7A70",
  mossLight: "#3AAFA0",
  mossDark: "#125A54",
  clay: "#247A90",
  clayLight: "#4A9EB0",
  clayDark: "#1A5A6A",
  rust: "#C45A5A",
  ochre: "#D4A84A",
  dusk: "#3ECFBE",
  contrastText: "#FFFFFF",
};

const tidepoolDark: ZenPalette = {
  bgDefault: "#0E2428",
  bgPaper: "#163238",
  ink: "#E6FAF6",
  inkSoft: "#A0C8C4",
  mist: "rgba(62, 207, 190, 0.14)",
  tooltipBg: "#1E4048",
  moss: "#3ECFBE",
  mossLight: "#6EE0D4",
  mossDark: "#28A898",
  clay: "#5AB8D4",
  clayLight: "#8AD0E4",
  clayDark: "#3A98B0",
  rust: "#E08080",
  ochre: "#E8C06A",
  dusk: "#7AE8FF",
  contrastText: "#0E2428",
};

/**
 * Aurora — northern-lights garden: electric moss, magenta + indigo sky fruit.
 */
const auroraLight: ZenPalette = {
  bgDefault: "#EEF6FF",
  bgPaper: "#F7FBFF",
  ink: "#1A2048",
  inkSoft: "#5A6288",
  mist: "#D4E4F8",
  tooltipBg: "#1A2048",
  moss: "#1E9A52",
  mossLight: "#3CCF78",
  mossDark: "#157A3E",
  clay: "#C02888",
  clayLight: "#E050A8",
  clayDark: "#9A1A68",
  rust: "#E04070",
  ochre: "#E8A830",
  dusk: "#4A5CE8",
  contrastText: "#FFFFFF",
};

const auroraDark: ZenPalette = {
  bgDefault: "#0A1028",
  bgPaper: "#121A38",
  ink: "#E8F0FF",
  inkSoft: "#A0A8D4",
  mist: "rgba(90, 108, 255, 0.16)",
  tooltipBg: "#1C2850",
  moss: "#4ADE80",
  mossLight: "#86EFAC",
  mossDark: "#22C55E",
  clay: "#F472B6",
  clayLight: "#F9A8D4",
  clayDark: "#DB2777",
  rust: "#FB7185",
  ochre: "#FBBF24",
  dusk: "#818CF8",
  contrastText: "#0A1028",
};

/**
 * Disco — mirror-ball pond: hot pink, gold, electric lime — pure party frogs.
 */
const discoLight: ZenPalette = {
  bgDefault: "#FFF0F8",
  bgPaper: "#FFF8FC",
  ink: "#2A1030",
  inkSoft: "#7A4A70",
  mist: "#F0D8E8",
  tooltipBg: "#2A1030",
  moss: "#1A9A38",
  mossLight: "#3CCF5A",
  mossDark: "#127A28",
  clay: "#D01878",
  clayLight: "#F0409A",
  clayDark: "#A01058",
  rust: "#E02850",
  ochre: "#D4A020",
  dusk: "#7A30C8",
  contrastText: "#FFFFFF",
};

const discoDark: ZenPalette = {
  bgDefault: "#1A0A1E",
  bgPaper: "#2A1230",
  ink: "#FFF0FA",
  inkSoft: "#D4A0C8",
  mist: "rgba(255, 45, 149, 0.14)",
  tooltipBg: "#3A1A48",
  moss: "#4ADE80",
  mossLight: "#86EFAC",
  mossDark: "#22C55E",
  clay: "#FF2D95",
  clayLight: "#FF6BB5",
  clayDark: "#E01070",
  rust: "#FF4D6D",
  ochre: "#FFD84A",
  dusk: "#C084FC",
  contrastText: "#1A0A1E",
};

/**
 * Cotton Floss — sugar-rush pastels: bubblegum pink, sky blue, mint joy.
 */
const flossLight: ZenPalette = {
  bgDefault: "#FFF0F6",
  bgPaper: "#FFFAFC",
  ink: "#3A2040",
  inkSoft: "#8A6080",
  mist: "#F5DCE8",
  tooltipBg: "#3A2040",
  moss: "#2AAA78",
  mossLight: "#5ECF9A",
  mossDark: "#1E8A5E",
  clay: "#E04098",
  clayLight: "#FF6BB5",
  clayDark: "#B02878",
  rust: "#E85870",
  ochre: "#E8B040",
  dusk: "#4A98E8",
  contrastText: "#FFFFFF",
};

const flossDark: ZenPalette = {
  bgDefault: "#221028",
  bgPaper: "#321838",
  ink: "#FFF0F8",
  inkSoft: "#D4A8C8",
  mist: "rgba(255, 107, 181, 0.14)",
  tooltipBg: "#402048",
  moss: "#5ECF9A",
  mossLight: "#8AE8BC",
  mossDark: "#3AAA78",
  clay: "#FF6BB5",
  clayLight: "#FF9AD0",
  clayDark: "#E04098",
  rust: "#FF8A9A",
  ochre: "#FFD06A",
  dusk: "#6BB8FF",
  contrastText: "#221028",
};

/**
 * Nebula — cosmic garden: deep space violet, starfruit pink, nova gold.
 */
const nebulaLight: ZenPalette = {
  bgDefault: "#F4EEFF",
  bgPaper: "#FBF0FF",
  ink: "#241848",
  inkSoft: "#6A5888",
  mist: "#E4D8F8",
  tooltipBg: "#241848",
  moss: "#2A9A58",
  mossLight: "#4ADE80",
  mossDark: "#1E7A44",
  clay: "#8B3AD4",
  clayLight: "#A855F7",
  clayDark: "#6B21A8",
  rust: "#DB2777",
  ochre: "#D97706",
  dusk: "#7C3AED",
  contrastText: "#FFFFFF",
};

const nebulaDark: ZenPalette = {
  bgDefault: "#100818",
  bgPaper: "#1A1028",
  ink: "#F5EDFF",
  inkSoft: "#B8A0D4",
  mist: "rgba(192, 132, 252, 0.16)",
  tooltipBg: "#2A1840",
  moss: "#4ADE80",
  mossLight: "#86EFAC",
  mossDark: "#22C55E",
  clay: "#C084FC",
  clayLight: "#D8B4FE",
  clayDark: "#A855F7",
  rust: "#F472B6",
  ochre: "#FBBF24",
  dusk: "#A78BFA",
  contrastText: "#100818",
};

const tokensByPalette: Record<PaletteId, { light: ZenPalette; dark: ZenPalette }> =
  {
    natural: { light: naturalLight, dark: naturalDark },
    vibrant: { light: vibrantLight, dark: vibrantDark },
    dusk: { light: duskLight, dark: duskDark },
    guestbook: { light: guestbookLight, dark: guestbookDark },
    sunlily: { light: sunlilyLight, dark: sunlilyDark },
    tidepool: { light: tidepoolLight, dark: tidepoolDark },
    aurora: { light: auroraLight, dark: auroraDark },
    disco: { light: discoLight, dark: discoDark },
    floss: { light: flossLight, dark: flossDark },
    nebula: { light: nebulaLight, dark: nebulaDark },
  };

const bodyFontFamily = `${zenBodyFont.style.fontFamily}, "Helvetica Neue", Arial, sans-serif`;

/** Playful display headings for high-energy opt-in palettes. */
function usesDisplayHeading(palette: PaletteId): boolean {
  return (
    palette === "vibrant" ||
    palette === "guestbook" ||
    palette === "aurora" ||
    palette === "disco" ||
    palette === "floss" ||
    palette === "nebula"
  );
}

function headingFontFamilyFor(palette: PaletteId): string {
  const heading = usesDisplayHeading(palette)
    ? zenHeadingFontVibrant
    : zenHeadingFontNatural;
  return `${heading.style.fontFamily}, ${bodyFontFamily}`;
}

/**
 * Joyful gradient wordmark for opt-in palettes.
 * Natural + Dusk stay solid primary (calm brand baseline).
 */
export function gardenWordmarkGradient(
  palette: PaletteId,
  themePalette: Theme["palette"],
): string | null {
  const { primary, secondary, info, error, warning } = themePalette;
  switch (palette) {
    case "natural":
    case "dusk":
      return null;
    case "guestbook":
      return `linear-gradient(100deg, ${primary.main} 0%, ${info.main} 45%, ${secondary.main} 100%)`;
    case "vibrant":
      return `linear-gradient(100deg, ${primary.main} 0%, ${info.main} 50%, #B983FF 100%)`;
    case "sunlily":
      return `linear-gradient(100deg, ${primary.main} 0%, ${warning.main} 45%, ${secondary.main} 100%)`;
    case "tidepool":
      return `linear-gradient(100deg, ${primary.main} 0%, ${info.main} 50%, ${secondary.main} 100%)`;
    case "aurora":
      return `linear-gradient(100deg, ${primary.main} 0%, ${info.main} 40%, ${secondary.main} 100%)`;
    case "disco":
      return `linear-gradient(100deg, ${primary.main} 0%, ${warning.main} 35%, ${secondary.main} 70%, ${info.main} 100%)`;
    case "floss":
      return `linear-gradient(100deg, ${secondary.main} 0%, ${info.main} 50%, ${primary.main} 100%)`;
    case "nebula":
      return `linear-gradient(100deg, ${primary.main} 0%, ${info.main} 40%, ${error.main} 100%)`;
    default:
      return null;
  }
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
  const displayHeading = usesDisplayHeading(palette);

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
        fontWeight: displayHeading ? 800 : 700,
        letterSpacing: displayHeading ? -0.2 : 0,
      },
      h2: {
        fontFamily: headingFontFamily,
        fontWeight: displayHeading ? 800 : 700,
        letterSpacing: displayHeading ? -0.15 : 0,
      },
      h3: { fontFamily: headingFontFamily, fontWeight: 700 },
      h4: {
        fontFamily: headingFontFamily,
        fontWeight: 700,
        letterSpacing: displayHeading ? -0.1 : 0,
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
      MuiSelect: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            marginInline: 6,
            marginBlock: 2,
          },
        },
      },
    },
  });
}

/** Default (Natural light) theme for any static consumers. */
export const zenTheme = createZenTheme("light", "natural");
