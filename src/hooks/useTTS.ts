"use client";

import { useState, useRef, useCallback, useEffect } from "react";

type TTSStatus = "idle" | "loading" | "playing" | "error";

export function useTTS() {
  const [status, setStatus] = useState<TTSStatus>("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);

  // Create a single Audio element and reuse it.
  // On mobile (especially iOS), creating new Audio() each time can fail
  // after the first play because only one audio context is allowed.
  useEffect(() => {
    audioRef.current = new Audio();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
      }
    };
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
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
            // Clean up previous URL
            if (urlRef.current) {
              URL.revokeObjectURL(urlRef.current);
            }

            const url = URL.createObjectURL(blob);
            urlRef.current = url;

            const audio = audioRef.current!;

            // Remove old listeners to avoid leaks
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

            // Reuse the same element — set src and play
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
    [stop]
  );

  return { speak, stop, status };
}
