"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export type OrbState = "idle" | "listening" | "thinking" | "speaking";

interface OrbProps {
  size?: "large" | "small";
  state?: OrbState;
}

const PULSE_VARIANTS: Record<
  OrbState,
  { scale: number[]; opacity: number[]; transition: object }
> = {
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

const STATE_SPEED: Record<OrbState, number> = {
  idle: 2.2,
  listening: 3.2,
  thinking: 4.0,
  speaking: 3.5,
};

function OrbCanvas({
  diameter,
  state,
}: {
  diameter: number;
  state: OrbState;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = diameter;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let time = 0;
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2;

    // Nebula layers — bright luminous purples, lavenders, pinks, and white mist
    const nebulae = [
      // [r, g, b, orbit speed, orbit radius, blob size, phase offset]
      { color: [220, 200, 255], speed: 0.50, orbit: 0.45, blobSize: 0.75, phase: 0 },     // white-lavender mist
      { color: [196, 181, 253], speed: 0.38, orbit: 0.40, blobSize: 0.80, phase: 1.2 },    // lavender
      { color: [167, 139, 250], speed: 0.60, orbit: 0.42, blobSize: 0.65, phase: 2.5 },    // light purple
      { color: [192, 132, 252], speed: 0.45, orbit: 0.38, blobSize: 0.70, phase: 3.8 },    // orchid
      { color: [139, 92, 246],  speed: 0.55, orbit: 0.44, blobSize: 0.60, phase: 5.0 },    // purple
      { color: [216, 180, 254], speed: 0.35, orbit: 0.35, blobSize: 0.85, phase: 0.7 },    // soft lilac
      { color: [232, 210, 255], speed: 0.65, orbit: 0.40, blobSize: 0.55, phase: 4.1 },    // bright lavender
      { color: [245, 235, 255], speed: 0.42, orbit: 0.30, blobSize: 0.90, phase: 1.9 },    // near-white glow
    ];

    const draw = () => {
      const speed = STATE_SPEED[stateRef.current];
      time += 0.006 * speed;

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();

      // Luminous medium-purple base instead of dark
      ctx.fillStyle = "#A78BFA";
      ctx.fillRect(0, 0, size, size);

      // Layer many large overlapping nebula blobs
      for (let i = 0; i < nebulae.length; i++) {
        const n = nebulae[i];
        const [cr, cg, cb] = n.color;

        // Lissajous-like orbit for smooth, never-repeating paths
        const a1 = time * n.speed + n.phase;
        const a2 = time * n.speed * 0.7 + n.phase * 1.3;
        const bx = cx + Math.sin(a1) * r * n.orbit + Math.sin(a2 * 1.3) * r * 0.1;
        const by = cy + Math.cos(a2) * r * n.orbit + Math.cos(a1 * 0.8) * r * 0.1;

        // Breathing blob radius
        const blobR = r * n.blobSize * (1 + Math.sin(time * 0.6 + n.phase) * 0.1);

        // High opacity for luminous feel
        const alpha = 0.6 + Math.sin(time * 0.9 + n.phase * 0.7) * 0.15;

        const grad = ctx.createRadialGradient(bx, by, 0, bx, by, blobR);
        grad.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, ${alpha})`);
        grad.addColorStop(0.3, `rgba(${cr}, ${cg}, ${cb}, ${alpha * 0.65})`);
        grad.addColorStop(0.6, `rgba(${cr}, ${cg}, ${cb}, ${alpha * 0.25})`);
        grad.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);
      }

      // Central bright core glow — wandering slowly
      const coreX = cx + Math.sin(time * 0.3) * r * 0.08;
      const coreY = cy + Math.cos(time * 0.2) * r * 0.06;
      const coreR = r * 0.5;
      const coreGrad = ctx.createRadialGradient(coreX, coreY, 0, coreX, coreY, coreR);
      coreGrad.addColorStop(0, "rgba(255, 255, 255, 0.35)");
      coreGrad.addColorStop(0.2, "rgba(237, 225, 255, 0.25)");
      coreGrad.addColorStop(0.5, "rgba(196, 181, 253, 0.1)");
      coreGrad.addColorStop(1, "rgba(167, 139, 250, 0)");
      ctx.fillStyle = coreGrad;
      ctx.fillRect(0, 0, size, size);

      // Subtle swirling wisps — two rotating elongated glows
      for (let w = 0; w < 2; w++) {
        const wAngle = time * (0.4 + w * 0.15) + w * Math.PI;
        const wx = cx + Math.cos(wAngle) * r * 0.3;
        const wy = cy + Math.sin(wAngle) * r * 0.25;
        const wRadius = r * 0.45;
        const wAlpha = 0.2 + Math.sin(time * 1.1 + w * 2) * 0.08;

        const wGrad = ctx.createRadialGradient(wx, wy, 0, wx, wy, wRadius);
        wGrad.addColorStop(0, `rgba(255, 255, 255, ${wAlpha})`);
        wGrad.addColorStop(0.4, `rgba(221, 214, 254, ${wAlpha * 0.4})`);
        wGrad.addColorStop(1, `rgba(192, 132, 252, 0)`);
        ctx.fillStyle = wGrad;
        ctx.fillRect(0, 0, size, size);
      }

      ctx.restore();

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [diameter]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute rounded-full"
      style={{
        top: diameter === 140 ? 30 : 15,
        left: diameter === 140 ? 30 : 15,
      }}
    />
  );
}

export function Orb({ size = "large", state = "idle" }: OrbProps) {
  const isLarge = size === "large";
  const container = isLarge ? "w-[200px] h-[200px]" : "w-[100px] h-[100px]";
  const coreDiameter = isLarge ? 140 : 70;
  const highlight = isLarge
    ? "w-[60px] h-[60px] top-[42px] left-[58px]"
    : "w-[36px] h-[36px] top-[20px] left-[27px]";
  const glowBlur = isLarge ? "blur-[40px]" : "blur-[24px]";

  return (
    <div className={`relative shrink-0 ${container}`}>
      {/* Glow */}
      <motion.div
        className={`absolute inset-0 rounded-full bg-purple-400 ${glowBlur}`}
        animate={PULSE_VARIANTS[state]}
      />
      {/* Core — animated nebula canvas */}
      <OrbCanvas diameter={coreDiameter} state={state} />
      {/* Highlight reflection */}
      <div
        className={`absolute rounded-full ${highlight}`}
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)",
        }}
      />
    </div>
  );
}
