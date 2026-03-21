"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GreetingView } from "@/components/GreetingView";
import { MedicationsView } from "@/components/MedicationsView";
import { ResultsView } from "@/components/ResultsView";
import {
  createGuest,
  sendMessage,
  checkInteractions,
  type Medication,
  type InteractionResult,
  type ProfileWarning,
  type ChatMessageResponse,
} from "@/lib/api";
import { useTTS } from "@/hooks/useTTS";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import type { OrbState } from "@/components/Orb";
import { SiriBorder } from "@/components/SiriBorder";

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
  const [profileWarnings, setProfileWarnings] = useState<ProfileWarning[]>([]);

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
          const data = checkTc.data as { results: InteractionResult[]; profile_warnings?: ProfileWarning[] };
          setInteractions(data.results);
          setProfileWarnings(data.profile_warnings ?? []);
          setView("results");
        } else {
          // Otherwise call the endpoint
          setOrbState("thinking");
          const interactionsResponse = await checkInteractions({
            conversation_id: response.conversation_id,
            medications: genericNames,
          });
          setInteractions(interactionsResponse.results);
          setProfileWarnings(interactionsResponse.profile_warnings ?? []);
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
    requestPermission,
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

    // Request mic permission immediately on user gesture (before anything else)
    // This ensures the permission dialog appears now, not later when TTS finishes.
    await requestPermission();

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
  }, [handleResponse, requestPermission]);

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
      <div className="flex h-dvh w-full max-w-[393px] flex-col overflow-hidden rounded-[40px] bg-gradient-to-b from-white via-purple-50 to-purple-100 pt-[62px]">
        <div className="flex flex-1 flex-col items-center justify-center gap-10 px-6 pb-16">
          {/* App name */}
          <h1 className="text-3xl font-bold uppercase tracking-widest text-gray-900">
            Guarda
          </h1>

          {/* Orbe — tap to start */}
          <button
            onClick={startFlow}
            className="cursor-pointer transition-transform duration-200 active:scale-95"
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
          </button>

          {/* Instruction */}
          <p className="text-sm text-gray-400">
            Tocá el orbe para comenzar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-dvh w-full max-w-[393px] flex-col">
      <SiriBorder active={orbState === "listening" && userTranscript.length > 0} />
      <div className="relative flex flex-1 flex-col overflow-hidden rounded-[40px] bg-gradient-to-b from-white via-purple-50 to-purple-100 pt-[62px]">
      <div className="flex min-h-0 flex-1 flex-col">
      <AnimatePresence mode="wait">
        {view === "greeting" && (
          <motion.div
            key="greeting"
            className="flex flex-1 flex-col"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <GreetingView
              orbState={orbState}
              assistantMessage={assistantMessage}
              transcript={userTranscript}
            />
          </motion.div>
        )}
        {view === "medications" && (
          <motion.div
            key="medications"
            className="flex flex-1 flex-col"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <MedicationsView
              medications={medications}
              orbState={orbState}
              assistantMessage={assistantMessage}
            />
          </motion.div>
        )}
        {view === "results" && (
          <motion.div
            key="results"
            className="flex min-h-0 flex-1 flex-col"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <ResultsView results={interactions} profileWarnings={profileWarnings} />
          </motion.div>
        )}
      </AnimatePresence>
      </div>
      </div>
    </div>
  );
}
