"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseSpeechToTextOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
}

interface UseSpeechToTextReturn {
  isListening: boolean;
  transcript: string;
  isSupported: boolean;
  start: () => void;
  stop: () => void;
  requestPermission: () => Promise<boolean>;
}

export function useSpeechToText(
  options: UseSpeechToTextOptions = {}
): UseSpeechToTextReturn {
  const {
    lang = "es-AR",
    continuous = true,
    interimResults = true,
    onResult,
    onError,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);
  const shouldBeListeningRef = useRef(false);
  const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep callback refs fresh
  onResultRef.current = onResult;
  onErrorRef.current = onError;

  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  // Pre-request microphone permission (call early, e.g. on user tap)
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop tracks immediately — we just needed the permission
      stream.getTracks().forEach((t) => t.stop());
      return true;
    } catch {
      onErrorRef.current?.("Permiso de micrófono denegado");
      return false;
    }
  }, []);

  const stop = useCallback(() => {
    shouldBeListeningRef.current = false;
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const start = useCallback(() => {
    if (!isSupported) {
      onErrorRef.current?.("Speech Recognition no está soportado en este navegador");
      return;
    }

    // Signal that we want to be listening
    shouldBeListeningRef.current = true;

    // Clean up any existing instance
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        finalTranscript += event.results[i][0].transcript;
      }
      setTranscript(finalTranscript);

      // Only call onResult with final results
      const lastResult = event.results[event.results.length - 1];
      if (lastResult.isFinal) {
        onResultRef.current?.(finalTranscript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // "no-speech" and "aborted" are expected — not real errors
      if (event.error === "no-speech" || event.error === "aborted") return;

      if (event.error === "not-allowed") {
        // Permission denied — stop trying
        shouldBeListeningRef.current = false;
        onErrorRef.current?.("not-allowed");
        setIsListening(false);
        return;
      }

      onErrorRef.current?.(event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
      // On mobile, recognition ends after each utterance even in continuous mode.
      // Auto-restart if we should still be listening.
      if (shouldBeListeningRef.current) {
        restartTimeoutRef.current = setTimeout(() => {
          if (shouldBeListeningRef.current) {
            start();
          }
        }, 200);
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (err) {
      // start() can throw if called too fast after abort
      console.warn("STT start error, retrying:", err);
      restartTimeoutRef.current = setTimeout(() => {
        if (shouldBeListeningRef.current) {
          start();
        }
      }, 300);
    }
  }, [isSupported, lang, continuous, interimResults]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      shouldBeListeningRef.current = false;
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, []);

  return { isListening, transcript, isSupported, start, stop, requestPermission };
}
