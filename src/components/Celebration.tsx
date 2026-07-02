"use client";

import Box from "@mui/material/Box";
import { motion, useReducedMotion } from "framer-motion";
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

/** Fire a small celebratory burst at a viewport coordinate. */
type Celebrate = (x: number, y: number) => void;

const CelebrationContext = createContext<Celebrate>(() => {});

export function useCelebration(): Celebrate {
  return useContext(CelebrationContext);
}

type Particle = { dx: number; dy: number; size: number; color: string };
type Burst = { id: number; x: number; y: number; particles: Particle[] };

// Muted zen palette — same tones as the theme/sand, so the burst feels calm
// and of-a-piece rather than like party confetti (constitution Principle I/II).
const PALETTE = ["#6B8F71", "#B98C5B", "#7A93A6", "#C79A4B", "#8FB49A"];
const PARTICLE_COUNT = 12;
const BURST_MS = 900;

export function CelebrationProvider({ children }: { children: ReactNode }) {
  const [bursts, setBursts] = useState<Burst[]>([]);
  const nextId = useRef(0);
  const reduceMotion = useReducedMotion();

  const celebrate = useCallback<Celebrate>((x, y) => {
    const id = nextId.current;
    nextId.current += 1;
    // Randomize particle spray here, in the event handler — never during
    // render (React purity rule); each burst's shape is then fixed data.
    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const angle = (i / PARTICLE_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
      const distance = 34 + Math.random() * 46;
      return {
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance,
        size: 7 + Math.random() * 7,
        color: PALETTE[i % PALETTE.length],
      };
    });
    setBursts((current) => [...current, { id, x, y, particles }]);
    // Self-cleaning: particles have finished fading well before this.
    window.setTimeout(() => {
      setBursts((current) => current.filter((burst) => burst.id !== id));
    }, BURST_MS + 100);
  }, []);

  return (
    <CelebrationContext.Provider value={celebrate}>
      {children}
      <Box
        aria-hidden
        sx={{
          position: "fixed",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: (theme) => theme.zIndex.tooltip + 1,
        }}
      >
        {bursts.map((burst) => (
          <BurstView key={burst.id} burst={burst} reduceMotion={!!reduceMotion} />
        ))}
      </Box>
    </CelebrationContext.Provider>
  );
}

function BurstView({ burst, reduceMotion }: { burst: Burst; reduceMotion: boolean }) {
  const particles = burst.particles;

  // Reduced motion: a single soft ring instead of a spray of particles.
  if (reduceMotion) {
    return (
      <motion.div
        initial={{ opacity: 0.5, scale: 0.3 }}
        animate={{ opacity: 0, scale: 1.7 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          position: "absolute",
          left: burst.x,
          top: burst.y,
          width: 48,
          height: 48,
          marginLeft: -24,
          marginTop: -24,
          borderRadius: "50%",
          border: `2px solid ${PALETTE[0]}`,
        }}
      />
    );
  }

  return (
    <>
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 1, scale: 0.4, x: burst.x, y: burst.y }}
          animate={{
            opacity: 0,
            scale: 1,
            x: burst.x + particle.dx,
            y: burst.y + particle.dy,
          }}
          transition={{ duration: BURST_MS / 1000, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: particle.size,
            height: particle.size,
            marginLeft: -particle.size / 2,
            marginTop: -particle.size / 2,
            borderRadius: "50%",
            backgroundColor: particle.color,
          }}
        />
      ))}
    </>
  );
}
