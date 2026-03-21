"use client";

import { useState, useRef, useCallback } from "react";

type TTSStatus = "idle" | "loading" | "playing" | "error";

function isMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

/** Fallback: use browser's native speechSynthesis (works on iOS without gesture) */
function speakNative(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window)) {
      resolve();
      return;
    }
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-AR";
    utterance.rate = 1.05;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

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
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setStatus("idle");
  }, []);

  const speak = useCallback(
    async (text: string): Promise<void> => {
      stop();
      setStatus("loading");

      // On mobile, use native speechSynthesis directly (no iOS audio restrictions)
      if (isMobile()) {
        setStatus("playing");
        await speakNative(text);
        setStatus("idle");
        return;
      }

      // Desktop: use ElevenLabs
      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });

        if (!res.ok) throw new Error(`TTS ${res.status}`);

        const blob = await res.blob();
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);

        const url = URL.createObjectURL(blob);
        urlRef.current = url;

        await new Promise<void>((resolve, reject) => {
          const audio = new Audio(url);
          audioRef.current = audio;

          audio.onended = () => {
            setStatus("idle");
            resolve();
          };
          audio.onerror = () => reject(new Error("playback failed"));

          setStatus("playing");
          audio.play().catch(reject);
        });
      } catch {
        // Desktop fallback if ElevenLabs fails
        setStatus("playing");
        await speakNative(text);
        setStatus("idle");
      }
    },
    [stop]
  );

  return { speak, stop, status };
}
