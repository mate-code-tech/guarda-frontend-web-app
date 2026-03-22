"use client";

import { motion } from "framer-motion";
import { Orb } from "./Orb";
import { AnimatedMessage } from "./AnimatedMessage";

interface FarewellViewProps {
  assistantMessage: string;
  onRestart: () => void;
}

export function FarewellView({ assistantMessage, onRestart }: FarewellViewProps) {
  return (
    <motion.div
      className="flex flex-1 flex-col items-center justify-center gap-8 px-6 pb-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Orb size="large" state="idle" />

      <div className="flex w-full flex-col items-center gap-4">
        <AnimatedMessage
          text={assistantMessage || "¡Hasta la próxima! Cuidate."}
          className="text-center text-[15px] text-gray-500"
        />

        <motion.button
          onClick={onRestart}
          className="mt-4 rounded-full bg-purple-500 px-8 py-3 text-sm font-semibold text-white shadow-lg transition-transform active:scale-95"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Nueva consulta
        </motion.button>
      </div>
    </motion.div>
  );
}
