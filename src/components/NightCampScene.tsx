"use client";

import Box from "@mui/material/Box";
import { darken, lighten, useTheme } from "@mui/material/styles";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";
import type { NightCampView } from "@/lib/nightCamp";
import { FROG_ICON_PATH } from "@/lib/frogIcon";

type NightCampSceneProps = {
  view: NightCampView;
  size?: number;
};

/** Deterministic 0..1 from index — stable SSR/client. */
function seeded(i: number, salt: number): number {
  const v = Math.sin((i + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return v - Math.floor(v);
}

/**
 * Night Camp — central campfire, frogs gather around it, fireflies blink &
 * collect nearer the fire as stages rise, moon + stars grow with the ledger.
 * Critters use the same FaFrog mark + sticker halo as the Day Garden.
 * Joyful ambient motion (constitution v2.2.0); Framer Motion only (no new deps).
 */
export default function NightCampScene({ view, size = 320 }: NightCampSceneProps) {
  const theme = useTheme();

  const skyTop = theme.palette.mode === "dark" ? "#070B18" : "#12182C";
  const skyBot = theme.palette.mode === "dark" ? "#141C32" : "#1E2740";
  const ground = theme.palette.secondary.dark;
  const groundLight = theme.palette.secondary.main;
  const moonFill = lighten(theme.palette.warning.light, 0.25);
  const moonRim = theme.palette.warning.main;
  const starFill = lighten(theme.palette.info.light, 0.35);
  const fireCore = theme.palette.warning.main;
  const fireMid = theme.palette.warning.light;
  const fireOuter = theme.palette.error.light;
  const ember = theme.palette.error.main;
  const glow = theme.palette.warning.main;
  const frogMain = theme.palette.primary.main;
  const frogLight = theme.palette.primary.light;
  const frogDark = theme.palette.primary.dark;
  const halo = theme.palette.background.paper;
  const firefly = lighten(theme.palette.warning.light, 0.2);

  const stage = view.stage;
  const fireScale = 0.55 + view.campfireLevel * 0.22;

  // Stars densify with stage (and progress within stage via starDensity).
  const stars = useMemo(() => {
    const count = Math.round(6 + view.starDensity * 42);
    return Array.from({ length: count }, (_, i) => ({
      x: 8 + seeded(i, 1) * 224,
      y: 6 + seeded(i, 2) * 100,
      r: 0.5 + seeded(i, 3) * 1.6,
      delay: seeded(i, 4) * 3,
      dur: 1.8 + seeded(i, 5) * 2.4,
    }));
  }, [view.starDensity]);

  // Fireflies: early stages wander wide; higher stages collect toward the fire.
  const fireflies = useMemo(() => {
    const count = view.fireflies;
    const collect = Math.min(1, stage / 4); // 0 = scattered, 1 = around fire
    return Array.from({ length: count }, (_, i) => {
      const angle = seeded(i, 10) * Math.PI * 2;
      const farR = 55 + seeded(i, 11) * 70;
      const nearR = 18 + seeded(i, 12) * 28;
      const r = farR * (1 - collect) + nearR * collect;
      const cx = 120 + Math.cos(angle) * r;
      const cy = 95 + Math.sin(angle) * r * 0.65;
      return {
        x: cx,
        y: cy,
        delay: seeded(i, 13) * 2.2,
        dur: 0.7 + seeded(i, 14) * 1.1,
        drift: 3 + seeded(i, 15) * 5,
      };
    });
  }, [view.fireflies, stage]);

  // Frogs sit in an arc around the central fire (not a flat line).
  const frogs = useMemo(() => {
    const n = view.nightFrogs;
    if (n <= 0) return [];
    const fills = [frogMain, frogLight, frogDark];
    return Array.from({ length: n }, (_, i) => {
      // Arc from ~200° to ~340° under the fire (front gathering).
      const t = n === 1 ? 0.5 : i / (n - 1);
      const angle = Math.PI * 0.15 + t * Math.PI * 0.7; // lower semicircle-ish
      const radius = 52 + (i % 3) * 6;
      const x = 120 + Math.cos(angle + Math.PI) * radius * 1.15;
      const y = 148 + Math.sin(angle) * 18 + seeded(i, 20) * 6;
      return {
        x,
        y,
        scale: 1.55 + seeded(i, 21) * 0.55,
        fill: fills[i % fills.length],
        flip: seeded(i, 22) > 0.5,
      };
    });
  }, [view.nightFrogs, frogMain, frogLight, frogDark]);

  const moonR = 8 + view.moonFill * 22;

  return (
    <Box sx={{ width: size, height: size, maxWidth: "100%" }} aria-hidden>
      <svg width="100%" height="100%" viewBox="0 0 240 200" overflow="visible">
        <defs>
          <linearGradient id="nightSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={skyTop} />
            <stop offset="100%" stopColor={skyBot} />
          </linearGradient>
          <radialGradient id="fireGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={glow} stopOpacity={0.55} />
            <stop offset="55%" stopColor={glow} stopOpacity={0.18} />
            <stop offset="100%" stopColor={glow} stopOpacity={0} />
          </radialGradient>
          <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={moonFill} stopOpacity={0.9} />
            <stop offset="70%" stopColor={moonRim} stopOpacity={0.35} />
            <stop offset="100%" stopColor={moonRim} stopOpacity={0} />
          </radialGradient>
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Sky */}
        <rect x="0" y="0" width="240" height="200" rx="14" fill="url(#nightSky)" />

        {/* Stars — twinkle; count rises with stage */}
        {stars.map((s, i) => (
          <motion.circle
            key={`star-${i}`}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill={starFill}
            initial={{ opacity: 0.15 }}
            animate={{ opacity: [0.2, 0.95, 0.25] }}
            transition={{
              duration: s.dur,
              delay: s.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Moon — grows with iterations/stage */}
        <AnimatePresence>
          {view.moonFill > 0.08 && (
            <motion.g
              key="moon"
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <circle cx="198" cy="42" r={moonR * 1.55} fill="url(#moonGlow)" />
              <circle
                cx="198"
                cy="42"
                r={moonR}
                fill={moonFill}
                stroke={moonRim}
                strokeWidth={1.2}
                opacity={0.95}
              />
              {/* Soft crater hints */}
              <circle
                cx={198 - moonR * 0.25}
                cy={42 - moonR * 0.15}
                r={moonR * 0.18}
                fill={darken(moonFill, 0.08)}
                opacity={0.35}
              />
              <circle
                cx={198 + moonR * 0.2}
                cy={42 + moonR * 0.25}
                r={moonR * 0.12}
                fill={darken(moonFill, 0.1)}
                opacity={0.3}
              />
            </motion.g>
          )}
        </AnimatePresence>

        {/* Ground mound */}
        <ellipse cx="120" cy="178" rx="98" ry="22" fill={ground} opacity={0.85} />
        <ellipse cx="120" cy="172" rx="70" ry="12" fill={groundLight} opacity={0.35} />

        {/* Fireflies — blink + drift; collect toward fire as stage rises */}
        {fireflies.map((f, i) => (
          <motion.g
            key={`ff-${i}`}
            initial={{ x: f.x, y: f.y }}
            animate={{
              x: [f.x - f.drift, f.x + f.drift, f.x - f.drift * 0.4],
              y: [f.y + f.drift * 0.35, f.y - f.drift, f.y + f.drift * 0.2],
            }}
            transition={{
              duration: f.dur * 2.4,
              delay: f.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <motion.circle
              r={2.4}
              fill={firefly}
              filter="url(#softGlow)"
              animate={{ opacity: [0.2, 1, 0.15] }}
              transition={{
                duration: f.dur,
                delay: f.delay * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.g>
        ))}

        {/* Central campfire — layered flame + glow */}
        {view.campfireLevel > 0 && (
          <g transform={`translate(120 142) scale(${fireScale})`}>
            <motion.ellipse
              cx="0"
              cy="4"
              rx="36"
              ry="22"
              fill="url(#fireGlow)"
              animate={{ opacity: [0.55, 0.9, 0.6] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Logs */}
            <rect x="-16" y="6" width="14" height="5" rx="2" fill={darken(ground, 0.15)} transform="rotate(-18 -9 8)" />
            <rect x="2" y="6" width="14" height="5" rx="2" fill={darken(ground, 0.05)} transform="rotate(16 9 8)" />
            {/* Outer flame */}
            <motion.path
              d="M0 8 C-14 0 -12 -18 0 -34 C12 -18 14 0 0 8 Z"
              fill={fireOuter}
              animate={{
                d: [
                  "M0 8 C-14 0 -12 -18 0 -34 C12 -18 14 0 0 8 Z",
                  "M0 8 C-12 2 -16 -16 2 -36 C10 -14 16 2 0 8 Z",
                  "M0 8 C-16 -2 -10 -20 -2 -32 C14 -16 12 0 0 8 Z",
                  "M0 8 C-14 0 -12 -18 0 -34 C12 -18 14 0 0 8 Z",
                ],
              }}
              transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Mid flame */}
            <motion.path
              d="M0 6 C-8 0 -8 -12 0 -24 C8 -12 8 0 0 6 Z"
              fill={fireMid}
              animate={{
                d: [
                  "M0 6 C-8 0 -8 -12 0 -24 C8 -12 8 0 0 6 Z",
                  "M0 6 C-6 2 -10 -10 1 -26 C7 -10 10 1 0 6 Z",
                  "M0 6 C-10 -1 -6 -14 -1 -22 C9 -11 7 0 0 6 Z",
                  "M0 6 C-8 0 -8 -12 0 -24 C8 -12 8 0 0 6 Z",
                ],
              }}
              transition={{ duration: 0.85, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Core */}
            <motion.path
              d="M0 4 C-4 1 -4 -6 0 -14 C4 -6 4 1 0 4 Z"
              fill={fireCore}
              animate={{ opacity: [0.85, 1, 0.9] }}
              transition={{ duration: 0.55, repeat: Infinity }}
            />
            {/* Embers rising */}
            {[0, 1, 2, 3].map((i) => (
              <motion.circle
                key={`ember-${i}`}
                r={1.2}
                fill={ember}
                initial={{ cx: -4 + i * 3, cy: -8, opacity: 0 }}
                animate={{
                  cy: [-8, -28 - i * 4],
                  opacity: [0, 0.9, 0],
                  cx: [-4 + i * 3, -6 + i * 4 + (i % 2 ? 3 : -3)],
                }}
                transition={{
                  duration: 1.4 + i * 0.25,
                  delay: i * 0.35,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            ))}
          </g>
        )}

        {/* Resting coals when stage 0 */}
        {view.campfireLevel === 0 && (
          <g transform="translate(120 150)">
            <ellipse cx="0" cy="6" rx="18" ry="6" fill={darken(ground, 0.2)} opacity={0.7} />
            <circle cx="-6" cy="4" r="3" fill={darken(ember, 0.35)} opacity={0.5} />
            <circle cx="4" cy="5" r="2.5" fill={darken(ember, 0.4)} opacity={0.4} />
          </g>
        )}

        {/* Frogs gather around the fire — same brand mark as Day Garden */}
        <AnimatePresence>
          {frogs.map((f, i) => (
            <motion.g
              key={`frog-${i}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: i * 0.04 }}
              transform={`translate(${f.x} ${f.y}) scale(${f.flip ? -f.scale : f.scale} ${f.scale})`}
            >
              <path
                d={FROG_ICON_PATH}
                fill={f.fill}
                stroke={halo}
                strokeWidth={2.75}
                strokeLinejoin="round"
                paintOrder="stroke"
                vectorEffect="non-scaling-stroke"
                transform="translate(-8.064 -7.168) scale(0.028)"
              />
            </motion.g>
          ))}
        </AnimatePresence>
      </svg>
    </Box>
  );
}
