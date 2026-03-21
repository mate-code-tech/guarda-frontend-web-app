# Plan Frontend — Guarda (`guarda-frontend-web-app`)

## Context

Hackathon biotech/health. App mobile-first llamada **Guarda** con un asistente conversacional (orbe animado) que detecta riesgos en combinaciones de medicamentos y cruza medicamentos con análisis clínicos. Frontend en Next.js. Sin login, solo guest_id.

---

## Setup

Next.js 14+ App Router, TypeScript, Tailwind CSS.
Deps: `zustand`, `uuid`, `framer-motion`, `lucide-react`, `clsx`, `tailwind-merge`.

---

## Estructura de directorios

```
src/
├── app/
│   ├── layout.tsx              # Root layout, viewport meta, GuestProvider
│   ├── page.tsx                # Onboarding (elegir voz o texto)
│   ├── chat/page.tsx           # Pantalla principal de conversación
│   ├── validate/page.tsx       # Validación de medicamentos
│   ├── results/page.tsx        # Resultados semáforo
│   └── globals.css
├── components/
│   ├── orb/                    # Orb.tsx, OrbPulse.tsx (idle/listening/thinking/speaking)
│   ├── chat/                   # ChatBubble, ChatThread, ChatInput, VoiceButton
│   ├── medications/            # MedicationList, MedicationRow, ConfirmButton
│   ├── results/                # TrafficLight, ResultsList, SeverityBadge
│   ├── upload/                 # FileUpload, FilePreview
│   ├── onboarding/             # ModeSelector, WelcomeScreen
│   └── ui/                     # Button, Card, Spinner, Modal
├── hooks/
│   ├── useGuest.ts             # Guest ID localStorage
│   ├── useSpeechRecognition.ts # Web Speech API
│   ├── useSpeechSynthesis.ts   # TTS
│   ├── useChat.ts              # Fetch + polling de mensajes
│   └── useWakeWord.ts          # Detección "Che Guarda"
├── stores/
│   ├── appStore.ts             # guestId, mode, orbState
│   ├── chatStore.ts            # messages, conversationId
│   ├── medicationStore.ts      # lista de medicamentos
│   └── resultStore.ts          # resultados de interacciones
├── lib/
│   ├── api.ts                  # Fetch wrapper con X-Guest-ID header
│   ├── constants.ts            # Enums, URLs
│   └── types.ts                # Interfaces compartidas
└── utils/
    ├── guestId.ts              # UUID + localStorage
    └── formatters.ts
```

---

## Rutas

| Ruta        | Propósito                                |
| ----------- | ---------------------------------------- |
| `/`         | Onboarding: orbe pregunta voz o texto    |
| `/chat`     | Conversación principal con IA            |
| `/validate` | Revisar/editar medicamentos normalizados |
| `/results`  | Resultados de interacciones (semáforo)   |

Navegación controlada por IA via tool-calls (sin navbar manual).

---

## Orbe — Estados

| Estado      | Animación                                      | Colores        |
| ----------- | ---------------------------------------------- | -------------- |
| **idle**    | Respiración suave, escala 1.0→1.05, pulso opacidad | Azul/púrpura   |
| **listening** | Pulso brillante, ripples expandiéndose        | Cyan           |
| **thinking** | Gradiente rotatorio, partículas orbitando      | Ámbar          |
| **speaking** | Distorsión waveform, amplitud ligada a TTS     | Verde          |

---

## Integración de Voz

- `useSpeechRecognition`: Web Speech API, `lang: es-AR`, push-to-talk o continuo
- `useWakeWord`: reconocimiento continuo buscando "che guarda" (fuzzy)
- `useSpeechSynthesis`: voz española, orbe en estado speaking
- **Fallback**: si no hay soporte, ocultar opción voz y default a texto

---

## Chat Response (JSON del backend)

`POST /api/v1/chat/message` devuelve HTTP JSON normal (no SSE). El frontend muestra spinner/orbe thinking mientras espera.

```jsonc
{
  "conversation_id": "uuid",
  "message": "Veo que mencionás dos medicamentos...",
  "tool_calls": [
    { "name": "normalize_medications", "data": { "medications": [...] } },
    { "name": "check_interactions", "data": { "results": [...] } },
    { "name": "show_file_upload", "data": { "prompt": "..." } }
  ]
}
```

`tool_calls` es un array (puede estar vacío). El frontend itera y renderiza UI según cada tool_call.

---

## Contrato de Integración con Backend

### Headers

- `X-Guest-ID: <uuid>` en toda request (excepto `POST /guests`)

### Endpoints — Request / Response completos

---

#### `POST /api/v1/guests` — Registrar guest

**Request:**
```json
{ "preferred_mode": "text" }
```

**Response:** `201`
```json
{
  "id": "uuid",
  "created_at": "2026-03-21T...",
  "preferred_mode": "text"
}
```

---

#### `POST /api/v1/chat/message` — Enviar mensaje, respuesta JSON

**Request:**
```json
{ "conversation_id": "uuid | null", "message": "Tomo ibuprofeno y aspirina" }
```

**Response:** `200`
```json
{
  "conversation_id": "uuid",
  "message": "Veo que mencionás dos medicamentos...",
  "tool_calls": [
    {
      "name": "normalize_medications",
      "data": {
        "medications": [
          { "input_name": "ibuprofeno", "generic_name": "ibuprofen" },
          { "input_name": "aspirina", "generic_name": "aspirin" }
        ]
      }
    },
    {
      "name": "check_interactions",
      "data": {
        "results": [
          {
            "drug_a": "ibuprofen",
            "drug_b": "aspirin",
            "severity": "severe",
            "description": "Aumenta riesgo de sangrado GI",
            "recommendation": "No combinar sin supervisión médica",
            "source": "dataset"
          }
        ]
      }
    }
  ]
}
```

---

#### `POST /api/v1/medications/validate` — Normalizar nombres

**Request:**
```json
{
  "conversation_id": "uuid",
  "medications": ["ibuprofeno", "Tafirol", "bayaspirina"]
}
```

**Response:** `200`
```json
{
  "medications": [
    { "input_name": "ibuprofeno", "generic_name": "ibuprofen" },
    { "input_name": "Tafirol", "generic_name": "acetaminophen" },
    { "input_name": "bayaspirina", "generic_name": "aspirin" }
  ]
}
```

---

#### `POST /api/v1/medications/confirm` — Confirmar medicamentos

**Request:**
```json
{
  "conversation_id": "uuid",
  "medications": [
    { "generic_name": "ibuprofen" },
    { "generic_name": "acetaminophen" },
    { "generic_name": "aspirin" }
  ]
}
```

**Response:** `200`
```json
{ "confirmed": true, "count": 3 }
```

---

#### `POST /api/v1/interactions/check` — Cruce de interacciones

**Request:**
```json
{
  "conversation_id": "uuid",
  "medications": ["ibuprofen", "aspirin", "acetaminophen"]
}
```

**Response:** `200`
```json
{
  "results": [
    {
      "drug_a": "ibuprofen",
      "drug_b": "aspirin",
      "severity": "severe",
      "description": "Aumenta riesgo de sangrado gastrointestinal",
      "recommendation": "No combinar sin supervisión médica",
      "source": "dataset"
    },
    {
      "drug_a": "ibuprofen",
      "drug_b": "acetaminophen",
      "severity": "mild",
      "description": "Combinación generalmente segura en dosis terapéuticas",
      "recommendation": "Monitorear dosis total diaria",
      "source": "ai_fallback"
    }
  ]
}
```

Severidades posibles: `none`, `mild`, `moderate`, `severe`.

---

#### `POST /api/v1/upload/lab` — Subir análisis clínico

**Request:** `multipart/form-data`
```
file: <archivo PDF/imagen>
conversation_id: "uuid"
```

**Response:** `200`
```json
{
  "id": "uuid",
  "filename": "analisis_sangre.pdf",
  "extracted_data": {
    "hemoglobina": { "value": 14.2, "unit": "g/dL", "reference": "12-16" },
    "glucemia": { "value": 110, "unit": "mg/dL", "reference": "70-100" },
    "creatinina": { "value": 1.1, "unit": "mg/dL", "reference": "0.7-1.3" }
  }
}
```

---

#### `GET /api/v1/conversations/:id` — Historial de conversación

**Request:** solo header `X-Guest-ID`

**Response:** `200`
```json
{
  "id": "uuid",
  "guest_id": "uuid",
  "flow_type": "general",
  "status": "active",
  "created_at": "...",
  "messages": [
    { "id": "uuid", "role": "user", "content": "Tomo ibuprofeno", "created_at": "..." },
    { "id": "uuid", "role": "assistant", "content": "Veo que...", "tool_calls": [...], "created_at": "..." }
  ],
  "medications": [...],
  "interactions": [...]
}
```

---

## Tareas (ordenadas)

| #   | Tarea                                                                     | Entregable                          |
| --- | ------------------------------------------------------------------------- | ----------------------------------- |
| F1  | Project init: create-next-app, deps, tailwind, .env                       | Proyecto booteable                  |
| F2  | Scaffolding: carpetas, stubs, types.ts                                    | Estructura completa                 |
| F3  | Guest ID: guestId.ts, useGuest, appStore                                  | Registro de guest en primera visita |
| F4  | API client: api.ts con fetch + X-Guest-ID                                 | Cliente API funcional               |
| F5  | Orbe: 4 estados con framer-motion                                         | Orbe animado                        |
| F6  | Onboarding: WelcomeScreen + ModeSelector                                  | Ruta `/` funcional                  |
| F7  | Chat UI: ChatThread, ChatBubble, ChatInput, chatStore                     | `/chat` con mensajes de texto       |
| F8  | Voz: useSpeechRecognition, VoiceButton, useWakeWord                       | Input por voz en chat               |
| F9  | TTS: useSpeechSynthesis + orbe speaking                                   | IA habla las respuestas             |
| F10 | Validación medicamentos: MedicationList, MedicationRow, ConfirmButton     | `/validate` funcional               |
| F11 | Resultados semáforo: TrafficLight, ResultsList, SeverityBadge             | `/results` funcional                |
| F12 | File upload: FileUpload, FilePreview, progress                            | Componente de carga                 |
| F13 | Routing por tool-calls: renderizar UI según tool_call del AI              | Navegación AI-driven                |
| F14 | Integración E2E, error handling, polish                                   | App integrada completa              |

### Paralelización

- F5 (orbe) independiente de F3+F4
- F7 y F8 pueden dividirse entre devs
- F10, F11, F12 son independientes entre sí

### Orden sugerido para demo rápida

1. Scaffolding (F1-F2)
2. Guest system (F3)
3. Chat E2E con AI real (F4+F7) ← **primer milestone**
4. Orbe visual (F5) — en paralelo
5. Tool-calls + normalización (F10+F13)
6. Interaction checking (F11)
7. File upload (F12)
8. Voz (F8-F9)
9. Polish y demo (F14)

---

## Riesgos y Mitigaciones

| Riesgo                                   | Mitigación                                    |
| ---------------------------------------- | --------------------------------------------- |
| Web Speech API no disponible             | Feature-detect + fallback a texto             |
| Wake word mal reconocido                 | Aceptar variantes fuzzy + botón tap-to-talk   |
| Teclado móvil cubre input               | API `visualViewport` + `position: sticky`     |
| Animaciones lentas en dispositivos bajos | CSS fallback + `prefers-reduced-motion`       |

---

## Verificación

- [ ] Guest se crea en primera visita y persiste en localStorage
- [ ] Chat E2E: escribir mensaje → ver respuesta completa del AI
- [ ] Orbe cambia de estado según flujo
- [ ] Decir medicamentos → ver lista normalizada → confirmar → ver semáforo
- [ ] Subir análisis → ver datos extraídos → cruce con medicamentos
- [ ] "Che Guarda" activa escucha (en modo voz)
