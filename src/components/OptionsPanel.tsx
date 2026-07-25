"use client";

import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
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
import {
  amPmToHour,
  hourToAmPm,
  isDegenerateWorkWindow,
  useWorkWindow,
  type AmPmTime,
} from "@/lib/gardenRealm";
import { useColorMode, useGardenPalette } from "@/theme/ThemeRegistry";
import type { ColorMode, PaletteId } from "@/theme/theme";

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
  const { workWindow, setWorkWindow } = useWorkWindow();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const titleId = useId();
  const startLabelId = useId();
  const endLabelId = useId();
  const open = Boolean(anchorEl);
  const reduceMotion = useReducedMotion();

  const startAmPm = hourToAmPm(workWindow.startHour);
  const endAmPm = hourToAmPm(workWindow.endHour);

  function setStart(next: Partial<AmPmTime>) {
    const merged = { ...startAmPm, ...next };
    const startHour = amPmToHour(merged.hour12, merged.period);
    const candidate = { startHour, endHour: workWindow.endHour };
    if (isDegenerateWorkWindow(candidate)) return;
    setWorkWindow(candidate);
  }

  function setEnd(next: Partial<AmPmTime>) {
    const merged = { ...endAmPm, ...next };
    const endHour = amPmToHour(merged.hour12, merged.period);
    const candidate = { startHour: workWindow.startHour, endHour };
    if (isDegenerateWorkWindow(candidate)) return;
    setWorkWindow(candidate);
  }

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
              minWidth: 288,
              // Theme radius (16) — calm for a settings popover; cards stay 24.
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
              fullWidth
              aria-label="Palette"
              sx={optionsToggleSx}
              onChange={(_, next: PaletteId | null) => {
                if (next) setPalette(next);
              }}
            >
              <ToggleButton value="natural" aria-label="Natural">
                Natural
              </ToggleButton>
              <ToggleButton value="vibrant" aria-label="Vibrant">
                Vibrant
              </ToggleButton>
              <ToggleButton value="dusk" aria-label="Dusk">
                Dusk
              </ToggleButton>
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

          <OptionsSection label="Work hours">
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.25 }}>
              Hours the garden gently minds idle time (local clock). Outside this
              window the bonsai sleeps and Night Camp can grow.
            </Typography>
            <Stack spacing={1.25}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <FormControl size="small" sx={{ minWidth: 72 }}>
                  <InputLabel id={startLabelId}>Start</InputLabel>
                  <Select
                    labelId={startLabelId}
                    label="Start"
                    value={startAmPm.hour12}
                    aria-label="Work window start hour"
                    onChange={(e: SelectChangeEvent<number>) =>
                      setStart({ hour12: Number(e.target.value) })
                    }
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                      <MenuItem key={h} value={h}>
                        {h}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <ToggleButtonGroup
                  size="small"
                  exclusive
                  value={startAmPm.period}
                  aria-label="Work window start AM or PM"
                  onChange={(_, period: "AM" | "PM" | null) => {
                    if (period) setStart({ period });
                  }}
                  sx={optionsToggleSx}
                >
                  <ToggleButton value="AM" aria-label="Start AM">
                    AM
                  </ToggleButton>
                  <ToggleButton value="PM" aria-label="Start PM">
                    PM
                  </ToggleButton>
                </ToggleButtonGroup>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <FormControl size="small" sx={{ minWidth: 72 }}>
                  <InputLabel id={endLabelId}>End</InputLabel>
                  <Select
                    labelId={endLabelId}
                    label="End"
                    value={endAmPm.hour12}
                    aria-label="Work window end hour"
                    onChange={(e: SelectChangeEvent<number>) =>
                      setEnd({ hour12: Number(e.target.value) })
                    }
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                      <MenuItem key={h} value={h}>
                        {h}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <ToggleButtonGroup
                  size="small"
                  exclusive
                  value={endAmPm.period}
                  aria-label="Work window end AM or PM"
                  onChange={(_, period: "AM" | "PM" | null) => {
                    if (period) setEnd({ period });
                  }}
                  sx={optionsToggleSx}
                >
                  <ToggleButton value="AM" aria-label="End AM">
                    AM
                  </ToggleButton>
                  <ToggleButton value="PM" aria-label="End PM">
                    PM
                  </ToggleButton>
                </ToggleButtonGroup>
              </Stack>
              {workWindow.startHour > workWindow.endHour && (
                <Typography variant="caption" color="text.secondary">
                  Overnight window — day realm spans midnight.
                </Typography>
              )}
            </Stack>
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
