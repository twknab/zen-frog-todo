"use client";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import SelfImprovementOutlinedIcon from "@mui/icons-material/SelfImprovementOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import WavesOutlinedIcon from "@mui/icons-material/WavesOutlined";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import CompletedLog from "@/components/CompletedLog";
import FocusTimer from "@/components/FocusTimer";
import SandCanvas from "@/components/SandCanvas";
import TaskListCard from "@/components/TaskListCard";
import { usePersistentState } from "@/lib/storage";
import { useTasks } from "@/lib/tasks";
import { useColorMode } from "@/theme/ThemeRegistry";

type CardAccent = "primary" | "secondary" | "info" | "warning" | "success" | "error";

type DashboardMode = "frog" | "flow";

type DashboardMode = "frog" | "flow";

export default function Home() {
  const { mode: colorMode, toggleColorMode } = useColorMode();
  const [mode, setMode] = useState<DashboardMode>("flow");
  const {
    frogTask,
    otherTasks,
    completedLog,
    addTask,
    updateTaskTitle,
    toggleTaskCompleted,
    updateCompletedNote,
    setFrogTaskId,
    reorderTasks,
  } = useTasks();
  const [notes, setNotes] = usePersistentState("frog-garden:reflection-v1", "");

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        px: { xs: 2, md: 6 },
        py: { xs: 4, md: 6 },
        maxWidth: 1200,
        mx: "auto",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{
          mb: 5,
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <SelfImprovementOutlinedIcon color="primary" fontSize="large" />
          <Box>
            <Typography variant="h4" component="h1">
              Frog Garden
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Swallow the frog first. Let the rest flow naturallyo.
            </Typography>
          </Box>
        </Stack>

        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={(_, next: DashboardMode | null) => next && setMode(next)}
          aria-label="Dashboard mode"
          size="small"
        >
          <ToggleButton value="flow" aria-label="Flow mode">
            Flow Mode
          </ToggleButton>
          <ToggleButton value="frog" aria-label="Focus mode">
            Focus Mode
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" },
          gridTemplateAreas: {
            xs: `"frog" "garden" "tasks" "timer" "reflection"`,
            md: `"frog frog garden garden" "tasks timer garden garden" "tasks reflection reflection reflection"`,
          },
        }}
      >
        <BentoCard area="frog" accent="primary">
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1.5 }}>
            <span role="img" aria-hidden="true" style={{ fontSize: "1.3rem" }}>
              🐸
            </span>
            <Chip
              label={mode === "frog" ? "Today's frog" : "Suggested next"}
              color="primary"
              size="small"
            />
          </Stack>
          {frogTask ? (
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
              <Checkbox
                checked={frogTask.completed}
                onChange={() => toggleTaskCompleted(frogTask.id)}
              />
              <Typography
                variant="h5"
                component="h2"
                sx={{
                  color: frogTask.completed ? "text.disabled" : "text.primary",
                  textDecoration: frogTask.completed ? "line-through" : "none",
                }}
              >
                {frogTask.title}
              </Typography>
            </Stack>
          ) : (
            <Typography variant="h5" component="h2" sx={{ mb: 1 }}>
              No frog chosen yet
            </Typography>
          )}
        </BentoCard>

        <BentoCard area="garden" accent="secondary">
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1.5 }}>
            <WavesOutlinedIcon color="info" />
            <Typography variant="h6" component="h2">
              Sand Mode
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Rake a little. No pattern is wrong.
          </Typography>
          <SandCanvas />
        </BentoCard>

        <BentoCard area="tasks">
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1.5 }}>
            <CheckCircleOutlineIcon color="primary" />
            <Typography variant="h6" component="h2">
              Task list
            </Typography>
          </Stack>
          <TaskListCard
            tasks={otherTasks}
            locked={mode === "frog"}
            onUpdateTitle={updateTaskTitle}
            onAddTask={addTask}
            onSetFrog={setFrogTaskId}
            onToggleCompleted={toggleTaskCompleted}
            onReorder={reorderTasks}
          />
        </BentoCard>

        <BentoCard area="timer">
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1.5 }}>
            <TimerOutlinedIcon color="primary" />
            <Typography variant="h6" component="h2">
              Focus
            </Typography>
          </Stack>
          <FocusTimer />
        </BentoCard>

        <BentoCard area="reflection">
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1.5 }}>
            <EditNoteOutlinedIcon color="primary" />
            <Typography variant="h6" component="h2">
              Close the day
            </Typography>
          </Stack>
          <TextField
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="One line on how today went — tomorrow's frog is already waiting."
            multiline
            minRows={2}
            fullWidth
            variant="standard"
            slotProps={{ input: { disableUnderline: true } }}
          />
          <Typography variant="caption" color="text.secondary">
            Saved automatically as you type.
          </Typography>
        </BentoCard>
      </Box>

      <Card sx={{ mt: 3, p: { xs: 2.5, md: 3 } }}>
        <CardContent sx={{ p: 0 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1.5 }}>
            <HistoryOutlinedIcon color="primary" />
            <Typography variant="h6" component="h2">
              Completed
            </Typography>
          </Stack>
          <CompletedLog entries={completedLog} onUpdateNote={updateCompletedNote} />
        </CardContent>
      </Card>
    </Box>
  );
}

function BentoCard({
  area,
  accent,
  children,
}: {
  area: string;
  accent?: "primary" | "secondary";
  children: React.ReactNode;
}) {
  return (
    <Card
      sx={{
        gridArea: area,
        p: { xs: 2.5, md: 3 },
        borderTop: accent ? "3px solid" : undefined,
        borderTopColor: accent ? `${accent}.main` : undefined,
      }}
    >
      <CardContent sx={{ p: 0 }}>{children}</CardContent>
    </Card>
  );
}
