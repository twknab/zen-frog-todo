"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
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

const RichNotepadEditor = dynamic(() => import("@/components/RichNotepadEditor"), {
  ssr: false,
  loading: () => (
    <Box sx={{ height: "100%", minHeight: 0, typography: "body2", color: "text.secondary", py: 1 }}>
      Loading editor…
    </Box>
  ),
});

class RichEditorBoundary extends Component<
  { children: ReactNode; onFallback: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    // Keep notes reachable via Write mode — no telemetry (FR-010).
  }

  render() {
    if (this.state.failed) {
      return (
        <Stack spacing={1} sx={{ height: "100%", minHeight: 0, py: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Rich editing is unavailable right now. Switch to Write to keep editing your notes as
            markdown.
          </Typography>
          <ButtonBase
            onClick={this.props.onFallback}
            sx={{
              alignSelf: "flex-start",
              typography: "caption",
              fontWeight: 650,
              color: "primary.main",
              py: 0.5,
            }}
          >
            Switch to Write
          </ButtonBase>
        </Stack>
      );
    }
    return (
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, flexGrow: 1 }}>
        {this.props.children}
      </Box>
    );
  }
}

/**
 * Controlled engineering notepad: raw markdown Write mode + live TipTap Rich mode.
 * Mode may be lifted to the shell so tab switches keep write vs rich.
 * See specs/022-wysiwyg-notepad.
 */
export default function MarkdownNotepad({
  value,
  onChange,
  placeholder = DEFAULT_PLACEHOLDER,
  mode: modeProp,
  onModeChange,
}: MarkdownNotepadProps) {
  const [internalMode, setInternalMode] = useState<NotepadMode>("write");
  const mode = modeProp ?? internalMode;
  const setMode = onModeChange ?? setInternalMode;
  const reduce = useReducedMotion();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1, minHeight: 0 }}>
      <Stack
        direction="row"
        role="group"
        aria-label="Notepad display mode"
        spacing={1.5}
        sx={{
          mb: 0.75,
          alignSelf: "flex-start",
        }}
      >
        {(["write", "rich"] as const).map((option) => {
          const active = mode === option;
          const label = option === "write" ? "Write" : "Rich";
          return (
            <ButtonBase
              key={option}
              aria-label={`${label} mode`}
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
              {label}
            </ButtonBase>
          );
        })}
      </Stack>

      <Box sx={{ position: "relative", flexGrow: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <AnimatePresence mode="wait" initial={false}>
          {mode === "write" ? (
            <motion.div
              key="write"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? undefined : { opacity: 0 }}
              transition={reduce ? { duration: 0 } : { duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              style={{ height: "100%", display: "flex", flexDirection: "column", flexGrow: 1, minHeight: 0 }}
            >
              <TextField
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                multiline
                minRows={16}
                fullWidth
                variant="standard"
                aria-label="Notepad"
                slotProps={{ input: { disableUnderline: true } }}
                sx={{
                  height: "100%",
                  flexGrow: 1,
                  "& .MuiInputBase-root": {
                    height: "100%",
                    typography: "body2",
                    lineHeight: 1.65,
                    alignItems: "flex-start",
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  },
                  "& .MuiInputBase-input": {
                    height: "100% !important",
                    overflow: "auto !important",
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
              style={{ height: "100%", display: "flex", flexDirection: "column", flexGrow: 1, minHeight: 0 }}
            >
              <RichEditorBoundary onFallback={() => setMode("write")}>
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
