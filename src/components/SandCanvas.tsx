"use client";

import Box from "@mui/material/Box";
import { useEffect, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import {
  captureSandSnapshot,
  registerSandCanvasHandlers,
  useSandReset,
} from "@/lib/sand";
import { playRake } from "@/lib/sound";

type Point = { x: number; y: number };
type Stroke = { points: Point[]; color: string };

// Muted, nature-derived tones — matches the zen theme palette (see src/theme/theme.ts).
const ZEN_COLORS = ["#6B8F71", "#B98C5B", "#7A93A6", "#C79A4B", "#B1554A"];

function pickColor() {
  return ZEN_COLORS[Math.floor(Math.random() * ZEN_COLORS.length)];
}

/** Draws one segment as five parallel offset lines — a rake's tines. */
function drawProngs(ctx: CanvasRenderingContext2D, p0: Point, p1: Point, color: string) {
  const dx = p1.x - p0.x;
  const dy = p1.y - p0.y;
  const length = Math.hypot(dx, dy) || 1;
  const nx = -dy / length;
  const ny = dx / length;
  const spacing = 5;

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.globalAlpha = 0.75;

  [-2 * spacing, -spacing, 0, spacing, 2 * spacing].forEach((offset) => {
    ctx.beginPath();
    ctx.moveTo(p0.x + nx * offset, p0.y + ny * offset);
    ctx.lineTo(p1.x + nx * offset, p1.y + ny * offset);
    ctx.stroke();
  });

  ctx.globalAlpha = 1;
}

// Below this, two points are treated as "the same spot" — caps how many
// points a single stroke accumulates so later redraws (e.g. after a resize)
// stay cheap no matter how long or slow the drag was.
const MIN_POINT_DISTANCE = 2.5;

export default function SandCanvas({ minHeight = 220 }: { minHeight?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const currentRef = useRef<Stroke | null>(null);
  const sizeRef = useRef({ width: 0, height: minHeight });
  const dragRectRef = useRef<DOMRect | null>(null);
  const { sandResetToken } = useSandReset();

  // Register sync peek/wipe so resetSand / new-day archive can capture without
  // racing a useEffect (specs/011 analysis C1).
  useEffect(() => {
    function wipeOnly() {
      strokesRef.current = [];
      currentRef.current = null;
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, sizeRef.current.width, sizeRef.current.height);
    }

    function peekCapture(): string | null {
      // Include an in-progress stroke so reset mid-drag still keeps a keepsake.
      if (strokesRef.current.length === 0 && !currentRef.current) return null;
      const canvas = canvasRef.current;
      if (!canvas) return null;
      return captureSandSnapshot(canvas);
    }

    registerSandCanvasHandlers({ peekCapture, wipeOnly });
    return () => registerSandCanvasHandlers(null);
  }, []);

  // Fallback wipe when the shared reset token bumps (resetSand already wipes
  // sync; this covers any token-only bump and is a harmless no-op if empty).
  useEffect(() => {
    strokesRef.current = [];
    currentRef.current = null;
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, sizeRef.current.width, sizeRef.current.height);
  }, [sandResetToken]);

  useEffect(() => {
    function redrawAll(ctx: CanvasRenderingContext2D) {
      ctx.clearRect(0, 0, sizeRef.current.width, sizeRef.current.height);
      for (const stroke of strokesRef.current) {
        for (let i = 1; i < stroke.points.length; i += 1) {
          drawProngs(ctx, stroke.points[i - 1], stroke.points[i], stroke.color);
        }
      }
    }

    function resize() {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      // The canvas is absolutely positioned to fill the container (see JSX), so
      // its drawable size is the container's content box. Measuring clientWidth/
      // clientHeight (integers, no border/padding) and driving the bitmap off
      // that guarantees the canvas always covers every edge — fixing a gap where
      // a stale measurement left dead, un-rakeable strips on the right/bottom.
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width === 0 || height === 0) return;

      // Setting canvas.width/height wipes the bitmap, so redrawing every stored
      // point is unavoidable — but a ResizeObserver can fire for sub-pixel noise
      // with no real size change. Skip the clear+redraw when nothing changed.
      const unchanged =
        width === sizeRef.current.width && height === sizeRef.current.height;
      if (unchanged && canvas.width > 0) return;

      const dpr = window.devicePixelRatio || 1;
      sizeRef.current = { width, height };
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      redrawAll(ctx);
    }

    resize();

    const container = containerRef.current;
    const observer = new ResizeObserver(resize);
    if (container) observer.observe(container);
    return () => observer.disconnect();
  }, [minHeight]);

  function getPoint(event: { clientX: number; clientY: number }): Point {
    // Cached at pointerdown rather than re-measured on every pointermove —
    // the canvas doesn't move mid-drag, and getBoundingClientRect() forces a
    // layout reflow, which adds up fast at pointermove's event rate.
    const rect = dragRectRef.current ?? canvasRef.current!.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.setPointerCapture(event.pointerId);
    } catch {
      // no-op — capture is a nice-to-have for drags that leave the canvas
    }

    dragRectRef.current = canvas.getBoundingClientRect();
    const point = getPoint(event);
    const color = pickColor();
    currentRef.current = { points: [point], color };
    playRake();

    const ctx = canvas.getContext("2d");
    if (ctx) {
      drawProngs(ctx, point, { x: point.x + 0.5, y: point.y }, color);
    }
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    const current = currentRef.current;
    const canvas = canvasRef.current;
    if (!current || !canvas) return;

    const point = getPoint(event);
    const last = current.points[current.points.length - 1];
    if (Math.hypot(point.x - last.x, point.y - last.y) < MIN_POINT_DISTANCE) return;

    const ctx = canvas.getContext("2d");
    if (ctx) drawProngs(ctx, last, point, current.color);
    current.points.push(point);
  }

  function handlePointerUp() {
    if (currentRef.current) {
      strokesRef.current.push(currentRef.current);
      currentRef.current = null;
    }
    dragRectRef.current = null;
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        position: "relative",
        width: "100%",
        flexGrow: 1,
        minHeight,
        borderRadius: "15px",
        backgroundColor: "action.hover",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
          touchAction: "none",
          cursor: "crosshair",
        }}
      />
    </Box>
  );
}
