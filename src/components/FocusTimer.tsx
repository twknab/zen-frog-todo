"use client";

import AirOutlinedIcon from "@mui/icons-material/AirOutlined";
import PauseOutlinedIcon from "@mui/icons-material/PauseOutlined";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect, useRef, useState } from "react";
import FocusDial from "./FocusDial";
import { SESSION_LEAVES, useBonsai } from "@/lib/bonsai";
import { useFocusStats } from "@/lib/focusStats";
import { playChime, startAmbientLoop } from "@/lib/sound";

type Phase = "idle" | "working" | "work-done" | "break" | "break-done";

const MIN_WORK_MINUTES = 5;
const MAX_WORK_MINUTES = 60;
const DEFAULT_WORK_MINUTES = 25;
const BREAK_MINUTES = 5;

function formatClock(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function FocusTimer({ fast = false }: { fast?: boolean }) {
  const [workMinutes, setWorkMinutes] = useState(DEFAULT_WORK_MINUTES);
  const [phase, setPhase] = useState<Phase>("idle");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [ambientOn, setAmbientOn] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimeRef = useRef<number | null>(null);
  const { completedSessions, recordSessionComplete } = useFocusStats();
  const { recordGrowth } = useBonsai();

  // Dev "fast timer": a work "minute" lasts 1 second so the whole finish flow
  // (work → complete → break → done) is reachable in a few seconds for demos.
  const secondsPerMinute = fast ? 1 : 60;

  // Ambient wind follows the toggle alone — once on, it keeps playing across
  // phase changes (work → break → done) and only stops when toggled off.
  useEffect(() => {
    if (!ambientOn) return undefined;
    const loop = startAmbientLoop();
    return () => loop?.stop();
  }, [ambientOn]);

  // Countdown is derived from a target end-timestamp, NOT by counting interval
  // ticks — so it stays accurate even when the browser throttles/pauses timers
  // in a backgrounded tab (start a session, switch away to work, come back: the
  // remaining time is correct). The interval just refreshes the display; the
  // visibilitychange listener snaps it the instant the tab is refocused.
  useEffect(() => {
    if (phase !== "working" && phase !== "break") return;

    function sync() {
      const end = endTimeRef.current;
      if (end == null) return;
      setSecondsLeft(Math.max(0, Math.round((end - Date.now()) / 1000)));
    }

    sync();
    intervalRef.current = setInterval(sync, 500);
    document.addEventListener("visibilitychange", sync);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [phase]);

  // Side effects for reaching zero live in their own effect (not inside the
  // tick's updater) — an updater with side effects gets double-invoked in
  // development, which previously double-counted focus sessions.
  useEffect(() => {
    if ((phase !== "working" && phase !== "break") || secondsLeft > 0) return;

    playChime(phase === "working" ? "focus-complete" : "break-complete");
    if (phase === "working") {
      recordSessionComplete();
      recordGrowth(SESSION_LEAVES); // a finished session grows the bonsai
    }
    // Reacting to secondsLeft crossing zero to advance a state machine —
    // intentional, and guarded above so it fires exactly once per crossing.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPhase(phase === "working" ? "work-done" : "break-done");
  }, [phase, secondsLeft, recordSessionComplete, recordGrowth]);

  const totalSeconds =
    phase === "break" ? BREAK_MINUTES * secondsPerMinute : workMinutes * secondsPerMinute;
  const fraction =
    phase === "idle"
      ? workMinutes / MAX_WORK_MINUTES
      : phase === "working" || phase === "break"
        ? secondsLeft / totalSeconds
        : 0;

  function startFocus() {
    const duration = workMinutes * secondsPerMinute;
    endTimeRef.current = Date.now() + duration * 1000;
    setSecondsLeft(duration);
    setPhase("working");
  }

  function acknowledgeAndStartBreak() {
    const duration = BREAK_MINUTES * secondsPerMinute;
    endTimeRef.current = Date.now() + duration * 1000;
    setSecondsLeft(duration);
    setPhase("break");
  }

  function reset() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    endTimeRef.current = null;
    setPhase("idle");
    setSecondsLeft(0);
  }

  return (
    <Stack spacing={2} sx={{ alignItems: "center" }}>
      <FocusDial
        fraction={fraction}
        interactive={phase === "idle"}
        minutes={workMinutes}
        minMinutes={MIN_WORK_MINUTES}
        maxMinutes={MAX_WORK_MINUTES}
        onMinutesChange={setWorkMinutes}
        centerLabel={
          phase === "idle" ? (
            <Stack sx={{ alignItems: "center" }}>
              <Typography variant="h4" sx={{ fontVariantNumeric: "tabular-nums" }}>
                {workMinutes}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                minutes
              </Typography>
            </Stack>
          ) : (
            <Typography variant="h4" sx={{ fontVariantNumeric: "tabular-nums" }}>
              {formatClock(secondsLeft)}
            </Typography>
          )
        }
      />

      <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
        <AirOutlinedIcon
          fontSize="small"
          sx={{ color: ambientOn ? "primary.main" : "text.disabled" }}
        />
        <IconButton
          size="small"
          onClick={() => setAmbientOn((current) => !current)}
          color={ambientOn ? "primary" : "default"}
          aria-pressed={ambientOn}
          aria-label={
            ambientOn ? "Pause ambient nature sound" : "Play ambient nature sound"
          }
        >
          {ambientOn ? (
            <PauseOutlinedIcon fontSize="small" />
          ) : (
            <PlayArrowOutlinedIcon fontSize="small" />
          )}
        </IconButton>
      </Stack>

      <Typography variant="caption" color="text.secondary">
        {completedSessions === 1
          ? "1 focus session completed"
          : `${completedSessions} focus sessions completed`}
      </Typography>

      <div aria-live="polite">
        {phase === "idle" && (
          <Button variant="contained" onClick={startFocus}>
            Start focus
          </Button>
        )}

        {phase === "working" && (
          <Button variant="text" color="inherit" onClick={reset}>
            Cancel
          </Button>
        )}

        {phase === "work-done" && (
          <Stack spacing={1} sx={{ alignItems: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Focus session complete. Take a 5 minute break?
            </Typography>
            <Button variant="contained" color="secondary" onClick={acknowledgeAndStartBreak}>
              Start 5 min break
            </Button>
          </Stack>
        )}

        {phase === "break" && (
          <Button variant="text" color="inherit" onClick={reset}>
            End break
          </Button>
        )}

        {phase === "break-done" && (
          <Stack spacing={1} sx={{ alignItems: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Break&rsquo;s over whenever you are.
            </Typography>
            <Button variant="contained" onClick={reset}>
              Back to focus
            </Button>
          </Stack>
        )}
      </div>
    </Stack>
  );
}
