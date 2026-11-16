import { apiFetch } from "@/lib/api/client";
import type { SelfServePlan, Settings, Usage, User } from "@/types";

export function getMe(): Promise<User> {
  return apiFetch<User>("/v1/me");
}

/** Name is 1–80 characters. The response carries recomputed initials. */
export function patchMe(input: { name?: string; email?: string }): Promise<User> {
  return apiFetch<User>("/v1/me", { method: "PATCH", json: input });
}

export function getUsage(): Promise<Usage> {
  return apiFetch<Usage>("/v1/me/usage");
}

export function getSettings(): Promise<Settings> {
  return apiFetch<Settings>("/v1/me/settings");
}

/** Send only the fields that changed. */
export function patchSettings(input: Partial<Settings>): Promise<Settings> {
  return apiFetch<Settings>("/v1/me/settings", { method: "PATCH", json: input });
}

/** Demo plan switch: no payment is taken. Returns the new usage. */
export function switchPlan(plan: SelfServePlan): Promise<Usage> {
  return apiFetch<Usage>("/v1/me/plan", { method: "POST", json: { plan } });
}

/** Links a Google account using a fresh Google ID token. */
export function connectGoogle(idToken: string): Promise<User> {
  return apiFetch<User>("/v1/me/connections/google", { method: "POST", json: { idToken } });
}

/** Fails with `validation_error` when the account has no password to fall back on. */
export function disconnectGoogle(): Promise<User> {
  return apiFetch<User>("/v1/me/connections/google", { method: "DELETE" });
}
