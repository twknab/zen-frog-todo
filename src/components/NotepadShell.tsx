"use client";

import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import StickyNote2OutlinedIcon from "@mui/icons-material/StickyNote2Outlined";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useReducedMotion } from "framer-motion";
import MarkdownNotepad from "@/components/MarkdownNotepad";

type NotepadShellProps = {
  open: boolean;
  onClose: () => void;
  value: string;
  onChange: (next: string) => void;
};

/**
 * Full-screen surface for the engineering notepad. Escape/close dismisses
 * without a discard prompt — content auto-persists via the parent.
 * See specs/011-markdown-notepad/contracts/notepad-ui-contract.md.
 *
 * Chrome is intentionally light: small title row, soft divider, more room
 * for the writing surface.
 */
export default function NotepadShell({
  open,
  onClose,
  value,
  onChange,
}: NotepadShellProps) {
  const reduce = useReducedMotion();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      transitionDuration={reduce ? 0 : undefined}
      aria-labelledby="notepad-title"
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
        id="notepad-title"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          borderBottom: 1,
          borderColor: "divider",
          py: 1,
          px: { xs: 2, md: 3 },
          minHeight: 48,
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <StickyNote2OutlinedIcon
            sx={{ color: "text.secondary", fontSize: "1.25rem" }}
            aria-hidden
          />
          <Typography
            variant="subtitle1"
            component="span"
            sx={{ fontWeight: 600, color: "text.primary" }}
          >
            Notepad
          </Typography>
        </Stack>
        <IconButton onClick={onClose} aria-label="Close notepad" edge="end" size="small">
          <CloseOutlinedIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          pt: 3,
          px: { xs: 2, md: 3 },
          pb: 3,
        }}
      >
        {/* Remount on each open so mode defaults to Write (FR-003). */}
        {open && <MarkdownNotepad key="open" value={value} onChange={onChange} />}
      </DialogContent>
    </Dialog>
  );
}
