"use client";

import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { CompletedLogEntry } from "@/lib/tasks";

type CompletedLogProps = {
  entries: CompletedLogEntry[];
  onUpdateNote: (id: string, note: string) => void;
};

function formatCompletedAt(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function CompletedLog({ entries, onUpdateNote }: CompletedLogProps) {
  if (entries.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        Nothing finished yet — completed tasks will collect here.
      </Typography>
    );
  }

  return (
    <Stack spacing={1.5}>
      {entries.map((entry) => (
        <Stack
          key={entry.id}
          spacing={0.5}
          sx={{
            px: 1.5,
            py: 1,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: "baseline", justifyContent: "space-between" }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {entry.taskTitle}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
              {formatCompletedAt(entry.completedAt)}
            </Typography>
          </Stack>
          <TextField
            value={entry.note}
            onChange={(event) => onUpdateNote(entry.id, event.target.value)}
            placeholder="Add a note..."
            variant="standard"
            size="small"
            fullWidth
            multiline
            slotProps={{ input: { disableUnderline: true } }}
          />
        </Stack>
      ))}
    </Stack>
  );
}
