# 0xPray

> Underground spiritual vault. Encrypted. Private. Yours.

A Progressive Web App built as a private prayer journal with a cyberpunk-monastery aesthetic. Every prayer is AES-256-GCM encrypted before hitting storage — your spiritual practice belongs only to you.

```
> sys.init — vault unlocked
> 0xPray v1.0 // offline-first · encrypted · AI-assisted
```

---

## Features

- **PIN-locked vault** — AES-256-GCM encryption, PBKDF2 key derivation (210,000 iterations, SHA-256)
- **Prayer journal** — write, categorize, and revisit your prayers across 7 categories
- **AI prayer generator** — Claude-powered drafts from your intentions (optional)
- **Focus reading mode** — full-screen, distraction-free reading with font selection
- **Offline-first PWA** — installable on any device, works with no internet
- **Encrypted at rest** — entire vault (prayers + settings) stored encrypted in `localStorage`
- **Plain JSON export** — download a decrypted backup anytime

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Language | TypeScript |
| Bundler | Vite 6 |
| Routing | React Router 7 |
| Styling | Tailwind CSS 4 |
| State | Zustand 5 |
| PWA | vite-plugin-pwa + Workbox |
| Testing | Vitest 2 + Testing Library |
| Linting | ESLint 9 + Prettier |
| Icons | Lucide React |
| Primitives | Radix UI |

## Security Model

| Property | Implementation |
|----------|---------------|
| Cipher | AES-256-GCM (authenticated) |
| Key derivation | PBKDF2 / 210,000 iterations / SHA-256 |
| IV | Random 96-bit per encryption |
| Salt | Random 128-bit per vault |
| PIN storage | Never stored — used only to derive key |
| Key lifetime | Memory only — cleared on lock |
| API key | Stored inside encrypted vault |

The PIN is **never** persisted. If you forget your PIN, the vault data is unrecoverable by design.

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# → http://localhost:5173
```

Open the app, create a 4-digit PIN, and your encrypted vault is ready.

## AI Prayer Generation

1. Get an [Anthropic API key](https://console.anthropic.com)
2. Go to **Settings → AI → API Key**
3. Enter your key — it's stored inside your encrypted vault
4. Use the **IA** tab in the Editor to generate prayers from your intentions

The API call runs directly from the browser. No proxy, no backend.

## Prayer Categories

| Symbol | Category | Portuguese |
|--------|----------|------------|
| ☀ | Morning | Manhã |
| ☽ | Night | Noite |
| ✝ | Intercession | Intercessão |
| ♥ | Gratitude | Gratidão |
| ◈ | Repentance | Arrependimento |
| ◎ | Personal | Pessoal |
| ◬ | Cry out | Clamor |

## Scripts

```bash
npm run dev          # Start dev server (port 5173)
npm run build        # Production build
npm run preview      # Preview production build
npm test             # Run unit tests
npm run test:ui      # Vitest UI
npm run lint         # ESLint
npm run format       # Prettier
```

## Project Structure

```
src/
├── components/
│   ├── layout/       # AppShell, BottomNav
│   ├── pin/          # PinScreen (setup / unlock / change)
│   ├── prayer/       # PrayerCard, AIGenerator
│   └── ui/           # Button, Input, Textarea, Badge, Toaster
├── hooks/            # useToast
├── lib/
│   ├── ai.ts         # Anthropic Claude API client
│   ├── crypto.ts     # AES-256-GCM + PBKDF2
│   ├── storage.ts    # Vault CRUD (localStorage)
│   └── utils.ts      # Helpers, category maps
├── pages/
│   ├── Editor.tsx    # Create / edit prayer (Manual + AI tabs)
│   ├── Focus.tsx     # Full-screen reading mode
│   ├── Home.tsx      # Dashboard with stats
│   ├── Prayers.tsx   # List with search + filters
│   └── Settings.tsx  # PIN, API key, model, export
├── store/
│   └── vault.ts      # Zustand store (lockState, key, prayers)
└── types/
    └── index.ts      # Prayer, Vault, AppLockState types
```

## PWA Installation

On mobile (iOS/Android) or desktop (Chrome/Edge): open the app in the browser and use **"Add to Home Screen"** / **"Install"**. The app then runs standalone, offline-capable, with no browser UI.

## Development Notes

- Tailwind CSS 4 is configured via `@theme` in `index.css` — no `tailwind.config.ts`
- No backend required — all data stays on your device
- Tests run with `TEMP="E:/tmp" npx vitest run` if system temp is on a full drive

## License

MIT — fork it, adapt it, pray with it.
