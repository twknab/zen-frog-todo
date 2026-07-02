"use client";

import Box from "@mui/material/Box";
import { useEffect, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { playRake } from "@/lib/sound";

type Point = { x: number; y: number };
type Stroke = { points: Point[]; color: string };

// Muted, nature-derived tones — matches the zen theme palette (see src/theme/theme.ts).
const ZEN_COLORS = ["#6B8F71", "#B98C5B", "#7A93A6", "#C79A4B", "#B1554A"];

function pickColor() {
  return ZEN_COLORS[Math.floor(Math.random() * ZEN_COLORS.length)];
}

/** Draws one segment as three parallel offset lines — a rake's tines. */
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

  [-spacing, 0, spacing].forEach((offset) => {
    ctx.beginPath();
    ctx.moveTo(p0.x + nx * offset, p0.y + ny * offset);
    ctx.lineTo(p1.x + nx * offset, p1.y + ny * offset);
    ctx.stroke();
  });

  ctx.globalAlpha = 1;
}

export default function SandCanvas({ height = 220 }: { height?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const currentRef = useRef<Stroke | null>(null);
  const sizeRef = useRef({ width: 0, height });

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

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      sizeRef.current = { width: rect.width, height };
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${height}px`;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      redrawAll(ctx);
    }

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [height]);

  function getPoint(event: { clientX: number; clientY: number }): Point {
    const rect = canvasRef.current!.getBoundingClientRect();
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
    const ctx = canvas.getContext("2d");
    if (ctx) drawProngs(ctx, last, point, current.color);
    current.points.push(point);
  }

  function handlePointerUp() {
    if (currentRef.current) {
      strokesRef.current.push(currentRef.current);
      currentRef.current = null;
    }
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        width: "100%",
        height,
        borderRadius: 3,
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
        style={{ display: "block", touchAction: "none", cursor: "crosshair" }}
      />
    </Box>
  );
}
