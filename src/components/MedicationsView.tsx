"use client";

import { motion } from "framer-motion";
import { Pill, CircleCheck } from "lucide-react";
import { Orb, OrbState } from "./Orb";
import { ThinkingDots } from "./ThinkingDots";
import { AnimatedMessage } from "./AnimatedMessage";
import type { Medication } from "@/lib/api";

interface MedicationsViewProps {
  medications: Medication[];
  orbState: OrbState;
  assistantMessage: string;
}

function MedCard({ name, index }: { name: string; index: number }) {
  return (
    <motion.div
      className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-3"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.35,
        ease: "easeOut",
        delay: index * 0.08,
      }}
    >
      <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] bg-purple-500">
        <Pill className="h-[18px] w-[18px] text-white" />
      </div>
      <span className="min-w-0 flex-1 text-sm font-semibold text-gray-900">
        {name}
      </span>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: index * 0.08 + 0.2, type: "spring", stiffness: 400, damping: 15 }}
      >
        <CircleCheck className="h-5 w-5 shrink-0 text-green-500" />
      </motion.div>
    </motion.div>
  );
}

export function MedicationsView({
  medications,
  orbState,
  assistantMessage,
}: MedicationsViewProps) {
  const isThinking = orbState === "thinking";

  return (
    <motion.div
      className="flex flex-1 flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Top: orb + message */}
      <div className="flex flex-col items-center gap-3 px-6 pb-4 pt-5">
        <Orb size="small" state={orbState} />
        {isThinking ? (
          <ThinkingDots />
        ) : (
          <AnimatedMessage
            text={assistantMessage || "Revisando tus medicamentos..."}
            className="text-center text-[13px] font-medium text-gray-500"
          />
        )}
      </div>

      {/* Panel */}
      <motion.div
        className="flex flex-1 flex-col rounded-t-3xl border border-gray-200 bg-gray-50 p-5"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: "easeOut", delay: 0.1 }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">
            Medicamentos detectados
          </h2>
          <motion.span
            className="text-xs font-semibold text-purple-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {medications.length} encontrados
          </motion.span>
        </div>

        <div className="mt-3.5 flex flex-col gap-2.5">
          {medications.map((med, i) => (
            <MedCard key={med.generic_name} name={med.input_name} index={i} />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
