"use client";

import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import StickyNote2OutlinedIcon from "@mui/icons-material/StickyNote2Outlined";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import MarkdownNotepad, { type NotepadMode } from "@/components/MarkdownNotepad";
import NotepadTabStrip from "@/components/NotepadTabStrip";
import type { UseNotepadResult } from "@/lib/notepad";
import {
  notepadTabsFromExportField,
  titleFromFilename,
} from "@/lib/notepad";

type NotepadShellProps = {
  open: boolean;
  onClose: () => void;
  notepad: UseNotepadResult;
};

/**
 * Full-screen surface for the tabbed engineering notepad.
 * See specs/021-notepad-tabs-grove-rows/contracts/notepad-tabs-ui-contract.md.
 */
export default function NotepadShell({ open, onClose, notepad }: NotepadShellProps) {
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<NotepadMode>("write");
  const [importError, setImportError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const wasOpen = useRef(false);

  // Default to Write each time the shell opens (session mode shared across tabs while open).
  useEffect(() => {
    if (open && !wasOpen.current) {
      setMode("write");
      setImportError(null);
    }
    wasOpen.current = open;
  }, [open]);

  const {
    document,
    activeTab,
    setActiveTabId,
    updateActiveBody,
    addTab,
    renameTab,
    moveTab,
    deleteTab,
    importMarkdown,
    mergeImportedTabs,
  } = notepad;

  const handleImportFile = async (file: File | undefined) => {
    setImportError(null);
    if (!file) return;
    const name = file.name.toLowerCase();
    try {
      const text = await file.text();
      if (name.endsWith(".json")) {
        let parsed: unknown;
        try {
          parsed = JSON.parse(text) as unknown;
        } catch {
          setImportError("That JSON file couldn’t be read. Your notes are unchanged.");
          return;
        }
        if (
          !parsed ||
          typeof parsed !== "object" ||
          (parsed as { kind?: string }).kind !== "full"
        ) {
          setImportError(
            "That doesn’t look like a full Frog Garden backup. Your notes are unchanged.",
          );
          return;
        }
        const tabs = notepadTabsFromExportField((parsed as { notepad?: unknown }).notepad);
        if (tabs.length === 0) {
          setImportError("That backup had no notepad notes to add.");
          return;
        }
        mergeImportedTabs(tabs);
        return;
      }
      if (
        name.endsWith(".md") ||
        name.endsWith(".markdown") ||
        name.endsWith(".txt") ||
        file.type.startsWith("text/")
      ) {
        importMarkdown(titleFromFilename(file.name), text);
        return;
      }
      setImportError("Try a markdown (.md) or full backup (.json) file. Your notes are unchanged.");
    } catch {
      setImportError("That file couldn’t be opened. Your notes are unchanged.");
    }
  };

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
        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
          <input
            ref={fileRef}
            type="file"
            accept=".md,.markdown,.txt,.json,text/markdown,text/plain,application/json"
            hidden
            onChange={(e) => {
              void handleImportFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <Tooltip title="Import markdown or backup">
            <IconButton
              aria-label="Import markdown or backup"
              size="small"
              onClick={() => fileRef.current?.click()}
            >
              <FileUploadOutlinedIcon />
            </IconButton>
          </Tooltip>
          <IconButton onClick={onClose} aria-label="Close notepad" edge="end" size="small">
            <CloseOutlinedIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          pt: 2,
          px: { xs: 2, md: 3 },
          pb: 3,
          gap: 2,
        }}
      >
        <NotepadTabStrip
          tabs={document.tabs}
          activeTabId={document.activeTabId}
          onSelect={setActiveTabId}
          onAdd={addTab}
          onRename={renameTab}
          onMove={moveTab}
          onDelete={deleteTab}
        />

        {importError && (
          <Alert
            severity="info"
            onClose={() => setImportError(null)}
            sx={{ borderRadius: 2 }}
          >
            {importError}
          </Alert>
        )}

        <Box sx={{ flexGrow: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
          {open && (
            <MarkdownNotepad
              key="open"
              value={activeTab.body}
              onChange={updateActiveBody}
              mode={mode}
              onModeChange={setMode}
            />
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
