"use client";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import { useCallback, useEffect, useId, useRef } from "react";
import type { KeyboardEvent, PointerEvent, ReactNode } from "react";

type FocusDialProps = {
  /** 0..1 — how much of the ring is filled. */
  fraction: number;
  size?: number;
  strokeWidth?: number;
  /** When true, the ring is draggable/keyboard-adjustable (the "set" state). */
  interactive?: boolean;
  minutes?: number;
  minMinutes?: number;
  maxMinutes?: number;
  step?: number;
  onMinutesChange?: (minutes: number) => void;
  centerLabel: ReactNode;
  ariaLabel?: string;
};

export default function FocusDial({
  fraction,
  size = 176,
  strokeWidth = 10,
  interactive = false,
  minutes = 25,
  minMinutes = 5,
  maxMinutes = 60,
  step = 5,
  onMinutesChange,
  centerLabel,
  ariaLabel = "Focus length in minutes",
}: FocusDialProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const draggingRef = useRef(false);
  const theme = useTheme();
  // Strip colons React's useId emits — they break SVG url(#id) references.
  const gradientId = `focus-dial-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  // A rich, cool→warm sweep across the countdown ring so it reads at a glance
  // and pops against the calm card — drawn from the themed palette, so it
  // adapts to light/dark automatically.
  const gradientStops = [
    theme.palette.info.main,
    theme.palette.primary.main,
    theme.palette.secondary.main,
  ];

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, fraction));
  const dashOffset = circumference * (1 - clamped);

  const updateFromPoint = useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current;
      if (!svg || !onMinutesChange) return;
      const rect = svg.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = clientX - cx;
      const dy = clientY - cy;
      let angleDeg = Math.atan2(dx, -dy) * (180 / Math.PI);
      if (angleDeg < 0) angleDeg += 360;
      const raw = (angleDeg / 360) * maxMinutes;
      const snapped = Math.round(raw / step) * step;
      const next = Math.max(
        minMinutes,
        Math.min(maxMinutes, snapped === 0 ? maxMinutes : snapped),
      );
      onMinutesChange(next);
    },
    [maxMinutes, minMinutes, onMinutesChange, step],
  );

  useEffect(() => {
    if (!interactive) return;
    function onMove(event: globalThis.PointerEvent) {
      if (!draggingRef.current) return;
      updateFromPoint(event.clientX, event.clientY);
    }
    function onUp() {
      draggingRef.current = false;
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [interactive, updateFromPoint]);

  function handlePointerDown(event: PointerEvent<SVGSVGElement>) {
    if (!interactive) return;
    draggingRef.current = true;
    updateFromPoint(event.clientX, event.clientY);
  }

  function handleKeyDown(event: KeyboardEvent<SVGSVGElement>) {
    if (!interactive || !onMinutesChange) return;
    if (event.key === "ArrowUp" || event.key === "ArrowRight") {
      event.preventDefault();
      onMinutesChange(Math.min(maxMinutes, minutes + step));
    } else if (event.key === "ArrowDown" || event.key === "ArrowLeft") {
      event.preventDefault();
      onMinutesChange(Math.max(minMinutes, minutes - step));
    } else if (event.key === "Home") {
      event.preventDefault();
      onMinutesChange(minMinutes);
    } else if (event.key === "End") {
      event.preventDefault();
      onMinutesChange(maxMinutes);
    }
  }

  const handleAngleRad = ((clamped * 360 - 90) * Math.PI) / 180;
  const handleX = size / 2 + radius * Math.cos(handleAngleRad);
  const handleY = size / 2 + radius * Math.sin(handleAngleRad);

  return (
    <Box sx={{ position: "relative", width: size, height: size, color: "primary.main" }}>
      <svg
        ref={svgRef}
        width={size}
        height={size}
        role={interactive ? "slider" : undefined}
        tabIndex={interactive ? 0 : undefined}
        aria-valuemin={interactive ? minMinutes : undefined}
        aria-valuemax={interactive ? maxMinutes : undefined}
        aria-valuenow={interactive ? minutes : undefined}
        aria-label={interactive ? ariaLabel : undefined}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        style={{
          touchAction: "none",
          cursor: interactive ? "pointer" : "default",
          outline: "none",
        }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            {gradientStops.map((color, index) => (
              <stop
                key={color}
                offset={`${(index / (gradientStops.length - 1)) * 100}%`}
                stopColor={color}
              />
            ))}
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.14}
          strokeWidth={strokeWidth}
        />
        <circle
          className="dial-arc"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ filter: `drop-shadow(0 0 6px ${theme.palette.primary.main}66)` }}
        />
        {interactive && (
          <circle
            cx={handleX}
            cy={handleY}
            r={strokeWidth * 0.85}
            fill={theme.palette.secondary.main}
          />
        )}
      </svg>
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        {centerLabel}
      </Box>
    </Box>
  );
}
