import { ApiError, errorFromResponse, isAbortError, networkError } from "@/lib/api/errors";
import { getAccessToken, handleUnauthorized, refreshAccessToken } from "@/lib/api/session";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

export interface ApiRequestInit extends Omit<RequestInit, "body"> {
  body?: BodyInit | null;
  /** Serialized as the JSON body, with `Content-Type: application/json`. */
  json?: unknown;
  /**
   * `true` (default): send the signed-in user's token, refresh it once on
   * `token_expired`, and sign out on any other 401.
   * `false`: send no token (public auth endpoints).
   * A string: send exactly this token and leave 401 handling to the caller
   * (used on the server inside Auth.js callbacks).
   */
  auth?: boolean | string;
}

function buildHeaders(init: ApiRequestInit, token: string | null): Headers {
  const headers = new Headers(init.headers);
  if (init.json !== undefined) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

async function send(path: string, init: ApiRequestInit, token: string | null): Promise<Response> {
  const { json, auth: _auth, ...rest } = init;
  void _auth;
  try {
    return await fetch(`${API_URL}${path}`, {
      ...rest,
      headers: buildHeaders(init, token),
      body: json !== undefined ? JSON.stringify(json) : init.body,
    });
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw networkError();
  }
}

/**
 * Sends a request and returns the raw `Response` once it is known to be OK.
 * Used directly for streaming; everything else goes through `apiFetch`.
 */
export async function apiRequest(path: string, init: ApiRequestInit = {}): Promise<Response> {
  const mode = init.auth ?? true;
  const token = typeof mode === "string" ? mode : mode ? getAccessToken() : null;
  const response = await send(path, init, token);
  if (response.ok) return response;

  const error = await errorFromResponse(response);
  if (response.status === 401 && mode === true) {
    if (error.code === "token_expired") {
      const fresh = await refreshAccessToken();
      if (fresh) {
        const retried = await send(path, init, fresh);
        if (retried.ok) return retried;
        const retryError = await errorFromResponse(retried);
        if (retried.status === 401) handleUnauthorized();
        throw retryError;
      }
    }
    handleUnauthorized();
  }
  throw error;
}

/** Typed JSON request against the PromptDox API. Resolves to `undefined` for 204 responses. */
export async function apiFetch<T>(path: string, init: ApiRequestInit = {}): Promise<T> {
  const response = await apiRequest(path, init);
  if (response.status === 204) return undefined as T;
  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiError(response.status, "invalid_response", "The server sent a response we couldn't read. Please try again.");
  }
}
