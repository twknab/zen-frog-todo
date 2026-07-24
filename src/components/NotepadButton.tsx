"use client";

import StickyNote2OutlinedIcon from "@mui/icons-material/StickyNote2Outlined";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

type NotepadButtonProps = {
  onClick: () => void;
};

/**
 * Upper-right header control that opens the persistent engineering notepad.
 * Visible in Flow and Focus Mode (specs/011-markdown-notepad).
 *
 * Icon: StickyNote2Outlined — reads as a sticky/notepad rather than a
 * text-orientation / list block (NotesOutlined).
 */
export default function NotepadButton({ onClick }: NotepadButtonProps) {
  return (
    <Tooltip title="Open notepad">
      <IconButton
        onClick={onClick}
        aria-label="Open notepad"
        sx={{ color: "text.secondary" }}
      >
        <StickyNote2OutlinedIcon />
      </IconButton>
    </Tooltip>
  );
}
