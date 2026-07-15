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

  const isSeedling = stage === "seedling" || leaves <= 0;
  const shownLeaves = LEAF_POSITIONS.slice(0, Math.min(leaves, MAX_LEAVES));
  const shownBlossoms = BLOSSOM_SLOTS.slice(0, blossoms);

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

        {isSeedling ? (
          <g>
            <path
              d="M80 162 Q79 146 80 132"
              stroke={leafTone.dark}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            <ellipse cx="72" cy="134" rx="9" ry="5" fill={leafTone.main} transform="rotate(-30 72 134)" />
            <ellipse cx="88" cy="130" rx="9" ry="5" fill={leafTone.light} transform="rotate(30 88 130)" />
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
      </svg>
    </Box>
  );
}
