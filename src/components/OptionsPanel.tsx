"use client";

import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import CloudOffOutlinedIcon from "@mui/icons-material/CloudOffOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PolicyOutlinedIcon from "@mui/icons-material/PolicyOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
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
import LegalDocsDialog from "@/components/LegalDocsDialog";
import { useExportEverything, useExportEverythingXlsx } from "@/lib/dayArchive";
import { useHyperMinimal } from "@/lib/hyperMinimal";
import type { LegalDocId } from "@/lib/legalDocs";
import {
  getPlausibleDomain,
  useTelemetryConsent,
} from "@/lib/telemetryConsent";

const TK_SITE_URL = "https://timknab.dev";
const TY_SITE_URL = "https://www.linkedin.com/in/tyler-w/";

/** Shared “Built by” name mark — calm at rest, loud on hover/focus. */
const builderNameSx = {
  fontWeight: 800,
  letterSpacing: "0.14em",
  display: "inline-block",
  px: 0.2,
  cursor: "pointer",
  backgroundImage:
    "linear-gradient(120deg, #5eead4 0%, #34d399 28%, #a78bfa 58%, #f472b6 82%, #fbbf24 100%)",
  backgroundSize: "100% 100%",
  backgroundPosition: "0% 50%",
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  color: "transparent",
  borderBottom: "1.5px solid",
  borderColor: "transparent",
  transition:
    "transform 240ms cubic-bezier(0.22, 1, 0.36, 1), filter 240ms ease, border-color 180ms ease",
  "@keyframes builderNameShine": {
    "0%": { backgroundPosition: "0% 50%" },
    "50%": { backgroundPosition: "100% 50%" },
    "100%": { backgroundPosition: "0% 50%" },
  },
  "@media (prefers-reduced-motion: reduce)": {
    transition: "border-color 120ms ease, filter 120ms ease",
  },
  "&:hover, &:focus-visible": {
    transform: "scale(1.14) translateY(-1px)",
    backgroundSize: "260% 100%",
    backgroundImage:
      "linear-gradient(105deg, #22d3ee 0%, #4ade80 16%, #a3e635 32%, #facc15 48%, #fb923c 64%, #f472b6 80%, #c084fc 100%)",
    borderImage:
      "linear-gradient(90deg, #22d3ee, #facc15, #f472b6, #c084fc) 1",
    borderBottom: "1.5px solid",
    borderColor: "transparent",
    filter:
      "drop-shadow(0 0 5px rgba(34, 211, 238, 0.95)) drop-shadow(0 0 10px rgba(250, 204, 21, 0.7)) drop-shadow(0 0 16px rgba(244, 114, 182, 0.75)) drop-shadow(0 0 22px rgba(192, 132, 252, 0.55))",
    animation: "builderNameShine 1.4s ease-in-out infinite",
    "@media (prefers-reduced-motion: reduce)": {
      transform: "none",
      animation: "none",
      filter:
        "drop-shadow(0 0 5px rgba(34, 211, 238, 0.8)) drop-shadow(0 0 10px rgba(244, 114, 182, 0.6))",
    },
  },
} as const;

function BuilderName({
  href,
  label,
  children,
}: {
  href?: string;
  label: string;
  children: string;
}) {
  if (href) {
    return (
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        underline="none"
        aria-label={label}
        sx={builderNameSx}
      >
        {children}
      </Link>
    );
  }
  return (
    <Box component="span" aria-label={label} sx={builderNameSx}>
      {children}
    </Box>
  );
}

const legalLinkSx = {
  position: "relative",
  alignSelf: "flex-start",
  display: "inline-flex",
  alignItems: "center",
  gap: 0.75,
  px: 0.25,
  py: 0.5,
  borderRadius: 1,
  typography: "body2",
  color: "text.secondary",
  fontWeight: 500,
  transition: "color 180ms ease",
  "&::after": {
    content: '""',
    position: "absolute",
    left: 0,
    right: "100%",
    bottom: 2,
    height: 1.5,
    borderRadius: 1,
    bgcolor: "primary.main",
    transition: "right 220ms ease",
  },
  "&:hover, &:focus-visible": {
    color: "text.primary",
    "&::after": { right: 0 },
  },
} as const;
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
  const { consented: telemetryConsented, setConsented: setTelemetryConsented } =
    useTelemetryConsent();
  const plausibleConfigured = Boolean(getPlausibleDomain());
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [backupMenuAnchor, setBackupMenuAnchor] = useState<HTMLElement | null>(null);
  const [legalOpen, setLegalOpen] = useState(false);
  const [legalDocId, setLegalDocId] = useState<LegalDocId>("privacy");
  const [open, setOpen] = useState(false);

  const openLegal = (id: LegalDocId) => {
    setLegalDocId(id);
    setLegalOpen(true);
  };
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
              No account, no sync server. What you write never leaves your machine.
            </Typography>
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            Because it lives in your browser&rsquo;s storage, clearing your browser data
            will erase it. If something&rsquo;s worth keeping, export a backup from time
            to time.
          </Typography>

          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={telemetryConsented}
                disabled={!plausibleConfigured}
                onChange={(event) => setTelemetryConsented(event.target.checked)}
              />
            }
            label="Share anonymous visit stats"
            slotProps={{
              typography: { variant: "body2", color: "text.secondary" },
            }}
            sx={{ ml: 0, mr: 0, alignItems: "flex-start", gap: 1 }}
          />
          {plausibleConfigured ? (
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5, pl: 0.25 }}>
              Off by default. When on, only coarse visit counts (via Plausible) — never your lists or
              notes. Details in Privacy Policy.
            </Typography>
          ) : null}

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

      <Divider sx={{ my: 2, borderColor: "divider", opacity: 0.7 }} />

      <OptionsSection label="About & legal">
        <Stack spacing={0.5}>
          <ButtonBase
            onClick={() => openLegal("privacy")}
            aria-haspopup="dialog"
            sx={legalLinkSx}
          >
            <PolicyOutlinedIcon sx={{ fontSize: "1.05rem" }} aria-hidden />
            Privacy Policy
          </ButtonBase>
          <ButtonBase
            onClick={() => openLegal("about")}
            aria-haspopup="dialog"
            sx={legalLinkSx}
          >
            <InfoOutlinedIcon sx={{ fontSize: "1.05rem" }} aria-hidden />
            About
          </ButtonBase>
          <Typography
            variant="caption"
            component="p"
            sx={{
              pt: 1.25,
              width: "100%",
              textAlign: "center",
              color: "text.disabled",
              letterSpacing: "0.06em",
              fontWeight: 500,
            }}
          >
            <span aria-hidden>🌊</span> By{" "}
            <BuilderName href={TK_SITE_URL} label="TK — timknab.dev">
              TK
            </BuilderName>
            {" & "}
            <BuilderName href={TY_SITE_URL} label="Ty — LinkedIn">
              Ty
            </BuilderName>
          </Typography>
        </Stack>
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

      <LegalDocsDialog
        key={legalOpen ? `legal-${legalDocId}` : "legal-closed"}
        open={legalOpen}
        onClose={() => setLegalOpen(false)}
        initialDocId={legalDocId}
      />
    </>
  );
}
