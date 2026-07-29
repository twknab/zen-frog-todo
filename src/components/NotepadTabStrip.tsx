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
  const [draggedId, setDraggedId] = useState<string | null>(null);
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

  const selectRelativeTab = (direction: -1 | 1) => {
    if (tabs.length < 2 || activeIndex < 0) return;
    const nextIndex = (activeIndex + direction + tabs.length) % tabs.length;
    onSelect(tabs[nextIndex].id);
  };

  const reorderOnto = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;
    const from = tabs.findIndex((tab) => tab.id === draggedId);
    const to = tabs.findIndex((tab) => tab.id === targetId);
    if (from < 0 || to < 0) return;
    const direction: -1 | 1 = from < to ? 1 : -1;
    for (let step = 0; step < Math.abs(to - from); step += 1) {
      onMove(draggedId, direction);
    }
    onSelect(draggedId);
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
            gap: 0.25,
            flexGrow: 1,
            minWidth: 0,
            overflowX: "auto",
            scrollbarWidth: "thin",
            borderBottom: "1px solid",
            borderColor: "divider",
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
                aria-label={`${tab.title}. Drag to reorder; Alt plus arrow keys also reorder.`}
                tabIndex={selected ? 0 : -1}
                draggable={!editing}
                onClick={() => {
                  if (!editing) onSelect(tab.id);
                }}
                onDragStart={(event) => {
                  setDraggedId(tab.id);
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", tab.id);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  reorderOnto(tab.id);
                  setDraggedId(null);
                }}
                onDragEnd={() => setDraggedId(null)}
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
                  } else if (e.altKey && e.key === "ArrowLeft") {
                    e.preventDefault();
                    onMove(tab.id, -1);
                  } else if (e.altKey && e.key === "ArrowRight") {
                    e.preventDefault();
                    onMove(tab.id, 1);
                  } else if (e.key === "ArrowLeft") {
                    e.preventDefault();
                    selectRelativeTab(-1);
                  } else if (e.key === "ArrowRight") {
                    e.preventDefault();
                    selectRelativeTab(1);
                  }
                }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.25,
                  flexShrink: 0,
                  height: 32,
                  maxWidth: 168,
                  px: 1,
                  py: 0,
                  mb: "-1px",
                  borderRadius: "5px 5px 0 0",
                  cursor: draggedId === tab.id ? "grabbing" : "grab",
                  opacity: draggedId === tab.id ? 0.55 : 1,
                  bgcolor: selected ? "background.default" : "transparent",
                  border: "1px solid",
                  borderColor: selected ? "divider" : "transparent",
                  borderBottomColor: selected ? "background.default" : "divider",
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
                      minWidth: 64,
                      "& .MuiInputBase-input": {
                        typography: "caption",
                        py: 0,
                        fontWeight: 600,
                      },
                    }}
                  />
                ) : (
                  <Typography
                    variant="body2"
                    noWrap
                    title={tab.title}
                    sx={{
                      typography: "caption",
                      fontWeight: selected ? 600 : 500,
                      maxWidth: 116,
                    }}
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
                    sx={{
                      width: 18,
                      height: 18,
                      p: 0,
                      ml: 0.25,
                      color: "text.secondary",
                    }}
                  >
                    <CloseOutlinedIcon sx={{ fontSize: "0.78rem" }} />
                  </IconButton>
                )}
              </Box>
            );
          })}
        </Box>

        <Stack
          direction="row"
          spacing={0.125}
          sx={{
            flexShrink: 0,
            "& .MuiIconButton-root": {
              width: 28,
              height: 28,
              p: 0.5,
            },
          }}
        >
          <Tooltip title="Previous tab">
            <IconButton
              size="small"
              aria-label="Select previous tab"
              disabled={tabs.length < 2}
              onClick={() => selectRelativeTab(-1)}
            >
              <ChevronLeftOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Next tab">
            <IconButton
              size="small"
              aria-label="Select next tab"
              disabled={tabs.length < 2}
              onClick={() => selectRelativeTab(1)}
            >
              <ChevronRightOutlinedIcon fontSize="small" />
            </IconButton>
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
