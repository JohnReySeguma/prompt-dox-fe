import { apiFetch, apiRequest } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import type { components } from "@/types/api";
import type { ChatMessage, Citation } from "@/types";

type ApiMessage = components["schemas"]["MessageOut"];

export function toChatMessage(message: ApiMessage): ChatMessage {
  return { id: message.id, role: message.role, content: message.content, citations: message.citations, createdAt: message.createdAt };
}

/** Oldest first. */
export async function getMessages(documentId: string): Promise<ChatMessage[]> {
  const { messages } = await apiFetch<{ messages: ApiMessage[] }>(`/v1/documents/${encodeURIComponent(documentId)}/messages`);
  return messages.map(toChatMessage);
}

/** Starts a new conversation. */
export function clearMessages(documentId: string): Promise<void> {
  return apiFetch<void>(`/v1/documents/${encodeURIComponent(documentId)}/messages`, { method: "DELETE" });
}

/** Assistant messages only. */
export function sendFeedback(messageId: string, helpful: boolean): Promise<void> {
  return apiFetch<void>(`/v1/messages/${encodeURIComponent(messageId)}/feedback`, { method: "POST", json: { helpful } });
}

export type ChatEvent =
  | { event: "status"; data: { stage: "searching"; passages: number } | { stage: "writing" } }
  | { event: "citation"; data: { index: number } & Citation }
  | { event: "delta"; data: { text: string } }
  | { event: "done"; data: { userMessage: ApiMessage; message: ApiMessage; usage: { queriesToday: number } } }
  | { event: "error"; data: { code: string; message: string } };

/** Parses one SSE frame (`event:` + `data:` lines). Returns null for comments and unknown events. */
function parseFrame(frame: string): ChatEvent | null {
  let event = "message";
  const data: string[] = [];
  for (const line of frame.split("\n")) {
    if (!line || line.startsWith(":")) continue;
    const colon = line.indexOf(":");
    const field = colon === -1 ? line : line.slice(0, colon);
    let value = colon === -1 ? "" : line.slice(colon + 1);
    if (value.startsWith(" ")) value = value.slice(1);
    if (field === "event") event = value;
    else if (field === "data") data.push(value);
  }
  if (!data.length) return null;
  try {
    const payload: unknown = JSON.parse(data.join("\n"));
    if (["status", "citation", "delta", "done", "error"].includes(event)) {
      return { event, data: payload } as ChatEvent;
    }
  } catch {
    // Ignore a malformed frame rather than failing the whole answer.
  }
  return null;
}

/**
 * Asks a question and yields server-sent events as they arrive. Uses `fetch`
 * (not `EventSource`, which can't POST or send headers).
 *
 * Throws `ApiError` if the request is refused before streaming starts
 * (validation, not found, not ready, daily limit, rate limit). Aborting the
 * signal stops the stream; the server then saves and counts nothing.
 */
export async function* streamChat(documentId: string, question: string, signal?: AbortSignal): AsyncGenerator<ChatEvent> {
  const response = await apiRequest(`/v1/documents/${encodeURIComponent(documentId)}/chat`, {
    method: "POST",
    json: { question },
    headers: { Accept: "text/event-stream" },
    signal,
  });
  if (!response.body) {
    throw new ApiError(response.status, "invalid_response", "The answer couldn't be streamed. Please try again.");
  }

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      // Normalize CRLF; a lone trailing "\r" waits for its "\n" in the next chunk.
      buffer = (buffer + value).replace(/\r\n/g, "\n");
      // Frames end with a blank line; keep any partial frame for the next chunk.
      let boundary = buffer.indexOf("\n\n");
      while (boundary !== -1) {
        const parsed = parseFrame(buffer.slice(0, boundary));
        buffer = buffer.slice(boundary + 2);
        if (parsed) yield parsed;
        boundary = buffer.indexOf("\n\n");
      }
    }
    const tail = parseFrame(buffer);
    if (tail) yield tail;
  } finally {
    reader.releaseLock();
  }
}
