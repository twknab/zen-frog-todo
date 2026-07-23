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
import confettiData from "@/assets/lottie/confetti.json";
import ribbonData from "@/assets/lottie/ribbon.json";

/** Fire a celebratory animation at a viewport coordinate. */
type CelebrationKind = "frog" | "task";
type Celebrate = (x: number, y: number, kind?: CelebrationKind) => void;

const CelebrationContext = createContext<Celebrate>(() => {});

export function useCelebration(): Celebrate {
  return useContext(CelebrationContext);
}

type Celebration = { id: number; x: number; y: number; kind: CelebrationKind };

// A ribbon flourish greets the day's frog (full-screen, see LottieBurst);
// confetti marks the rest, sized here to keep its 940×752 aspect ratio.
const TASK_SIZE = { w: 320, h: 256 };

const PALETTE = ["#6B8F71", "#B98C5B", "#7A93A6", "#C79A4B", "#8FB49A"];
// Safety net: remove a celebration even if Lottie's onComplete never fires
// (e.g. a backgrounded tab pausing rAF). Longer than the longest clip (~3.2s).
const MAX_MS = 4200;

export function CelebrationProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Celebration[]>([]);
  const nextId = useRef(0);
  const reduceMotion = useReducedMotion();

  const remove = useCallback((id: number) => {
    setItems((current) => current.filter((c) => c.id !== id));
  }, []);

  const celebrate = useCallback<Celebrate>(
    (x, y, kind = "task") => {
      const id = nextId.current;
      nextId.current += 1;
      setItems((current) => [...current, { id, x, y, kind }]);
      window.setTimeout(() => remove(id), MAX_MS);
    },
    [remove],
  );

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
            <SoftRing key={item.id} item={item} onDone={() => remove(item.id)} />
          ) : (
            <LottieBurst key={item.id} item={item} onDone={() => remove(item.id)} />
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

  const { w, h } = TASK_SIZE;
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
        animationData={confettiData}
        loop={false}
        autoplay
        onComplete={onDone}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
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
