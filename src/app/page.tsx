"use client";

import { useState } from "react";
import { GreetingView } from "@/components/GreetingView";
import { MedicationsView } from "@/components/MedicationsView";
import { ResultsView } from "@/components/ResultsView";

type AppState = "greeting" | "medications" | "results";

export default function Home() {
  const [state, setState] = useState<AppState>("greeting");

  return (
    <div className="flex h-dvh w-full max-w-[393px] flex-col overflow-hidden rounded-[40px] bg-white pt-[62px]">
      {state === "greeting" && <GreetingView />}
      {state === "medications" && <MedicationsView />}
      {state === "results" && <ResultsView />}

      {/* Temporary nav for testing */}
      <div className="flex shrink-0 gap-2 border-t border-gray-100 px-4 py-3">
        <button
          onClick={() => setState("greeting")}
          className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
            state === "greeting"
              ? "bg-purple-500 text-white"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Inicio
        </button>
        <button
          onClick={() => setState("medications")}
          className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
            state === "medications"
              ? "bg-purple-500 text-white"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Medicamentos
        </button>
        <button
          onClick={() => setState("results")}
          className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
            state === "results"
              ? "bg-purple-500 text-white"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Resultados
        </button>
      </div>
    </div>
  );
}
