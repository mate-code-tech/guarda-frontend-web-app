"use client";

import { useState, useRef, useCallback } from "react";

type TTSStatus = "idle" | "loading" | "playing" | "error";

/** Fallback: use browser's native speechSynthesis (works on iOS without gesture) */
function speakNative(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window)) {
      resolve();
      return;
    }
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-AR";
    utterance.rate = 1.05;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve(); // Don't block on error
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

      try {
        // Try ElevenLabs first
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

        // Try to play the audio
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
        // ElevenLabs or audio.play() failed → fallback to native TTS
        console.warn("ElevenLabs TTS failed, using native speechSynthesis");
        setStatus("playing");
        await speakNative(text);
        setStatus("idle");
      }
    },
    [stop]
  );

  return { speak, stop, status };
}
