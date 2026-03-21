"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { GreetingView } from "@/components/GreetingView";
import { MedicationsView } from "@/components/MedicationsView";
import { ResultsView } from "@/components/ResultsView";
import {
  createGuest,
  sendMessage,
  checkInteractions,
  type Medication,
  type InteractionResult,
  type ChatMessageResponse,
} from "@/lib/api";
import { useTTS } from "@/hooks/useTTS";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import type { OrbState } from "@/components/Orb";

const GUEST_ID_KEY = "guarda_guest_id";
const DEBOUNCE_MS = 2000;

type AppView = "greeting" | "medications" | "results";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [started, setStarted] = useState(false);
  const [view, setView] = useState<AppView>("greeting");
  const [orbState, setOrbState] = useState<OrbState>("idle");
  const [assistantMessage, setAssistantMessage] = useState("");
  const [userTranscript, setUserTranscript] = useState("");
  const [medications, setMedications] = useState<Medication[]>([]);
  const [interactions, setInteractions] = useState<InteractionResult[]>([]);

  const conversationIdRef = useRef<string | null>(null);
  const medicationsRef = useRef<Medication[]>([]);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isProcessingRef = useRef(false);
  const initDoneRef = useRef(false);

  const { speak, stop: stopTTS } = useTTS();

  // --- Handle backend response: TTS + tool-calls ---
  const handleResponse = useCallback(
    async (response: ChatMessageResponse) => {
      // Immediately stop listening and cancel any pending debounce
      sttStop();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      setUserTranscript("");

      conversationIdRef.current = response.conversation_id;

      // Check for normalize_medications tool-call
      const normalizeTc = response.tool_calls.find(
        (tc) => tc.name === "normalize_medications"
      );
      if (normalizeTc?.data) {
        const meds = (normalizeTc.data as { medications: Medication[] })
          .medications;
        medicationsRef.current = meds;
        setMedications(meds);
        setView("medications");
      }

      // Check for check_interactions tool-call
      const checkTc = response.tool_calls.find(
        (tc) => tc.name === "check_interactions"
      );

      if (checkTc) {
        // Call the interactions endpoint with normalized medications
        const genericNames = medicationsRef.current.map(
          (m) => m.generic_name
        );

        // If check_interactions has data.results, use it directly
        if (checkTc.data && (checkTc.data as { results?: unknown }).results) {
          const results = (checkTc.data as { results: InteractionResult[] })
            .results;
          setInteractions(results);
          setView("results");
        } else {
          // Otherwise call the endpoint
          setOrbState("thinking");
          const interactionsResponse = await checkInteractions({
            conversation_id: response.conversation_id,
            medications: genericNames,
          });
          setInteractions(interactionsResponse.results);
          setView("results");
        }

        // TTS the message then stop the cycle (results are the end state)
        if (response.message) {
          setAssistantMessage(response.message);
          setOrbState("speaking");
          try {
            await speak(response.message);
          } catch {
            // TTS failed, continue anyway
          }
        }
        setOrbState("idle");
        isProcessingRef.current = false;
        return;
      }

      // No check_interactions: TTS the message, then start listening
      if (response.message) {
        setAssistantMessage(response.message);
        setOrbState("speaking");
        try {
          await speak(response.message);
        } catch {
          // TTS failed, continue to listening
        }
      }

      // TTS done → start listening
      setUserTranscript("");
      setOrbState("listening");
      sttStart();
      isProcessingRef.current = false;
    },
    [speak]
  );

  // --- Send user message to backend ---
  const sendUserMessage = useCallback(
    async (text: string) => {
      if (isProcessingRef.current || !text.trim()) return;
      isProcessingRef.current = true;

      sttStop();
      setOrbState("thinking");
      setUserTranscript("");

      try {
        const response = await sendMessage({
          conversation_id: conversationIdRef.current,
          message: text,
        });
        await handleResponse(response);
      } catch (err) {
        console.error("sendMessage error:", err);
        setOrbState("idle");
        isProcessingRef.current = false;
      }
    },
    [handleResponse]
  );

  // --- STT with 2s debounce ---
  const handleSTTResult = useCallback(
    (transcript: string) => {
      setUserTranscript(transcript);

      // Clear previous debounce
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // After 2s of silence, send the transcript
      debounceTimerRef.current = setTimeout(() => {
        sendUserMessage(transcript);
      }, DEBOUNCE_MS);
    },
    [sendUserMessage]
  );

  const {
    transcript: liveTranscript,
    start: sttStart,
    stop: sttStop,
  } = useSpeechToText({
    lang: "es-AR",
    continuous: true,
    onResult: handleSTTResult,
    onError: (err) => console.warn("STT error:", err),
  });

  // Show live transcript while listening
  useEffect(() => {
    if (liveTranscript) {
      setUserTranscript(liveTranscript);
    }
  }, [liveTranscript]);

  // --- Start flow (triggered by user tap to unlock audio) ---
  const startFlow = useCallback(async () => {
    if (initDoneRef.current) return;
    initDoneRef.current = true;
    setStarted(true);

    let guestId = localStorage.getItem(GUEST_ID_KEY);

    if (!guestId) {
      const guest = await createGuest();
      localStorage.setItem(GUEST_ID_KEY, guest.id);
      guestId = guest.id;
    }

    isProcessingRef.current = true;
    setOrbState("thinking");

    try {
      const response = await sendMessage({
        conversation_id: null,
        message: "Hola",
      });
      await handleResponse(response);
    } catch (err) {
      console.error("Init error:", err);
      setOrbState("idle");
      isProcessingRef.current = false;
    }
  }, [handleResponse]);

  // Hydration-safe mount flag
  useEffect(() => {
    setMounted(true);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      stopTTS();
    };
  }, [stopTTS]);

  // Server and client both render this on first pass (avoids hydration mismatch)
  if (!mounted || !started) {
    return (
      <div className="flex h-dvh w-full max-w-[393px] flex-col overflow-hidden rounded-[40px] bg-white pt-[62px]">
        <button
          onClick={startFlow}
          className="flex flex-1 flex-col items-center justify-center gap-6 px-6"
        >
          <div className="relative h-[200px] w-[200px] shrink-0">
            <div className="absolute inset-0 rounded-full bg-purple-500 opacity-[0.19] blur-[40px]" />
            <div
              className="absolute left-[30px] top-[30px] h-[140px] w-[140px] rounded-full"
              style={{
                background:
                  "radial-gradient(circle, #A78BFA 0%, #8B5CF6 50%, #6D28D9 100%)",
                boxShadow: "0 0 40px rgba(139, 92, 246, 0.25)",
              }}
            />
          </div>
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Guarda</h1>
            <p className="text-center text-[15px] text-gray-500">
              Tocá para comenzar
            </p>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-dvh w-full max-w-[393px] flex-col overflow-hidden rounded-[40px] bg-white pt-[62px]">
      {view === "greeting" && (
        <GreetingView
          orbState={orbState}
          assistantMessage={assistantMessage}
          transcript={userTranscript}
        />
      )}
      {view === "medications" && (
        <MedicationsView
          medications={medications}
          orbState={orbState}
          assistantMessage={assistantMessage}
        />
      )}
      {view === "results" && <ResultsView results={interactions} />}
    </div>
  );
}
