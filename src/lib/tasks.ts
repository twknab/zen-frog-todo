"use client";

import { FROG_LEAVES, TASK_LEAVES, useBonsai } from "./bonsai";
import { usePersistentState } from "./storage";

export type Task = {
  id: string;
  title: string;
  completed: boolean;
};

export type CompletedLogEntry = {
  id: string;
  taskId: string;
  taskTitle: string;
  completedAt: string;
  note: string;
};

type TasksState = {
  tasks: Task[];
  frogTaskId: string | null;
};

const DEFAULT_STATE: TasksState = {
  tasks: [
    { id: "seed-1", title: "Reply to Priya", completed: false },
    { id: "seed-2", title: "Water the plants", completed: false },
    { id: "seed-3", title: "Draft Q3 notes", completed: false },
  ],
  frogTaskId: null,
};

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function useTasks() {
  const [state, setState] = usePersistentState<TasksState>(
    "frog-garden:tasks-v1",
    DEFAULT_STATE,
  );
  const [completedLog, setCompletedLog] = usePersistentState<CompletedLogEntry[]>(
    "frog-garden:completed-log-v1",
    [],
  );
  const { recordGrowth } = useBonsai();

  function addTask(title: string) {
    const trimmed = title.trim();
    if (!trimmed) return;
    setState((current) => ({
      ...current,
      tasks: [...current.tasks, { id: makeId("task"), title: trimmed, completed: false }],
    }));
  }

  function updateTaskTitle(id: string, title: string) {
    setState((current) => ({
      ...current,
      tasks: current.tasks.map((task) => (task.id === id ? { ...task, title } : task)),
    }));
  }

  function toggleTaskCompleted(id: string) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const nowCompleted = !task.completed;

    setState((current) => ({
      ...current,
      tasks: current.tasks.map((t) => (t.id === id ? { ...t, completed: nowCompleted } : t)),
    }));

    // Append-only: reopening/re-completing a task never edits or removes a
    // prior entry, it always adds a new one (see data-model.md).
    if (nowCompleted) {
      setCompletedLog((entries) => [
        {
          id: makeId("log"),
          taskId: task.id,
          taskTitle: task.title,
          completedAt: new Date().toISOString(),
          note: "",
        },
        ...entries,
      ]);
      // Growth-affecting activity → grow the bonsai + reset its wilt clock.
      // Swallowing the frog is the whole point, so it grows the tree more.
      recordGrowth(id === state.frogTaskId ? FROG_LEAVES : TASK_LEAVES);
    }
  }

  function updateCompletedNote(id: string, note: string) {
    setCompletedLog((entries) =>
      entries.map((entry) => (entry.id === id ? { ...entry, note } : entry)),
    );
  }

  function setFrogTaskId(id: string | null) {
    // A completed task can never be (re-)designated the frog; the currently
    // designated frog may still be completed without losing its status.
    if (id) {
      const target = tasks.find((task) => task.id === id);
      if (!target || target.completed) return;
    }
    setState((current) => ({ ...current, frogTaskId: id }));
  }

  function reorderTasks(draggedId: string, targetId: string) {
    if (draggedId === targetId) return;
    setState((current) => {
      const tasks = [...current.tasks];
      const fromIndex = tasks.findIndex((task) => task.id === draggedId);
      const toIndex = tasks.findIndex((task) => task.id === targetId);
      if (fromIndex === -1 || toIndex === -1) return current;
      const [dragged] = tasks.splice(fromIndex, 1);
      tasks.splice(toIndex, 0, dragged);
      return { ...current, tasks };
    });
  }

  // Normalize tasks loaded from storage written by an older schema (e.g.
  // before `completed` existed) so controlled inputs never see `undefined`.
  const tasks = state.tasks.map((task) => ({ ...task, completed: task.completed ?? false }));
  const frogTask = tasks.find((task) => task.id === state.frogTaskId) ?? null;
  const otherTasks = tasks.filter((task) => task.id !== state.frogTaskId);

  return {
    tasks,
    frogTask,
    otherTasks,
    completedLog,
    addTask,
    updateTaskTitle,
    toggleTaskCompleted,
    updateCompletedNote,
    setFrogTaskId,
    reorderTasks,
  };
}
