# PromptDox API Contract (v1)

The contract between the **PromptDox frontend** (Next.js, this repo) and the **PromptDox backend** (FastAPI + PostgreSQL/pgvector, run with Docker). The backend must implement every endpoint marked **Required**; **Optional** endpoints back UI that can stay mocked.

The response shapes mirror `types/index.ts` in this repo. Where the API adds or omits a field relative to those types, the section says so.

---

## 1. Environment

| | Value |
|---|---|
| Backend base URL (local) | `http://localhost:4000` |
| API prefix | `/v1` |
| Frontend origin (local) | `http://localhost:3000` |
| Frontend env var | `NEXT_PUBLIC_API_URL=http://localhost:4000` |

### Backend environment variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL with the `pgvector` extension enabled |
| `JWT_SECRET` | Signs access tokens |
| `GOOGLE_CLIENT_ID` | Audience used to verify Google ID tokens. Same value as the frontend's `AUTH_GOOGLE_ID` |
| `ANTHROPIC_API_KEY` | Answer generation (Claude) |
| `EMBEDDINGS_API_KEY` | Embeddings provider (Claude does not produce embeddings; e.g. Voyage AI, or a local model with no key) |
| `UPLOAD_DIR` | Local directory for uploaded files, mounted as a Docker volume (e.g. `/data/uploads`) |
| `FRONTEND_URL` | `http://localhost:3000`, used to build password-reset links |
| `CORS_ORIGINS` | `http://localhost:3000` |

### Frontend environment variables (for reference)

`NEXT_PUBLIC_API_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`

---

## 2. Conventions

- **JSON keys are camelCase** (`sizeBytes`, `uploadedAt`). In FastAPI, use Pydantic models with `alias_generator=to_camel` and `populate_by_name=True`, and serialize with `by_alias=True`.
- **Timestamps** are ISO 8601 strings in UTC with a `Z` suffix: `"2026-10-28T09:14:00Z"`.
- **IDs** are opaque strings. Examples use prefixes (`usr_`, `ws_`, `doc_`, `msg_`); any unique string works.
- **Authentication:** every endpoint except `/v1/health`, `/v1/auth/*` and `/openapi.json` requires `Authorization: Bearer <accessToken>`.
- **Tenancy:** the workspace is derived from the access token, never from the request body or query. Every query filters by workspace; a document from another workspace returns `404`, not `403`.
- **CORS:** allow origin `http://localhost:3000`, methods `GET, POST, PATCH, DELETE, OPTIONS`, headers `Authorization, Content-Type`.
- **OpenAPI:** serve the spec at `/openapi.json`. The frontend generates TypeScript types from it.

### Error format

Every non-2xx response uses this body:

```json
{
  "error": {
    "code": "plan_limit_reached",
    "message": "You've reached the 10-document limit on your plan.",
    "details": { "limit": 10, "plan": "free" }
  }
}
```

`message` is shown to the user as is, so write it in plain language. `details` is optional.

| HTTP | `code` | When |
|---|---|---|
| 400 | `validation_error` | Body or query fails validation. `details.fields` maps field → message |
| 400 | `unsupported_format` | Upload is not `.pdf`, `.docx`, `.md` or `.txt` |
| 400 | `invalid_reset_token` | Password-reset token is unknown, used or expired |
| 401 | `unauthorized` | Missing or invalid access token |
| 401 | `token_expired` | Access token expired; the client should call `/v1/auth/refresh` |
| 401 | `invalid_credentials` | Wrong email or password |
| 401 | `invalid_google_token` | Google ID token failed verification |
| 403 | `plan_limit_reached` | Document count is at the plan limit |
| 403 | `demo_restricted` | Action not allowed in a demo session (see §4.8) |
| 404 | `document_not_found` | Unknown document, or it belongs to another workspace |
| 409 | `email_taken` | Registration with an email that already exists |
| 409 | `document_not_ready` | Chat on a document whose status is not `ready` |
| 413 | `file_too_large` | Upload over 50 MB |
| 422 | `too_many_pages` | Parsed document exceeds the page cap (500 pages) |
| 429 | `daily_query_limit_reached` | Questions today reached the plan limit |
| 429 | `rate_limited` | Per-user request rate exceeded. Include a `Retry-After` header (seconds) |
| 500 | `internal_error` | Unexpected failure. Never include stack traces |

---

## 3. Shared objects

These match `types/index.ts`.

### User (`/v1/me`)

Extends `UserProfile` with `id`, `plan`, and `isDemo`.

```json
{
  "id": "usr_7f3k2a",
  "name": "Avery Santos",
  "email": "avery.santos@northwind.example",
  "initials": "AS",
  "role": "Workspace Admin",
  "workspace": "Northwind Analytics",
  "memberSince": "2026-03-14T00:00:00Z",
  "googleConnected": true,
  "queriesToday": 64,
  "plan": "free",
  "isDemo": false
}
```

- `initials`: up to two uppercase letters from `name`.
- `role`: display label. Every user who creates a workspace is `"Workspace Admin"`.
- `plan`: `"free"` or `"pro"` (`SelfServePlan`).

### Document

Matches `DocumentItem` **without `pages`** (served by `GET /v1/documents/{id}/pages`), plus `pageCount` and `error`.

```json
{
  "id": "doc_q3report",
  "name": "Q3-2026-Financial-Report.pdf",
  "format": "pdf",
  "sizeBytes": 2480312,
  "uploadedAt": "2026-10-28T09:14:00Z",
  "status": "ready",
  "progress": 100,
  "chunkCount": 214,
  "pageCount": 4,
  "summary": "Quarterly results for Northwind Analytics: revenue, margins, operating costs and Q4 guidance.",
  "error": null
}
```

| Field | Rules |
|---|---|
| `format` | `"pdf" \| "docx" \| "md" \| "txt"`, taken from the file extension |
| `status` | Server values: `"indexing" \| "ready" \| "failed"`. `"uploading"` exists only in the browser while the upload request is in flight; the server never returns it |
| `progress` | 0–100 indexing progress while `status` is `"indexing"`; `100` when `ready` |
| `chunkCount` | Number of indexed passages; `0` until `ready` |
| `pageCount` | `0` until parsing finishes |
| `summary` | One or two sentences generated during indexing. While indexing: `"Indexing. A summary will appear when it finishes."` |
| `error` | `null`, or a plain-language reason when `status` is `"failed"` (e.g. `"This PDF is password-protected."`) |

### Page

Matches `DocPage`.

```json
{
  "number": 4,
  "heading": "Outlook & Risks",
  "paragraphs": [
    "For Q4 2026, management guides revenue between $52.0M and $53.5M and expects to reach non-GAAP operating break-even by the end of the fiscal year.",
    "Key risks include GPU supply constraints, foreign-exchange headwinds from a strengthening USD, and evolving AI regulatory requirements in the EU.",
    "The board approved a $25M share repurchase program, to be executed opportunistically over the next 18 months."
  ]
}
```

- `number` is 1-based.
- `heading` is the page's first heading. If the page has none, use `"Page {number}"`.
- Paragraph order and indexes must never change after indexing: citations point at `paragraphs[paragraph - 1]`.
- Markdown and text files have no physical pages. Split them into pages at top-level headings, or every ~400 words when there are none.

### Citation

Matches `Citation`. Both values are 1-based.

```json
{ "page": 4, "paragraph": 2 }
```

### ChatMessage

Matches `ChatMessage`, plus `createdAt`. The server never sends `streaming`; that flag is client-only.

```json
{
  "id": "msg_a91",
  "role": "assistant",
  "content": "For Q4 2026, management guides revenue of $52.0M–$53.5M [1]. The main risks are GPU supply constraints, FX headwinds from a stronger USD, and evolving EU AI regulation [2].",
  "citations": [
    { "page": 4, "paragraph": 1 },
    { "page": 4, "paragraph": 2 }
  ],
  "createdAt": "2026-11-16T10:02:11Z"
}
```

**Citation markers:** assistant `content` contains `[n]` markers, where `[n]` refers to `citations[n - 1]`. Every marker must have a matching entry, and every entry must point at a paragraph that exists. User messages have `"citations": []`. If the backend uses Claude's native citations feature internally, it must convert the result to this marker format before saving and streaming.

### Usage

```json
{
  "plan": "free",
  "documents": { "used": 7, "limit": 10 },
  "queriesToday": { "used": 64, "limit": 100, "resetsAt": "2026-11-17T00:00:00Z" },
  "passagesIndexed": 612
}
```

`limit` is `null` when unlimited. The plan limits match `PLAN_LIMITS` in `mock/site.ts`:

| Plan | `documents.limit` | `queriesToday.limit` |
|---|---|---|
| `free` | 10 | 100 |
| `pro` | 500 | `null` |

`queriesToday` resets at midnight UTC.

### Settings

```json
{
  "strictCitations": true,
  "streamAnswers": true,
  "weeklyDigest": false,
  "allowSharing": false
}
```

`strictCitations: true` means: when no retrieved passage supports an answer, reply that the document doesn't say, with `"citations": []`, instead of answering from general knowledge.

### AuthSession

Returned by every sign-in endpoint.

```json
{
  "user": { "...": "User object" },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "rt_4f8c0d6e2b...",
  "expiresIn": 900
}
```

- Access token: JWT, 15 minutes (`expiresIn` is in seconds). Claims: `sub` (user id), `wid` (workspace id), `demo` (boolean), `exp`.
- Refresh token: opaque, 30 days, stored hashed. Single use: each refresh issues a new one and revokes the old one. Logout and password reset revoke all of the user's refresh tokens.

---

## 4. Endpoints

### 4.1 Authentication

#### `POST /v1/auth/register` (Required)

Create an account and its workspace. New users start on the `free` plan.

```json
{ "name": "Avery Santos", "email": "avery.santos@northwind.example", "password": "correct-horse-battery" }
```

`201` → `AuthSession`. Errors: `validation_error` (password under 8 characters, invalid email), `email_taken`.

The workspace name defaults to `"{first name}'s workspace"`.

#### `POST /v1/auth/login` (Required)

```json
{ "email": "avery.santos@northwind.example", "password": "correct-horse-battery" }
```

`200` → `AuthSession`. Errors: `invalid_credentials` (same error for an unknown email and a wrong password).

#### `POST /v1/auth/google` (Required)

Next.js (Auth.js) completes Google OAuth at `http://localhost:3000/api/auth/callback/google`, takes `account.id_token` from the `jwt` callback, and sends it here.

```json
{ "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6..." }
```

`200` → `AuthSession`. Errors: `invalid_google_token`.

The backend must verify the token's signature with Google, `aud == GOOGLE_CLIENT_ID`, `iss` in (`accounts.google.com`, `https://accounts.google.com`), `exp` not passed, and `email_verified == true`. Then:

- Google `sub` already linked → sign that user in.
- Email matches an existing user → link Google to that user and sign in.
- Otherwise → create the user and workspace (`name` from the token) and sign in.

Set `googleConnected: true` on the user.

#### `POST /v1/auth/refresh` (Required)

```json
{ "refreshToken": "rt_4f8c0d6e2b..." }
```

`200` → `AuthSession` with a new token pair. Errors: `unauthorized` (unknown, revoked or expired token). Reusing an already-rotated refresh token revokes all of that user's tokens.

#### `POST /v1/auth/logout` (Required)

```json
{ "refreshToken": "rt_4f8c0d6e2b..." }
```

`204`. Succeeds even if the token is already revoked.

#### `POST /v1/auth/password/forgot` (Required)

```json
{ "email": "avery.santos@northwind.example" }
```

`204` whether or not the email exists, so the response doesn't reveal which emails have accounts.

If the account exists, create a single-use token valid for 1 hour and send `{FRONTEND_URL}/reset-password?token={token}`. **Locally, log the link to the console instead of sending email.** Google-only accounts get the same link, which lets them add a password.

#### `POST /v1/auth/password/reset` (Required)

```json
{ "token": "pr_9d2f7c1a...", "newPassword": "a-new-strong-password" }
```

`204`. Mark the token used and revoke all refresh tokens. Errors: `invalid_reset_token`, `validation_error` (under 8 characters).

The frontend page for this is `/reset-password?token=...` (already built).

#### `POST /v1/auth/demo` (Required)

"Try the demo" button. No body.

`200` → `AuthSession` where `user.isDemo` is `true`:

```json
{
  "user": {
    "id": "usr_demo_x81",
    "name": "Demo visitor",
    "email": "demo@promptdox.app",
    "initials": "DV",
    "role": "Workspace Admin",
    "workspace": "Northwind Analytics (demo)",
    "memberSince": "2026-11-16T10:00:00Z",
    "googleConnected": false,
    "queriesToday": 0,
    "plan": "free",
    "isDemo": true
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "rt_demo_51c...",
  "expiresIn": 900
}
```

Each call creates a **fresh, private demo workspace** pre-loaded with the seed documents (§6), already `ready`, with indexes copied from a pre-built seed workspace so no embeddings are recomputed. One visitor's renames, deletes and chats never affect another's. Delete demo workspaces 24 hours after creation. Demo limits are in §4.8.

### 4.2 Account

#### `GET /v1/me` (Required)

`200` → `User`.

#### `PATCH /v1/me` (Required)

```json
{ "name": "Avery J. Santos" }
```

`200` → updated `User` (`initials` recomputed). Errors: `validation_error` (empty or over 80 characters).

#### `GET /v1/me/usage` (Required)

`200` → `Usage`.

#### `GET /v1/me/settings` (Required)

`200` → `Settings`.

#### `PATCH /v1/me/settings` (Required)

Partial update; send only the fields that changed.

```json
{ "weeklyDigest": true }
```

`200` → full `Settings`.

#### `POST /v1/me/plan` (Required)

Demo plan switch. **No payment is taken.**

```json
{ "plan": "pro" }
```

`200` → `Usage` with the new limits. Switching back to `free` keeps existing documents even above 10; it only blocks new uploads.

#### `POST /v1/me/connections/google` (Optional)

```json
{ "idToken": "eyJhbGciOiJSUzI1NiIs..." }
```

`200` → `User` with `googleConnected: true`. Verified the same way as `/v1/auth/google`.

#### `DELETE /v1/me/connections/google` (Optional)

`200` → `User` with `googleConnected: false`. Error `validation_error` if the user has no password (it would lock them out).

### 4.3 Documents

#### `GET /v1/documents` (Required)

Query parameters, all optional:

| Param | Values |
|---|---|
| `status` | `ready` or `processing` (`processing` = `indexing` or `failed`) |
| `q` | Case-insensitive match on `name` or `summary` |

`200`, newest `uploadedAt` first, no pagination (plans cap at 500 documents):

```json
{
  "documents": [
    {
      "id": "doc_q3report",
      "name": "Q3-2026-Financial-Report.pdf",
      "format": "pdf",
      "sizeBytes": 2480312,
      "uploadedAt": "2026-10-28T09:14:00Z",
      "status": "ready",
      "progress": 100,
      "chunkCount": 214,
      "pageCount": 4,
      "summary": "Quarterly results for Northwind Analytics: revenue, margins, operating costs and Q4 guidance.",
      "error": null
    },
    {
      "id": "doc_vecnotes",
      "name": "vector-search-research.txt",
      "format": "txt",
      "sizeBytes": 38412,
      "uploadedAt": "2026-11-04T08:02:00Z",
      "status": "indexing",
      "progress": 40,
      "chunkCount": 0,
      "pageCount": 2,
      "summary": "Indexing. A summary will appear when it finishes.",
      "error": null
    }
  ]
}
```

**Polling:** while any document has `status: "indexing"`, the frontend calls this endpoint every 3 seconds and stops when none do. There is no event stream for document status. Keep this endpoint fast (no file reads, no AI calls).

#### `POST /v1/documents/upload` (Required)

`Content-Type: multipart/form-data` with one field:

| Field | Type |
|---|---|
| `file` | The file. Extension must be `.pdf`, `.docx`, `.md` or `.txt`; at most 50 MB |

The frontend sends this with `XMLHttpRequest` so it can show upload progress; that progress is client-side only.

`202` → the new `Document`, already in `indexing`:

```json
{
  "id": "doc_8k2m1q",
  "name": "Board-Meeting-Minutes-Oct.pdf",
  "format": "pdf",
  "sizeBytes": 1204880,
  "uploadedAt": "2026-11-16T10:05:42Z",
  "status": "indexing",
  "progress": 0,
  "chunkCount": 0,
  "pageCount": 0,
  "summary": "Indexing. A summary will appear when it finishes.",
  "error": null
}
```

Errors: `unsupported_format`, `file_too_large`, `plan_limit_reached`, `demo_restricted`.

Order of checks: plan limit, then extension, then size (read the stream with a 50 MB cap; don't trust `Content-Length` alone). Save the file to `UPLOAD_DIR/{workspaceId}/{documentId}{ext}`, insert the row, then schedule indexing with FastAPI `BackgroundTasks`.

**Indexing job:**

1. Parse into pages and paragraphs (§3 Page), keeping positions. PyMuPDF for PDF, python-docx for DOCX (page breaks or headings → pages), markdown/plain-text splitting for MD and TXT. Set `pageCount`.
2. Split into passages. Each passage stores `page`, `paragraph`, `text`, and the page heading as a prefix for embedding.
3. Embed the passages into pgvector, updating `progress` as batches finish.
4. Generate `summary` and three suggested questions with one Claude call.
5. Set `status: "ready"`, `progress: 100`, and `chunkCount`.

On any failure, set `status: "failed"` and a plain-language `error`.

`BackgroundTasks` jobs are lost when the server restarts. On startup, re-queue every document still in `indexing`.

#### `GET /v1/documents/{id}` (Required)

`200` → `Document`. Errors: `document_not_found`.

#### `GET /v1/documents/{id}/pages` (Required)

Optional query `from` and `to` (1-based, inclusive). Without them, all pages.

`200`:

```json
{
  "documentId": "doc_q3report",
  "pageCount": 4,
  "pages": [
    {
      "number": 1,
      "heading": "Executive Summary",
      "paragraphs": [
        "Northwind Analytics closed Q3 2026 with total revenue of $48.2M, a 23% increase year-over-year, driven primarily by enterprise subscription expansion across North America and APAC.",
        "Gross margin improved to 78.4% (up from 74.1% in Q3 2025) following the migration of inference workloads to reserved GPU capacity, which reduced per-query compute cost by 31%.",
        "Net revenue retention reached 128%, the highest in company history, with 14 customers now exceeding $1M in annual recurring revenue."
      ]
    }
  ]
}
```

Errors: `document_not_found`, `document_not_ready` (only when no page has been parsed yet).

#### `GET /v1/documents/{id}/suggestions` (Required)

`200`:

```json
{
  "suggestions": [
    "How much revenue did we make in Q3?",
    "What drove the gross margin improvement?",
    "What are the key risks in the outlook?"
  ]
}
```

Exactly three, under 60 characters each, answerable from the document. Empty array while indexing.

#### `PATCH /v1/documents/{id}` (Required)

```json
{ "name": "Q3 2026 Financial Report.pdf" }
```

`200` → updated `Document`. Only the display name changes; `format` stays the same. Errors: `validation_error` (empty or over 200 characters), `document_not_found`.

#### `DELETE /v1/documents/{id}` (Required)

`204`. Deletes the file, pages, passages, embeddings and messages. Errors: `document_not_found`.

### 4.4 Chat

#### `GET /v1/documents/{id}/messages` (Required)

`200`, oldest first:

```json
{
  "messages": [
    {
      "id": "msg_a90",
      "role": "user",
      "content": "Give me the headline numbers for this quarter.",
      "citations": [],
      "createdAt": "2026-11-16T10:01:58Z"
    },
    {
      "id": "msg_a91",
      "role": "assistant",
      "content": "Headline: revenue of $48.2M, up 23% YoY [1], gross margin of 78.4% [2], and record net revenue retention of 128% [3].",
      "citations": [
        { "page": 1, "paragraph": 1 },
        { "page": 1, "paragraph": 2 },
        { "page": 1, "paragraph": 3 }
      ],
      "createdAt": "2026-11-16T10:02:03Z"
    }
  ]
}
```

One conversation per document per user.

#### `POST /v1/documents/{id}/chat` (Required, streamed)

Request:

```json
{ "question": "What are the key risks in the outlook?" }
```

Response: `200`, `Content-Type: text/event-stream`, `Cache-Control: no-cache`. The frontend reads it with `fetch` and a stream reader, because `EventSource` cannot send a POST body or an `Authorization` header.

Validation happens **before** streaming starts and returns a normal JSON error: `validation_error` (empty, or over 2,000 characters), `document_not_found`, `document_not_ready`, `daily_query_limit_reached`.

Events, in order:

```
event: status
data: {"stage":"searching","passages":214}

event: status
data: {"stage":"writing"}

event: delta
data: {"text":"For Q4 2026, management guides revenue of $52.0M–$53.5M"}

event: citation
data: {"index":1,"page":4,"paragraph":1}

event: delta
data: {"text":" [1]. The main risks are GPU supply constraints"}

event: citation
data: {"index":2,"page":4,"paragraph":2}

event: delta
data: {"text":", FX headwinds from a stronger USD, and evolving EU AI regulation [2]."}

event: done
data: {"userMessage":{"id":"msg_b10","role":"user","content":"What are the key risks in the outlook?","citations":[],"createdAt":"2026-11-16T10:06:00Z"},"message":{"id":"msg_b11","role":"assistant","content":"For Q4 2026, management guides revenue of $52.0M–$53.5M [1]. The main risks are GPU supply constraints, FX headwinds from a stronger USD, and evolving EU AI regulation [2].","citations":[{"page":4,"paragraph":1},{"page":4,"paragraph":2}],"createdAt":"2026-11-16T10:06:04Z"},"usage":{"queriesToday":65}}
```

| Event | Data | Rules |
|---|---|---|
| `status` | `{ stage: "searching", passages }` then `{ stage: "writing" }` | `passages` = the document's `chunkCount`; the UI shows "Searching 214 passages…" |
| `delta` | `{ text }` | Append to the answer in order. May split anywhere, including inside a `[n]` marker |
| `citation` | `{ index, page, paragraph }` | Sent **before** the `delta` containing marker `[index]`. `index` is 1-based |
| `done` | `{ userMessage, message, usage }` | Final saved messages. The client replaces its streamed copy with `message` |
| `error` | `{ code, message }` | A failure after streaming started. Save nothing and don't count the question |

Rules:

- Count the question toward `queriesToday` only when `done` is sent.
- Retrieval searches **only this document's passages, within this workspace**.
- With `strictCitations` on and nothing relevant found, answer that the document doesn't cover it, with no markers and `"citations": []`.
- If the client disconnects mid-stream, stop generating and save nothing.

#### `DELETE /v1/documents/{id}/messages` (Required)

`204`. Clears the conversation ("New conversation" button).

#### `POST /v1/messages/{id}/feedback` (Optional)

```json
{ "helpful": true }
```

`204`. Assistant messages only.

### 4.5 System

#### `GET /v1/health` (Required)

No auth. `200`:

```json
{ "status": "ok", "database": "ok", "version": "0.1.0" }
```

`503` with `"database": "error"` when the database is unreachable.

### 4.6 Not part of v1

These were considered and dropped:

- Signed-URL uploads to S3/MinIO: replaced by `POST /v1/documents/upload`.
- `GET /v1/events`: replaced by polling `GET /v1/documents`.
- Email verification and `POST /v1/contact/sales`: the frontend keeps these mocked.

### 4.7 Endpoint summary

| Method | Path | Auth | Status |
|---|---|---|---|
| POST | `/v1/auth/register` | — | Required |
| POST | `/v1/auth/login` | — | Required |
| POST | `/v1/auth/google` | — | Required |
| POST | `/v1/auth/refresh` | — | Required |
| POST | `/v1/auth/logout` | — | Required |
| POST | `/v1/auth/password/forgot` | — | Required |
| POST | `/v1/auth/password/reset` | — | Required |
| POST | `/v1/auth/demo` | — | Required |
| GET | `/v1/me` | Bearer | Required |
| PATCH | `/v1/me` | Bearer | Required |
| GET | `/v1/me/usage` | Bearer | Required |
| GET | `/v1/me/settings` | Bearer | Required |
| PATCH | `/v1/me/settings` | Bearer | Required |
| POST | `/v1/me/plan` | Bearer | Required |
| POST | `/v1/me/connections/google` | Bearer | Optional |
| DELETE | `/v1/me/connections/google` | Bearer | Optional |
| GET | `/v1/documents` | Bearer | Required |
| POST | `/v1/documents/upload` | Bearer | Required |
| GET | `/v1/documents/{id}` | Bearer | Required |
| GET | `/v1/documents/{id}/pages` | Bearer | Required |
| GET | `/v1/documents/{id}/suggestions` | Bearer | Required |
| PATCH | `/v1/documents/{id}` | Bearer | Required |
| DELETE | `/v1/documents/{id}` | Bearer | Required |
| GET | `/v1/documents/{id}/messages` | Bearer | Required |
| POST | `/v1/documents/{id}/chat` | Bearer | Required (SSE) |
| DELETE | `/v1/documents/{id}/messages` | Bearer | Required |
| POST | `/v1/messages/{id}/feedback` | Bearer | Optional |
| GET | `/v1/health` | — | Required |

### 4.8 Limits and abuse protection

The backend enforces these; the frontend only displays them.

| Limit | Value |
|---|---|
| File types | `.pdf`, `.docx`, `.md`, `.txt` |
| File size | 50 MB |
| Pages per document | 500 |
| Documents | Plan limit (§3 Usage) |
| Questions per day | Plan limit, reset at midnight UTC |
| Question length | 2,000 characters |
| Request rate | 60 requests/minute per user; 10 chat requests/minute per user |
| Auth endpoints | 10 attempts/minute per IP |
| `POST /v1/auth/demo` | 5 per hour per IP |

**Demo sessions** (`isDemo: true`) additionally:

- 20 questions per day.
- At most 3 uploads of 5 MB each (`demo_restricted` beyond that).
- Cannot call `PATCH /v1/me` with an email change, connect Google, or switch to `pro` (`demo_restricted`).

---

## 5. Docker and local setup

- Run Postgres with pgvector (e.g. image `pgvector/pgvector:pg17`) and the API in Docker Compose. Expose the API on port `4000`.
- Mount `UPLOAD_DIR` as a named volume so uploads survive container restarts.
- Run migrations (Alembic) on container start, then seed (§6).
- No Redis or object storage is required for v1.

---

## 6. Seed data

The demo workspace uses the seven sample documents the frontend currently mocks. Their exact page headings and paragraphs are in this repo:

- `mock/documents.ts`: names, formats, sizes, summaries, pages and paragraphs (`MOCK_DOCUMENTS`).
- `mock/knowledge.ts`: suggested questions per document, and the canned answers with their citations. Use these as **expected-answer test cases**: each listed question should retrieve the cited paragraphs.

Seed them as `ready` documents in a template workspace, index them once, and clone that workspace for each `POST /v1/auth/demo`. In the seed, `vector-search-research.txt` is `ready` as well (the frontend mock shows it as indexing only to demonstrate the status).

---

## 7. Frontend integration notes

Already in the frontend:

- `/forgot-password`: email form. Will call `POST /v1/auth/password/forgot`.
- `/reset-password?token=...`: new-password form. Will call `POST /v1/auth/password/reset`.
- "Try the demo" buttons (landing hero, closing call to action, sign-in and sign-up). Will call `POST /v1/auth/demo`.

Still to wire when the backend is ready:

- **Auth.js** with the Google provider and a Credentials provider. Store the backend's `AuthSession` tokens in the Auth.js JWT and refresh them through `/v1/auth/refresh` before `exp`.
- The upload, polling, chat stream and account calls described above.
- On `401 token_expired`, refresh once and retry; on any other `401`, sign out.
