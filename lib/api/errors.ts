/** Every non-2xx body from the API: `{ "error": { code, message, details? } }`. */
interface ErrorEnvelope {
  error?: { code?: string; message?: string; details?: Record<string, unknown> };
}

export type ApiErrorDetails = Record<string, unknown> & {
  /** `validation_error`: field name → message. */
  fields?: Record<string, string>;
  /** `plan_limit_reached`: the limit that was hit. */
  limit?: number;
};

/**
 * A failed API call. `message` is written for end users and can be shown as is.
 * `status` is 0 when the request never reached the server.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: ApiErrorDetails;
  /** Seconds from the `Retry-After` header on 429 responses. */
  readonly retryAfter: number | null;

  constructor(status: number, code: string, message: string, details: ApiErrorDetails = {}, retryAfter: number | null = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.retryAfter = retryAfter;
  }

  /** Per-field messages from a `validation_error`, or an empty object. */
  get fieldErrors(): Record<string, string> {
    return this.code === "validation_error" ? (this.details.fields ?? {}) : {};
  }
}

export const NETWORK_ERROR_MESSAGE = "We can't reach PromptDox right now. Check your connection and try again.";

export function networkError(): ApiError {
  return new ApiError(0, "network_error", NETWORK_ERROR_MESSAGE);
}

function parseRetryAfter(value: string | null): number | null {
  if (!value) return null;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(1, Math.ceil(seconds));
  const date = Date.parse(value);
  return Number.isNaN(date) ? null : Math.max(1, Math.ceil((date - Date.now()) / 1000));
}

/** Builds an `ApiError` from a status, headers and raw body text (shared by fetch and XHR). */
export function errorFromParts(status: number, body: string, retryAfterHeader: string | null): ApiError {
  let envelope: ErrorEnvelope = {};
  try {
    envelope = JSON.parse(body) as ErrorEnvelope;
  } catch {
    // Not JSON (e.g. a proxy error page). Fall through to the generic message.
  }
  const code = envelope.error?.code ?? (status === 429 ? "rate_limited" : "internal_error");
  const retryAfter = parseRetryAfter(retryAfterHeader);
  let message = envelope.error?.message ?? "Something went wrong. Please try again.";
  if (code === "rate_limited" && retryAfter !== null) {
    message = `You're going a bit fast. Try again in ${retryAfter}s.`;
  }
  return new ApiError(status, code, message, (envelope.error?.details ?? {}) as ApiErrorDetails, retryAfter);
}

export async function errorFromResponse(response: Response): Promise<ApiError> {
  const body = await response.text().catch(() => "");
  return errorFromParts(response.status, body, response.headers.get("Retry-After"));
}

/** The user-facing message for anything thrown by an API call. */
export function errorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (error instanceof ApiError) return error.message;
  return fallback;
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}
