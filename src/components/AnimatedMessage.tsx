"use client";

import { AnimatePresence, motion } from "framer-motion";

interface AnimatedMessageProps {
  text: string;
  className?: string;
}

export function AnimatedMessage({ text, className = "" }: AnimatedMessageProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={text}
        className={className}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        {text}
      </motion.p>
    </AnimatePresence>
  );
}
