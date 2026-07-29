"use client";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import ChevronLeftOutlinedIcon from "@mui/icons-material/ChevronLeftOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { NotepadTab } from "@/lib/notepad";

type NotepadTabStripProps = {
  tabs: NotepadTab[];
  activeTabId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onRename: (id: string, title: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onDelete: (id: string) => void;
};

/**
 * Calm tab strip for the engineering notepad — select, add, rename, reorder, delete.
 * See specs/021-notepad-tabs-grove-rows/contracts/notepad-tabs-ui-contract.md.
 */
export default function NotepadTabStrip({
  tabs,
  activeTabId,
  onSelect,
  onAdd,
  onRename,
  onMove,
  onDelete,
}: NotepadTabStripProps) {
  const reduce = useReducedMotion();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeIndex = tabs.findIndex((t) => t.id === activeTabId);
  const canDelete = tabs.length > 1;
  const confirmTab = confirmId ? tabs.find((t) => t.id === confirmId) : null;

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const startRename = (tab: NotepadTab) => {
    setEditingId(tab.id);
    setDraft(tab.title);
  };

  const commitRename = () => {
    if (!editingId) return;
    onRename(editingId, draft);
    setEditingId(null);
  };

  const cancelRename = () => {
    setEditingId(null);
  };

  const requestDelete = (tab: NotepadTab) => {
    if (!canDelete) return;
    if (tab.body.trim().length === 0) {
      onDelete(tab.id);
      return;
    }
    setConfirmId(tab.id);
  };

  return (
    <>
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: "center", minWidth: 0, width: "100%" }}
      >
        <Box
          role="tablist"
          aria-label="Notepad tabs"
          sx={{
            display: "flex",
            gap: 0.75,
            flexGrow: 1,
            minWidth: 0,
            overflowX: "auto",
            scrollbarWidth: "thin",
            py: 0.25,
          }}
        >
          {tabs.map((tab) => {
            const selected = tab.id === activeTabId;
            const editing = editingId === tab.id;
            return (
              <Box
                key={tab.id}
                role="tab"
                aria-selected={selected}
                tabIndex={selected ? 0 : -1}
                onClick={() => {
                  if (!editing) onSelect(tab.id);
                }}
                onDoubleClick={(e) => {
                  e.preventDefault();
                  startRename(tab);
                }}
                onKeyDown={(e) => {
                  if (editing) return;
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(tab.id);
                  } else if (e.key === "F2") {
                    e.preventDefault();
                    startRename(tab);
                  }
                }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.25,
                  flexShrink: 0,
                  maxWidth: 200,
                  px: 1.25,
                  py: 0.5,
                  borderRadius: 2,
                  cursor: "pointer",
                  bgcolor: selected ? "action.selected" : "transparent",
                  border: "1px solid",
                  borderColor: selected ? "divider" : "transparent",
                  color: selected ? "text.primary" : "text.secondary",
                  "&:hover": {
                    bgcolor: selected ? "action.selected" : "action.hover",
                  },
                }}
              >
                {editing ? (
                  <TextField
                    inputRef={inputRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={commitRename}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                      if (e.key === "Enter") {
                        e.preventDefault();
                        commitRename();
                      } else if (e.key === "Escape") {
                        e.preventDefault();
                        cancelRename();
                      }
                    }}
                    variant="standard"
                    size="small"
                    aria-label="Rename tab"
                    slotProps={{ input: { disableUnderline: true } }}
                    sx={{
                      minWidth: 80,
                      "& .MuiInputBase-input": {
                        typography: "body2",
                        py: 0,
                        fontWeight: 500,
                      },
                    }}
                  />
                ) : (
                  <Typography
                    variant="body2"
                    noWrap
                    title={tab.title}
                    sx={{ fontWeight: selected ? 600 : 500, maxWidth: 140 }}
                  >
                    {tab.title}
                  </Typography>
                )}
                {canDelete && !editing && (
                  <IconButton
                    size="small"
                    aria-label={`Delete tab ${tab.title}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      requestDelete(tab);
                    }}
                    sx={{ p: 0.25, color: "text.secondary" }}
                  >
                    <CloseOutlinedIcon sx={{ fontSize: "0.95rem" }} />
                  </IconButton>
                )}
              </Box>
            );
          })}
        </Box>

        <Stack direction="row" spacing={0.25} sx={{ flexShrink: 0 }}>
          <Tooltip title="Move tab left">
            <span>
              <IconButton
                size="small"
                aria-label="Move active tab left"
                disabled={activeIndex <= 0}
                onClick={() => onMove(activeTabId, -1)}
              >
                <ChevronLeftOutlinedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Move tab right">
            <span>
              <IconButton
                size="small"
                aria-label="Move active tab right"
                disabled={activeIndex < 0 || activeIndex >= tabs.length - 1}
                onClick={() => onMove(activeTabId, 1)}
              >
                <ChevronRightOutlinedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="New tab">
            <IconButton size="small" aria-label="Add notepad tab" onClick={onAdd} color="inherit">
              <AddOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      <Dialog
        open={Boolean(confirmTab)}
        onClose={() => setConfirmId(null)}
        transitionDuration={reduce ? 0 : undefined}
        aria-labelledby="delete-tab-title"
      >
        <DialogTitle id="delete-tab-title">Delete this tab?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            “{confirmTab?.title}” has notes in it. Deleting removes that content from this
            device. This can’t be undone here.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmId(null)} color="inherit">
            Keep tab
          </Button>
          <Button
            onClick={() => {
              if (confirmId) onDelete(confirmId);
              setConfirmId(null);
            }}
            color="inherit"
            variant="outlined"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
