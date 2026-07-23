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
};

const DEFAULT_PLACEHOLDER =
  "Scratchpad for notes, plans, and scraps — markdown welcome. Nothing here is graded.";

/**
 * Controlled engineering markdown notepad with exclusive Write / Preview modes.
 * Mode is session-only (defaults to Write on mount). See
 * specs/011-markdown-notepad/contracts/notepad-ui-contract.md.
 */
export default function MarkdownNotepad({
  value,
  onChange,
  placeholder = DEFAULT_PLACEHOLDER,
}: MarkdownNotepadProps) {
  const [mode, setMode] = useState<NotepadMode>("write");
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
        sx={{ mb: 1.5, alignSelf: "flex-start" }}
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
