"use client";

import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Popover from "@mui/material/Popover";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useReducedMotion } from "framer-motion";
import { useId, useState, type MouseEvent, type ReactNode } from "react";
import { useHyperMinimal } from "@/lib/hyperMinimal";
import { useColorMode, useGardenPalette } from "@/theme/ThemeRegistry";
import {
  normalizePaletteId,
  PALETTE_OPTIONS,
  PALETTE_PREVIEWS,
  type ColorMode,
  type PaletteId,
} from "@/theme/theme";

type OptionsPanelProps = {
  devMode: boolean;
  onDevModeChange: (next: boolean) => void;
};

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
    transition:
      "background-color 180ms ease, color 180ms ease, border-color 180ms ease",
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

function PaletteSwatches({ id }: { id: PaletteId }) {
  const colors = PALETTE_PREVIEWS[id];
  return (
    <Stack direction="row" spacing={0.5} aria-hidden sx={{ flexShrink: 0 }}>
      {colors.map((color) => (
        <Box
          key={color}
          sx={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            bgcolor: color,
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.12)",
          }}
        />
      ))}
    </Stack>
  );
}

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
 * Calm Options Popover — single home for Palette, Appearance, Hyper Minimal,
 * and Dev. Palette is a dropdown so themes stay scannable, not crowded.
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
  const [hyperMinimal, setHyperMinimal] = useHyperMinimal();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const titleId = useId();
  const paletteLabelId = useId();
  const open = Boolean(anchorEl);
  const reduceMotion = useReducedMotion();

  function handleOpen(event: MouseEvent<HTMLElement>) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  function handlePaletteChange(event: SelectChangeEvent<PaletteId>) {
    setPalette(normalizePaletteId(event.target.value));
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
              minWidth: 280,
              maxWidth: "min(320px, calc(100vw - 24px))",
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
            <FormControl fullWidth size="small">
              <Select
                value={palette}
                onChange={handlePaletteChange}
                labelId={paletteLabelId}
                aria-label="Palette"
                MenuProps={{
                  transitionDuration: reduceMotion ? 0 : undefined,
                  slotProps: {
                    paper: {
                      sx: {
                        mt: 0.5,
                        maxHeight: "min(420px, 55vh)",
                        borderRadius: 1.5,
                        border: "1px solid",
                        borderColor: "divider",
                      },
                    },
                  },
                }}
                sx={{
                  bgcolor: "background.paper",
                  "& .MuiSelect-select": {
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                    py: 1.1,
                  },
                }}
                renderValue={(value) => {
                  const option = PALETTE_OPTIONS.find((item) => item.id === value);
                  return (
                    <Stack
                      direction="row"
                      spacing={1.25}
                      sx={{ alignItems: "center" }}
                    >
                      <PaletteSwatches id={value} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {option?.label ?? value}
                      </Typography>
                    </Stack>
                  );
                }}
              >
                {PALETTE_OPTIONS.map(({ id, label }) => (
                  <MenuItem key={id} value={id} aria-label={label}>
                    <Stack
                      direction="row"
                      spacing={1.25}
                      sx={{ alignItems: "center", width: "100%" }}
                    >
                      <PaletteSwatches id={id} />
                      <Typography variant="body2">{label}</Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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

          <OptionsSection label="Density">
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={hyperMinimal}
                  onChange={(event) => setHyperMinimal(event.target.checked)}
                  slotProps={{ input: { "aria-label": "Hyper Minimal" } }}
                />
              }
              label="Hyper Minimal"
              slotProps={{
                typography: { variant: "body2", color: "text.secondary" },
              }}
              sx={{ ml: 0, mr: 0 }}
            />
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
