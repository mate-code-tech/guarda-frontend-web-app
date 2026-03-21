const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

const GUEST_ID_KEY = "guarda_guest_id";

function getGuestId(): string {
  const id = localStorage.getItem(GUEST_ID_KEY);
  if (!id) throw new Error("Guest ID not found in localStorage");
  return id;
}

// --- Guest ---

export interface Guest {
  id: string;
  created_at: string;
}

async function mockCreateGuest(): Promise<Guest> {
  await new Promise((r) => setTimeout(r, 300));
  return {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
}

export async function createGuest(): Promise<Guest> {
  if (USE_MOCKS) {
    return mockCreateGuest();
  }

  const res = await fetch(`${API_URL}/guests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  if (!res.ok) {
    throw new Error(`POST /guests failed: ${res.status}`);
  }

  return res.json() as Promise<Guest>;
}

// --- Chat Message ---

export interface Medication {
  input_name: string;
  generic_name: string;
}

export interface InteractionResult {
  drug_a: string;
  drug_b: string;
  input_name_a: string;
  input_name_b: string;
  severity: "none" | "mild" | "moderate" | "severe";
  description: string;
  recommendation: string;
  source: string;
}

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

let mockCallCount = 0;

async function mockSendMessage(
  body: ChatMessageRequest
): Promise<ChatMessageResponse> {
  await new Promise((r) => setTimeout(r, 500));
  mockCallCount++;

  // First call: greeting
  if (mockCallCount === 1) {
    return {
      conversation_id: body.conversation_id ?? crypto.randomUUID(),
      message:
        "¡Hola! Soy Guarda, tu asistente para verificar interacciones entre medicamentos. Contame qué medicamentos tomás.",
      tool_calls: [],
    };
  }

  // Second call: simulate normalize_medications + check_interactions
  return {
    conversation_id: body.conversation_id ?? crypto.randomUUID(),
    message:
      "Encontré tus medicamentos. Voy a verificar las interacciones entre ellos.",
    tool_calls: [
      {
        name: "normalize_medications",
        data: {
          medications: [
            { input_name: "ibuprofeno", generic_name: "ibuprofen" },
            { input_name: "enalapril", generic_name: "enalapril" },
            { input_name: "metformina", generic_name: "metformin" },
          ],
        },
      },
      {
        name: "check_interactions",
        data: null,
      },
    ],
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

// --- Interactions Check ---

export interface CheckInteractionsRequest {
  conversation_id: string;
  medications: string[];
}

export interface ProfileWarning {
  type: "age" | "condition" | "allergy";
  severity: "mild" | "moderate" | "severe";
  drug: string;
  description: string;
  recommendation: string;
}

export interface CheckInteractionsResponse {
  results: InteractionResult[];
  profile_warnings: ProfileWarning[];
}

async function mockCheckInteractions(): Promise<CheckInteractionsResponse> {
  await new Promise((r) => setTimeout(r, 500));
  return {
    results: [
      {
        drug_a: "ibuprofen",
        drug_b: "enalapril",
        severity: "severe",
        description:
          "El ibuprofeno puede reducir el efecto antihipertensivo del enalapril y aumentar el riesgo de daño renal.",
        recommendation: "No combinar sin supervisión médica",
        source: "dataset",
      },
      {
        drug_a: "ibuprofen",
        drug_b: "metformin",
        severity: "moderate",
        description:
          "El ibuprofeno puede potenciar el efecto hipoglucemiante de la metformina. Monitorear glucemia.",
        recommendation: "Monitorear dosis total diaria",
        source: "dataset",
      },
      {
        drug_a: "enalapril",
        drug_b: "metformin",
        severity: "none",
        description:
          "No se encontraron interacciones significativas entre estos medicamentos.",
        recommendation: "Combinación segura",
        source: "dataset",
      },
    ],
    profile_warnings: [],
  };
}

export async function checkInteractions(
  body: CheckInteractionsRequest
): Promise<CheckInteractionsResponse> {
  if (USE_MOCKS) {
    return mockCheckInteractions();
  }

  const res = await fetch(`${API_URL}/interactions/check`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Guest-ID": getGuestId(),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`POST /interactions/check failed: ${res.status}`);
  }

  return res.json() as Promise<CheckInteractionsResponse>;
}
