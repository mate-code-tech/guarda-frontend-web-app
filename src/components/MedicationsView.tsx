"use client";

import { Pill, CircleCheck } from "lucide-react";
import { Orb, OrbState } from "./Orb";
import type { Medication } from "@/lib/api";

interface MedicationsViewProps {
  medications: Medication[];
  orbState: OrbState;
  assistantMessage: string;
}

function MedCard({ name }: { name: string }) {
  return (
    <div className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-3">
      <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] bg-purple-500">
        <Pill className="h-[18px] w-[18px] text-white" />
      </div>
      <span className="min-w-0 flex-1 text-sm font-semibold text-gray-900">
        {name}
      </span>
      <CircleCheck className="h-5 w-5 shrink-0 text-green-500" />
    </div>
  );
}

export function MedicationsView({
  medications,
  orbState,
  assistantMessage,
}: MedicationsViewProps) {
  return (
    <div className="flex flex-1 flex-col">
      {/* Top: orb + message */}
      <div className="flex flex-col items-center gap-3 px-6 pb-4 pt-5">
        <Orb size="small" state={orbState} />
        <p className="text-center text-[13px] font-medium text-gray-500">
          {assistantMessage || "Revisando tus medicamentos..."}
        </p>
      </div>

      {/* Panel */}
      <div className="flex flex-1 flex-col rounded-t-3xl border border-gray-200 bg-gray-50 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">
            Medicamentos detectados
          </h2>
          <span className="text-xs font-semibold text-purple-500">
            {medications.length} encontrados
          </span>
        </div>

        <div className="mt-3.5 flex flex-col gap-2.5">
          {medications.map((med) => (
            <MedCard key={med.generic_name} name={med.input_name} />
          ))}
        </div>
      </div>
    </div>
  );
}
