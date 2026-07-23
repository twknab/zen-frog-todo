"use client";

import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import { useReducedMotion } from "framer-motion";
import { useId, useState } from "react";

type DeleteIncompleteTaskControlProps = {
  taskId: string;
  taskTitle: string;
  onDelete: (id: string) => void;
  /** Extra sx for the IconButton (e.g. always-visible on frog card). */
  sx?: object;
};

/**
 * Muted trash control + calm confirm dialog for incomplete tasks only.
 * Callers must not render this for completed tasks (spec 012).
 * Pattern mirrors NewDayAction (Dialog + reduced-motion zero duration).
 */
export default function DeleteIncompleteTaskControl({
  taskId,
  taskTitle,
  onDelete,
  sx,
}: DeleteIncompleteTaskControlProps) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const titleId = useId();
  const descriptionId = useId();
  const labelTitle = taskTitle.trim() || "Untitled";

  return (
    <>
      <IconButton
        size="small"
        onClick={() => setOpen(true)}
        aria-label={`Delete task: ${labelTitle}`}
        sx={{ color: "text.secondary", ...sx }}
      >
        <DeleteOutlinedIcon fontSize="small" />
      </IconButton>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        transitionDuration={reduce ? 0 : undefined}
      >
        <DialogTitle id={titleId}>Remove this task?</DialogTitle>
        <DialogContent>
          <DialogContentText id={descriptionId}>
            It will leave your board. You can always add it again later.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              onDelete(taskId);
              setOpen(false);
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
