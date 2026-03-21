const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

export interface Guest {
  id: string;
  created_at: string;
  preferred_mode: "text" | "voice";
}

interface CreateGuestRequest {
  preferred_mode?: "text" | "voice";
}

async function mockCreateGuest(
  body: CreateGuestRequest
): Promise<Guest> {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 300));

  return {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    preferred_mode: body.preferred_mode ?? "text",
  };
}

export async function createGuest(
  body: CreateGuestRequest = {}
): Promise<Guest> {
  if (USE_MOCKS) {
    return mockCreateGuest(body);
  }

  const res = await fetch(`${API_URL}/guests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ preferred_mode: body.preferred_mode ?? "text" }),
  });

  if (!res.ok) {
    throw new Error(`POST /guests failed: ${res.status}`);
  }

  return res.json() as Promise<Guest>;
}
