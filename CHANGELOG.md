# Changelog

All notable changes to Chattify are documented here.

Format: [Semantic Versioning](https://semver.org/)

---

## [1.0.0] — 2025

### 🎉 Initial Release

#### Added
- **Authentication** — PIN-based login (6-digit), admin PIN `12345`, session persistence
- **LoginPage** — Animated logo with pulse rings, glassmorphism card, numeric keypad, auto-submit
- **DashboardPage** — Sticky glass header, Chats / Groups / Settings / Search tabs
- **Stories row** — Horizontal scroll, gradient rings, tap-to-view placeholder
- **Chat list** — Avatar + status dot, last message preview, unread badge, timestamps
- **ChatPage** — Message bubbles (sent gradient, received dark), read receipts, typing indicator, date separators, scroll-to-bottom button
- **GroupPage** — Group chat with member name labels, sender colors
- **StoryPage** — Full-screen story viewer, progress bars, tap prev/next, 5s auto-advance, reply input
- **CallPage** — Voice call UI with pulse rings, live timer, mute/speaker/video controls, end call
- **Search** — Global debounced search across conversations
- **Settings** — Profile card, settings groups, logout button
- **PWA** — Web App Manifest, Service Worker (Cache First, Network First, Stale While Revalidate)
- **Offline** — Offline page with reconnect detection
- **Background Sync** — Message outbox queue with retry
- **Push Notifications** — Service worker push handler + notification actions
- **Theme** — Dark mode default, light mode preparation, system preference detection
- **GitHub Actions** — `deploy.yml`, `build.yml`, `lint.yml`, `deploy-manual.yml`
- **Vercel config** — `vercel.json` with SPA rewrites and cache headers

#### Architecture
- Clean Architecture: adapters, models, services, store, router, hooks, utils
- ES Modules throughout — no bundler required
- Class-based components with JSDoc comments
- CSS Custom Properties design tokens (Space Grotesk + Plus Jakarta Sans)
- BEM-like CSS naming
- Safe area support (`env(safe-area-inset-*)`)

---

## [Upcoming]

### Planned
- Real backend integration (Express + Socket.IO + PostgreSQL)
- JWT authentication
- Image/file attachments
- Voice note recording
- Emoji picker
- Global search across messages
- Push notification subscription UI
- Story upload
- Video call (WebRTC)
- Light mode toggle
- PWA install prompt UI
