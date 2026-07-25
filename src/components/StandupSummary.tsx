"use client";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chrome from "@/components/Chrome";
import type { CompletedLogEntry, Task } from "@/lib/tasks";

type StandupSummaryProps = {
  tasks: Task[];
  completedLog: CompletedLogEntry[];
};

type DoneItem = {
  id: string;
  title: string;
  note: string | null;
};

type OpenItem = {
  id: string;
  title: string;
};

function deriveDoneItems(completedLog: CompletedLogEntry[]): DoneItem[] {
  return [...completedLog]
    .sort((a, b) => a.completedAt.localeCompare(b.completedAt))
    .map((entry) => {
      const trimmed = entry.note.trim();
      return { id: entry.id, title: entry.taskTitle, note: trimmed === "" ? null : trimmed };
    });
}

function deriveOpenItems(tasks: Task[]): OpenItem[] {
  return tasks.filter((task) => !task.completed).map((task) => ({ id: task.id, title: task.title }));
}

export default function StandupSummary({ tasks, completedLog }: StandupSummaryProps) {
  const doneItems = deriveDoneItems(completedLog);
  const openItems = deriveOpenItems(tasks);

  if (doneItems.length === 0 && openItems.length === 0) {
    return (
      <Chrome>
        <Typography variant="body2" color="text.secondary">
          Nothing in the current batch yet — finish a task or two and your recap will collect here.
        </Typography>
      </Chrome>
    );
  }

  // Hyper Minimal may hide the card title ("Standup Summary") and empty-state
  // helper copy, but MUST keep this body readable: section labels + task prose
  // for what was done / what's next when either list has content.
  return (
    <Stack spacing={2.5}>
      {doneItems.length > 0 && (
        <Stack spacing={0.5}>
          <Typography variant="subtitle2" component="h3" color="text.secondary">
            What I did
          </Typography>
          <List dense disablePadding aria-label="What I did">
            {doneItems.map((item) => (
              <ListItem key={item.id} disableGutters disablePadding sx={{ py: 0.5 }}>
                <ListItemText primary={item.title} secondary={item.note ?? undefined} />
              </ListItem>
            ))}
          </List>
        </Stack>
      )}

      {openItems.length > 0 && (
        <Stack spacing={0.5}>
          <Typography variant="subtitle2" component="h3" color="text.secondary">
            What&apos;s next
          </Typography>
          <List dense disablePadding aria-label="What's next">
            {openItems.map((item) => (
              <ListItem key={item.id} disableGutters disablePadding sx={{ py: 0.5 }}>
                <ListItemText primary={item.title} />
              </ListItem>
            ))}
          </List>
        </Stack>
      )}
    </Stack>
  );
}
