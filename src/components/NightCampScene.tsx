"use client";

import Box from "@mui/material/Box";
import { darken, lighten, useTheme } from "@mui/material/styles";
import { AnimatePresence, motion } from "framer-motion";
import { useId, useMemo } from "react";
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

/** Mix two hex colors by t (0..1). */
function mixHex(a: string, b: string, t: number): string {
  const parse = (hex: string) => {
    const h = hex.replace("#", "");
    const full =
      h.length === 3
        ? h
            .split("")
            .map((c) => c + c)
            .join("")
        : h;
    return [
      parseInt(full.slice(0, 2), 16),
      parseInt(full.slice(2, 4), 16),
      parseInt(full.slice(4, 6), 16),
    ] as const;
  };
  const [ar, ag, ab] = parse(a);
  const [br, bg, bb] = parse(b);
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  const r = clamp(ar + (br - ar) * t);
  const g = clamp(ag + (bg - ag) * t);
  const bch = clamp(ab + (bb - ab) * t);
  return `#${[r, g, bch].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Night Camp — understated sibling to Day's bonsai: a small central fire,
 * sparse-then-growing sky, soft fireflies, frogs gathering only as night
 * progress warrants. Joyful ambient motion (constitution v2.2.0); Framer + SVG.
 */
export default function NightCampScene({
  view,
  size = 240,
}: NightCampSceneProps) {
  const theme = useTheme();
  const uid = useId().replace(/:/g, "");

  const skyTopLight = theme.palette.mode === "dark" ? "#141A2C" : "#1A2238";
  const skyMidLight = theme.palette.mode === "dark" ? "#1A2438" : "#243048";
  const skyBotLight = theme.palette.mode === "dark" ? "#222C42" : "#2C3850";
  const skyTopDeep = theme.palette.mode === "dark" ? "#03060E" : "#080C18";
  const skyMidDeep = theme.palette.mode === "dark" ? "#070B16" : "#0E1424";
  const skyBotDeep = theme.palette.mode === "dark" ? "#10182A" : "#161E32";

  const depth = view.skyDepth;
  const skyTop = mixHex(skyTopLight, skyTopDeep, depth);
  const skyMid = mixHex(skyMidLight, skyMidDeep, depth);
  const skyBot = mixHex(skyBotLight, skyBotDeep, depth);

  const ground = theme.palette.secondary.dark;
  const groundLight = theme.palette.secondary.main;
  const moonBody = lighten(theme.palette.warning.light, 0.28);
  const moonRim = theme.palette.warning.main;
  const starFill = lighten(theme.palette.info.light, 0.4);
  const fireCore = theme.palette.warning.main;
  const fireMid = theme.palette.warning.light;
  const fireOuter = theme.palette.error.light;
  const ember = theme.palette.error.main;
  const glow = theme.palette.warning.main;
  const frogMain = theme.palette.primary.main;
  const frogLight = theme.palette.primary.light;
  const frogDark = theme.palette.primary.dark;
  const halo = theme.palette.background.paper;
  const firefly = lighten(theme.palette.warning.light, 0.25);

  const stage = view.stage;
  // Tiny barely-started flame at 0 → calm full fire at 4 (never a spectacle).
  const fireScale = 0.28 + view.campfireLevel * 0.16;

  const skyGradId = `nightSky-${uid}`;
  const fireGlowId = `fireGlow-${uid}`;
  const moonGlowId = `moonGlow-${uid}`;
  const softGlowId = `softGlow-${uid}`;
  const moonClipId = `moonClip-${uid}`;

  // Sparse start: ~2–3 stars when empty; denser only as ledger grows.
  const stars = useMemo(() => {
    const count = Math.round(2 + view.starDensity * 28);
    return Array.from({ length: count }, (_, i) => ({
      x: 10 + seeded(i, 1) * 220,
      y: 8 + seeded(i, 2) * 88,
      r: 0.4 + seeded(i, 3) * 1.1,
      delay: seeded(i, 4) * 4,
      dur: 2.4 + seeded(i, 5) * 2.8,
    }));
  }, [view.starDensity]);

  // Soft blink; collect nearer the fire as stages rise.
  const fireflies = useMemo(() => {
    const count = view.fireflies;
    const collect = Math.min(1, stage / 4);
    return Array.from({ length: count }, (_, i) => {
      const angle = seeded(i, 10) * Math.PI * 2;
      const farR = 48 + seeded(i, 11) * 58;
      const nearR = 14 + seeded(i, 12) * 22;
      const r = farR * (1 - collect) + nearR * collect;
      const cx = 120 + Math.cos(angle) * r;
      const cy = 108 + Math.sin(angle) * r * 0.55;
      return {
        x: cx,
        y: cy,
        delay: seeded(i, 13) * 2.6,
        dur: 1.1 + seeded(i, 14) * 1.4,
        drift: 2 + seeded(i, 15) * 3.5,
      };
    });
  }, [view.fireflies, stage]);

  // Arc around the fire — only when night progress warrants company.
  const frogs = useMemo(() => {
    const n = view.nightFrogs;
    if (n <= 0) return [];
    const fills = [frogMain, frogLight, frogDark];
    return Array.from({ length: n }, (_, i) => {
      const t = n === 1 ? 0.5 : i / (n - 1);
      const angle = Math.PI * 0.18 + t * Math.PI * 0.64;
      const radius = 48 + (i % 3) * 5;
      const x = 120 + Math.cos(angle + Math.PI) * radius * 1.12;
      const y = 152 + Math.sin(angle) * 16 + seeded(i, 20) * 5;
      return {
        x,
        y,
        scale: 1.35 + seeded(i, 21) * 0.4,
        fill: fills[i % fills.length],
        flip: seeded(i, 22) > 0.5,
      };
    });
  }, [view.nightFrogs, frogMain, frogLight, frogDark]);

  // Modest moon: small crescent early → fuller disk later.
  const moonR = 5 + view.moonFill * 14;
  const crescent = view.moonFill < 0.55;
  const crescentOffset = moonR * (0.55 - view.moonFill * 0.35);

  return (
    <Box sx={{ width: size, height: size, maxWidth: "100%" }} aria-hidden>
      <svg width="100%" height="100%" viewBox="0 0 240 200" overflow="visible">
        <defs>
          <linearGradient id={skyGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={skyTop} />
            <stop offset="48%" stopColor={skyMid} />
            <stop offset="100%" stopColor={skyBot} />
          </linearGradient>
          <radialGradient id={fireGlowId} cx="50%" cy="55%" r="50%">
            <stop
              offset="0%"
              stopColor={glow}
              stopOpacity={0.28 + stage * 0.08}
            />
            <stop offset="50%" stopColor={glow} stopOpacity={0.08} />
            <stop offset="100%" stopColor={glow} stopOpacity={0} />
          </radialGradient>
          <radialGradient id={moonGlowId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={moonBody} stopOpacity={0.55} />
            <stop offset="75%" stopColor={moonRim} stopOpacity={0.12} />
            <stop offset="100%" stopColor={moonRim} stopOpacity={0} />
          </radialGradient>
          <filter id={softGlowId} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="1.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id={moonClipId}>
            <circle cx="198" cy="40" r={moonR} />
          </clipPath>
        </defs>

        {/* Soft rounded sky plane — bonsai-card sibling, not a full-bleed stage */}
        <rect
          x="0"
          y="0"
          width="240"
          height="200"
          rx="14"
          fill={`url(#${skyGradId})`}
        />

        {/* Stars — few at rest; quiet twinkle */}
        {stars.map((s, i) => (
          <motion.circle
            key={`star-${i}`}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill={starFill}
            initial={{ opacity: 0.2 }}
            animate={{ opacity: [0.18, 0.7, 0.22] }}
            transition={{
              duration: s.dur,
              delay: s.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Moon — crescent early, fuller later; modest scale */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.85 + view.moonFill * 0.15 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <circle
            cx="198"
            cy="40"
            r={moonR * 1.35}
            fill={`url(#${moonGlowId})`}
          />
          <circle
            cx="198"
            cy="40"
            r={moonR}
            fill={moonBody}
            stroke={moonRim}
            strokeWidth={0.9}
            opacity={0.92}
          />
          {crescent && (
            <circle
              cx={198 + crescentOffset}
              cy={40 - moonR * 0.08}
              r={moonR * 0.92}
              fill={skyTop}
              opacity={0.98}
            />
          )}
          {!crescent && (
            <g clipPath={`url(#${moonClipId})`}>
              <circle
                cx={198 - moonR * 0.22}
                cy={40 - moonR * 0.12}
                r={moonR * 0.14}
                fill={darken(moonBody, 0.08)}
                opacity={0.28}
              />
              <circle
                cx={198 + moonR * 0.18}
                cy={40 + moonR * 0.22}
                r={moonR * 0.1}
                fill={darken(moonBody, 0.1)}
                opacity={0.22}
              />
            </g>
          )}
        </motion.g>

        {/* Quiet ground mound */}
        <ellipse cx="120" cy="180" rx="92" ry="18" fill={ground} opacity={0.8} />
        <ellipse
          cx="120"
          cy="174"
          rx="62"
          ry="10"
          fill={groundLight}
          opacity={0.28}
        />

        {/* Fireflies — soft blink; drift nearer the fire over stages */}
        {fireflies.map((f, i) => (
          <motion.g
            key={`ff-${i}`}
            initial={{ x: f.x, y: f.y }}
            animate={{
              x: [f.x - f.drift, f.x + f.drift, f.x - f.drift * 0.35],
              y: [f.y + f.drift * 0.3, f.y - f.drift, f.y + f.drift * 0.15],
            }}
            transition={{
              duration: f.dur * 2.8,
              delay: f.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <motion.circle
              r={1.6}
              fill={firefly}
              filter={`url(#${softGlowId})`}
              animate={{ opacity: [0.15, 0.85, 0.12] }}
              transition={{
                duration: f.dur,
                delay: f.delay * 0.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.g>
        ))}

        {/* Central campfire — always present; level 0 = tiny barely-lit flame */}
        <g transform={`translate(120 148) scale(${fireScale})`}>
          <motion.ellipse
            cx="0"
            cy="6"
            rx={22 + stage * 4}
            ry={12 + stage * 2}
            fill={`url(#${fireGlowId})`}
            animate={{ opacity: [0.4, 0.7, 0.45] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Logs */}
          <rect
            x="-12"
            y="8"
            width={stage === 0 ? 10 : 13}
            height={stage === 0 ? 3.5 : 4.5}
            rx="1.5"
            fill={darken(ground, 0.18)}
            transform="rotate(-16 -7 10)"
          />
          <rect
            x="1"
            y="8"
            width={stage === 0 ? 10 : 13}
            height={stage === 0 ? 3.5 : 4.5}
            rx="1.5"
            fill={darken(ground, 0.08)}
            transform="rotate(14 8 10)"
          />
          {/* Outer flame — tiny at rest */}
          <motion.path
            d="M0 8 C-10 2 -8 -12 0 -22 C8 -12 10 2 0 8 Z"
            fill={fireOuter}
            opacity={stage === 0 ? 0.75 : 0.95}
            animate={{
              d: [
                "M0 8 C-10 2 -8 -12 0 -22 C8 -12 10 2 0 8 Z",
                "M0 8 C-8 3 -11 -10 1 -24 C7 -10 11 3 0 8 Z",
                "M0 8 C-11 1 -7 -14 -1 -20 C9 -11 8 2 0 8 Z",
                "M0 8 C-10 2 -8 -12 0 -22 C8 -12 10 2 0 8 Z",
              ],
            }}
            transition={{
              duration: stage === 0 ? 1.6 : 1.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          {/* Mid flame */}
          <motion.path
            d="M0 6 C-5 1 -5 -8 0 -15 C5 -8 5 1 0 6 Z"
            fill={fireMid}
            animate={{
              d: [
                "M0 6 C-5 1 -5 -8 0 -15 C5 -8 5 1 0 6 Z",
                "M0 6 C-4 2 -7 -7 1 -16 C4 -7 6 2 0 6 Z",
                "M0 6 C-6 0 -4 -9 -1 -14 C6 -8 4 1 0 6 Z",
                "M0 6 C-5 1 -5 -8 0 -15 C5 -8 5 1 0 6 Z",
              ],
            }}
            transition={{
              duration: stage === 0 ? 1.35 : 0.95,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          {/* Core */}
          <motion.path
            d="M0 4 C-2.5 1 -2.5 -4 0 -9 C2.5 -4 2.5 1 0 4 Z"
            fill={fireCore}
            animate={{ opacity: [0.8, 1, 0.85] }}
            transition={{ duration: 0.7, repeat: Infinity }}
          />
          {/* Embers — fewer early */}
          {Array.from({ length: stage === 0 ? 1 : Math.min(3, 1 + stage) }).map(
            (_, i) => (
              <motion.circle
                key={`ember-${i}`}
                r={0.9}
                fill={ember}
                initial={{ cx: -2 + i * 2.5, cy: -4, opacity: 0 }}
                animate={{
                  cy: [-4, -16 - i * 3],
                  opacity: [0, 0.7, 0],
                  cx: [-2 + i * 2.5, -3 + i * 3 + (i % 2 ? 2 : -2)],
                }}
                transition={{
                  duration: 1.8 + i * 0.3,
                  delay: i * 0.5,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            ),
          )}
        </g>

        {/* Frogs gather around the fire — same brand mark as Day Garden */}
        <AnimatePresence>
          {frogs.map((f, i) => (
            <motion.g
              key={`frog-${i}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
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
