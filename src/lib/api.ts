const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

const GUEST_ID_KEY = "guarda_guest_id";

function getGuestId(): string {
  const id = localStorage.getItem(GUEST_ID_KEY);
  if (!id) throw new Error("Guest ID not found in localStorage");
  return id;
}

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

// --- Chat Message ---

export interface ToolCall {
  name: string;
  data: Record<string, unknown> | null;
}

export interface ChatMessageRequest {
  conversation_id: string | null;
  message: string;
}

export interface ChatMessageResponse {
  conversation_id: string;
  message: string;
  tool_calls: ToolCall[];
}

async function mockSendMessage(
  body: ChatMessageRequest
): Promise<ChatMessageResponse> {
  await new Promise((r) => setTimeout(r, 500));

  return {
    conversation_id: body.conversation_id ?? crypto.randomUUID(),
    message:
      "¡Hola! Soy Guarda, tu asistente para verificar interacciones entre medicamentos. ¿Cómo preferís interactuar, por texto o por voz?",
    tool_calls: [],
  };
}

export async function sendMessage(
  body: ChatMessageRequest
): Promise<ChatMessageResponse> {
  if (USE_MOCKS) {
    return mockSendMessage(body);
  }

  const res = await fetch(`${API_URL}/chat/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Guest-ID": getGuestId(),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`POST /chat/message failed: ${res.status}`);
  }

  return res.json() as Promise<ChatMessageResponse>;
}
