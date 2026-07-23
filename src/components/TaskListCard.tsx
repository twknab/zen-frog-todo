"use client";

import AddIcon from "@mui/icons-material/AddOutlined";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import type { ChangeEvent, DragEvent, KeyboardEvent } from "react";
import { GiFrog } from "react-icons/gi";
import { useCelebration } from "@/components/Celebration";
import DeleteIncompleteTaskControl from "@/components/DeleteIncompleteTaskControl";
import type { Task } from "@/lib/tasks";

type TaskListCardProps = {
  tasks: Task[];
  locked?: boolean;
  onUpdateTitle: (id: string, title: string) => void;
  onAddTask: (title: string) => void;
  onSetFrog: (id: string) => void;
  onToggleCompleted: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onReorder: (draggedId: string, targetId: string) => void;
};

export default function TaskListCard({
  tasks,
  locked = false,
  onUpdateTitle,
  onAddTask,
  onSetFrog,
  onToggleCompleted,
  onDeleteTask,
  onReorder,
}: TaskListCardProps) {
  const [draft, setDraft] = useState("");
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const celebrate = useCelebration();

  function handleToggle(id: string, event: ChangeEvent<HTMLInputElement>) {
    if (event.target.checked) {
      const rect = event.currentTarget.getBoundingClientRect();
      celebrate(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
    onToggleCompleted(id);
  }

  function submitDraft() {
    if (!draft.trim()) return;
    onAddTask(draft);
    setDraft("");
  }

  function handleDraftKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") submitDraft();
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
  }

  function handleDrop(targetId: string) {
    return (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (draggedId) onReorder(draggedId, targetId);
      setDraggedId(null);
    };
  }

  return (
    <Stack spacing={1}>
      {tasks.map((task) => (
        <Stack
          key={task.id}
          direction="row"
          spacing={0.5}
          draggable={!locked}
          onDragStart={() => setDraggedId(task.id)}
          onDragOver={handleDragOver}
          onDrop={handleDrop(task.id)}
          onDragEnd={() => setDraggedId(null)}
          sx={{
            alignItems: "center",
            px: 1,
            py: 0.5,
            borderRadius: "15px",
            border: "1px solid",
            borderColor: "divider",
            filter: locked ? "blur(3px)" : "none",
            opacity: locked ? 0.6 : draggedId === task.id ? 0.4 : 1,
            pointerEvents: locked ? "none" : "auto",
            transition: "filter 300ms ease, opacity 200ms ease",
            "&:hover .frog-toggle": { opacity: 1 },
          }}
        >
          <DragIndicatorIcon
            fontSize="small"
            sx={{ color: "text.disabled", cursor: "grab" }}
          />
          <Checkbox
            checked={task.completed}
            onChange={(event) => handleToggle(task.id, event)}
            size="small"
          />
          <TextField
            value={task.title}
            onChange={(event) => onUpdateTitle(task.id, event.target.value)}
            variant="standard"
            size="small"
            fullWidth
            slotProps={{ input: { disableUnderline: true } }}
            sx={{
              "& .MuiInputBase-input": {
                color: task.completed ? "text.disabled" : "text.primary",
                textDecoration: task.completed ? "line-through" : "none",
              },
            }}
          />
          {!task.completed && (
            <>
              <IconButton
                className="frog-toggle"
                size="small"
                onClick={() => onSetFrog(task.id)}
                aria-label={`Make "${task.title}" today's frog`}
                sx={{ opacity: 0, transition: "opacity 150ms ease" }}
              >
                <Box component={GiFrog} aria-hidden sx={{ color: "primary.main", fontSize: "1rem" }} />
              </IconButton>
              <DeleteIncompleteTaskControl
                taskId={task.id}
                taskTitle={task.title}
                onDelete={onDeleteTask}
              />
            </>
          )}
        </Stack>
      ))}

      <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", pt: 0.5 }}>
        <TextField
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleDraftKeyDown}
          placeholder="Add a task"
          variant="standard"
          size="small"
          fullWidth
          slotProps={{ input: { disableUnderline: true } }}
        />
        <IconButton size="small" color="primary" onClick={submitDraft} aria-label="Add task">
          <AddIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Stack>
  );
}
