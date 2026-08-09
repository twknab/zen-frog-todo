"use client";

import Box from "@mui/material/Box";
import { motion, useReducedMotion } from "framer-motion";
import Lottie from "lottie-react";
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { FaFrog } from "react-icons/fa6";
import addCelebrationData from "@/assets/lottie/add-celebration.json";
import confettiData from "@/assets/lottie/confetti.json";
import ribbonData from "@/assets/lottie/ribbon.json";

/** Fire a celebratory animation at a viewport coordinate. */
type CelebrationKind = "frog" | "task" | "add" | "pounce";
/** Optional `onComplete` runs once when the effect finishes (or hits the safety timeout). */
type Celebrate = (
  x: number,
  y: number,
  kind?: CelebrationKind,
  onComplete?: () => void,
) => void;

const CelebrationContext = createContext<Celebrate>((_x, _y, _kind, onComplete) => {
  onComplete?.();
});

export function useCelebration(): Celebrate {
  return useContext(CelebrationContext);
}

type Celebration = {
  id: number;
  x: number;
  y: number;
  kind: CelebrationKind;
  finish: () => void;
};

// A ribbon flourish greets the day's frog (full-screen, see LottieBurst);
// confetti marks the rest, sized here to keep its 940×752 aspect ratio.
const TASK_SIZE = { w: 320, h: 256 };
// Portrait add-burst (1620×2160) — keep it modest so it blooms near the new row.
const ADD_SIZE = { w: 180, h: 240 };

const PALETTE = ["#6B8F71", "#B98C5B", "#7A93A6", "#C79A4B", "#8FB49A"];
// Safety net: remove a celebration even if Lottie's onComplete never fires
// (e.g. a backgrounded tab pausing rAF). Longer than the longest clip (~5.9s add).
const MAX_MS = 7000;

export function CelebrationProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Celebration[]>([]);
  const nextId = useRef(0);
  // Rapid adds should feel calm — one add-burst at a time, extras are skipped.
  const addBurstActive = useRef(false);
  const reduceMotion = useReducedMotion();

  const celebrate = useCallback<Celebrate>((x, y, kind = "task", onComplete) => {
    if (kind === "add" && addBurstActive.current) {
      onComplete?.();
      return;
    }
    const id = nextId.current;
    nextId.current += 1;
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      if (kind === "add") addBurstActive.current = false;
      setItems((current) => current.filter((c) => c.id !== id));
      onComplete?.();
    };
    if (kind === "add") addBurstActive.current = true;
    setItems((current) => [...current, { id, x, y, kind, finish }]);
    window.setTimeout(finish, MAX_MS);
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
        {items.map((item) =>
          reduceMotion ? (
            <SoftRing key={item.id} item={item} onDone={item.finish} />
          ) : (
            <LottieBurst key={item.id} item={item} onDone={item.finish} />
          ),
        )}
      </Box>
    </CelebrationContext.Provider>
  );
}

function LottieBurst({ item, onDone }: { item: Celebration; onDone: () => void }) {
  if (item.kind === "frog") {
    // The frog is the day's one designated task — its celebration fills the
    // viewport instead of bursting from the checkbox. The square ribbon
    // asset is boxed at min(90vw, 90vh) so it scales as large as possible
    // without distortion or cropping on any aspect ratio.
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ width: "min(90vw, 90vh)", height: "min(90vw, 90vh)" }}>
          <Lottie
            animationData={ribbonData}
            loop={false}
            autoplay
            onComplete={onDone}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </div>
    );
  }

  if (item.kind === "pounce") {
    return <FrogHop onDone={onDone} />;
  }

  const { w, h } = item.kind === "add" ? ADD_SIZE : TASK_SIZE;
  const animationData = item.kind === "add" ? addCelebrationData : confettiData;
  return (
    <div
      style={{
        position: "absolute",
        left: item.x,
        top: item.y,
        width: w,
        height: h,
        marginLeft: -w / 2,
        marginTop: -h / 2,
      }}
    >
      <Lottie
        animationData={animationData}
        loop={false}
        autoplay
        onComplete={onDone}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}

// Rainbow comet wake — same loud family as the builder-name hover.
const FROG_TRAIL = ["#22d3ee", "#4ade80", "#facc15", "#fb923c", "#f472b6", "#c084fc"];

/** Logo frog (FaFrog) hops the full viewport — crouch, leap, land, repeat. */
function FrogHop({ onDone }: { onDone: () => void }) {
  const size = 80;
  const duration = 2.35;
  // Crouch → launch → peak → land, three times (real-frog rhythm).
  const hopTimes = [0, 0.08, 0.22, 0.34, 0.42, 0.56, 0.68, 0.76, 0.9, 1];
  const hopY = [0, 10, -78, 0, 8, -62, 0, 6, -44, 0];
  // Fan the wake taller behind him (above / below the hop line).
  const trailFanY = [-38, -22, -8, 8, 22, 38];

  return (
    <>
      {FROG_TRAIL.map((color, i) => {
        const tailW = 110 + i * 24;
        const delay = 0.03 + i * 0.045;
        const fan = trailFanY[i] ?? 0;
        return (
          <motion.div
            key={color}
            initial={{ x: -size, y: fan, opacity: 0, scaleX: 0.35 }}
            animate={{
              x: `calc(100vw + ${size}px)`,
              y: hopY.map((v) => v * 0.82 + fan),
              opacity: [0, 0.95, 0.85, 0.7, 0.9, 0.75, 0.65, 0.8, 0.45, 0],
              // Stretch longest at peak velocity — comet wake.
              scaleX: [0.4, 0.9, 1.55, 0.85, 1, 1.5, 0.9, 1.1, 1.45, 0.3],
            }}
            transition={{
              duration,
              delay,
              ease: "easeInOut",
              y: { duration, times: hopTimes, ease: "easeInOut" },
              opacity: { duration, times: hopTimes },
              scaleX: { duration, times: hopTimes },
            }}
            style={{
              position: "absolute",
              left: 0,
              top: "50%",
              width: tailW,
              height: 6 + (i % 3),
              // Anchor the bright head near the frog; fade trails behind (left).
              marginLeft: -tailW + size * 0.35,
              marginTop: -3,
              borderRadius: 999,
              transformOrigin: "right center",
              background: `linear-gradient(90deg, transparent 0%, ${color}33 28%, ${color}cc 78%, #fff 100%)`,
              boxShadow: `0 0 6px #fff, 0 0 14px ${color}, 0 0 28px ${color}bb, 0 0 48px ${color}66`,
              filter: "blur(0.35px)",
            }}
          />
        );
      })}
      {/* Sparkle motes shedding off the comet wake. */}
      {FROG_TRAIL.flatMap((color, i) =>
        [0, 1].map((spark) => {
          const n = i * 2 + spark;
          const mote = 3 + (n % 3);
          const fan = (trailFanY[i] ?? 0) * (spark === 0 ? 1.15 : 0.75);
          return (
            <motion.div
              key={`${color}-spark-${spark}`}
              initial={{ x: -size * 0.5, y: fan, opacity: 0, scale: 0 }}
              animate={{
                x: `calc(100vw + ${size}px)`,
                y: hopY.map((v, ti) => v * 0.7 + fan + Math.sin(ti + n) * 8),
                opacity: [0, 0, 1, 0.2, 1, 0.15, 1, 0.25, 0.8, 0],
                scale: [0, 0.4, 1.4, 0.3, 1.2, 0.2, 1.3, 0.35, 1, 0],
              }}
              transition={{
                duration,
                delay: 0.06 + n * 0.035,
                ease: "easeInOut",
                y: { duration, times: hopTimes, ease: "easeInOut" },
                opacity: { duration, times: hopTimes },
                scale: { duration, times: hopTimes },
              }}
              style={{
                position: "absolute",
                left: 0,
                top: "50%",
                width: mote,
                height: mote,
                marginTop: -mote / 2,
                marginLeft: -18 - spark * 14 - i * 6,
                borderRadius: "50%",
                background: spark === 0 ? "#fff" : color,
                boxShadow: `0 0 4px #fff, 0 0 10px ${color}, 0 0 18px ${color}`,
              }}
            />
          );
        }),
      )}
      <motion.div
        initial={{ x: -size, y: 0, opacity: 0, rotate: -6, scaleX: 1, scaleY: 1 }}
        animate={{
          x: `calc(100vw + ${size}px)`,
          y: hopY,
          opacity: [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
          // Nose up on launch, level at peak, tuck on landing.
          rotate: [0, -10, 14, -3, -8, 12, -2, -7, 10, 0],
          // Gentle squash/stretch — readable logo, not a funhouse mirror.
          scaleY: [1, 0.88, 1.1, 0.95, 0.9, 1.08, 0.96, 0.9, 1.06, 1],
          scaleX: [1, 1.1, 0.94, 1.02, 1.08, 0.95, 1.02, 1.06, 0.96, 1],
        }}
        transition={{
          duration,
          ease: "easeInOut",
          y: { duration, times: hopTimes, ease: "easeInOut" },
          rotate: { duration, times: hopTimes },
          scaleX: { duration, times: hopTimes },
          scaleY: { duration, times: hopTimes },
          opacity: { duration, times: hopTimes },
        }}
        onAnimationComplete={onDone}
        style={{
          position: "absolute",
          left: 0,
          top: "50%",
          width: size,
          height: size,
          marginTop: -size / 2,
          color: PALETTE[0],
          filter: "drop-shadow(0 6px 12px rgba(75, 107, 82, 0.35))",
          zIndex: 1,
        }}
      >
        <FaFrog aria-hidden style={{ width: "100%", height: "100%" }} />
      </motion.div>
    </>
  );
}

// Reduced motion: a single soft ring instead of a full animation (Principle IV).
function SoftRing({ item, onDone }: { item: Celebration; onDone: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0.5, scale: 0.3 }}
      animate={{ opacity: 0, scale: 1.7 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      onAnimationComplete={onDone}
      style={{
        position: "absolute",
        left: item.x,
        top: item.y,
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
