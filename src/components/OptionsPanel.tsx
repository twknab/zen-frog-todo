"use client";

import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useReducedMotion } from "framer-motion";
import { useId, useState, type MouseEvent, type ReactNode } from "react";
import { useColorMode, useGardenPalette } from "@/theme/ThemeRegistry";
import type { ColorMode, PaletteId } from "@/theme/theme";

type OptionsPanelProps = {
  devMode: boolean;
  onDevModeChange: (next: boolean) => void;
};

const PALETTE_OPTIONS: readonly { id: PaletteId; label: string }[] = [
  { id: "natural", label: "Natural" },
  { id: "vibrant", label: "Vibrant" },
  { id: "dusk", label: "Dusk" },
  { id: "guestbook", label: "Guestbook" },
  { id: "sunlily", label: "Sunlily" },
  { id: "tidepool", label: "Tide Pool" },
] as const;

/**
 * Shared ToggleButtonGroup look for Options — selected state uses primary
 * fill + contrast text so the active choice reads clearly at WCAG AA.
 */
const optionsToggleSx = {
  gap: 0.5,
  "& .MuiToggleButtonGroup-grouped": {
    border: "1px solid",
    borderColor: "divider",
    borderRadius: "10px !important",
    mx: 0,
    px: 1.25,
    py: 0.75,
    typography: "body2",
    color: "text.secondary",
    transition: "background-color 180ms ease, color 180ms ease, border-color 180ms ease",
    "&.Mui-selected": {
      bgcolor: "primary.main",
      color: "primary.contrastText",
      borderColor: "primary.main",
      "&:hover": {
        bgcolor: "primary.dark",
        borderColor: "primary.dark",
      },
    },
    "&:hover": {
      bgcolor: "action.hover",
    },
  },
} as const;

/** Six palettes wrap into a calm ~2×3 grid instead of one crowded row. */
const paletteToggleSx = {
  ...optionsToggleSx,
  display: "flex",
  flexWrap: "wrap",
  width: "100%",
  gap: 0.75,
  "& .MuiToggleButtonGroup-grouped": {
    ...optionsToggleSx["& .MuiToggleButtonGroup-grouped"],
    flex: "1 1 calc(50% - 6px)",
    maxWidth: "calc(50% - 6px)",
    px: 1,
    py: 0.65,
    fontSize: "0.8125rem",
    lineHeight: 1.25,
    justifyContent: "center",
  },
} as const;

function OptionsSection({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <Box>
      <Typography
        component="h3"
        variant="overline"
        sx={{
          display: "block",
          mb: 1,
          letterSpacing: "0.08em",
          color: "text.secondary",
          lineHeight: 1.2,
        }}
      >
        {label}
      </Typography>
      {children}
    </Box>
  );
}

/**
 * Calm Options Popover — single home for Palette, Appearance, and Dev.
 * Keeps the main header free of settings chrome.
 *
 * Radius: uses theme.shape.borderRadius (16) — one step softer than cards
 * (24px), not the previous `borderRadius: 3` (= 48px) which felt bubbly
 * for a compact settings surface.
 */
export default function OptionsPanel({
  devMode,
  onDevModeChange,
}: OptionsPanelProps) {
  const { mode, setColorMode } = useColorMode();
  const { palette, setPalette } = useGardenPalette();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const titleId = useId();
  const open = Boolean(anchorEl);
  const reduceMotion = useReducedMotion();

  function handleOpen(event: MouseEvent<HTMLElement>) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  return (
    <>
      <Tooltip title="Options">
        <IconButton
          onClick={handleOpen}
          aria-label="Options"
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          aria-controls={open ? titleId : undefined}
          sx={{ color: "text.secondary" }}
        >
          <SettingsOutlinedIcon />
        </IconButton>
      </Tooltip>

      <Popover
        id={titleId}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        transitionDuration={reduceMotion ? 0 : undefined}
        slotProps={{
          paper: {
            role: "dialog",
            "aria-label": "Options",
            sx: {
              mt: 1,
              p: 2.25,
              // Room for a 2×3 palette grid without crowding or horizontal scroll.
              minWidth: 312,
              maxWidth: "min(360px, calc(100vw - 24px))",
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
              boxShadow: 3,
            },
          },
        }}
      >
        <Stack spacing={0}>
          <Typography
            variant="subtitle2"
            sx={{ mb: 2, color: "text.primary", fontWeight: 700 }}
          >
            Options
          </Typography>

          <OptionsSection label="Palette">
            <ToggleButtonGroup
              value={palette}
              exclusive
              size="small"
              aria-label="Palette"
              sx={paletteToggleSx}
              onChange={(_, next: PaletteId | null) => {
                if (next) setPalette(next);
              }}
            >
              {PALETTE_OPTIONS.map(({ id, label }) => (
                <ToggleButton key={id} value={id} aria-label={label}>
                  {label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </OptionsSection>

          <Divider sx={{ my: 2, borderColor: "divider", opacity: 0.7 }} />

          <OptionsSection label="Appearance">
            <ToggleButtonGroup
              value={mode}
              exclusive
              size="small"
              fullWidth
              aria-label="Appearance"
              sx={optionsToggleSx}
              onChange={(_, next: ColorMode | null) => {
                if (next) setColorMode(next);
              }}
            >
              <ToggleButton value="light" aria-label="Light">
                Light
              </ToggleButton>
              <ToggleButton value="dark" aria-label="Dark">
                Dark
              </ToggleButton>
            </ToggleButtonGroup>
          </OptionsSection>

          <Divider sx={{ my: 2, borderColor: "divider", opacity: 0.7 }} />

          <OptionsSection label="Dev">
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={devMode}
                  onChange={(event) => onDevModeChange(event.target.checked)}
                />
              }
              label="Dev tools"
              slotProps={{
                typography: { variant: "body2", color: "text.secondary" },
              }}
              sx={{ ml: 0, mr: 0 }}
            />
          </OptionsSection>
        </Stack>
      </Popover>
    </>
  );
}
