"use client";

import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import MarkdownPreview from "@/components/MarkdownPreview";

export type NotepadMode = "write" | "preview";

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

/**
 * Controlled engineering markdown notepad with exclusive Write / Preview modes.
 * Mode may be lifted to the shell so tab switches keep write vs preview.
 * See specs/021-notepad-tabs-grove-rows (extends 011 notepad UI).
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
      <ToggleButtonGroup
        value={mode}
        exclusive
        size="small"
        aria-label="Notepad display mode"
        onChange={(_, next: NotepadMode | null) => {
          if (next) setMode(next);
        }}
        sx={{
          mb: 1.5,
          alignSelf: "flex-start",
          "& .MuiToggleButton-root": {
            minHeight: 26,
            minWidth: 0,
            px: 1,
            py: 0.125,
            borderRadius: 1,
            typography: "caption",
            lineHeight: 1.4,
            textTransform: "none",
          },
        }}
      >
        <ToggleButton value="write" aria-label="Write mode">
          Write
        </ToggleButton>
        <ToggleButton value="preview" aria-label="Preview mode">
          Preview
        </ToggleButton>
      </ToggleButtonGroup>

      <Box sx={{ position: "relative", flexGrow: 1, minHeight: 200 }}>
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
                aria-label="Notepad"
                slotProps={{ input: { disableUnderline: true } }}
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
              key="preview"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? undefined : { opacity: 0 }}
              transition={reduce ? { duration: 0 } : { duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              <MarkdownPreview markdown={value} sx={{ minHeight: 200 }} />
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </Box>
  );
}
