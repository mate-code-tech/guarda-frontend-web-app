"use client";

import { useState, useRef, useCallback } from "react";

type TTSStatus = "idle" | "loading" | "playing" | "error";

export function useTTS() {
  const [status, setStatus] = useState<TTSStatus>("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    setStatus("idle");
  }, []);

  const speak = useCallback(
    async (text: string) => {
      stop();
      setStatus("loading");

      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });

        if (!res.ok) {
          throw new Error(`TTS request failed: ${res.status}`);
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        urlRef.current = url;

        const audio = new Audio(url);
        audioRef.current = audio;

        audio.addEventListener("ended", () => {
          setStatus("idle");
          URL.revokeObjectURL(url);
          urlRef.current = null;
        });

        audio.addEventListener("error", () => {
          setStatus("error");
        });

        setStatus("playing");
        await audio.play();
      } catch {
        setStatus("error");
      }
    },
    [stop]
  );

  return { speak, stop, status };
}
