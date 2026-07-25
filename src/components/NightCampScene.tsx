"use client";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { NightCampView } from "@/lib/nightCamp";
import { FROG_ICON_PATH } from "@/lib/frogIcon";

type NightCampSceneProps = {
  view: NightCampView;
  size?: number;
};

/**
 * Night Camp SVG — fireflies, campfire, stars, moon, frogs (017).
 * Decorative; parent supplies accessible labeling.
 */
export default function NightCampScene({ view, size = 240 }: NightCampSceneProps) {
  const theme = useTheme();
  const reduce = useReducedMotion();
  const appear = reduce
    ? { initial: false as const, animate: {}, transition: { duration: 0 } }
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
      };

  const sky = theme.palette.mode === "dark" ? "#0B1020" : "#1A2238";
  const moon = theme.palette.warning.light;
  const star = theme.palette.info.light;
  const fireCore = theme.palette.warning.main;
  const fireOuter = theme.palette.error.light;
  const frogFill = theme.palette.primary.main;
  const frogAlt = theme.palette.primary.light;
  const halo = theme.palette.background.paper;

  const stars = Array.from({ length: Math.round(4 + view.starDensity * 18) }, (_, i) => {
    const a = (i * 2.399) % (Math.PI * 2);
    const r = 18 + (i % 7) * 9;
    return {
      x: 80 + Math.cos(a) * r * 1.15,
      y: 28 + Math.sin(a) * r * 0.55 + (i % 5) * 3,
      s: 0.7 + (i % 3) * 0.35,
    };
  });

  const fireflies = Array.from({ length: view.fireflies }, (_, i) => {
    const a = i * 0.9;
    return {
      x: 40 + (i * 17) % 90 + Math.sin(a) * 6,
      y: 70 + (i * 11) % 50 + Math.cos(a) * 8,
    };
  });

  const frogs = Array.from({ length: view.nightFrogs }, (_, i) => {
    const side = i % 2 === 0 ? -1 : 1;
    return {
      x: 80 + side * (18 + (i % 5) * 14) + (i % 3) * 3,
      y: 168 + (i % 4) * 4,
      scale: 1.4 + (i % 3) * 0.25,
      fill: i % 2 === 0 ? frogFill : frogAlt,
    };
  });

  const fireScale = 0.35 + view.campfireLevel * 0.2;

  return (
    <Box sx={{ width: size, height: size, maxWidth: "100%" }} aria-hidden>
      <svg width="100%" height="100%" viewBox="0 0 160 200">
        <rect x="0" y="0" width="160" height="200" rx="12" fill={sky} opacity={0.92} />

        {/* Moon */}
        <AnimatePresence>
          {view.moonFill > 0.05 && (
            <motion.circle
              key="moon"
              cx={118}
              cy={36}
              r={10 + view.moonFill * 8}
              fill={moon}
              opacity={0.55 + view.moonFill * 0.4}
              {...appear}
            />
          )}
        </AnimatePresence>

        {/* Stars */}
        <AnimatePresence>
          {stars.map((s, i) => (
            <motion.circle
              key={`star-${i}`}
              cx={s.x}
              cy={s.y}
              r={s.s}
              fill={star}
              opacity={0.35 + view.starDensity * 0.5}
              {...appear}
            />
          ))}
        </AnimatePresence>

        {/* Ground */}
        <ellipse cx="80" cy="178" rx="62" ry="14" fill={theme.palette.secondary.dark} opacity={0.55} />

        {/* Campfire */}
        {view.campfireLevel > 0 && (
          <g transform={`translate(80 155) scale(${fireScale})`}>
            <ellipse cx="0" cy="8" rx="14" ry="5" fill={theme.palette.secondary.dark} opacity={0.7} />
            <path d="M-6 6 L-2 -2 L2 6 Z" fill={theme.palette.secondary.main} />
            <path d="M2 6 L6 -1 L10 6 Z" fill={theme.palette.secondary.dark} />
            <path
              d="M0 4 Q-8 -10 0 -22 Q8 -10 0 4 Z"
              fill={fireOuter}
              opacity={0.85}
            />
            <path
              d="M0 2 Q-4 -6 0 -14 Q4 -6 0 2 Z"
              fill={fireCore}
              opacity={0.95}
            />
          </g>
        )}

        {/* Fireflies */}
        <AnimatePresence>
          {fireflies.map((f, i) => (
            <motion.circle
              key={`ff-${i}`}
              cx={f.x}
              cy={f.y}
              r={1.6}
              fill={theme.palette.warning.light}
              opacity={0.75}
              {...appear}
            />
          ))}
        </AnimatePresence>

        {/* Frogs near the fire — may "nibble" near fireflies by sitting mid-ground */}
        <AnimatePresence>
          {frogs.map((f, i) => (
            <motion.g
              key={`nf-${i}`}
              transform={`translate(${f.x} ${f.y}) scale(${f.scale})`}
              {...appear}
            >
              <path
                d={FROG_ICON_PATH}
                fill={f.fill}
                stroke={halo}
                strokeWidth={2.5}
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
