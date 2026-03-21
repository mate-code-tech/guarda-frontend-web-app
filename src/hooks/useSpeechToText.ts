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

  // Keep callback refs fresh
  onResultRef.current = onResult;
  onErrorRef.current = onError;

  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const start = useCallback(() => {
    if (!isSupported) {
      onErrorRef.current?.("Speech Recognition no está soportado en este navegador");
      return;
    }

    // Clean up any existing instance
    if (recognitionRef.current) {
      recognitionRef.current.abort();
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
      // "no-speech" and "aborted" are not real errors
      if (event.error === "no-speech" || event.error === "aborted") return;
      onErrorRef.current?.(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported, lang, continuous, interimResults]);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, []);

  return { isListening, transcript, isSupported, start, stop };
}
