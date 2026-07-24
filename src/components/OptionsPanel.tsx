"use client";

import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import Box from "@mui/material/Box";
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
import { useId, useState, type MouseEvent } from "react";
import { useColorMode, useGardenPalette } from "@/theme/ThemeRegistry";
import type { ColorMode, PaletteId } from "@/theme/theme";

type OptionsPanelProps = {
  devMode: boolean;
  onDevModeChange: (next: boolean) => void;
};

/**
 * Calm Options Popover — single home for Palette, Appearance, and Dev.
 * Keeps the main header free of settings chrome.
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
              p: 2.5,
              minWidth: 280,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
            },
          },
        }}
      >
        <Stack spacing={2.5}>
          <Typography variant="subtitle2" color="text.secondary">
            Options
          </Typography>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mb: 1 }}
            >
              Palette
            </Typography>
            <ToggleButtonGroup
              value={palette}
              exclusive
              size="small"
              fullWidth
              aria-label="Palette"
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
          </Box>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mb: 1 }}
            >
              Appearance
            </Typography>
            <ToggleButtonGroup
              value={mode}
              exclusive
              size="small"
              fullWidth
              aria-label="Appearance"
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
          </Box>

          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={devMode}
                onChange={(event) => onDevModeChange(event.target.checked)}
              />
            }
            label="Dev"
            slotProps={{ typography: { variant: "body2", color: "text.secondary" } }}
            sx={{ ml: 0, mr: 0 }}
          />
        </Stack>
      </Popover>
    </>
  );
}
