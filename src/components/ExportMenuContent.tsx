"use client";

import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import Divider from "@mui/material/Divider";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Tooltip from "@mui/material/Tooltip";
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
import {
  downloadNote,
  useNotepadTabs,
  type NoteExportFormat,
  type NotepadTab,
} from "@/lib/notepad";

type ExportMenuContentProps = {
  /** Called after a download starts — e.g. close a Menu. */
  onDone?: () => void;
};

/**
 * Shared body for the header download menu: archived days, full Excel/JSON
 * backups, and per-note downloads with a Markdown / plain-text toggle.
 * Fully on-device — no network.
 *
 * Uses ListItemButton (not MenuItem) so the same tree works inside Menu
 * without requiring a separate MenuList wrapper in other hosts.
 */
export default function ExportMenuContent({ onDone }: ExportMenuContentProps) {
  const archive = useArchive();
  const exportEverything = useExportEverything();
  const exportEverythingXlsx = useExportEverythingXlsx();
  const noteTabs = useNotepadTabs();
  const [noteFormat, setNoteFormat] = useState<NoteExportFormat>("md");

  const dateCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const day of archive) counts.set(day.date, (counts.get(day.date) ?? 0) + 1);
    return counts;
  }, [archive]);

  const exportDay = (day: ArchivedDay) => {
    const count = dateCounts.get(day.date) ?? 1;
    downloadJson(archiveFilename(day, count), buildSingleDayExport(day));
    onDone?.();
  };

  const exportAllXlsx = () => {
    exportEverythingXlsx();
    onDone?.();
  };

  const exportAllJson = () => {
    exportEverything();
    onDone?.();
  };

  const exportNote = (tab: NotepadTab) => {
    downloadNote(tab, noteFormat);
    onDone?.();
  };

  return (
    <>
      {archive.length === 0 ? (
        <ListItemButton disabled>
          <ListItemText
            primary="No archived days yet"
            secondary="Start a new day to save one."
          />
        </ListItemButton>
      ) : (
        archive.map((day) => (
          <ListItemButton key={day.id} onClick={() => exportDay(day)}>
            <ListItemText primary={archiveEntryLabel(day, dateCounts.get(day.date) ?? 1)} />
          </ListItemButton>
        ))
      )}

      <Divider />

      <ListItemButton onClick={exportAllXlsx}>
        <ListItemIcon>
          <TableChartOutlinedIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText
          primary="Export everything (Excel)"
          secondary="All days + today, one spreadsheet"
        />
      </ListItemButton>

      <ListItemButton onClick={exportAllJson}>
        <ListItemIcon>
          <Inventory2OutlinedIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText
          primary="Full backup (JSON)"
          secondary="Everything, re-importable"
        />
      </ListItemButton>

      <Divider />

      <Tooltip title="Download individual notes below" placement="top">
        <ListSubheader
          component="div"
          sx={{
            lineHeight: "32px",
            bgcolor: "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          Notes
          <ToggleButtonGroup
            exclusive
            size="small"
            value={noteFormat}
            aria-label="Note download format"
            onChange={(_event, next: NoteExportFormat | null) => {
              if (next !== null) setNoteFormat(next);
            }}
            sx={{ "& .MuiToggleButton-root": { px: 1, py: 0.25, fontSize: "0.7rem" } }}
          >
            <ToggleButton value="md" aria-label="Markdown (.md)">
              .md
            </ToggleButton>
            <ToggleButton value="txt" aria-label="Plain text (.txt)">
              .txt
            </ToggleButton>
          </ToggleButtonGroup>
        </ListSubheader>
      </Tooltip>

      {noteTabs.map((tab) => (
        <ListItemButton key={tab.id} onClick={() => exportNote(tab)}>
          <ListItemIcon>
            <DescriptionOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={tab.title} />
        </ListItemButton>
      ))}
    </>
  );
}
