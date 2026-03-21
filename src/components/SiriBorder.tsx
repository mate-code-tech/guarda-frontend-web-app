
"use client";

import { useEffect, useRef } from "react";

interface SiriBorderProps {
  active: boolean;
}

export function SiriBorder({ active }: SiriBorderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const opacityRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const OVERFLOW = 60; // extra px beyond the container on each side

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const w = parent.clientWidth + OVERFLOW * 2;
      const h = parent.clientHeight + OVERFLOW * 2;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    let time = 0;
    const R = 40;

    // Point + outward normal along rounded-rect perimeter (coordinates offset by OVERFLOW)
    const getPointAndNormal = (
      t: number,
      cw: number, // container width (without overflow)
      ch: number  // container height (without overflow)
    ): [number, number, number, number] => {
      const w = cw;
      const h = ch;
      const perim = 2 * (w - 2 * R) + 2 * (h - 2 * R) + 2 * Math.PI * R;
      const d = (((t % 1) + 1) % 1) * perim;

      const topLen = w - 2 * R;
      const cornerLen = (Math.PI / 2) * R;
      const rightLen = h - 2 * R;
      const bottomLen = w - 2 * R;
      const leftLen = h - 2 * R;

      let rem = d;
      let px: number, py: number, nx: number, ny: number;

      if (rem < topLen) {
        px = R + rem; py = 0; nx = 0; ny = -1;
      } else {
        rem -= topLen;
        if (rem < cornerLen) {
          const a = -Math.PI / 2 + rem / R;
          px = w - R + Math.cos(a) * R; py = R + Math.sin(a) * R;
          nx = Math.cos(a); ny = Math.sin(a);
        } else {
          rem -= cornerLen;
          if (rem < rightLen) {
            px = w; py = R + rem; nx = 1; ny = 0;
          } else {
            rem -= rightLen;
            if (rem < cornerLen) {
              const a = rem / R;
              px = w - R + Math.cos(a) * R; py = h - R + Math.sin(a) * R;
              nx = Math.cos(a); ny = Math.sin(a);
            } else {
              rem -= cornerLen;
              if (rem < bottomLen) {
                px = w - R - rem; py = h; nx = 0; ny = 1;
              } else {
                rem -= bottomLen;
                if (rem < cornerLen) {
                  const a = Math.PI / 2 + rem / R;
                  px = R + Math.cos(a) * R; py = h - R + Math.sin(a) * R;
                  nx = Math.cos(a); ny = Math.sin(a);
                } else {
                  rem -= cornerLen;
                  if (rem < leftLen) {
                    px = 0; py = h - R - rem; nx = -1; ny = 0;
                  } else {
                    rem -= leftLen;
                    const a = Math.PI + rem / R;
                    px = R + Math.cos(a) * R; py = R + Math.sin(a) * R;
                    nx = Math.cos(a); ny = Math.sin(a);
                  }
                }
              }
            }
          }
        }
      }

      // Offset to canvas coordinates (container is centered with OVERFLOW margin)
      return [px + OVERFLOW, py + OVERFLOW, nx, ny];
    };

    const draw = () => {
      const canvasW = canvas.width / dpr;
      const canvasH = canvas.height / dpr;
      const cw = canvasW - OVERFLOW * 2; // actual container width
      const ch = canvasH - OVERFLOW * 2;

      const target = active ? 1 : 0;
      opacityRef.current += (target - opacityRef.current) * 0.035;

      if (opacityRef.current < 0.001 && !active) {
        ctx.clearRect(0, 0, canvasW, canvasH);
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, canvasW, canvasH);
      time += 0.005;

      const ga = opacityRef.current;
      const steps = 260;

      for (let i = 0; i < steps; i++) {
        const t = i / steps;
        const [px, py, nx, ny] = getPointAndNormal(t, cw, ch);

        // Soft overlapping waves for continuous flow
        const wave1 = Math.sin(t * Math.PI * 4 + time * 2.5) * 0.5 + 0.5;
        const wave2 = Math.sin(t * Math.PI * 6 - time * 1.8 + 1.7) * 0.5 + 0.5;
        const wave3 = Math.sin(t * Math.PI * 2 + time * 1.2 + 3.1) * 0.5 + 0.5;
        const intensity = 0.03 + (wave1 * 0.12 + wave2 * 0.10 + wave3 * 0.08);

        // Purple <-> sky-blue color shift
        const colorWave = Math.sin(t * Math.PI * 3 + time * 1.5) * 0.5 + 0.5;
        const r = Math.round(139 + (110 - 139) * colorWave);
        const g = Math.round(92 + (185 - 92) * colorWave);
        const b = Math.round(246 + (252 - 246) * colorWave);

        const alpha = intensity * ga;
        const spread = 45 + wave1 * 15;

        const grad = ctx.createRadialGradient(px, py, 0, px, py, spread);
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
        grad.addColorStop(0.25, `rgba(${r}, ${g}, ${b}, ${alpha * 0.45})`);
        grad.addColorStop(0.55, `rgba(${r}, ${g}, ${b}, ${alpha * 0.12})`);
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        ctx.fillStyle = grad;
        ctx.fillRect(px - spread, py - spread, spread * 2, spread * 2);
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute z-50"
      style={{
        top: -60,
        left: -60,
        right: -60,
        bottom: -60,
      }}
    />
  );
}
