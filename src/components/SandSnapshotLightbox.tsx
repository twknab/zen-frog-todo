"use client";

import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useReducedMotion } from "framer-motion";

type SandSnapshotLightboxProps = {
  /** Data URL of the sand keepsake; dialog is open while non-null. */
  src: string | null;
  /** Accessible / visible title — should reference the date or "Today". */
  label: string;
  onClose: () => void;
};

/**
 * Calm lightbox for a sand day keepsake (specs/011-sand-day-snapshots).
 * Themed MUI Dialog; Escape/backdrop dismiss; reduced-motion collapses
 * transition duration. Image alt echoes the date-referenced label.
 */
export default function SandSnapshotLightbox({ src, label, onClose }: SandSnapshotLightboxProps) {
  const reduce = useReducedMotion();
  const open = src !== null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      transitionDuration={reduce ? 0 : undefined}
      aria-labelledby="sand-snapshot-title"
    >
      {src && (
        <>
          <DialogTitle id="sand-snapshot-title" sx={{ pb: 1 }}>
            {label}
          </DialogTitle>
          <DialogContent sx={{ pt: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- data URL keepsake, not a static asset */}
            <img
              src={src}
              alt={label}
              style={{
                display: "block",
                width: "100%",
                height: "auto",
                borderRadius: 12,
              }}
            />
          </DialogContent>
        </>
      )}
    </Dialog>
  );
}
