"use client";

import { Pill, CircleCheck } from "lucide-react";
import { Orb } from "./Orb";

interface Medication {
  name: string;
  detail: string;
}

const MOCK_MEDICATIONS: Medication[] = [
  { name: "Losartán 50mg", detail: "1 comprimido · Mañana" },
  { name: "Metformina 850mg", detail: "1 comprimido · Almuerzo" },
  { name: "Atorvastatina 20mg", detail: "1 comprimido · Noche" },
  { name: "Omeprazol 20mg", detail: "1 cápsula · Mañana" },
];

function MedCard({ med }: { med: Medication }) {
  return (
    <div className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-3">
      <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] bg-purple-500">
        <Pill className="h-[18px] w-[18px] text-white" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-sm font-semibold text-gray-900">{med.name}</span>
        <span className="text-xs text-gray-500">{med.detail}</span>
      </div>
      <CircleCheck className="h-5 w-5 shrink-0 text-green-500" />
    </div>
  );
}

export function MedicationsView() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Top: orb + message */}
      <div className="flex flex-col items-center gap-3 px-6 pb-4 pt-5">
        <Orb size="small" />
        <p className="text-center text-[13px] font-medium text-gray-500">
          Revisando tus medicamentos...
        </p>
      </div>

      {/* Panel */}
      <div className="flex flex-1 flex-col rounded-t-3xl border border-gray-200 bg-gray-50 p-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">
            Tus medicamentos
          </h2>
          <span className="text-xs font-semibold text-purple-500">
            {MOCK_MEDICATIONS.length} activos
          </span>
        </div>

        {/* List */}
        <div className="mt-3.5 flex flex-col gap-2.5">
          {MOCK_MEDICATIONS.map((med) => (
            <MedCard key={med.name} med={med} />
          ))}
        </div>
      </div>
    </div>
  );
}
