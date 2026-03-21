"use client";

import { useState, useRef, useCallback } from "react";

type TTSStatus = "idle" | "loading" | "playing" | "error";

// Tiny silent WAV to "unlock" the Audio element on iOS with a user gesture.
const SILENCE =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";

export function useTTS() {
  const [status, setStatus] = useState<TTSStatus>("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);
  const unlockedRef = useRef(false);

  // Get or create the shared Audio element.
  // Must be reused — iOS kills playback if you create new Audio() after the first gesture.
  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    return audioRef.current;
  }, []);

  // Call this once from a user gesture (tap) to unlock audio playback on iOS.
  const unlock = useCallback(() => {
    if (unlockedRef.current) return;
    const audio = getAudio();
    audio.src = SILENCE;
    audio.play().then(() => {
      unlockedRef.current = true;
    }).catch(() => {
      // Ignore — will retry on next gesture
    });
  }, [getAudio]);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      // Do NOT set src="" — that destroys the unlocked state on iOS.
      // Just reset currentTime so it's ready for next play.
      audio.currentTime = 0;
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    setStatus("idle");
  }, []);

  /** Speaks the text and resolves when audio finishes playing */
  const speak = useCallback(
    (text: string): Promise<void> => {
      stop();
      setStatus("loading");

      return new Promise((resolve, reject) => {
        fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        })
          .then((res) => {
            if (!res.ok) throw new Error(`TTS request failed: ${res.status}`);
            return res.blob();
          })
          .then((blob) => {
            if (urlRef.current) {
              URL.revokeObjectURL(urlRef.current);
            }

            const url = URL.createObjectURL(blob);
            urlRef.current = url;

            const audio = getAudio();

            const onEnded = () => {
              audio.removeEventListener("ended", onEnded);
              audio.removeEventListener("error", onError);
              setStatus("idle");
              resolve();
            };

            const onError = () => {
              audio.removeEventListener("ended", onEnded);
              audio.removeEventListener("error", onError);
              setStatus("error");
              reject(new Error("Audio playback error"));
            };

            audio.addEventListener("ended", onEnded);
            audio.addEventListener("error", onError);

            audio.src = url;
            setStatus("playing");
            audio.play().catch((err) => {
              audio.removeEventListener("ended", onEnded);
              audio.removeEventListener("error", onError);
              setStatus("error");
              reject(err);
            });
          })
          .catch((err) => {
            setStatus("error");
            reject(err);
          });
      });
    },
    [stop, getAudio]
  );

  return { speak, stop, unlock, status };
}
