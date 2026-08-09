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

/** Logo frog hops the full viewport width across vertical center. */
function FrogHop({ onDone }: { onDone: () => void }) {
  const size = 72;
  return (
    <motion.div
      initial={{ x: -size, y: 0, opacity: 0, rotate: -8 }}
      animate={{
        x: `calc(100vw + ${size}px)`,
        // A few soft hops — organic, not a bounce house.
        y: [0, -36, 0, -28, 0, -18, 0],
        opacity: [0, 1, 1, 1, 1, 1, 0],
        rotate: [-8, 6, -4, 5, -2, 3, 0],
      }}
      transition={{
        duration: 1.7,
        ease: "easeInOut",
        y: { duration: 1.7, times: [0, 0.18, 0.36, 0.52, 0.68, 0.84, 1] },
        opacity: { duration: 1.7, times: [0, 0.08, 0.2, 0.5, 0.8, 0.92, 1] },
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
        filter: "drop-shadow(0 4px 10px rgba(75, 107, 82, 0.28))",
      }}
    >
      <FaFrog aria-hidden style={{ width: "100%", height: "100%" }} />
    </motion.div>
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
