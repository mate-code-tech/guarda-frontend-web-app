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
            const url = URL.createObjectURL(blob);
            urlRef.current = url;

            const audio = new Audio(url);
            audioRef.current = audio;

            audio.addEventListener("ended", () => {
              setStatus("idle");
              URL.revokeObjectURL(url);
              urlRef.current = null;
              resolve();
            });

            audio.addEventListener("error", () => {
              setStatus("error");
              reject(new Error("Audio playback error"));
            });

            setStatus("playing");
            audio.play().catch(reject);
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
