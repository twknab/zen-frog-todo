"use client";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ChevronLeftOutlinedIcon from "@mui/icons-material/ChevronLeftOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  downloadSandSvg,
  type SandDrawing,
} from "@/lib/sand";

export type SandLightboxItem = {
  id: string;
  src: string;
  drawing?: SandDrawing;
};

type SandSnapshotLightboxProps = {
  /** Drawings to browse; dialog is open while non-empty and index is set. */
  items: SandLightboxItem[];
  /** Starting index when opened; null closes. */
  index: number | null;
  /** Accessible / visible title — should reference the date or "Today". */
  label: string;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
};

/**
 * Calm lightbox for sand day keepsakes (specs/011-sand-day-snapshots).
 * Supports a multi-drawing gallery with prev/next, Escape dismiss, SVG
 * download when vector markup is available, and reduced-motion collapses.
 */
export default function SandSnapshotLightbox({
  items,
  index,
  label,
  onClose,
  onIndexChange,
}: SandSnapshotLightboxProps) {
  const reduce = useReducedMotion();
  const open = index !== null && items.length > 0;
  const safeIndex = index === null ? 0 : Math.min(Math.max(0, index), Math.max(0, items.length - 1));
  const current = items[safeIndex];
  const multi = items.length > 1;

  // Keep title stable through close animation.
  const [title, setTitle] = useState(label);
  useEffect(() => {
    if (open) setTitle(label);
  }, [open, label]);

  function go(delta: number) {
    if (!multi || index === null) return;
    const next = (safeIndex + delta + items.length) % items.length;
    onIndexChange?.(next);
  }

  const detailLabel =
    multi && current
      ? `${title} (${safeIndex + 1} of ${items.length})`
      : title;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      transitionDuration={reduce ? 0 : undefined}
      aria-labelledby="sand-snapshot-title"
    >
      {current && (
        <>
          <DialogTitle id="sand-snapshot-title" sx={{ pb: 1 }}>
            {detailLabel}
          </DialogTitle>
          <DialogContent sx={{ pt: 0 }}>
            <Stack spacing={1.5} sx={{ alignItems: "center" }}>
              {multi && (
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", width: "100%" }}>
                  <IconButton
                    aria-label="Previous sand drawing"
                    onClick={() => go(-1)}
                    size="small"
                  >
                    <ChevronLeftOutlinedIcon />
                  </IconButton>
                  <Typography variant="caption" color="text.secondary" sx={{ flex: 1, textAlign: "center" }}>
                    Drawing {safeIndex + 1} of {items.length}
                  </Typography>
                  <IconButton
                    aria-label="Next sand drawing"
                    onClick={() => go(1)}
                    size="small"
                  >
                    <ChevronRightOutlinedIcon />
                  </IconButton>
                </Stack>
              )}
              {/* eslint-disable-next-line @next/next/no-img-element -- SVG/data URL keepsake, not a static asset */}
              <img
                src={current.src}
                alt={detailLabel}
                style={{
                  display: "block",
                  width: "100%",
                  height: "auto",
                  borderRadius: 12,
                  backgroundColor: "transparent",
                }}
              />
            </Stack>
          </DialogContent>
          {current.drawing && (
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button
                onClick={() => downloadSandSvg(current.drawing!)}
                color="inherit"
                sx={{ textTransform: "none" }}
              >
                Download SVG
              </Button>
            </DialogActions>
          )}
        </>
      )}
    </Dialog>
  );
}
