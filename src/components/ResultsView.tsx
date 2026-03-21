"use client";

import { Orb } from "./Orb";

type Severity = "severe" | "moderate" | "safe";

interface InteractionCard {
  severity: Severity;
  label: string;
  title: string;
  description: string;
}

const SEVERITY_CONFIG: Record<
  Severity,
  { bg: string; border: string; dotColor: string; labelColor: string }
> = {
  severe: {
    bg: "bg-red-50",
    border: "border-red-200",
    dotColor: "bg-red-500",
    labelColor: "text-red-600",
  },
  moderate: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    dotColor: "bg-amber-400",
    labelColor: "text-amber-600",
  },
  safe: {
    bg: "bg-green-50",
    border: "border-green-200",
    dotColor: "bg-green-500",
    labelColor: "text-green-600",
  },
};

const MOCK_RESULTS: InteractionCard[] = [
  {
    severity: "severe",
    label: "Peligroso",
    title: "Ibuprofeno + Enalapril",
    description:
      "El ibuprofeno puede reducir el efecto antihipertensivo del enalapril y aumentar el riesgo de daño renal.",
  },
  {
    severity: "moderate",
    label: "Precaución",
    title: "Ibuprofeno + Metformina",
    description:
      "El ibuprofeno puede potenciar el efecto hipoglucemiante de la metformina. Monitorear glucemia.",
  },
  {
    severity: "safe",
    label: "Sin riesgo conocido",
    title: "Enalapril + Metformina",
    description:
      "No se encontraron interacciones significativas entre estos medicamentos. Combinación segura.",
  },
];

function ResultCard({ card }: { card: InteractionCard }) {
  const config = SEVERITY_CONFIG[card.severity];

  return (
    <div
      className={`flex w-full flex-col gap-2 rounded-xl border p-4 ${config.bg} ${config.border}`}
    >
      <div className="flex items-center gap-1.5">
        <div className={`h-3 w-3 rounded-full ${config.dotColor}`} />
        <span className={`text-xs font-semibold ${config.labelColor}`}>
          {card.label}
        </span>
      </div>
      <h3 className="text-base font-bold text-gray-900">{card.title}</h3>
      <p className="text-[13px] leading-[1.4] text-gray-600">
        {card.description}
      </p>
    </div>
  );
}

export function ResultsView() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Top: orb + status */}
      <div className="flex flex-col items-center gap-3 px-6 pb-4 pt-5">
        <Orb size="small" />
        <p className="text-center text-[13px] font-semibold text-green-500">
          Análisis completo
        </p>
      </div>

      {/* Panel */}
      <div className="flex flex-1 flex-col rounded-t-3xl border border-gray-200 bg-gray-50 p-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Interacciones</h2>
        </div>

        {/* Results */}
        <div className="mt-3 flex flex-col gap-3">
          {MOCK_RESULTS.map((card) => (
            <ResultCard key={card.title} card={card} />
          ))}
        </div>

        {/* Disclaimer */}
        <p className="mt-4 text-center text-[11px] leading-snug text-gray-400">
          Esta información es orientativa y no reemplaza el consejo médico.
          Consultá siempre a tu médico de confianza.
        </p>
      </div>
    </div>
  );
}
