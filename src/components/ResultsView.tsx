"use client";

import { motion } from "framer-motion";
import { Orb, OrbState } from "./Orb";
import { AnimatedMessage } from "./AnimatedMessage";
import type { InteractionResult, ProfileWarning } from "@/lib/api";

type Severity = InteractionResult["severity"];

interface ResultsViewProps {
  results: InteractionResult[];
  profileWarnings?: ProfileWarning[];
  orbState?: OrbState;
  assistantMessage?: string;
  transcript?: string;
  showTextInput?: boolean;
  textInput?: string;
  onTextInputChange?: (value: string) => void;
  onTextInputSubmit?: () => void;
}

const SEVERITY_CONFIG: Record<
  Severity,
  { bg: string; border: string; dotColor: string; labelColor: string; label: string }
> = {
  severe: {
    bg: "bg-red-50",
    border: "border-red-200",
    dotColor: "bg-red-500",
    labelColor: "text-red-600",
    label: "Peligroso",
  },
  moderate: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    dotColor: "bg-amber-400",
    labelColor: "text-amber-600",
    label: "Precaución",
  },
  mild: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    dotColor: "bg-yellow-400",
    labelColor: "text-yellow-600",
    label: "Leve",
  },
  none: {
    bg: "bg-green-50",
    border: "border-green-200",
    dotColor: "bg-green-500",
    labelColor: "text-green-600",
    label: "Sin riesgo conocido",
  },
};

const WARNING_TYPE_LABELS: Record<string, string> = {
  age: "Edad",
  condition: "Condición médica",
  allergy: "Alergia",
};

function ResultCard({ result, index }: { result: InteractionResult; index: number }) {
  const config = SEVERITY_CONFIG[result.severity];

  return (
    <motion.div
      className={`flex w-full flex-col gap-2 rounded-xl border p-4 ${config.bg} ${config.border}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: "easeOut",
        delay: index * 0.1,
      }}
    >
      <div className="flex items-center gap-1.5">
        <motion.div
          className={`h-3 w-3 rounded-full ${config.dotColor}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.1 + 0.2, type: "spring", stiffness: 400, damping: 15 }}
        />
        <span className={`text-xs font-semibold ${config.labelColor}`}>
          {config.label}
        </span>
      </div>
      <h3 className="text-base font-bold text-gray-900">
        {result.input_name_a || result.drug_a} + {result.input_name_b || result.drug_b}
      </h3>
      <p className="text-[13px] leading-[1.4] text-gray-600">
        {result.description}
      </p>
      {result.recommendation && (
        <p className="text-[12px] font-medium text-gray-500">
          {result.recommendation}
        </p>
      )}
    </motion.div>
  );
}

function ProfileWarningCard({ warning, index, offset }: { warning: ProfileWarning; index: number; offset: number }) {
  const config = SEVERITY_CONFIG[warning.severity as Severity] ?? SEVERITY_CONFIG.moderate;
  const typeLabel = WARNING_TYPE_LABELS[warning.type] ?? warning.type;

  return (
    <motion.div
      className={`flex w-full flex-col gap-2 rounded-xl border p-4 ${config.bg} ${config.border}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: "easeOut",
        delay: (index + offset) * 0.1,
      }}
    >
      <div className="flex items-center gap-1.5">
        <motion.div
          className={`h-3 w-3 rounded-full ${config.dotColor}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: (index + offset) * 0.1 + 0.2, type: "spring", stiffness: 400, damping: 15 }}
        />
        <span className={`text-xs font-semibold ${config.labelColor}`}>
          {typeLabel}
        </span>
      </div>
      <h3 className="text-base font-bold text-gray-900">
        {warning.drug}
      </h3>
      <p className="text-[13px] leading-[1.4] text-gray-600">
        {warning.description}
      </p>
      {warning.recommendation && (
        <p className="text-[12px] font-medium text-gray-500">
          {warning.recommendation}
        </p>
      )}
    </motion.div>
  );
}

export function ResultsView({
  results,
  profileWarnings = [],
  orbState = "idle",
  assistantMessage,
  transcript,
  showTextInput = false,
  textInput = "",
  onTextInputChange,
  onTextInputSubmit,
}: ResultsViewProps) {
  return (
    <motion.div
      className="flex min-h-0 flex-1 flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Top: orb + status */}
      <div className="shrink-0 flex flex-col items-center gap-3 px-6 pb-4 pt-5">
        <Orb size="small" state={orbState} />
        {assistantMessage ? (
          <AnimatedMessage
            text={assistantMessage}
            className="text-center text-[13px] font-medium text-gray-500"
          />
        ) : (
          <motion.p
            className="text-center text-[13px] font-semibold text-green-500"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
          >
            Análisis completo
          </motion.p>
        )}
        {transcript && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-sm font-medium text-purple-600"
          >
            {transcript}
          </motion.p>
        )}
      </div>

      {/* Panel */}
      <motion.div
        className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain rounded-t-3xl border border-gray-200 bg-gray-50 p-5 pb-10"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: "easeOut", delay: 0.1 }}
      >
        {/* Profile warnings */}
        {profileWarnings.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">Alertas personales</h2>
            </div>
            <div className="mt-3 flex flex-col gap-3">
              {profileWarnings.map((warning, i) => (
                <ProfileWarningCard
                  key={`pw-${warning.drug}-${warning.type}-${i}`}
                  warning={warning}
                  index={i}
                  offset={0}
                />
              ))}
            </div>
            <div className="my-4 border-t border-gray-200" />
          </>
        )}

        {/* Drug interactions */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Interacciones</h2>
        </div>

        <div className="mt-3 flex flex-col gap-3">
          {results.map((result, i) => (
            <ResultCard
              key={`${result.drug_a}-${result.drug_b}`}
              result={result}
              index={i + profileWarnings.length}
            />
          ))}
        </div>

        <motion.p
          className="mt-4 text-center text-[11px] leading-snug text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: (results.length + profileWarnings.length) * 0.1 + 0.3 }}
        >
          Esta información es orientativa y no reemplaza el consejo médico.
          Consultá siempre a tu médico de confianza.
        </motion.p>

        {/* Text input fallback */}
        {showTextInput && orbState === "listening" && (
          <motion.form
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 flex w-full gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              onTextInputSubmit?.();
            }}
          >
            <input
              type="text"
              value={textInput}
              onChange={(e) => onTextInputChange?.(e.target.value)}
              placeholder="¿Tenés otra consulta?"
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
    </motion.div>
  );
}
