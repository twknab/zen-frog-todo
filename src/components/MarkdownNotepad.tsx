"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import { Component, useState, type ReactNode } from "react";

export type NotepadMode = "write" | "rich";

type MarkdownNotepadProps = {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  /** When provided with onModeChange, mode is controlled by the parent (shared across tabs). */
  mode?: NotepadMode;
  onModeChange?: (mode: NotepadMode) => void;
};

const DEFAULT_PLACEHOLDER =
  "Scratchpad for notes, plans, and scraps — markdown welcome. Nothing here is graded.";

const MODE_LABELS: Record<NotepadMode, string> = {
  // Common CMS pairing: Visual = WYSIWYG, Text = plain markdown source.
  rich: "Visual",
  write: "Text",
};

// The TipTap editor is a meaningfully heavy chunk — load it only when the
// rich mode actually renders (notepad open), never on the dashboard path
// (spec 022, FR-009).
const RichNotepadEditor = dynamic(() => import("./RichNotepadEditor"), {
  ssr: false,
  loading: () => (
    <Stack sx={{ alignItems: "center", justifyContent: "center", minHeight: 200 }}>
      <CircularProgress size={20} color="inherit" sx={{ color: "text.disabled" }} />
    </Stack>
  ),
});

/**
 * Controlled engineering notepad with exclusive Visual (WYSIWYG) / Text
 * (raw markdown) modes over one markdown document (spec 022, extends 021/011).
 * Mode may be lifted to the shell so tab switches keep the chosen mode.
 */
export default function MarkdownNotepad({
  value,
  onChange,
  placeholder = DEFAULT_PLACEHOLDER,
  mode: modeProp,
  onModeChange,
}: MarkdownNotepadProps) {
  const [internalMode, setInternalMode] = useState<NotepadMode>("rich");
  const mode = modeProp ?? internalMode;
  const setMode = onModeChange ?? setInternalMode;
  const reduce = useReducedMotion();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1, minHeight: 0 }}>
      <Stack
        direction="row"
        role="group"
        aria-label="Notepad editing mode"
        spacing={1.5}
        sx={{
          mb: 0.75,
          alignSelf: "flex-start",
        }}
      >
        {(["rich", "write"] as const).map((option) => {
          const active = mode === option;
          return (
            <ButtonBase
              key={option}
              aria-label={`${MODE_LABELS[option]} mode`}
              aria-pressed={active}
              onClick={() => setMode(option)}
              sx={{
                position: "relative",
                minHeight: 24,
                px: 0,
                py: 0.25,
                borderRadius: 0,
                color: active ? "text.primary" : "text.secondary",
                typography: "caption",
                fontWeight: active ? 650 : 500,
                "&::after": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: 1.5,
                  borderRadius: 1,
                  bgcolor: active ? "primary.main" : "transparent",
                },
                "&:hover": { color: "text.primary" },
              }}
            >
              {MODE_LABELS[option]}
            </ButtonBase>
          );
        })}
      </Stack>

      <Box
        sx={{
          position: "relative",
          flexGrow: 1,
          minHeight: 200,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {mode === "write" ? (
            <motion.div
              key="write"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? undefined : { opacity: 0 }}
              transition={reduce ? { duration: 0 } : { duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              style={{ height: "100%" }}
            >
              <TextField
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                multiline
                minRows={16}
                fullWidth
                variant="standard"
                slotProps={{
                  input: { disableUnderline: true },
                  // htmlInput so the label lands on the real <textarea> —
                  // a top-level aria-label stops at MUI's wrapper div.
                  htmlInput: { "aria-label": "Notepad markdown source" },
                }}
                sx={{
                  height: "100%",
                  "& .MuiInputBase-root": {
                    typography: "body2",
                    lineHeight: 1.65,
                    alignItems: "flex-start",
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  },
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="rich"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? undefined : { opacity: 0 }}
              transition={reduce ? { duration: 0 } : { duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: "flex", flexDirection: "column", flexGrow: 1, minHeight: 0 }}
            >
              <RichEditorBoundary>
                <RichNotepadEditor
                  value={value}
                  onChange={onChange}
                  placeholder={placeholder}
                />
              </RichEditorBoundary>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </Box>
  );
}

/**
 * If the rich editor chunk fails to load or init, keep the notepad usable:
 * a quiet message — Text mode remains one tap away (FR-010). Notes
 * are never inaccessible.
 */
class RichEditorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ py: 3, textAlign: "center" }}
        >
          Visual editing couldn&rsquo;t load here — your notes are safe. Switch to
          Text above to keep writing.
        </Typography>
      );
    }
    return this.props.children;
  }
}
