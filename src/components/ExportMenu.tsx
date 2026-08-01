"use client";

import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Tooltip from "@mui/material/Tooltip";
import { useReducedMotion } from "framer-motion";
import { useState } from "react";
import ExportMenuContent from "@/components/ExportMenuContent";

/**
 * Header menu for exporting your data (specs 007 + 022). Lists archived days,
 * Excel / JSON full backups, and per-note downloads. Fully on-device — no network.
 */
export default function ExportMenu() {
  const reduce = useReducedMotion();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const close = () => setAnchorEl(null);

  return (
    <>
      <Tooltip title="Export your days">
        <IconButton
          onClick={(event) => setAnchorEl(event.currentTarget)}
          aria-label="Export archived days and notes"
          aria-haspopup="menu"
          aria-expanded={open}
          sx={{ color: "text.secondary" }}
        >
          <FileDownloadOutlinedIcon />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={close}
        transitionDuration={reduce ? 0 : undefined}
        slotProps={{ list: { "aria-label": "Export archived days and notes", dense: true } }}
      >
        <ExportMenuContent onDone={close} />
      </Menu>
    </>
  );
}
