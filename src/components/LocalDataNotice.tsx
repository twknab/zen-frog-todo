"use client";

import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import CloudOffOutlinedIcon from "@mui/icons-material/CloudOffOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { usePrivacyNoticeAck } from "@/lib/privacyNotice";

type LocalDataNoticeProps = {
  /** Opens Options so the user can export from Your data. */
  onExportCta: () => void;
};

/**
 * One-time (per notice version) top-of-page reminder that Frog Garden is
 * local-first and private, with a calm CTA into Options → Export a backup.
 * Dismissing persists an ack; bump PRIVACY_NOTICE_VERSION to resurface.
 */
export default function LocalDataNotice({ onExportCta }: LocalDataNoticeProps) {
  const { acknowledged, dismiss } = usePrivacyNoticeAck();
  const [ready, setReady] = useState(false);

  // Wait until after mount so a stored ack never flashes the banner on hydrate.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true);
  }, []);

  if (!ready || acknowledged) return null;

  return (
    <Box
      role="status"
      aria-label="Local data privacy notice"
      sx={{
        mb: 2.5,
        px: { xs: 1.5, sm: 2 },
        py: { xs: 1.25, sm: 1.5 },
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Stack
        direction="row"
        spacing={{ xs: 1, sm: 1.5 }}
        sx={{ alignItems: "flex-start" }}
      >
        <CloudOffOutlinedIcon
          aria-hidden
          sx={{
            color: "text.secondary",
            fontSize: "1.2rem",
            mt: "3px",
            flexShrink: 0,
          }}
        />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 1.25, sm: 2 }}
          sx={{
            flexGrow: 1,
            minWidth: 0,
            alignItems: { xs: "stretch", sm: "center" },
          }}
        >
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: "text.primary", lineHeight: 1.4 }}
            >
              Private by design
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ lineHeight: 1.5, mt: 0.25 }}
            >
              Your garden stays in this browser — no account, no servers, no tracking.
              Export a backup from Options whenever you want one.
            </Typography>
          </Box>

          <Button
            size="small"
            variant="outlined"
            color="inherit"
            onClick={onExportCta}
            sx={{
              flexShrink: 0,
              alignSelf: { xs: "flex-start", sm: "center" },
              borderColor: "divider",
              color: "text.primary",
              px: 1.5,
              whiteSpace: "nowrap",
            }}
          >
            Export a backup
          </Button>
        </Stack>

        <IconButton
          aria-label="Dismiss privacy notice"
          size="small"
          onClick={dismiss}
          sx={{
            color: "text.secondary",
            mt: "-2px",
            mr: "-6px",
            flexShrink: 0,
          }}
        >
          <CloseOutlinedIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Box>
  );
}
