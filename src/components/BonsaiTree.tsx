"use client";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  BASELINE_FROGS,
  bonsaiStageLabel,
  MAX_FROGS,
  MAX_LEAVES,
  SQUIRREL_MIN,
  type BonsaiStage,
} from "@/lib/bonsai";
import { FROG_ICON_PATH, SQUIRREL_ICON_PATH } from "@/lib/frogIcon";

type BonsaiTreeProps = {
  stage: BonsaiStage;
  leaves: number;
  blossoms: number;
  isWilting?: boolean;
  size?: number;
  frogs?: number;
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

// Deterministic 0..1 hash of an index — a stable stand-in for randomness so the
// critter scatter is identical on server + client (no hydration mismatch).
function seeded(i: number, salt: number): number {
  const v = Math.sin((i + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return v - Math.floor(v);
}

// Frog friends gather on the ground around the pot base. Computed once; frog `i`
// always sits in slot `i`, so the crowd grows additively without reshuffling.
// Slot 0 is the original lone frog's spot (the baseline).
// Scale is 2x the original hand-drawn-critter sizing (0.68..1.18 -> 1.36..2.36)
// now that the critters render as a bolder icon silhouette instead of tiny
// ellipses — the smallest frog is still exactly 2x its old smallest size.
const FROG_POSITIONS = Array.from({ length: MAX_FROGS }, (_, i) => {
  if (i === 0) return { x: 30, y: 187, scale: 2 };
  return {
    x: 12 + seeded(i, 1) * 136, // 12..148 across the ground band
    y: 186 + seeded(i, 2) * 13, // 186..199, clustered at the base
    scale: 1.36 + seeded(i, 3) * 1.0, // 1.36..2.36 depth variation
  };
});

// The squirrel's own fixed spot (distinct from the frog slots, not counted in
// the frog cap). It only visits occasionally — see squirrelVisible.
const SQUIRREL_SLOT = { x: 132, y: 184, scale: 2 };

// Occasional + deterministic: present only once the crowd is established and
// when a seeded hash of the count lands, so it pops in and out as frogs change
// but is stable for any given count (no per-render randomness → never flickers).
function squirrelVisible(frogCount: number): boolean {
  if (frogCount < SQUIRREL_MIN) return false;
  const v = Math.sin(frogCount * 91.7) * 43758.5453;
  return v - Math.floor(v) < 0.3;
}

export default function BonsaiTree({
  stage,
  leaves,
  blossoms,
  isWilting = false,
  size = 180,
  frogs = BASELINE_FROGS,
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

  // Fade-in only (no scale): a leaf/frog is never stranded invisible if the
  // animation is interrupted (e.g. a backgrounded tab pausing rAF).
  const appear = reduce
    ? { initial: false as const, animate: {}, exit: {}, transition: { duration: 0 } }
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
      };

  // Critters are drawn as bold, solid icon silhouettes at the pot base. A
  // "sticker halo" — a stroke in the card's own background colour, painted
  // behind the fill — keeps each critter visually distinct even when the
  // crowd piles up and overlaps (otherwise they merge into one green blob).
  const frogFill = theme.palette.primary.main;
  const squirrelBody = theme.palette.secondary.main;
  const critterHalo = theme.palette.background.paper;

  const isShrub = stage === "shrub" || leaves <= 0;
  const shownLeaves = LEAF_POSITIONS.slice(0, Math.min(leaves, MAX_LEAVES));
  const shownBlossoms = BLOSSOM_SLOTS.slice(0, blossoms);
  const shownGrass = GRASS.slice(0, Math.min(GRASS.length, Math.ceil(leaves / 4)));

  // The tree scales up as it fills in, so the mature stage is notably big.
  const treeScale = 0.9 + (Math.min(leaves, MAX_LEAVES) / MAX_LEAVES) * 0.45;

  // Frogs are bounded and always show at least the baseline lone frog.
  const frogCount = Math.max(BASELINE_FROGS, Math.min(frogs, MAX_FROGS));
  const shownFrogs = FROG_POSITIONS.slice(0, frogCount);
  const showSquirrel = squirrelVisible(frogCount);

  // Wilt dims only the living tree/pot layer — the frog friends and squirrel
  // stay full-color, since they mark work already done and never wilt.
  const wiltStyle = {
    opacity: isWilting ? 0.75 : 1,
    filter: isWilting ? "saturate(0.6)" : "none",
    transition: "opacity 600ms ease, filter 600ms ease",
  } as const;

  return (
    <Box
      role="img"
      aria-label={bonsaiStageLabel(stage)}
      sx={{ width: size, height: size, maxWidth: "100%" }}
    >
      <svg width="100%" height="100%" viewBox="0 0 160 200" aria-hidden="true">
        {/* Living layer — pot, soil, grass, tree — dims when wilting. */}
        <g style={wiltStyle}>
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
                    <motion.circle key={i} cx={leaf.x} cy={leaf.y} r={9} fill={leafTone[leaf.tone]} {...appear} />
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
        </g>

        {/* Critter layer — frog friends + the occasional squirrel. Outside the
            wilt styling, so they stay full-color even when the tree wilts. */}
        <g>
          <AnimatePresence>
            {shownFrogs.map((p, i) => (
              <motion.g key={i} transform={`translate(${p.x} ${p.y}) scale(${p.scale})`} {...appear}>
                {/* Same frog mark used everywhere else in the app (favicon,
                    header, task buttons) — see src/lib/frogIcon.ts. Path is
                    576x512; this local transform centers and shrinks it to
                    the same footprint the hand-drawn critter used to have.
                    The bg-coloured, non-scaling stroke (painted behind the
                    fill via paint-order) is the sticker halo that separates
                    overlapping frogs — see critterHalo above. */}
                <path
                  d={FROG_ICON_PATH}
                  fill={frogFill}
                  stroke={critterHalo}
                  strokeWidth={2.5}
                  strokeLinejoin="round"
                  paintOrder="stroke"
                  vectorEffect="non-scaling-stroke"
                  transform="translate(-8.064 -7.168) scale(0.028)"
                />
              </motion.g>
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {showSquirrel && (
              <motion.g
                key="squirrel"
                transform={`translate(${SQUIRREL_SLOT.x} ${SQUIRREL_SLOT.y}) scale(${SQUIRREL_SLOT.scale})`}
                {...appear}
              >
                {/* Same bold, solid-fill artistic variety as the frog mark,
                    with the same sticker halo — see src/lib/frogIcon.ts. Path
                    is 512x512; this local transform centers and sizes it so it
                    reads clearly at the pot base among the frogs. */}
                <path
                  d={SQUIRREL_ICON_PATH}
                  fill={squirrelBody}
                  stroke={critterHalo}
                  strokeWidth={2.5}
                  strokeLinejoin="round"
                  paintOrder="stroke"
                  vectorEffect="non-scaling-stroke"
                  transform="translate(-9 -9) scale(0.035)"
                />
              </motion.g>
            )}
          </AnimatePresence>
        </g>
      </svg>
    </Box>
  );
}
