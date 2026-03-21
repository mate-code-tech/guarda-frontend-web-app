"use client";

import { motion } from "framer-motion";

export type OrbState = "idle" | "listening" | "thinking" | "speaking";

interface OrbProps {
  size?: "large" | "small";
  state?: OrbState;
}

const PULSE_VARIANTS: Record<OrbState, { scale: number[]; opacity: number[]; transition: object }> = {
  idle: {
    scale: [1, 1.03, 1],
    opacity: [0.19, 0.22, 0.19],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
  },
  listening: {
    scale: [1, 1.15, 1],
    opacity: [0.2, 0.35, 0.2],
    transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
  },
  thinking: {
    scale: [1, 1.08, 1],
    opacity: [0.15, 0.3, 0.15],
    transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" },
  },
  speaking: {
    scale: [1, 1.2, 1.05, 1.18, 1],
    opacity: [0.2, 0.4, 0.25, 0.38, 0.2],
    transition: { duration: 1, repeat: Infinity, ease: "easeInOut" },
  },
};

const CORE_COLORS: Record<OrbState, string> = {
  idle: "radial-gradient(circle, #A78BFA 0%, #8B5CF6 50%, #6D28D9 100%)",
  listening: "radial-gradient(circle, #C4B5FD 0%, #8B5CF6 40%, #7C3AED 100%)",
  thinking: "radial-gradient(circle, #A78BFA 0%, #7C3AED 50%, #5B21B6 100%)",
  speaking: "radial-gradient(circle, #DDD6FE 0%, #A78BFA 40%, #7C3AED 100%)",
};

export function Orb({ size = "large", state = "idle" }: OrbProps) {
  const isLarge = size === "large";
  const container = isLarge ? "w-[200px] h-[200px]" : "w-[100px] h-[100px]";
  const core = isLarge
    ? "w-[140px] h-[140px] top-[30px] left-[30px]"
    : "w-[70px] h-[70px] top-[15px] left-[15px]";
  const highlight = isLarge
    ? "w-[60px] h-[60px] top-[42px] left-[58px]"
    : "w-[36px] h-[36px] top-[20px] left-[27px]";
  const glowBlur = isLarge ? "blur-[40px]" : "blur-[24px]";

  return (
    <div className={`relative shrink-0 ${container}`}>
      {/* Glow */}
      <motion.div
        className={`absolute inset-0 rounded-full bg-purple-500 ${glowBlur}`}
        animate={PULSE_VARIANTS[state]}
      />
      {/* Core */}
      <div
        className={`absolute rounded-full ${core}`}
        style={{
          background: CORE_COLORS[state],
          boxShadow: isLarge
            ? "0 0 40px rgba(139, 92, 246, 0.25)"
            : "0 0 24px rgba(139, 92, 246, 0.2)",
        }}
      />
      {/* Highlight */}
      <div
        className={`absolute rounded-full ${highlight}`}
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.33) 0%, rgba(255,255,255,0) 100%)",
        }}
      />
    </div>
  );
}
