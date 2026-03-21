"use client";

interface OrbProps {
  size?: "large" | "small";
}

export function Orb({ size = "large" }: OrbProps) {
  const isLarge = size === "large";
  const container = isLarge ? "w-[200px] h-[200px]" : "w-[100px] h-[100px]";
  const core = isLarge
    ? "w-[140px] h-[140px] top-[30px] left-[30px]"
    : "w-[70px] h-[70px] top-[15px] left-[15px]";
  const highlight = isLarge
    ? "w-[60px] h-[60px] top-[42px] left-[58px]"
    : "w-[36px] h-[36px] top-[20px] left-[27px]";
  const glowBlur = isLarge ? "blur-[40px]" : "blur-[24px]";
  const glowOpacity = isLarge ? "opacity-[0.19]" : "opacity-[0.15]";

  return (
    <div className={`relative shrink-0 ${container}`}>
      {/* Glow */}
      <div
        className={`absolute inset-0 rounded-full bg-purple-500 ${glowBlur} ${glowOpacity}`}
      />
      {/* Core */}
      <div
        className={`absolute rounded-full ${core}`}
        style={{
          background:
            "radial-gradient(circle, #A78BFA 0%, #8B5CF6 50%, #6D28D9 100%)",
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
