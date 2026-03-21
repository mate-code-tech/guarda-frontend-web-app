"use client";

import { Orb } from "./Orb";
import type { InteractionResult } from "@/lib/api";

type Severity = InteractionResult["severity"];

interface ResultsViewProps {
  results: InteractionResult[];
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

function ResultCard({ result }: { result: InteractionResult }) {
  const config = SEVERITY_CONFIG[result.severity];

  return (
    <div
      className={`flex w-full flex-col gap-2 rounded-xl border p-4 ${config.bg} ${config.border}`}
    >
      <div className="flex items-center gap-1.5">
        <div className={`h-3 w-3 rounded-full ${config.dotColor}`} />
        <span className={`text-xs font-semibold ${config.labelColor}`}>
          {config.label}
        </span>
      </div>
      <h3 className="text-base font-bold text-gray-900">
        {result.drug_a} + {result.drug_b}
      </h3>
      <p className="text-[13px] leading-[1.4] text-gray-600">
        {result.description}
      </p>
      {result.recommendation && (
        <p className="text-[12px] font-medium text-gray-500">
          {result.recommendation}
        </p>
      )}
    </div>
  );
}

export function ResultsView({ results }: ResultsViewProps) {
  return (
    <div className="flex flex-1 flex-col">
      {/* Top: orb + status */}
      <div className="flex flex-col items-center gap-3 px-6 pb-4 pt-5">
        <Orb size="small" state="idle" />
        <p className="text-center text-[13px] font-semibold text-green-500">
          Análisis completo
        </p>
      </div>

      {/* Panel */}
      <div className="flex flex-1 flex-col rounded-t-3xl border border-gray-200 bg-gray-50 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Interacciones</h2>
        </div>

        <div className="mt-3 flex flex-col gap-3">
          {results.map((result) => (
            <ResultCard
              key={`${result.drug_a}-${result.drug_b}`}
              result={result}
            />
          ))}
        </div>

        <p className="mt-4 text-center text-[11px] leading-snug text-gray-400">
          Esta información es orientativa y no reemplaza el consejo médico.
          Consultá siempre a tu médico de confianza.
        </p>
      </div>
    </div>
  );
}
