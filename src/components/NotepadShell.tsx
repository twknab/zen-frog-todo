"use client";

import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
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
          py: 1.5,
          px: { xs: 2, md: 3 },
        }}
      >
        <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
          <NotesOutlinedIcon color="primary" />
          <Typography variant="h6" component="span">
            Notepad
          </Typography>
        </Stack>
        <IconButton onClick={onClose} aria-label="Close notepad" edge="end">
          <CloseOutlinedIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          pt: 2.5,
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
