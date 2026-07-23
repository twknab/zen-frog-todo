"use client";

import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useReducedMotion } from "framer-motion";
import { useState } from "react";
import { useNewDay } from "@/lib/dayArchive";

/**
 * "Start a new day" ritual, rendered inside the today's-note card. Snapshots
 * the day into the archive and resets the board after a gentle confirmation.
 * Copy is keepsake-framed, never judgmental (constitution Principles I/II).
 */
export default function NewDayAction() {
  const { startNewDay } = useNewDay();
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  return (
    <>
      <Button
        variant="outlined"
        color="success"
        size="small"
        startIcon={<WbSunnyOutlinedIcon />}
        onClick={() => setOpen(true)}
        sx={{ mt: 2, alignSelf: "flex-start" }}
      >
        Start a new day
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="new-day-title"
        aria-describedby="new-day-description"
        transitionDuration={reduce ? 0 : undefined}
      >
        <DialogTitle id="new-day-title">Start a new day?</DialogTitle>
        <DialogContent>
          <DialogContentText id="new-day-description">
            Today&apos;s finished tasks and note are tucked into your archive, and
            your board starts fresh. Unfinished tasks stay with you.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="inherit">
            Not yet
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => {
              startNewDay();
              setOpen(false);
            }}
          >
            Start fresh
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
