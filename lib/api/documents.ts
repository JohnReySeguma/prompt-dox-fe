import { API_URL, apiFetch } from "@/lib/api/client";
import { ApiError, errorFromParts, networkError } from "@/lib/api/errors";
import { getAccessToken, handleUnauthorized, refreshAccessToken } from "@/lib/api/session";
import type { components } from "@/types/api";
import type { DocPage, DocumentItem } from "@/types";

type ApiDocument = components["schemas"]["DocumentOut"];
type PagesOut = components["schemas"]["PagesOut"];

export type DocumentFilter = "all" | "ready" | "processing";

export function toDocumentItem(doc: ApiDocument): DocumentItem {
  return { ...doc, error: doc.error ?? null };
}

/** Newest first. `processing` means indexing or failed. */
export async function listDocuments(params: { status?: DocumentFilter; q?: string } = {}): Promise<DocumentItem[]> {
  const search = new URLSearchParams();
  if (params.status && params.status !== "all") search.set("status", params.status);
  if (params.q?.trim()) search.set("q", params.q.trim());
  const query = search.size ? `?${search}` : "";
  const { documents } = await apiFetch<{ documents: ApiDocument[] }>(`/v1/documents${query}`);
  return documents.map(toDocumentItem);
}

export async function getDocument(id: string): Promise<DocumentItem> {
  return toDocumentItem(await apiFetch<ApiDocument>(`/v1/documents/${encodeURIComponent(id)}`));
}

/** `document_not_ready` (409) only when nothing has been parsed yet. */
export async function getPages(id: string, range: { from?: number; to?: number } = {}): Promise<{ pageCount: number; pages: DocPage[] }> {
  const search = new URLSearchParams();
  if (range.from) search.set("from", String(range.from));
  if (range.to) search.set("to", String(range.to));
  const query = search.size ? `?${search}` : "";
  const { pageCount, pages } = await apiFetch<PagesOut>(`/v1/documents/${encodeURIComponent(id)}/pages${query}`);
  return { pageCount, pages };
}

/** Three while ready, empty while indexing. */
export async function getSuggestions(id: string): Promise<string[]> {
  const { suggestions } = await apiFetch<{ suggestions: string[] }>(`/v1/documents/${encodeURIComponent(id)}/suggestions`);
  return suggestions;
}

/** Name is 1–200 characters. */
export async function renameDocument(id: string, name: string): Promise<DocumentItem> {
  return toDocumentItem(
    await apiFetch<ApiDocument>(`/v1/documents/${encodeURIComponent(id)}`, { method: "PATCH", json: { name } }),
  );
}

export function deleteDocument(id: string): Promise<void> {
  return apiFetch<void>(`/v1/documents/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export interface UploadOptions {
  /** 0–100, from the browser's upload progress events. */
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
}

function sendUpload(file: File, token: string | null, options: UploadOptions): Promise<{ status: number; body: string; retryAfter: string | null }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_URL}/v1/documents/upload`);
    // No Content-Type: the browser sets the multipart boundary itself.
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) options.onProgress?.(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      // getResponseHeader() logs a console error for headers CORS doesn't expose; read the exposed list instead.
      const retryAfter = /^retry-after:\s*(.+)$/im.exec(xhr.getAllResponseHeaders())?.[1]?.trim() ?? null;
      resolve({ status: xhr.status, body: xhr.responseText, retryAfter });
    };
    xhr.onerror = () => reject(networkError());
    xhr.onabort = () => reject(new DOMException("Upload cancelled", "AbortError"));
    options.signal?.addEventListener("abort", () => xhr.abort(), { once: true });

    const form = new FormData();
    form.append("file", file);
    xhr.send(form);
  });
}

/**
 * Multipart upload with progress. Resolves (202) with the new document in
 * `indexing`. Uses XHR because `fetch` can't report upload progress.
 */
export async function uploadDocument(file: File, options: UploadOptions = {}): Promise<DocumentItem> {
  let result = await sendUpload(file, getAccessToken(), options);

  if (result.status === 401) {
    const error = errorFromParts(result.status, result.body, null);
    const fresh = error.code === "token_expired" ? await refreshAccessToken() : null;
    if (!fresh) {
      handleUnauthorized();
      throw error;
    }
    options.onProgress?.(0);
    result = await sendUpload(file, fresh, options);
    if (result.status === 401) handleUnauthorized();
  }

  if (result.status < 200 || result.status >= 300) {
    throw errorFromParts(result.status, result.body, result.retryAfter);
  }
  try {
    return toDocumentItem(JSON.parse(result.body) as ApiDocument);
  } catch {
    throw new ApiError(result.status, "invalid_response", "The upload finished, but we couldn't read the reply. Refresh to see the file.");
  }
}
