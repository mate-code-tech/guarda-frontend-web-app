"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Orb, OrbState } from "./Orb";
import { ThinkingDots } from "./ThinkingDots";
import { AnimatedMessage } from "./AnimatedMessage";

interface GreetingViewProps {
  orbState: OrbState;
  assistantMessage: string;
  transcript: string;
  showTextInput?: boolean;
  textInput?: string;
  onTextInputChange?: (value: string) => void;
  onTextInputSubmit?: () => void;
}

export function GreetingView({
  orbState,
  assistantMessage,
  transcript,
  showTextInput = false,
  textInput = "",
  onTextInputChange,
  onTextInputSubmit,
}: GreetingViewProps) {
  const isThinking = orbState === "thinking";

  return (
    <motion.div
      className="flex flex-1 flex-col items-center justify-center gap-8 px-6 pb-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Orb size="large" state={orbState} />

      <div className="flex w-full flex-col items-center gap-2">
        <AnimatePresence mode="wait">
          {isThinking && !assistantMessage ? (
            <motion.div
              key="thinking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <ThinkingDots />
            </motion.div>
          ) : assistantMessage ? (
            <AnimatedMessage
              key="assistant"
              text={assistantMessage}
              className="text-center text-[15px] text-gray-500"
            />
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {transcript && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="mt-2 text-center text-sm font-medium text-purple-600"
            >
              {transcript}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Text input fallback when STT is not available */}
      {showTextInput && orbState === "listening" && (
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex w-full gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            onTextInputSubmit?.();
          }}
        >
          <input
            type="text"
            value={textInput}
            onChange={(e) => onTextInputChange?.(e.target.value)}
            placeholder="Escribí tu respuesta..."
            autoFocus
            className="flex-1 rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
          />
          <button
            type="submit"
            disabled={!textInput.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-500 text-white disabled:opacity-40"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </motion.form>
      )}
    </motion.div>
  );
}
