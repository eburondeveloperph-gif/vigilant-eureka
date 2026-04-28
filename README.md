<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

<h1 align="center">🧠 Beatrice — AI Voice Assistant Platform</h1>

<p align="center">
  <strong>An intelligent, voice-powered AI assistant integrating Gemini Live API, real-time speech-to-text, 
  multi-agent orchestration, document scanning, vision capabilities, and Google Workspace productivity tools.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript" alt="TypeScript 5.8" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite" alt="Vite 6" />
  <img src="https://img.shields.io/badge/Gemini_Live-8E75B2?logo=google" alt="Gemini Live" />
  <img src="https://img.shields.io/badge/Deepgram-13EF93?logo=deepgram" alt="Deepgram" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?logo=firebase" alt="Firebase" />
  <img src="https://img.shields.io/badge/License-Apache_2.0-blue" alt="License" />
</p>

---

## ✨ Features

### 🎙️ Voice Conversations
- **Gemini Live API** — Bidirectional real-time audio streaming with Gemini 2.0 models
- **Real-time STT** — Deepgram WebSocket integration for live speech-to-text transcription
- **HeyGen Integration** — AI video generation via HeyGen v3 API
- **Voice Chat Bridge** — Seamless routing between voice input and text chat

### 🧠 Multi-Agent System
A sophisticated agent registry that dispatches tool calls to specialized handlers:

| Agent | Purpose |
|-------|---------|
| 📧 **Email Agent** | Send, read, and manage Gmail messages |
| 📅 **Calendar Agent** | Create events, manage schedules, set reminders |
| 📄 **Document Agent** | Document analysis and processing |
| 🗂️ **Drive Agent** | Google Drive & Docs management |
| 🖼️ **Image Agent** | Image generation and analysis |
| 🗺️ **Navigation Agent** | Maps, routes, and nearby places |
| 🎬 **Video Agent** | Video processing and generation |
| 👁️ **Vision Agent** | CCTV integration with object detection |
| 🛠️ **Customer Support** | Returns, order status, escalation |
| 🎥 **EburonFlix Agent** | Media streaming platform integration |
| 💾 **Conversation Memory** | Persistent conversation history recall |
| 📚 **Knowledge Base** | `/files` knowledge base queries |
| 💬 **WhatsApp Agent** | Meta Cloud API messaging |
| ⚡ **Zapier Agent** | Catch Hook webhook integration |
| 📊 **Sheets Agent** | Google Sheets CRUD operations |
| 📽️ **Slides Agent** | Google Slides management |
| ✅ **Tasks Agent** | Google Tasks integration |
| 👥 **People Agent** | Google Contacts management |
| 📝 **Forms Agent** | Google Forms creation and responses |
| 🌍 **Translate Agent** | Text translation services |
| 💭 **Chat Agent** | General conversation handling |
| ▶️ **YouTube Agent** | YouTube search and data |

### 📄 Document Scanning & OCR
- **Camera Capture** — Real-time document scanning via device camera
- **OCR Processing** — Text extraction using Tesseract.js
- **AI-Powered Analysis** — Google Document AI integration
- **File Upload** — Support for images, PDFs, and documents
- **Firebase Storage** — Secure cloud upload and retrieval
- **Screenshot Capture** — Screen capture with OCR analysis

### 🔐 Authentication & User Management
- **Firebase Authentication** — Google OAuth sign-in
- **User Profiles** — Customizable profiles with avatars, preferred names, and addresses
- **Firebase Realtime Database** — Persistent conversation history
- **Cloud Sync** — Conversations, settings, and profiles synced across sessions

### 👁️ Vision & CCTV
- **Object Detection** — TensorFlow.js + COCO-SSD model
- **Camera Integration** — Live CCTV feed processing
- **Vision Agent** — AI-powered scene analysis and description

### 🔧 Integrations
| Service | Type |
|---------|------|
| **Google Workspace** | Email, Calendar, Drive, Docs, Sheets, Slides, Tasks, People, Forms |
| **Google Maps** | Routes, places, traffic, navigation |
| **Google Translate** | Multi-language translation |
| **DeepSeek** | Chat model backend (`eburon-chat`) |
| **WhatsApp** | Meta Cloud API messaging |
| **Zapier** | Webhook-based automation |
| **HeyGen** | AI video generation |
| **YouTube** | Video search and data |
| **Ollama** | Local LLM integration |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│                  Frontend                     │
│  React 19 + TypeScript + Vite 6              │
├─────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Auth     │  │  Chat    │  │  Voice   │  │
│  │  Screen   │  │  Console │  │  Stream  │  │
│  └──────────┘  └──────────┘  └──────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Scanner │  │  Vision  │  │  Eburon  │  │
│  │  Modal   │  │  Panel   │  │  Flix    │  │
│  └──────────┘  └──────────┘  └──────────┘  │
├─────────────────────────────────────────────┤
│              State Management                │
│  Zustand stores (UI, Settings, Processing,   │
│  User Profile, Integrations, EburonFlix)     │
├─────────────────────────────────────────────┤
│            Agent Registry                    │
│  ┌──────────────────────────────────────┐   │
│  │ dispatchToAgent(toolName, args, ctx)  │   │
│  │  → Email  → Calendar → Drive → ...   │   │
│  └──────────────────────────────────────┘   │
├─────────────────────────────────────────────┤
│              External Services               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Gemini   │ │ Deepgram │ │ DeepSeek │   │
│  │ Live API │ │ STT      │ │ Chat     │   │
│  └──────────┘ └──────────┘ └──────────┘   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Firebase │ │ Google   │ │ HeyGen   │   │
│  │ Auth+RTDB│ │ Workspace│ │ Video    │   │
│  └──────────┘ └──────────┘ └──────────┘   │
└─────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (v20+ recommended)
- **npm** 9+
- **Gemini API Key** — [Get one here](https://aistudio.google.com/app/apikey)
- **Firebase Project** — With Authentication (Google provider) & Realtime Database enabled

### Optional Services

| Service | Key | How to Get |
|---------|-----|------------|
| Deepgram API Key | `DEEPGRAM_API_KEY` | [Deepgram Console](https://console.deepgram.com/) |
| HeyGen API Key | `HEYGEN_API_KEY` | [HeyGen API](https://www.heygen.com/) |
| Firebase Config | `VITE_FIREBASE_*` | [Firebase Console](https://console.firebase.google.com/) |

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/eburondeveloperph-gif/vigilant-eureka.git
cd vigilant-eureka

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.local.example .env.local  # or create manually

# 4. Add your API keys to .env.local:
cat > .env.local << 'EOF'
GEMINI_API_KEY=your_gemini_api_key_here
VITE_GEMINI_API_KEY=your_gemini_api_key_here
DEEPGRAM_API_KEY=your_deepgram_api_key_here
HEYGEN_API_KEY=your_heygen_api_key_here
EOF

# 5. Start the dev server
npm run dev
```

The app will be available at **http://0.0.0.0:3000**.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | ✅ | Gemini Live API key |
| `VITE_GEMINI_API_KEY` | ✅ | Vite-exposed Gemini API key |
| `DEEPGRAM_API_KEY` | ❌ | Deepgram realtime STT |
| `HEYGEN_API_KEY` | ❌ | HeyGen video generation |
| `VITE_DEEPGRAM_MODEL` | ❌ | Deepgram model (default: `nova-3`) |
| `VITE_DEEPGRAM_LANGUAGE` | ❌ | STT language (default: `multi`) |
| `VITE_DEEPGRAM_ENDPOINTING_MS` | ❌ | Endpointing timeout in ms (default: `500`) |

---

## 📦 Project Structure

```
├── App.tsx                          # Main application shell (2711 lines)
├── index.tsx                        # React entry point
├── index.css                        # Global styles
├── vite.config.ts                   # Vite configuration
├── tsconfig.json                    # TypeScript configuration
├── package.json                     # Dependencies & scripts
├── .env.local                       # Local environment variables
│
├── components/                      # React UI components
│   ├── Header.tsx                   # Top navigation bar
│   ├── Sidebar.tsx                  # Settings & integrations panel
│   ├── Modal.tsx                    # Reusable modal component
│   ├── TestLogViewer.tsx            # Test log viewer
│   ├── ToolEditorModal.tsx          # Tool editor modal
│   ├── demo/                        # Auth & streaming console
│   │   ├── AuthScreen.tsx           # Google sign-in screen
│   │   ├── ErrorScreen.tsx          # Error display screen
│   │   └── streaming-console/       # Live voice streaming UI
│   ├── document/                    # Document scanning
│   │   └── DocumentScannerModal.tsx # Camera/upload/screenshot scanner
│   ├── eburonflix/                  # Media streaming
│   │   └── EburonFlixOverlay.tsx    # EburonFlix overlay UI
│   ├── vision/                      # Vision/CCTV
│   │   └── CctvVisionPanel.tsx      # CCTV vision panel
│   └── user/                        # User profile
│       └── UserProfileOnboardingModal.tsx
│
├── contexts/                        # React contexts
│   └── LiveAPIContext.tsx           # Gemini Live API provider
│
├── hooks/                           # React hooks
│   └── media/
│       └── use-live-api.ts          # Gemini Live API hook
│
├── lib/                             # Core library code
│   ├── genai-live-client.ts         # Gemini Live WebSocket client
│   ├── deepgram.ts                  # Deepgram STT integration
│   ├── heygen-client.ts             # HeyGen video API client
│   ├── firebase.ts                  # Firebase auth, RTDB, storage
│   ├── firestore-safe.ts            # Firestore safe operations
│   ├── google-api-key.ts            # Google API key management
│   ├── google-oauth-fetch.ts        # Google OAuth fetch wrapper
│   ├── google-services.ts           # Google Workspace executor
│   ├── state.ts                     # Zustand stores
│   ├── tools.ts                     # Tool definitions
│   ├── tool-executor.ts             # Tool execution engine
│   ├── processing-console.ts        # Processing visual console
│   ├── task-engagement.ts           # Task engagement system
│   ├── conversation-context.ts      # Conversation context type
│   ├── conversation-history.ts      # Long-term history recording
│   ├── conversation-memory.ts       # Conversation memory management
│   ├── chat-attachments.ts          # Chat attachment handling
│   ├── scan-chat-bridge.ts          # Scan→Chat bridge
│   ├── voice-chat-bridge.ts         # Voice→Chat bridge
│   ├── prompts.ts                   # System prompts
│   ├── constants.ts                 # Shared constants
│   ├── integrations-store.ts        # WhatsApp/Zapier integration state
│   ├── user-profile.ts              # User profile logic
│   ├── user-profile-store.ts        # User profile Zustand store
│   ├── knowledge-base.ts            # Knowledge base queries
│   ├── test-log-store.ts            # Test log store
│   ├── utils.ts                     # Utility functions
│   ├── audio-recorder.ts            # Audio recording utilities
│   ├── audio-streamer.ts            # Audio streaming utilities
│   ├── audioworklet-registry.ts     # Audio worklet management
│   │
│   ├── agents/                      # Specialized agent handlers
│   │   ├── index.ts                 # Agent registry & dispatcher
│   │   ├── types.ts                 # Agent type definitions
│   │   ├── email-agent.ts           # Gmail agent
│   │   ├── calendar-agent.ts        # Calendar agent
│   │   ├── document-agent.ts        # Document agent
│   │   ├── drive-agent.ts           # Drive/Docs agent
│   │   ├── image-agent.ts           # Image agent
│   │   ├── video-agent.ts           # Video agent
│   │   ├── vision-agent.ts          # Vision/CCTV agent
│   │   ├── navigation-agent.ts      # Maps/navigation agent
│   │   ├── customer-support-agent.ts# Customer support agent
│   │   ├── eburonflix-agent.ts       # EburonFlix agent
│   │   ├── conversation-memory-agent.ts
│   │   ├── knowledge-base-agent.ts   # Knowledge base agent
│   │   ├── whatsapp-agent.ts         # WhatsApp agent
│   │   ├── zapier-agent.ts           # Zapier agent
│   │   ├── sheets-agent.ts           # Sheets agent
│   │   ├── slides-agent.ts           # Slides agent
│   │   ├── tasks-agent.ts            # Tasks agent
│   │   ├── people-agent.ts           # People/contacts agent
│   │   ├── forms-agent.ts            # Forms agent
│   │   ├── translate-agent.ts        # Translation agent
│   │   ├── chat-agent.ts             # Chat agent
│   │   └── youtube-agent.ts          # YouTube agent
│   │
│   ├── document/                    # Document processing
│   │   ├── scanner-service.ts       # Camera/upload scanning
│   │   ├── ocr-service.ts           # Tesseract OCR
│   │   ├── document-ai-service.ts   # Google Document AI
│   │   ├── file-text-extractor.ts   # File text extraction
│   │   ├── drive-knowledge-service.ts
│   │   ├── memory-service.ts        # Local memory management
│   │   ├── permanent-knowledge-service.ts
│   │   ├── permanent-knowledge-data.ts
│   │   ├── beatrice-response-service.ts
│   │   ├── voice-command-router.ts  # Voice command routing
│   │   ├── store.ts                 # Document Zustand store
│   │   ├── types.ts                 # Document types
│   │   ├── utils.ts                 # Document utilities
│   │   └── constants.ts             # Document constants
│   │
│   ├── prompts/                     # Prompt engineering
│   │   ├── beatrice.ts              # Beatrice system prompt
│   │   └── conversational-base.ts   # Universal conversational base
│   │
│   ├── tools/                       # Tool implementations
│   │   ├── beatrice-tools.ts        # Beatrice tool definitions
│   │   ├── customer-support.ts      # Customer support tools
│   │   ├── navigation-system.ts     # Navigation system tools
│   │   └── personal-assistant.ts    # Personal assistant tools
│   │
│   ├── vision/                      # Vision processing
│   │   ├── camera-tool-store.ts     # Camera tool state
│   │   ├── cctv-store.ts            # CCTV store
│   │   ├── object-detection-service.ts # TensorFlow detection
│   │   └── types.ts                 # Vision types
│   │
│   ├── eburonflix/                  # EburonFlix integration
│   │   ├── api.ts                   # EburonFlix API client
│   │   └── store.ts                 # EburonFlix Zustand store
│   │
│   └── worklets/                    # Audio worklet processors
│       ├── audio-processing.ts      # Audio processing worklet
│       └── vol-meter.ts             # Volume meter worklet
│
├── scripts/                         # Build & utility scripts
│   └── verify-tool-routes.mjs       # Tool route verification
│
├── public/                          # Static assets
├── cue/                             # Cue/reference files
├── files/                           # File storage
├── knowledge/                       # Knowledge base files
└── src/                             # Additional source files
```

---

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server on `http://0.0.0.0:3000` |
| `npm run build` | Create production bundle in `dist/` |
| `npm run preview` | Serve production bundle locally |
| `npm run verify:tools` | Verify tool route configurations |

---

## 🧪 Testing

Currently, treat `npm run build` as the primary validation step before making changes. Manual testing covers:

- **Auth flow** — Google sign-in, logout, session persistence
- **Chat console** — Send messages, view responses, conversation history
- **Voice streaming** — Connect/disconnect, audio I/O, transcription
- **Document scanning** — Camera capture, upload, OCR results
- **Sidebar** — Settings, integrations, profile management

---

## 🔐 Security Notes

- Keep API keys in `.env.local` — never commit them to version control
- Firebase API keys in client code are safe by design (Firebase Security Rules govern access)
- The DeepSeek API key is currently hardcoded in `App.tsx` — move to `.env.local` for production
- Use Firebase Security Rules to restrict database access to authenticated users only
- The `dist/` directory is generated output — never edit it manually

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Make your changes
4. Run `npm run build` to verify
5. Commit: `git commit -m "feat: description of changes"`
6. Push: `git push origin feat/my-feature`
7. Open a Pull Request

See [AGENTS.md](./AGENTS.md) for detailed coding guidelines.

---

## 📄 License

This project includes code from the Google Gemini API samples, licensed under **Apache 2.0**.

```
Copyright 2024 Google LLC
Copyright 2025 Eburon Developer PH

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

---

<p align="center">
  Built with ❤️ by the Eburon Developer PH team<br/>
  Powered by Google Gemini, Deepgram, and Firebase
</p>
