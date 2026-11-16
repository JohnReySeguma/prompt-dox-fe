/**
 * The bridge between Auth.js (which owns the tokens, in its encrypted JWT
 * cookie) and the API client (which needs the access token on every call).
 * `AuthBridge` registers these handlers from inside `SessionProvider`.
 *
 * The refresh token never reaches the browser: refreshing goes through the
 * Auth.js `jwt` callback, which rotates the pair and stores the new one.
 */
interface AuthHandlers {
  /** Asks Auth.js to rotate the tokens now. Resolves to the new access token, or null if that failed. */
  refresh: () => Promise<string | null>;
  /** Called on a 401 that a refresh can't fix. Signs the user out. */
  onUnauthorized: () => void;
}

let accessToken: string | null = null;
let handlers: AuthHandlers | null = null;
let inflightRefresh: Promise<string | null> | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAuthHandlers(next: AuthHandlers | null): void {
  handlers = next;
}

/**
 * Refresh tokens are single use, and reusing one revokes every session, so
 * all callers share one in-flight refresh instead of starting their own.
 */
export function refreshAccessToken(): Promise<string | null> {
  if (!handlers) return Promise.resolve(null);
  if (!inflightRefresh) {
    const run = handlers.refresh;
    inflightRefresh = run()
      .then((token) => {
        if (token) accessToken = token;
        return token;
      })
      .catch(() => null)
      .finally(() => {
        inflightRefresh = null;
      });
  }
  return inflightRefresh;
}

export function handleUnauthorized(): void {
  accessToken = null;
  handlers?.onUnauthorized();
}
