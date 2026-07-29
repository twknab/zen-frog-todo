"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
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
        {(["write", "preview"] as const).map((option) => {
          const active = mode === option;
          return (
            <ButtonBase
              key={option}
              aria-label={`${option === "write" ? "Write" : "Preview"} mode`}
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
              {option === "write" ? "Write" : "Preview"}
            </ButtonBase>
          );
        })}
      </Stack>

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
