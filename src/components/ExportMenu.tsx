"use client";

import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
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
  useExportEverythingXlsx,
  type ArchivedDay,
} from "@/lib/dayArchive";
import { downloadNoteMarkdown, useNotepadTabs, type NotepadTab } from "@/lib/notepad";

/**
 * Header menu for exporting your data (specs 007 + 022). Lists each archived
 * day (date, plus a time when a date repeats) as its own JSON download, an
 * "Export everything" spreadsheet (.xlsx) for reading outside the app, a JSON
 * full backup (the re-importable format), and each notepad note as its own
 * Markdown file. Fully on-device — no network.
 */
export default function ExportMenu() {
  const archive = useArchive();
  const exportEverything = useExportEverything();
  const exportEverythingXlsx = useExportEverythingXlsx();
  const noteTabs = useNotepadTabs();
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

  const exportAllXlsx = () => {
    exportEverythingXlsx();
    close();
  };

  const exportAllJson = () => {
    exportEverything();
    close();
  };

  const exportNote = (tab: NotepadTab) => {
    downloadNoteMarkdown(tab);
    close();
  };

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

        <MenuItem onClick={exportAllXlsx}>
          <ListItemIcon>
            <TableChartOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Export everything (Excel)"
            secondary="All days + today, one spreadsheet"
          />
        </MenuItem>

        <MenuItem onClick={exportAllJson}>
          <ListItemIcon>
            <Inventory2OutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Full backup (JSON)"
            secondary="Everything, re-importable"
          />
        </MenuItem>

        <Divider />

        <ListSubheader component="div" sx={{ lineHeight: "32px", bgcolor: "transparent" }}>
          Notes as Markdown
        </ListSubheader>

        {noteTabs.map((tab) => (
          <MenuItem key={tab.id} onClick={() => exportNote(tab)}>
            <ListItemIcon>
              <DescriptionOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={tab.title} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
