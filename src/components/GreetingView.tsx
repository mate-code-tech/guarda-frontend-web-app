"use client";

import { Orb, OrbState } from "./Orb";

interface GreetingViewProps {
  orbState: OrbState;
  assistantMessage: string;
  transcript: string;
}

export function GreetingView({
  orbState,
  assistantMessage,
  transcript,
}: GreetingViewProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 pb-10">
      <Orb size="large" state={orbState} />
      <div className="flex w-full flex-col items-center gap-2">
        {assistantMessage && (
          <p className="text-center text-[15px] text-gray-500">
            {assistantMessage}
          </p>
        )}
        {transcript && (
          <p className="mt-2 text-center text-sm font-medium text-purple-600">
            {transcript}
          </p>
        )}
      </div>
    </div>
  );
}
