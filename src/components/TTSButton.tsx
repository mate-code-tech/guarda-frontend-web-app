"use client";

import { Volume2, Loader2, Square } from "lucide-react";
import { useTTS } from "@/hooks/useTTS";

interface TTSButtonProps {
  text: string;
  className?: string;
}

export function TTSButton({ text, className = "" }: TTSButtonProps) {
  const { speak, stop, status } = useTTS();

  const handleClick = () => {
    if (status === "playing") {
      stop();
    } else {
      speak(text);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={status === "loading"}
      className={`flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1.5 text-xs font-medium text-purple-600 transition-colors hover:bg-purple-200 disabled:opacity-50 ${className}`}
    >
      {status === "loading" && (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      )}
      {status === "playing" && <Square className="h-3 w-3" />}
      {(status === "idle" || status === "error") && (
        <Volume2 className="h-3.5 w-3.5" />
      )}
      {status === "playing" ? "Detener" : status === "loading" ? "Cargando..." : "Escuchar"}
    </button>
  );
}
