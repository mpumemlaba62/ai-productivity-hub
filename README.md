# AI Productivity Suite

A modern, responsive web application that combines three AI-powered productivity tools into a single polished dashboard:

- ✉️ **Smart Email Generator** — draft professional emails from a few details and a chosen tone.
- 📝 **Meeting Notes Summarizer** — turn raw transcripts into executive summaries, action items, and decisions.
- ✅ **AI Task Planner & Scheduler** — generate a prioritized, time-boxed schedule from your goals and available hours.

Built with **TanStack Start (React 19 + Vite 7)**, **Tailwind CSS v4**, **shadcn/ui**, and the **Lovable AI Gateway** (Gemini).

---

## ✨ Features

- **Unified dashboard** with usage stats and recent activity feed
- **Three AI tools** powered by structured outputs (Zod-validated)
- **Dark / light mode** with persisted preference
- **Responsive layout** with a collapsible sidebar
- **Copy / download / regenerate** actions on every generated result
- **AI disclaimer** shown on every generated output
- **Accessible UI** built on Radix primitives via shadcn/ui
- **Loading and empty states** across every tool

---

## 🧱 Tech Stack

| Layer            | Tech                                                          |
| ---------------- | ------------------------------------------------------------- |
| Framework        | TanStack Start v1 (React 19, file-based routing, SSR-capable) |
| Bundler          | Vite 7                                                        |
| Styling          | Tailwind CSS v4 (OKLCH design tokens in `src/styles.css`)     |
| UI components    | shadcn/ui + Radix UI + lucide-react icons                     |
| State            | React Context (`src/context/app-context.tsx`) + localStorage  |
| Server functions | `createServerFn` from `@tanstack/react-start`                 |
| AI               | Vercel `ai` SDK + Lovable AI Gateway (`google/gemini-3-flash-preview`) |
| Validation       | Zod                                                           |

---

## 📂 Project Structure

```
src/
├── components/
│   ├── ai-disclaimer.tsx       # "AI may make mistakes" notice
│   ├── app-header.tsx          # Top bar: theme toggle, profile
│   ├── app-sidebar.tsx         # Collapsible nav
│   └── ui/                     # shadcn/ui primitives
├── context/
│   └── app-context.tsx         # Usage stats, activity log, theme
├── hooks/
│   └── use-mobile.tsx
├── lib/
│   ├── ai-gateway.server.ts    # Lovable AI Gateway provider (server only)
│   ├── ai.functions.ts         # generateEmail / summarizeMeeting / planTasks
│   └── utils.ts
├── routes/
│   ├── __root.tsx              # Dashboard shell (sidebar + header + <Outlet/>)
│   ├── index.tsx               # Dashboard home
│   ├── email.tsx               # Smart Email Generator
│   ├── meetings.tsx            # Meeting Notes Summarizer
│   ├── planner.tsx             # AI Task Planner
│   ├── settings.tsx            # Theme + clear history
│   └── help.tsx                # Usage tips
├── router.tsx
├── server.ts
├── start.ts
└── styles.css                  # Design tokens & global theme
```

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh) ≥ 1.1 (preferred) or Node.js ≥ 20

### Install

```bash
bun install
```

### Run the dev server

```bash
bun run dev
```

The app will be available at **http://localhost:8080**.

### Build for production

```bash
bun run build
```

---

## 🔑 Environment Variables

When deployed via Lovable, the AI Gateway is configured automatically — no setup required.

For local development outside Lovable, set:

```bash
LOVABLE_API_KEY=your_lovable_api_key
```

The key is read inside `src/lib/ai-gateway.server.ts` and only used in server-side handlers — it is never exposed to the browser.

---

## 🤖 AI Service Layer

All AI calls live in `src/lib/ai.functions.ts` as TanStack server functions:

| Function            | Input                                     | Output                                              |
| ------------------- | ----------------------------------------- | --------------------------------------------------- |
| `generateEmail`     | recipient, subject, tone, context         | `{ subject, body }`                                 |
| `summarizeMeeting`  | transcript                                | `{ summary, actionItems[], decisions[] }`           |
| `planTasks`         | goal, hoursAvailable, deadline (optional) | `{ tasks: [{ title, priority, durationMins, ... }]}`|

Each function uses `generateObject` with a Zod schema, so the UI receives structured, type-safe results.

---

## 🎨 Design System

Colors, gradients, and shadows are defined as semantic tokens in `src/styles.css` (HSL/OKLCH). Components consume them through Tailwind utilities like `bg-primary`, `text-muted-foreground`, and `shadow-glow`. Avoid hardcoded color utilities (e.g. `bg-white`, `text-black`) so the dark theme stays consistent.

---

## ♿ Accessibility

- Keyboard-navigable sidebar and dialogs (Radix primitives)
- Visible focus rings on interactive elements
- `aria-label`s on icon-only buttons
- Color contrast tuned in both themes

---

## 📦 Deliverables Checklist

- [x] Complete React + TypeScript application
- [x] Fully responsive dashboard
- [x] Reusable components & shadcn/ui primitives
- [x] AI service integration (Lovable AI Gateway)
- [x] Loading, empty, and error states
- [x] Dark mode + theme persistence
- [x] README with setup instructions

---

## 📄 License

MIT — built with [Lovable](https://lovable.dev).
