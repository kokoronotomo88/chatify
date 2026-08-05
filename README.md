# Chattify 💬

> **Connect. Chat. Create.**

A premium realtime chat PWA built with pure HTML5, CSS3, and Vanilla JavaScript ES2022+. Dark mode. Glassmorphism. Gen-Z aesthetic.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/kokoronotomo88/chatify)

---

## ✨ Features

| Feature | Status |
|---|---|
| PIN-based authentication (admin: `12345`) | ✅ |
| Animated login with glassmorphism card | ✅ |
| Dashboard — Chats / Groups / Settings tabs | ✅ |
| Stories row with horizontal scroll | ✅ |
| Real-time chat bubbles with read receipts | ✅ |
| Group chat with member names | ✅ |
| Story viewer with progress bar | ✅ |
| Voice/video call placeholder UI | ✅ |
| Global search | ✅ |
| Dark mode default + light mode prep | ✅ |
| PWA — manifest, service worker, offline page | ✅ |
| Background sync ready | ✅ |
| Push notification ready | ✅ |
| Touch optimized, mobile first | ✅ |
| GitHub Actions CI/CD | ✅ |
| Vercel deployment config | ✅ |

---

## 🚀 Stack

- **HTML5** — Semantic markup
- **CSS3** — Custom Properties, Grid, Flexbox, Animations
- **Vanilla JavaScript ES2022+** — Modules, Classes, Private fields, Async/Await
- **PWA** — Web App Manifest, Service Worker, Offline support

**No frameworks. No jQuery. No React.**

---

## 🏗️ Architecture

```
chattify/
├── adapters/        # Data transformers API ↔ Model
├── assets/
│   ├── css/         # Design tokens, animations, component styles
│   └── icons/       # PWA icons (SVG + PNG)
├── components/      # Reusable UI components
├── config/          # dev / staging / prod config
├── constants/       # Routes, events, colors, API endpoints
├── hooks/           # useFetch, useSocket, useStorage, useTheme
├── layouts/         # AuthLayout, DashboardLayout, ChatLayout
├── mock/            # Seed data (easily removable)
├── models/          # User, Room, Message, Group, Notification
├── pages/           # LoginPage, DashboardPage, ChatPage, GroupPage, StoryPage, CallPage
├── router/          # Client-side SPA hash router
├── services/        # ApiService, AuthService, SocketService, StorageService, ThemeService
├── store/           # AppStore, AuthStore, ChatStore, ThemeStore
├── sw/              # CacheStrategy, OfflineStrategy, SyncStrategy, PushStrategy, VersionStrategy
├── utils/           # helpers, toast, modal, loading, validators
├── index.html       # App entry point
├── main.js          # Bootstrap & router setup
├── manifest.json    # PWA manifest
├── offline.html     # Offline fallback page
├── service-worker.js# Service worker (imports sw/ modules)
└── vercel.json      # Vercel deployment config
```

---

## 🔑 Authentication

| PIN | Role | FAB |
|---|---|---|
| `12345` | Admin | ✅ Visible |
| Any 4–6 digits | User | ❌ Hidden |

Session persisted via `localStorage`. Logout clears everything.

---

## 🛠️ Development

```bash
# Clone
git clone https://github.com/kokoronotomo88/chatify.git
cd chatify

# Install (optional — for linting/formatting)
npm install

# Serve locally (any static server)
npx serve .
# or
python3 -m http.server 3000

# Open
open http://localhost:3000
```

---

## 🌍 Deployment

### Vercel (Recommended)

1. Import repo at [vercel.com/new](https://vercel.com/new)
2. Framework preset: **Other** (static)
3. Output directory: `.` (root)
4. Deploy!

### Manual

Push to `main` branch → GitHub Actions auto-deploys to Vercel.

---

## 🎨 Design System

| Token | Value |
|---|---|
| Background primary | `#0F0F1A` |
| Card surface | `#1A1A2E` |
| Gradient brand | `#8B5CF6 → #EC4899` |
| Accent cyan | `#06B6D4` |
| Font heading | Space Grotesk |
| Font body | Plus Jakarta Sans |

---

## 📦 Mock Data

Located in `mock/` — easily deletable for production:

- `users.json` — 1 admin user (Sarah Amelia)
- `messages.json` — `[]` (empty)
- `stories.json` — `[]` (empty)
- `groups.json` — `[]` (empty)

---

## 🔌 Backend Preparation

Frontend is wired to connect to:

- **REST API** — `ApiService` in `services/ApiService.js`
- **Socket.IO** — `SocketService` in `services/SocketService.js`
- **JWT Auth** — ready in `AuthService`
- **Config** — `config/dev.js`, `config/prod.js`

---

## 📄 License

MIT © 2025 kokoronotomo88
