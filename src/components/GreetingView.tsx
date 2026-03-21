"use client";

import { Orb } from "./Orb";

export function GreetingView() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 pb-10">
      <Orb size="large" />
      <div className="flex w-full flex-col items-center gap-2">
        <h1 className="text-center text-2xl font-bold text-gray-900">
          Hola, Gastón
        </h1>
        <p className="text-center text-[15px] text-gray-500">
          ¿En qué puedo ayudarte hoy?
        </p>
      </div>
    </div>
  );
}
