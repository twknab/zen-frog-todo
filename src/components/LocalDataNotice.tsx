"use client";

import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import CloudOffOutlinedIcon from "@mui/icons-material/CloudOffOutlined";
import Alert from "@mui/material/Alert";
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
    <Alert
      severity="info"
      variant="outlined"
      icon={<CloudOffOutlinedIcon fontSize="inherit" />}
      role="status"
      sx={{
        mb: 2.5,
        alignItems: "flex-start",
        borderRadius: 2,
        bgcolor: "action.hover",
        borderColor: "divider",
        color: "text.primary",
        "& .MuiAlert-icon": { color: "text.secondary", pt: 0.75 },
        "& .MuiAlert-message": { width: "100%", py: 0.25 },
        "& .MuiAlert-action": { pt: 0.25, pr: 0.5 },
      }}
      action={
        <IconButton
          aria-label="Dismiss privacy notice"
          color="inherit"
          size="small"
          onClick={dismiss}
        >
          <CloseOutlinedIcon fontSize="small" />
        </IconButton>
      }
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 1.25, sm: 2 }}
        sx={{ alignItems: { xs: "stretch", sm: "center" }, width: "100%" }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55, flexGrow: 1 }}>
          Private by design — your tasks and notes stay in this browser, never on our servers.
          Grab a backup from Options whenever you like.
        </Typography>
        <Button
          size="small"
          variant="contained"
          color="primary"
          onClick={onExportCta}
          sx={{ alignSelf: { xs: "flex-start", sm: "center" }, flexShrink: 0 }}
        >
          Export a backup
        </Button>
      </Stack>
    </Alert>
  );
}
