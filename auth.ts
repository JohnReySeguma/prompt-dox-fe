import NextAuth, { CredentialsSignin, type Account } from "next-auth";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import * as authApi from "@/lib/api/auth";
import { apiFetch } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import type { AuthSession, User } from "@/types";

/**
 * Auth.js owns the session cookie; the FastAPI backend owns the accounts.
 * Every provider ends in an `AuthSession` from the backend, whose tokens are
 * kept in the encrypted Auth.js JWT. Only the access token is exposed to the
 * browser (see the `session` callback).
 */

/** Carries the backend's user-facing message to `signIn()` on the client as `result.code`. */
class BackendSignInError extends CredentialsSignin {
  constructor(error: unknown) {
    super();
    this.code = error instanceof ApiError ? error.message : "We couldn't sign you in. Please try again.";
  }
}

type AccountWithBackend = Account & { backendSession?: AuthSession };

/** Refresh about a minute before the access token expires. */
const REFRESH_MARGIN_MS = 60_000;

function tokenFromSession(session: AuthSession): Pick<JWT, "accessToken" | "refreshToken" | "accessTokenExpires" | "user" | "error"> {
  return {
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    // Never assume a lifetime: the backend says how long this token lasts.
    accessTokenExpires: Date.now() + session.expiresIn * 1000,
    user: session.user,
    error: undefined,
  };
}

/**
 * Refresh tokens are single use: presenting one twice revokes every session.
 * Parallel requests (two tabs, a burst of session reads) can arrive holding
 * the same old token, so they share one rotation, and a just-finished rotation
 * is reused for a short while instead of being repeated.
 */
const inflightRotations = new Map<string, Promise<AuthSession>>();
const recentRotations = new Map<string, { session: AuthSession; at: number }>();
const ROTATION_REUSE_MS = 30_000;

function rotate(refreshToken: string): Promise<AuthSession> {
  const now = Date.now();
  for (const [key, entry] of recentRotations) {
    if (now - entry.at > ROTATION_REUSE_MS) recentRotations.delete(key);
  }
  const recent = recentRotations.get(refreshToken);
  if (recent) return Promise.resolve(recent.session);

  let pending = inflightRotations.get(refreshToken);
  if (!pending) {
    pending = authApi
      .refresh(refreshToken)
      .then((session) => {
        recentRotations.set(refreshToken, { session, at: Date.now() });
        return session;
      })
      .finally(() => inflightRotations.delete(refreshToken));
    inflightRotations.set(refreshToken, pending);
  }
  return pending;
}

async function refreshToken(token: JWT): Promise<JWT> {
  if (!token.refreshToken) return { ...token, error: "RefreshFailed" };
  try {
    return { ...token, ...tokenFromSession(await rotate(token.refreshToken)) };
  } catch (error) {
    // A network blip shouldn't sign anyone out; keep the token and try again next time.
    if (error instanceof ApiError && error.status === 0) return token;
    return { ...token, error: "RefreshFailed" };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/sign-in", error: "/sign-in" },
  providers: [
    Credentials({
      id: "credentials",
      name: "Email",
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        try {
          const session = await authApi.login({ email: String(credentials.email ?? ""), password: String(credentials.password ?? "") });
          return { id: session.user.id, name: session.user.name, email: session.user.email, backend: session };
        } catch (error) {
          throw new BackendSignInError(error);
        }
      },
    }),
    /**
     * Adopts a session the browser already got from the backend (after
     * `POST /v1/auth/register`). The tokens are checked against `GET /v1/me`,
     * so a forged payload can't create a session.
     */
    Credentials({
      id: "session",
      name: "Session",
      credentials: { accessToken: {}, refreshToken: {}, expiresIn: {} },
      async authorize(credentials) {
        const accessToken = String(credentials.accessToken ?? "");
        const refresh = String(credentials.refreshToken ?? "");
        const expiresIn = Number(credentials.expiresIn);
        if (!accessToken || !refresh || !Number.isFinite(expiresIn)) return null;
        try {
          const user = await apiFetch<User>("/v1/me", { auth: accessToken });
          const session: AuthSession = { user, accessToken, refreshToken: refresh, expiresIn };
          return { id: user.id, name: user.name, email: user.email, backend: session };
        } catch (error) {
          throw new BackendSignInError(error);
        }
      },
    }),
    // AUTH_GOOGLE_ID must equal the backend's GOOGLE_CLIENT_ID so it accepts the ID token.
    Google,
  ],
  callbacks: {
    /** Google: trade Google's ID token for a backend session before the sign-in completes. */
    async signIn({ account }) {
      if (account?.provider !== "google") return true;
      if (!account.id_token) return "/sign-in?error=GoogleSignIn";
      try {
        // The same `account` object is handed to the `jwt` callback next.
        (account as AccountWithBackend).backendSession = await authApi.google(account.id_token);
        return true;
      } catch (error) {
        const code = error instanceof ApiError ? error.code : "google_failed";
        return `/sign-in?error=GoogleSignIn&code=${encodeURIComponent(code)}`;
      }
    },

    async jwt({ token, user, account, trigger, session }) {
      // Only Google and email accounts count as signed in. A backend demo
      // session (from an older build) is dropped, which signs the browser out.
      if (token.user?.isDemo || user?.backend?.user.isDemo || (account as AccountWithBackend | null)?.backendSession?.user.isDemo) {
        return null;
      }
      if (account) {
        const backend = account.provider === "google" ? (account as AccountWithBackend).backendSession : user?.backend;
        if (backend) return { ...token, ...tokenFromSession(backend) };
      }

      if (trigger === "update") {
        const update = session as { user?: Partial<User>; refresh?: boolean } | undefined;
        if (update?.user && token.user) token.user = { ...token.user, ...update.user };
        // The API answered `token_expired` earlier than we expected: rotate now.
        if (update?.refresh) return refreshToken(token);
        return token;
      }

      if (token.error || !token.accessTokenExpires) return token;
      if (Date.now() < token.accessTokenExpires - REFRESH_MARGIN_MS) return token;
      return refreshToken(token);
    },

    session({ session, token }) {
      // Only what the browser needs. The refresh token stays in the encrypted cookie.
      return {
        ...session,
        user: { ...session.user, ...token.user },
        accessToken: token.accessToken,
        accessTokenExpires: token.accessTokenExpires,
        error: token.error,
      };
    },
  },
  events: {
    /** Revoke the refresh token on the backend. The endpoint always answers 204. */
    async signOut(message) {
      const refresh = "token" in message ? message.token?.refreshToken : undefined;
      if (refresh) await authApi.logout(refresh).catch(() => undefined);
    },
  },
});
