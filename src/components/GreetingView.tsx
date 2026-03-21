"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Orb, OrbState } from "./Orb";
import { ThinkingDots } from "./ThinkingDots";
import { AnimatedMessage } from "./AnimatedMessage";

interface GreetingViewProps {
  orbState: OrbState;
  assistantMessage: string;
  transcript: string;
}

export function GreetingView({
  orbState,
  assistantMessage,
  transcript,
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
    </motion.div>
  );
}
