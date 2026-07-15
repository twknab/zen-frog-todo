"use client";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { bonsaiStageLabel, MAX_LEAVES, type BonsaiStage } from "@/lib/bonsai";

type BonsaiTreeProps = {
  stage: BonsaiStage;
  leaves: number;
  blossoms: number;
  isWilting?: boolean;
  size?: number;
};

const CANOPY = { cx: 80, cy: 92 };

// Phyllotaxis (golden-angle) layout so leaves fill the canopy outward in a
// natural spiral — computed once at module load (no render-time randomness).
const GOLDEN_ANGLE = 2.399963229728653; // ~137.5° in radians
const LEAF_POSITIONS = Array.from({ length: MAX_LEAVES }, (_, i) => {
  const r = 7 * Math.sqrt(i);
  return {
    x: CANOPY.cx + r * Math.cos(i * GOLDEN_ANGLE),
    y: CANOPY.cy + r * Math.sin(i * GOLDEN_ANGLE) * 0.82,
    tone: ["main", "light", "dark"][i % 3] as "main" | "light" | "dark",
  };
});

// Blossoms sit on a handful of inner canopy positions, revealed as the tree flowers.
const BLOSSOM_SLOTS = [2, 5, 8, 11, 14, 17];

// Grass sprigs flanking the pot base (ground y≈196); more appear as the tree grows.
const GRASS = [
  { x: 46, h: 14, tilt: -5 },
  { x: 116, h: 15, tilt: 5 },
  { x: 40, h: 10, tilt: -9 },
  { x: 122, h: 11, tilt: 8 },
  { x: 52, h: 18, tilt: 2 },
  { x: 110, h: 17, tilt: -3 },
];

export default function BonsaiTree({
  stage,
  leaves,
  blossoms,
  isWilting = false,
  size = 180,
}: BonsaiTreeProps) {
  const theme = useTheme();
  const reduce = useReducedMotion();

  const leafTone = {
    main: theme.palette.primary.main,
    light: theme.palette.primary.light,
    dark: theme.palette.primary.dark,
  };
  const potFill = theme.palette.secondary.main;
  const potRim = theme.palette.secondary.dark;
  const soilFill = theme.palette.secondary.dark;
  const woodFill = theme.palette.secondary.dark;
  const blossomFill = theme.palette.error.light;

  // Fade-in only (no scale): a leaf is never stranded invisible if the
  // animation is interrupted (e.g. a backgrounded tab pausing rAF).
  const appear = reduce
    ? { initial: false as const, animate: {}, exit: {}, transition: { duration: 0 } }
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
      };

  const frogFill = theme.palette.primary.light;
  const eyeFill = theme.palette.text.primary;

  const isShrub = stage === "shrub" || leaves <= 0;
  const shownLeaves = LEAF_POSITIONS.slice(0, Math.min(leaves, MAX_LEAVES));
  const shownBlossoms = BLOSSOM_SLOTS.slice(0, blossoms);
  const shownGrass = GRASS.slice(0, Math.min(GRASS.length, Math.ceil(leaves / 4)));

  // The tree scales up as it fills in, so the mature stage is notably big.
  const treeScale = 0.9 + (Math.min(leaves, MAX_LEAVES) / MAX_LEAVES) * 0.45;

  return (
    <Box
      role="img"
      aria-label={bonsaiStageLabel(stage)}
      sx={{
        width: size,
        height: size,
        maxWidth: "100%",
        opacity: isWilting ? 0.75 : 1,
        filter: isWilting ? "saturate(0.6)" : "none",
        transition: "opacity 600ms ease, filter 600ms ease",
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 160 200" aria-hidden="true">
        {/* Pot + soil — always present */}
        <path d="M44 162 L116 162 L108 196 L52 196 Z" fill={potFill} />
        <rect x="40" y="156" width="80" height="10" rx="4" fill={potRim} />
        <ellipse cx="80" cy="162" rx="34" ry="6" fill={soilFill} />

        {/* Grass sprigs around the pot base — grow in as the tree does */}
        <AnimatePresence>
          {shownGrass.map((blade) => (
            <motion.path
              key={blade.x}
              d={`M${blade.x} 196 Q${blade.x + blade.tilt * 0.5} ${196 - blade.h * 0.6} ${blade.x + blade.tilt} ${196 - blade.h}`}
              stroke={leafTone.main}
              strokeWidth={2}
              strokeLinecap="round"
              fill="none"
              {...appear}
            />
          ))}
        </AnimatePresence>

        {/* A little frog friend beside the pot */}
        <g transform="translate(30 187)">
          <ellipse cx={0} cy={4} rx={9} ry={6} fill={frogFill} />
          <ellipse cx={-4} cy={-1.5} rx={3.2} ry={3.6} fill={frogFill} />
          <ellipse cx={4} cy={-1.5} rx={3.2} ry={3.6} fill={frogFill} />
          <circle cx={-4} cy={-1.5} r={1.2} fill={eyeFill} />
          <circle cx={4} cy={-1.5} r={1.2} fill={eyeFill} />
          <path d="M-4 5 Q0 8 4 5" stroke={eyeFill} strokeWidth={1} fill="none" strokeLinecap="round" />
        </g>

        {/* The tree itself scales up around its base as it matures */}
        <g transform={`translate(80 162) scale(${treeScale}) translate(-80 -162)`}>
        {isShrub ? (
          // Starting state: a small bushy shrub near the soil — a living base
          // to grow from, never an empty pot.
          <g>
            {[
              { x: 80, y: 150, a: 0 },
              { x: 68, y: 152, a: -22 },
              { x: 92, y: 152, a: 22 },
            ].map((stem) => (
              <path
                key={`${stem.x}-${stem.y}`}
                d={`M80 162 Q${stem.x} 156 ${stem.x} ${stem.y}`}
                stroke={leafTone.dark}
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
            ))}
            <ellipse cx="80" cy="146" rx="10" ry="6" fill={leafTone.main} />
            <ellipse cx="67" cy="150" rx="9" ry="5.5" fill={leafTone.dark} transform="rotate(-24 67 150)" />
            <ellipse cx="93" cy="150" rx="9" ry="5.5" fill={leafTone.light} transform="rotate(24 93 150)" />
            <ellipse cx="74" cy="142" rx="8" ry="5" fill={leafTone.light} />
            <ellipse cx="87" cy="142" rx="8" ry="5" fill={leafTone.main} />
          </g>
        ) : (
          <g>
            {/* Trunk */}
            <path d="M76 162 Q73 126 80 112 Q87 126 84 162 Z" fill={woodFill} />
            {/* Leaves — one per completion, filling the canopy outward */}
            <AnimatePresence>
              {shownLeaves.map((leaf, i) => (
                <motion.circle
                  key={i}
                  cx={leaf.x}
                  cy={leaf.y}
                  r={9}
                  fill={leafTone[leaf.tone]}
                  {...appear}
                />
              ))}
            </AnimatePresence>
            {/* Blossoms once flowering */}
            <AnimatePresence>
              {shownBlossoms.map((slot) => (
                <motion.circle
                  key={`b${slot}`}
                  cx={LEAF_POSITIONS[slot].x}
                  cy={LEAF_POSITIONS[slot].y}
                  r={4}
                  fill={blossomFill}
                  {...appear}
                />
              ))}
            </AnimatePresence>
          </g>
        )}
        </g>
      </svg>
    </Box>
  );
}
