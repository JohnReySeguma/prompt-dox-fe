# PromptDox — Frontend Prototype

A **UI-only** prototype for PromptDox, a multi-tenant AI document assistant (RAG). Every screen runs on mock data, local Zustand state and simulated streaming. There is no backend, database or auth provider.

## Stack

Next.js 16 (App Router, Cache Components) · TypeScript (strict) · Tailwind CSS v4 · shadcn-style primitives on Radix · Framer Motion · Lucide · Zustand

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # type-checks and prerenders all routes
npm run lint
```

## Routes

| Route | What it shows |
| --- | --- |
| `/` | Landing page: hero with a self-playing demo, feature grid, how-it-works timeline, pricing with billing toggle |
| `/features`, `/pricing` | Marketing detail pages (security section, FAQ) |
| `/sign-in`, `/sign-up` | Mock auth: any credentials (or "Continue with Google") redirect to the dashboard |
| `/dashboard` | Drag-and-drop upload with simulated progress → indexing → ready, plus a document library (grid/list, search, filter, rename/delete/open) |
| `/workspace/[docId]` | Split-screen document viewer + chat. Answers stream character by character, and citation badges highlight and scroll to the source paragraph |
| `/profile` | Avatar, Google connection badge, document/query quota meters, preference toggles |

## Project structure

```
app/            (marketing) · (auth) · (dashboard) route groups
components/     branding · ui · marketing · dashboard · workspace · auth · profile
mock/           sample documents, canned answers + citations, pricing, user
store/          Zustand store (uploads, indexing, chats, simulated replies)
hooks/          useTypewriter: simulated token streaming
types/          shared TypeScript types
```

## Notes

- State lives in memory, so a full page reload resets uploads, renames and chats. Client-side navigation keeps them.
- Uploaded files are never read. Only the name and size are used to create a placeholder document.
- Mock answers are matched to questions by keyword. Try the suggested questions in each workspace.
