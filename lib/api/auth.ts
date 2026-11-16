import { apiFetch } from "@/lib/api/client";
import type { AuthSession } from "@/types";

/**
 * Public auth endpoints. These send no access token; several of them run on the
 * server inside Auth.js callbacks (see `auth.ts` at the repo root).
 */

export function register(input: { name: string; email: string; password: string }): Promise<AuthSession> {
  return apiFetch<AuthSession>("/v1/auth/register", { method: "POST", json: input, auth: false });
}

export function login(input: { email: string; password: string }): Promise<AuthSession> {
  return apiFetch<AuthSession>("/v1/auth/login", { method: "POST", json: input, auth: false });
}

export function google(idToken: string): Promise<AuthSession> {
  return apiFetch<AuthSession>("/v1/auth/google", { method: "POST", json: { idToken }, auth: false });
}

/** Rotates the pair. The old refresh token is dead afterwards; store the new one. */
export function refresh(refreshToken: string): Promise<AuthSession> {
  return apiFetch<AuthSession>("/v1/auth/refresh", { method: "POST", json: { refreshToken }, auth: false });
}

/** Always 204, even for an unknown token. */
export function logout(refreshToken: string): Promise<void> {
  return apiFetch<void>("/v1/auth/logout", { method: "POST", json: { refreshToken }, auth: false });
}

/** Always 204, whether or not the email has an account. */
export function forgotPassword(email: string): Promise<void> {
  return apiFetch<void>("/v1/auth/password/forgot", { method: "POST", json: { email }, auth: false });
}

/** 204 on success. Revokes every session for the account. */
export function resetPassword(input: { token: string; newPassword: string }): Promise<void> {
  return apiFetch<void>("/v1/auth/password/reset", { method: "POST", json: input, auth: false });
}

/** Creates a fresh private demo workspace with sample documents. */
export function demo(): Promise<AuthSession> {
  return apiFetch<AuthSession>("/v1/auth/demo", { method: "POST", auth: false });
}
