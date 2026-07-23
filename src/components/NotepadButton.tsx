"use client";

import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

type NotepadButtonProps = {
  onClick: () => void;
};

/**
 * Upper-right header control that opens the persistent engineering notepad.
 * Visible in Flow and Focus Mode (specs/011-markdown-notepad).
 */
export default function NotepadButton({ onClick }: NotepadButtonProps) {
  return (
    <Tooltip title="Open notepad">
      <IconButton
        onClick={onClick}
        aria-label="Open notepad"
        sx={{ color: "text.secondary" }}
      >
        <NotesOutlinedIcon />
      </IconButton>
    </Tooltip>
  );
}
