# PromptDox — Frontend

The web app for PromptDox, a multi-tenant AI document assistant (RAG). Upload PDFs, Word files, Markdown and text, ask questions, and get answers that cite the exact paragraph they came from.

This repo is the Next.js frontend. It talks to the PromptDox FastAPI backend; [`API_CONTRACT.md`](API_CONTRACT.md) describes every endpoint.

## Stack

Next.js 16 (App Router, Cache Components) · TypeScript (strict) · Tailwind CSS v4 · Auth.js v5 · TanStack Query · Zustand · shadcn-style primitives on Radix · Framer Motion · Lucide

## Getting started

1. Start the backend (`docker compose up -d` in the backend repo). It serves `http://localhost:4000`; check `http://localhost:4000/v1/health`.
2. Copy `.env.example` to `.env.local` and fill it in:

   | Variable | Value |
   | --- | --- |
   | `NEXT_PUBLIC_API_URL` | `http://localhost:4000` |
   | `AUTH_SECRET` | Any long random string (`npx auth secret` makes one) |
   | `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Your Google OAuth web client. `AUTH_GOOGLE_ID` must equal the backend's `GOOGLE_CLIENT_ID`. Redirect URI: `http://localhost:3000/api/auth/callback/google` |

3. Run it on port 3000 (the backend's CORS only allows `http://localhost:3000`):

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # type-check + production build
npm run lint
npm run gen:api   # regenerate types/api.ts from the running backend's OpenAPI spec
```

No account? **Try the demo** opens `/demo`: seven sample documents with pre-written answers and working citations. It runs entirely in the browser, so it never creates an account or calls the API.

## How it fits together

- **Auth** (`auth.ts`): Auth.js keeps the backend's access and refresh tokens in its encrypted JWT cookie. Only Google and email accounts sign in. Providers: email/password (`POST /v1/auth/login`), Google (Google's ID token is traded at `POST /v1/auth/google`), and `session`, which adopts the session returned by `POST /v1/auth/register`. The access token is refreshed about a minute before it expires. Refresh tokens are single use, so concurrent refreshes share one rotation. Only the access token reaches the browser.
- **API client** (`lib/api/`): `apiFetch<T>()` adds the base URL and Bearer token, turns the error envelope into an `ApiError`, refreshes once on `token_expired`, and signs out on any other 401. Endpoint modules: `auth`, `me`, `documents`, `chat`.
- **Data** (`lib/queries.ts`): TanStack Query caches the documents, pages, messages, user, usage and settings. The document list is polled every 3 s while anything is indexing; there is no event stream.
- **Uploads** (`hooks/use-upload.ts`): checked in the browser first, then sent with `XMLHttpRequest` so progress can be shown. The `uploading` status exists only in the browser.
- **Chat** (`hooks/use-chat.ts`): `POST /v1/documents/{id}/chat` is read as server-sent events through `fetch`. Deltas stream into the message, `citation` events fill `citations[n-1]`, and `done` swaps in the saved messages. Stop aborts the request, and nothing is saved.

## Routes

| Route | What it shows |
| --- | --- |
| `/` | Landing page with a self-playing hero, features, how it works and pricing |
| `/features`, `/pricing` | Marketing detail pages |
| `/sign-in`, `/sign-up` | Email/password and Google. Signed-in users are sent to the dashboard |
| `/demo`, `/demo/[docId]` | Public, read-only demo with sample documents (no account, no API calls) |
| `/forgot-password`, `/reset-password?token=` | Password reset via the emailed link |
| `/dashboard` | Upload with progress, then indexing to ready by polling. Library with search, filter, rename and delete |
| `/workspace/[docId]` | Document pages and chat side by side. Citations scroll to and highlight the cited paragraph |
| `/profile` | Name, Google connection, usage quotas, answer preferences, plan switch (demo: no payment) |

## Project structure

```
app/            (marketing) · (auth) · (dashboard) route groups, api/auth (Auth.js)
auth.ts         Auth.js configuration
components/     branding · ui · marketing · dashboard · workspace · auth · profile · billing · providers
content/        static copy: pricing, hero animation script, demo documents and answers
hooks/          useChat (SSE), useDemoChat, useUpload, useCurrentUser, useSignOut, useTypewriter (hero only)
lib/api/        typed API client and endpoint modules
lib/queries.ts  TanStack Query hooks and keys
store/          Zustand: in-flight uploads, toasts
types/          api.ts (generated from OpenAPI), index.ts (UI types)
```
