"use client";

import { useEffect, useState, useCallback } from "react";
import { Orb } from "./Orb";
import { useSpeechToText } from "@/hooks/useSpeechToText";

const GUEST_ID_KEY = "guarda_guest_id";

interface GreetingViewProps {
  onSpeechResult?: (transcript: string) => void;
}

export function GreetingView({ onSpeechResult }: GreetingViewProps) {
  const [guestReady, setGuestReady] = useState(false);

  const handleResult = useCallback(
    (transcript: string) => {
      console.log("STT resultado final:", transcript);
      onSpeechResult?.(transcript);
    },
    [onSpeechResult]
  );

  const { isListening, transcript, isSupported, start, stop } =
    useSpeechToText({
      lang: "es-AR",
      continuous: true,
      onResult: handleResult,
      onError: (err) => console.warn("STT error:", err),
    });

  // Wait for guest_id to exist before starting STT
  useEffect(() => {
    const id = localStorage.getItem(GUEST_ID_KEY);
    if (id) {
      setGuestReady(true);
    } else {
      // Poll briefly in case initGuest is still running
      const interval = setInterval(() => {
        if (localStorage.getItem(GUEST_ID_KEY)) {
          setGuestReady(true);
          clearInterval(interval);
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, []);

  // Auto-start STT when guest is ready
  useEffect(() => {
    if (guestReady && isSupported) {
      start();
    }
    return () => {
      stop();
    };
  }, [guestReady, isSupported, start, stop]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 pb-10">
      <Orb size="large" />
      <div className="flex w-full flex-col items-center gap-2">
        <h1 className="text-center text-2xl font-bold text-gray-900">
          Hola, Gastón
        </h1>
        <p className="text-center text-[15px] text-gray-500">
          {transcript ||
            "Contame qué medicamentos tomás y te ayudo a verificar si son compatibles."}
        </p>
      </div>
      {isSupported && (
        <button
          onClick={isListening ? stop : start}
          className={`rounded-full px-6 py-2 text-sm font-medium transition-colors ${
            isListening
              ? "bg-red-500 text-white"
              : "bg-purple-500 text-white"
          }`}
        >
          {isListening ? "Dejar de escuchar" : "Hablar"}
        </button>
      )}
    </div>
  );
}
