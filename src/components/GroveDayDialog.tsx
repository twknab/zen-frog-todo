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
import { archiveEntryLabel, type ArchivedDay } from "@/lib/dayArchive";
import { bonsaiStageLabel, type BonsaiStage } from "@/lib/bonsai";

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
 * day. No edit or delete affordances — this is a keepsake, not a workspace.
 * MUI Dialog manages focus (traps on open, returns to the invoking scene on
 * close); motion collapses to instant under prefers-reduced-motion.
 */
export default function GroveDayDialog({ day, sameDateCount, onClose }: GroveDayDialogProps) {
  const reduce = useReducedMotion();

  // Keep the last non-null day mounted through the close transition so the
  // content doesn't blank out as the dialog animates away.
  const open = day !== null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      transitionDuration={reduce ? 0 : undefined}
      aria-labelledby="grove-day-title"
    >
      {day && (
        <>
          <DialogTitle id="grove-day-title" sx={{ pb: 0.5 }}>
            {archiveEntryLabel(day, sameDateCount)}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {bonsaiStageLabel(day.bonsai.stage as BonsaiStage)}
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              {day.reflection.trim() !== "" && (
                <Stack spacing={0.5}>
                  <Typography variant="subtitle2" component="h3" color="text.secondary">
                    Reflection
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                    {day.reflection.trim()}
                  </Typography>
                </Stack>
              )}

              {day.reflection.trim() !== "" && day.completedTasks.length > 0 && <Divider flexItem />}

              <Stack spacing={0.5}>
                <Typography variant="subtitle2" component="h3" color="text.secondary">
                  What was done
                </Typography>
                {day.completedTasks.length > 0 ? (
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
            </Stack>
          </DialogContent>
        </>
      )}
    </Dialog>
  );
}
