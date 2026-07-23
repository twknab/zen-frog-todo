"use client";

import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import SandDrawingGallery from "@/components/SandDrawingGallery";
import SandSnapshotLightbox from "@/components/SandSnapshotLightbox";
import { archiveEntryLabel, type ArchivedDay } from "@/lib/dayArchive";
import { bonsaiStageLabel, type BonsaiStage } from "@/lib/bonsai";
import { drawingsFromArchivedDay } from "@/lib/sand";

type GroveDayDialogProps = {
  /** The selected day; the dialog is open while this is non-null. */
  day: ArchivedDay | null;
  /** How many archived entries share this day's date (drives the label). */
  sameDateCount: number;
  onClose: () => void;
};

/**
 * A calm, read-only recap of one archived day (specs/010-grove-history, US3):
 * its date, the reflection (only when written), and the tasks completed that
 * day. Sand drawings (011) appear as a bottom gallery; each thumb opens a
 * lightbox. MUI Dialog manages focus; motion collapses under prefers-reduced-motion.
 */
export default function GroveDayDialog({ day, sameDateCount, onClose }: GroveDayDialogProps) {
  const reduce = useReducedMotion();
  const [sandIndex, setSandIndex] = useState<number | null>(null);

  const open = day !== null;
  const label = day ? archiveEntryLabel(day, sameDateCount) : "";

  const sandItems = useMemo(() => {
    if (!day) return [];
    return drawingsFromArchivedDay(day).map((d, i) => ({
      id: d.id,
      src: d.src,
      drawing: d.drawing,
      alt: `Sand drawing ${i + 1} for ${label}`,
    }));
  }, [day, label]);

  const hasSand = sandItems.length > 0;
  const hasReflection = Boolean(day && day.reflection.trim() !== "");
  const hasTasks = Boolean(day && day.completedTasks.length > 0);

  return (
    <>
      <Dialog
        open={open}
        onClose={() => {
          setSandIndex(null);
          onClose();
        }}
        fullWidth
        maxWidth="xs"
        transitionDuration={reduce ? 0 : undefined}
        aria-labelledby="grove-day-title"
      >
        {day && (
          <>
            <DialogTitle id="grove-day-title" sx={{ pb: 0.5 }}>
              {label}
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {bonsaiStageLabel(day.bonsai.stage as BonsaiStage)}
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2.5} sx={{ mt: 1 }}>
                {hasReflection && (
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle2" component="h3" color="text.secondary">
                      Reflection
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {day.reflection.trim()}
                    </Typography>
                  </Stack>
                )}

                {hasReflection && hasTasks && <Divider flexItem />}

                <Stack spacing={0.5}>
                  <Typography variant="subtitle2" component="h3" color="text.secondary">
                    What was done
                  </Typography>
                  {hasTasks ? (
                    <List dense disablePadding>
                      {day.completedTasks.map((task, i) => (
                        <ListItem key={`${task.completedAt}-${i}`} disableGutters disablePadding sx={{ py: 0.5 }}>
                          <ListItemText
                            primary={task.title}
                            secondary={task.note.trim() !== "" ? task.note.trim() : undefined}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      A quiet day — nothing was recorded here, and that&apos;s perfectly fine.
                    </Typography>
                  )}
                </Stack>

                {hasSand && (
                  <>
                    <Divider flexItem />
                    <SandDrawingGallery
                      items={sandItems.map(({ id, src, alt }) => ({ id, src, alt }))}
                      heading="Sand"
                      onSelect={(i) => setSandIndex(i)}
                    />
                  </>
                )}
              </Stack>
            </DialogContent>
          </>
        )}
      </Dialog>

      <SandSnapshotLightbox
        items={sandItems}
        index={sandIndex}
        label={`Sand drawing for ${label}`}
        onClose={() => setSandIndex(null)}
        onIndexChange={setSandIndex}
      />
    </>
  );
}
