"use client";

import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import { useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  archiveEntryLabel,
  archiveFilename,
  buildSingleDayExport,
  downloadJson,
  useArchive,
  useExportEverything,
  type ArchivedDay,
} from "@/lib/dayArchive";

/**
 * Header menu for exporting archived days as JSON (spec 007, US2). Lists each
 * archived day (date, plus a time when a date repeats), each downloadable on
 * its own. A calm empty-state shows when nothing is archived yet. Fully
 * on-device — no network. ("Export everything" is added in US3.)
 */
export default function ExportMenu() {
  const archive = useArchive();
  const exportEverything = useExportEverything();
  const reduce = useReducedMotion();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // How many entries share each date — drives same-date time disambiguation.
  const dateCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const day of archive) counts.set(day.date, (counts.get(day.date) ?? 0) + 1);
    return counts;
  }, [archive]);

  const close = () => setAnchorEl(null);

  const exportDay = (day: ArchivedDay) => {
    const count = dateCounts.get(day.date) ?? 1;
    downloadJson(archiveFilename(day, count), buildSingleDayExport(day));
    close();
  };

  const exportAll = () => {
    exportEverything();
    close();
  };

  return (
    <>
      <Tooltip title="Export your days">
        <IconButton
          onClick={(event) => setAnchorEl(event.currentTarget)}
          aria-label="Export archived days"
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
        slotProps={{ list: { "aria-label": "Export archived days", dense: true } }}
      >
        {archive.length === 0 ? (
          <MenuItem disabled>
            <ListItemText
              primary="No archived days yet"
              secondary="Start a new day to save one."
            />
          </MenuItem>
        ) : (
          archive.map((day) => (
            <MenuItem key={day.id} onClick={() => exportDay(day)}>
              <ListItemText primary={archiveEntryLabel(day, dateCounts.get(day.date) ?? 1)} />
            </MenuItem>
          ))
        )}

        <Divider />

        <MenuItem onClick={exportAll}>
          <ListItemIcon>
            <Inventory2OutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Export everything" secondary="All days + today, as one file" />
        </MenuItem>
      </Menu>
    </>
  );
}
