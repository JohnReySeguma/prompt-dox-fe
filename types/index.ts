import type { components } from "@/types/api";

type Schemas = components["schemas"];

export type DocFormat = Schemas["DocumentOut"]["format"];

/** `uploading` exists only in the browser while the file is in flight; the API reports the rest. */
export type DocStatus = "uploading" | Schemas["DocumentOut"]["status"];

export interface DocPage {
  /** 1-based page number. */
  number: number;
  heading: string;
  paragraphs: string[];
}

/** A document as the UI shows it. Pages come from `GET /v1/documents/{id}/pages`. */
export interface DocumentItem {
  id: string;
  name: string;
  format: DocFormat;
  sizeBytes: number;
  /** ISO 8601 UTC timestamp. */
  uploadedAt: string;
  status: DocStatus;
  /** Upload progress 0–100 while `uploading`; indexing progress while `indexing`. */
  progress: number;
  chunkCount: number;
  pageCount: number;
  summary: string;
  /** Plain-language reason when `status === "failed"`. */
  error: string | null;
}

/** Points at a paragraph inside a document page. Both values are 1-based. */
export interface Citation {
  page: number;
  paragraph: number;
}

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  /** Assistant content may contain `[n]` markers referencing `citations[n - 1]`. */
  content: string;
  /** Sparse while streaming: a citation is filled in when its event arrives. */
  citations: Citation[];
  createdAt?: string;
  /** True while the answer is still streaming in. */
  streaming?: boolean;
  /** True for the user's question until the server confirms it was saved. */
  pending?: boolean;
}

export type BillingCycle = "monthly" | "yearly";

export interface PricingPlan {
  id: "free" | "pro" | "enterprise";
  name: string;
  tagline: string;
  /** `null` means "Custom" pricing. */
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

/** Plans a user can switch between in the demo (Enterprise is sales-led). */
export type SelfServePlan = Exclude<PricingPlan["id"], "enterprise">;

export type User = Schemas["UserOut"];
export type Usage = Schemas["UsageOut"];
export type Settings = Schemas["SettingsOut"];
export type AuthSession = Schemas["AuthSession"];
