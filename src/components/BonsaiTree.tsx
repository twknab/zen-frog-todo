"use client";

import Box from "@mui/material/Box";
import { darken, lighten, useTheme, type Theme } from "@mui/material/styles";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useId } from "react";
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
  /** Canopy frog-fruit count (same unlock pacing as former pink blossoms). */
  blossoms: number;
  isWilting?: boolean;
  size?: number;
  frogs?: number;
};

// Dial-back knobs (specs/015-garden-critter-bonsai):
// - MAX_FROGS — src/lib/bonsai.ts
// - FROG_BAND / FROG_X / FROG_ROW_DEPTH / FROG_SCALE_* — ground crowd comedy vs sludge
// - TREE_SCALE_BASE / TREE_SCALE_DELTA — bonsai presence
// - CANOPY_SPREAD_* — canopy width/height at terminal state
// - FROG_FRUIT_SCALE — canopy fruit size
// - fruitFills() token list — multi-color fun vs quiet
const FROG_BAND = { yMin: 186, ySpan: 20 };
const FROG_ROW_DEPTH = 11; // back rows sit higher so the pile reads tall, not flat
const FROG_SCALE_MIN = 1.75;
const FROG_SCALE_SPAN = 1.2; // → max ~2.95 (bigger, grander pile)
const FROG_X = { min: -22, span: 204 }; // continuous wide band (~-22..182) — no center gap
const TREE_SCALE_BASE = 0.98;
const TREE_SCALE_DELTA = 0.62; // fuller mature presence
const CANOPY_SPREAD_X = 1.24; // horizontal stretch → wider terminal canopy
const CANOPY_SPREAD_Y = 0.8; // gentle vertical flatten (bonsai silhouette)
const CANOPY_RADIUS = 8.4; // spiral step — larger = wider, leafier fan
const FROG_FRUIT_SCALE = 1.55; // large fruit presence in the canopy
const CANOPY = { cx: 80, cy: 88 }; // slightly lower so mature crown clears the card edge

// Phyllotaxis (golden-angle) layout so leaves fill the canopy outward in a
// natural spiral — computed once at module load (no render-time randomness).
const GOLDEN_ANGLE = 2.399963229728653; // ~137.5° in radians
const LEAF_POSITIONS = Array.from({ length: MAX_LEAVES }, (_, i) => {
  const r = CANOPY_RADIUS * Math.sqrt(i);
  const angle = i * GOLDEN_ANGLE;
  return {
    x: CANOPY.cx + r * Math.cos(angle) * CANOPY_SPREAD_X,
    y: CANOPY.cy + r * Math.sin(angle) * CANOPY_SPREAD_Y,
    // Leaf tip rotation (degrees) — soft fan, not mechanical grid.
    rot: (angle * 180) / Math.PI + 35,
    tone: ["main", "light", "dark"][i % 3] as "main" | "light" | "dark",
  };
});

// A soft backdrop of larger, low-opacity leaf blobs behind the crisp leaves so
// a full canopy reads dense and lush rather than as separable dots. Positions
// track the spiral (pulled slightly inward) and unlock in step with the crisp
// leaves via the same slice count.
const CANOPY_BACKDROP = LEAF_POSITIONS.map((leaf) => ({
  x: CANOPY.cx + (leaf.x - CANOPY.cx) * 0.86,
  y: CANOPY.cy + (leaf.y - CANOPY.cy) * 0.86,
  rot: leaf.rot,
}));

// Frog-fruit sit on canopy positions (former blossom slots), spread across the
// crown so a mature tree hangs a generous, colorful cluster of frog-fruit.
const BLOSSOM_SLOTS = [2, 4, 6, 9, 12, 15, 18, 21];

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

// Frog friends gather in one continuous pile across the pot base. Computed once;
// frog `i` always sits in slot `i`, so the crowd grows additively without
// reshuffling. Slot 0 is the baseline. Specs/015: wide continuous band (no
// left/right split) + comedy scale — pot peeks through overlaps, not a gap.
const FROG_POSITIONS = Array.from({ length: MAX_FROGS }, (_, i) => {
  if (i === 0) return { x: 38, y: 192, scale: 2.75 };
  // Continuous x across a wide band so the pile reads as one dense mound,
  // including under the pot — not two flank clumps with a center gap.
  const x = FROG_X.min + seeded(i, 4) * FROG_X.span;
  // Depth rows: front frogs sit low + big; back rows climb the pot base a touch
  // higher and slightly smaller, so the crowd reads as a tall, grand pile.
  const row = Math.floor(seeded(i, 5) * 3); // 0 (front) .. 2 (back)
  const yFront = FROG_BAND.yMin + seeded(i, 2) * FROG_BAND.ySpan;
  return {
    x,
    // Back rows sit higher; render sorts by this y so back frogs paint first.
    y: yFront - row * FROG_ROW_DEPTH,
    scale: FROG_SCALE_MIN + seeded(i, 3) * FROG_SCALE_SPAN - row * 0.28,
  };
});

// The squirrel's own fixed spot (distinct from the frog slots, not counted in
// the frog cap). It only visits occasionally — see squirrelVisible.
const SQUIRREL_SLOT = { x: 134, y: 183, scale: 2.35 };

// Occasional + deterministic: present only once the crowd is established and
// when a seeded hash of the count lands, so it pops in and out as frogs change
// but is stable for any given count (no per-render randomness → never flickers).
function squirrelVisible(frogCount: number): boolean {
  if (frogCount < SQUIRREL_MIN) return false;
  const v = Math.sin(frogCount * 91.7) * 43758.5453;
  return v - Math.floor(v) < 0.3;
}

/** Soft theme-token fills for canopy frog-fruit (fun, not neon). */
function fruitFills(theme: Theme): string[] {
  const p = theme.palette;
  return [
    p.primary.main,
    p.secondary.main,
    p.error.light,
    p.success.main,
    p.warning.light,
    p.info.main,
  ];
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
  // Unique per instance so multiple trees (e.g. The Grove) never share gradient
  // ids. Colons from useId are stripped to keep url(#…) references clean.
  const gradientPrefix = `fruit${useId().replace(/:/g, "")}`;

  const leafTone = {
    main: theme.palette.primary.main,
    light: theme.palette.primary.light,
    dark: theme.palette.primary.dark,
  };
  const potFill = theme.palette.secondary.main;
  const potRim = theme.palette.secondary.dark;
  const soilFill = theme.palette.secondary.dark;
  const woodFill = theme.palette.secondary.dark;
  const frogFruitColors = fruitFills(theme);

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

  // Critters are drawn as bold, solid icon silhouettes. A "sticker halo" —
  // a stroke in the card's own background colour, painted behind the fill —
  // keeps each critter distinct when the crowd overlaps. Ground frogs cycle
  // the same theme-token palette as canopy frog-fruit.
  const squirrelBody = theme.palette.secondary.main;
  const critterHalo = theme.palette.background.paper;

  const isShrub = stage === "shrub" || leaves <= 0;
  const shownLeaves = LEAF_POSITIONS.slice(0, Math.min(leaves, MAX_LEAVES));
  const shownBackdrop = CANOPY_BACKDROP.slice(0, Math.min(leaves, MAX_LEAVES));
  const shownFruit = BLOSSOM_SLOTS.slice(0, blossoms);
  const shownGrass = GRASS.slice(0, Math.min(GRASS.length, Math.ceil(leaves / 4)));

  // Mature presence bump (~15–25% vs prior 0.9+0.45) — dial TREE_SCALE_* above.
  const treeScale =
    TREE_SCALE_BASE + (Math.min(leaves, MAX_LEAVES) / MAX_LEAVES) * TREE_SCALE_DELTA;

  // Frogs are bounded and always show at least the baseline lone frog. Keep the
  // slot index as identity (stable AnimatePresence keys) but paint back-to-front
  // (higher up the pile first) so the crowd overlaps like a real stacked pile.
  const frogCount = Math.max(BASELINE_FROGS, Math.min(frogs, MAX_FROGS));
  const shownFrogs = FROG_POSITIONS.slice(0, frogCount)
    .map((p, slot) => ({ ...p, slot }))
    .sort((a, b) => a.y - b.y);
  const showSquirrel = squirrelVisible(frogCount);

  // Wilt dims only the living tree/pot layer — frog friends, squirrel, and
  // canopy frog-fruit stay full-color (work already done / cheerful rewards).
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
      {/* Extra top/side pad so a mature scaled canopy + large frog-fruit never
          clip the card edge; wide enough for the continuous frog pile. */}
      <svg width="100%" height="100%" viewBox="-28 -56 216 288" aria-hidden="true">
        {/* Per-color vertical gradients give each canopy frog-fruit a soft,
            theme-matched sheen (light crown → base → shaded belly). */}
        <defs>
          {frogFruitColors.map((base, i) => (
            <linearGradient key={i} id={`${gradientPrefix}-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lighten(base, 0.28)} />
              <stop offset="50%" stopColor={base} />
              <stop offset="100%" stopColor={darken(base, 0.26)} />
            </linearGradient>
          ))}
        </defs>

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
                {/* Trunk — wider, gently flared base for a grounded bonsai */}
                <path d="M72 162 Q68 120 80 100 Q92 120 88 162 Z" fill={woodFill} />
                {/* Backdrop canopy — larger, low-opacity leaf blobs behind the
                    crisp leaves so a full crown reads dense and lush. */}
                <AnimatePresence>
                  {shownBackdrop.map((leaf, i) => (
                    <motion.ellipse
                      key={`bg-${i}`}
                      cx={leaf.x}
                      cy={leaf.y}
                      rx={15}
                      ry={9.5}
                      fill={leafTone.dark}
                      opacity={0.5}
                      transform={`rotate(${leaf.rot} ${leaf.x} ${leaf.y})`}
                      {...appear}
                    />
                  ))}
                </AnimatePresence>
                {/* Leaves — soft leaf-ish ovals (richer than plain circles) */}
                <AnimatePresence>
                  {shownLeaves.map((leaf, i) => (
                    <motion.ellipse
                      key={i}
                      cx={leaf.x}
                      cy={leaf.y}
                      rx={11.5}
                      ry={7.2}
                      fill={leafTone[leaf.tone]}
                      transform={`rotate(${leaf.rot} ${leaf.x} ${leaf.y})`}
                      {...appear}
                    />
                  ))}
                </AnimatePresence>
              </g>
            )}
          </g>
        </g>

        {/* Critter + frog-fruit layer — outside wilt styling so rewards stay cheerful. */}
        <g>
          {/* Canopy frog-fruit — same unlock slots as former pink blossoms; scaled
              with the tree so they hang in the canopy as it grows. */}
          {!isShrub && (
            <g transform={`translate(80 162) scale(${treeScale}) translate(-80 -162)`}>
              <AnimatePresence>
                {shownFruit.map((slot, fruitIndex) => {
                  const pos = LEAF_POSITIONS[slot];
                  const colorIndex = fruitIndex % frogFruitColors.length;
                  return (
                    <motion.g
                      key={`fruit-${slot}`}
                      transform={`translate(${pos.x} ${pos.y}) scale(${FROG_FRUIT_SCALE})`}
                      {...appear}
                    >
                      <path
                        d={FROG_ICON_PATH}
                        fill={`url(#${gradientPrefix}-${colorIndex})`}
                        stroke={critterHalo}
                        strokeWidth={2}
                        strokeLinejoin="round"
                        paintOrder="stroke"
                        vectorEffect="non-scaling-stroke"
                        transform="translate(-8.064 -7.168) scale(0.028)"
                      />
                    </motion.g>
                  );
                })}
              </AnimatePresence>
            </g>
          )}

          <AnimatePresence>
            {shownFrogs.map((p) => {
              const colorIndex = p.slot % frogFruitColors.length;
              return (
                <motion.g key={p.slot} transform={`translate(${p.x} ${p.y}) scale(${p.scale})`} {...appear}>
                  {/* Same frog mark as favicon/header — see src/lib/frogIcon.ts.
                      Sticker halo separates overlapping comedy-scale frogs.
                      Fills cycle theme tokens so the pile is colorful, not mono. */}
                  <path
                    d={FROG_ICON_PATH}
                    fill={frogFruitColors[colorIndex]}
                    stroke={critterHalo}
                    strokeWidth={2.75}
                    strokeLinejoin="round"
                    paintOrder="stroke"
                    vectorEffect="non-scaling-stroke"
                    transform="translate(-8.064 -7.168) scale(0.028)"
                  />
                </motion.g>
              );
            })}
          </AnimatePresence>

          <AnimatePresence>
            {showSquirrel && (
              <motion.g
                key="squirrel"
                transform={`translate(${SQUIRREL_SLOT.x} ${SQUIRREL_SLOT.y}) scale(${SQUIRREL_SLOT.scale})`}
                {...appear}
              >
                <path
                  d={SQUIRREL_ICON_PATH}
                  fill={squirrelBody}
                  stroke={critterHalo}
                  strokeWidth={2.75}
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
