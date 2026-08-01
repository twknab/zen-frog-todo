"use client";

import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import CloudOffOutlinedIcon from "@mui/icons-material/CloudOffOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Popover from "@mui/material/Popover";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useTheme, type SxProps, type Theme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useReducedMotion } from "framer-motion";
import { useEffect, useId, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { useExportEverything, useExportEverythingXlsx } from "@/lib/dayArchive";
import { useHyperMinimal } from "@/lib/hyperMinimal";
import {
  useColorMode,
  useGardenPalette,
  useHighContrast,
} from "@/theme/ThemeRegistry";
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
  /**
   * Increment to programmatically open Options (e.g. from the privacy notice
   * CTA). Anchors to the gear button so the desktop Popover still has a target.
   */
  openRequestKey?: number;
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
  sx,
}: {
  label: string;
  children: ReactNode;
  sx?: SxProps<Theme>;
}) {
  return (
    <Box sx={sx}>
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
 * Options — full-screen Dialog below `md` (phone), Popover at `md+`.
 * Palette, Appearance, Contrast, Density, and Dev share one body.
 */
export default function OptionsPanel({
  devMode,
  onDevModeChange,
  openRequestKey = 0,
}: OptionsPanelProps) {
  const theme = useTheme();
  const isPhone = useMediaQuery(theme.breakpoints.down("md"));
  const { mode, setColorMode } = useColorMode();
  const { palette, setPalette } = useGardenPalette();
  const [hyperMinimal, setHyperMinimal] = useHyperMinimal();
  const { highContrast, setHighContrast } = useHighContrast();
  const exportEverything = useExportEverything();
  const exportEverythingXlsx = useExportEverythingXlsx();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [backupMenuAnchor, setBackupMenuAnchor] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const paletteLabelId = useId();
  const paletteHintId = useId();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (openRequestKey <= 0) return;
    const trigger = triggerRef.current;
    if (!trigger) return;
    setAnchorEl(trigger);
    setOpen(true);
    // Soft-scroll Your data into view after the panel paints (phone Dialog especially).
    requestAnimationFrame(() => {
      document.getElementById("options-your-data")?.scrollIntoView({
        block: "nearest",
        behavior: reduceMotion ? "auto" : "smooth",
      });
    });
  }, [openRequestKey, reduceMotion]);

  function handleOpen(event: MouseEvent<HTMLElement>) {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
    setAnchorEl(null);
    setBackupMenuAnchor(null);
  }

  function handlePaletteChange(event: SelectChangeEvent<PaletteId>) {
    setPalette(normalizePaletteId(event.target.value));
  }

  const optionsBody = (
    <Stack spacing={0}>
      {!isPhone && (
        <Typography
          variant="subtitle2"
          sx={{ mb: 2, color: "text.primary", fontWeight: 700 }}
        >
          Options
        </Typography>
      )}

      <OptionsSection label="Palette" sx={{ mt: { xs: 1.5, md: 1.5 } }}>
        <FormControl fullWidth size="small" disabled={highContrast}>
          <Select
            value={palette}
            onChange={handlePaletteChange}
            labelId={paletteLabelId}
            aria-label="Palette"
            aria-describedby={highContrast ? paletteHintId : undefined}
            disabled={highContrast}
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
          {highContrast ? (
            <FormHelperText id={paletteHintId} sx={{ mx: 0, mt: 0.75 }}>
              Using high contrast
            </FormHelperText>
          ) : null}
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

      <OptionsSection label="Contrast">
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={highContrast}
              onChange={(event) => setHighContrast(event.target.checked)}
              slotProps={{ input: { "aria-label": "High Contrast" } }}
            />
          }
          label="High Contrast"
          slotProps={{
            typography: { variant: "body2", color: "text.secondary" },
          }}
          sx={{ ml: 0, mr: 0 }}
        />
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

      <OptionsSection label="Your data">
        <Stack id="options-your-data" spacing={1.25} tabIndex={-1}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
            <CloudOffOutlinedIcon
              aria-hidden
              sx={{ color: "text.secondary", fontSize: "1.15rem", mt: "1px", flexShrink: 0 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              Your tasks, notes, and garden live only in this browser, on this device.
              Nothing is sent anywhere — no account, no server, no tracking. What you
              write never leaves your machine.
            </Typography>
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            Because it lives in your browser&rsquo;s storage, clearing your browser data
            will erase it. If something&rsquo;s worth keeping, export a backup from time
            to time.
          </Typography>

          <Button
            fullWidth
            variant="outlined"
            size="small"
            color="inherit"
            startIcon={<FileDownloadOutlinedIcon />}
            onClick={(event) => setBackupMenuAnchor(event.currentTarget)}
            aria-haspopup="menu"
            aria-expanded={Boolean(backupMenuAnchor)}
            aria-controls={backupMenuAnchor ? "backup-format-menu" : undefined}
            sx={{ borderColor: "divider", color: "text.primary" }}
          >
            Export a backup
          </Button>

          <Menu
            id="backup-format-menu"
            anchorEl={backupMenuAnchor}
            open={Boolean(backupMenuAnchor)}
            onClose={() => setBackupMenuAnchor(null)}
            transitionDuration={reduceMotion ? 0 : undefined}
            slotProps={{ list: { "aria-label": "Backup file format", dense: true } }}
          >
            <MenuItem
              onClick={() => {
                exportEverythingXlsx();
                setBackupMenuAnchor(null);
              }}
            >
              <ListItemIcon>
                <TableChartOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Excel (.xlsx)"
                secondary="All days + today, one spreadsheet"
              />
            </MenuItem>
            <MenuItem
              onClick={() => {
                exportEverything();
                setBackupMenuAnchor(null);
              }}
            >
              <ListItemIcon>
                <Inventory2OutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="JSON"
                secondary="Everything, re-importable"
              />
            </MenuItem>
          </Menu>
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
  );

  return (
    <>
      <Tooltip title="Options">
        <IconButton
          ref={triggerRef}
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

      {isPhone ? (
        <Dialog
          open={open}
          onClose={handleClose}
          fullScreen
          transitionDuration={reduceMotion ? 0 : undefined}
          aria-labelledby={titleId}
          slotProps={{
            paper: {
              sx: {
                bgcolor: "background.default",
                backgroundImage: "none",
              },
            },
          }}
        >
          <DialogTitle
            id={titleId}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              borderBottom: 1,
              borderColor: "divider",
              py: 1,
              px: 2,
              pt: "max(8px, env(safe-area-inset-top))",
              minHeight: 48,
            }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <SettingsOutlinedIcon
                sx={{ color: "text.secondary", fontSize: "1.25rem" }}
                aria-hidden
              />
              <Typography
                variant="subtitle1"
                component="span"
                sx={{ fontWeight: 600, color: "text.primary" }}
              >
                Options
              </Typography>
            </Stack>
            <IconButton onClick={handleClose} aria-label="Close options" edge="end">
              <CloseOutlinedIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent
            sx={{
              pt: 3,
              px: 2,
              pb: "max(24px, env(safe-area-inset-bottom))",
            }}
          >
            {optionsBody}
          </DialogContent>
        </Dialog>
      ) : (
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
          {optionsBody}
        </Popover>
      )}
    </>
  );
}
