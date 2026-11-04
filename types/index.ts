export type DocFormat = "pdf" | "docx" | "md" | "txt";

export type DocStatus = "uploading" | "indexing" | "ready" | "failed";

export interface DocPage {
  /** 1-based page number. */
  number: number;
  heading: string;
  paragraphs: string[];
}

export interface DocumentItem {
  id: string;
  name: string;
  format: DocFormat;
  sizeBytes: number;
  /** ISO 8601 timestamp. */
  uploadedAt: string;
  status: DocStatus;
  /** Upload progress 0–100, only meaningful while `status === "uploading"`. */
  progress: number;
  chunkCount: number;
  summary: string;
  pages: DocPage[];
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
  citations: Citation[];
  /** True while the simulated stream is still typing this message. */
  streaming?: boolean;
}

export interface MockAnswer {
  keywords: string[];
  content: string;
  citations: Citation[];
}

export interface DocKnowledge {
  suggestions: string[];
  answers: MockAnswer[];
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

export interface UserProfile {
  name: string;
  email: string;
  initials: string;
  role: string;
  workspace: string;
  memberSince: string;
  googleConnected: boolean;
  queriesToday: number;
}

/** Plans a user can switch between in the demo (Enterprise is sales-led). */
export type SelfServePlan = Exclude<PricingPlan["id"], "enterprise">;

export interface PlanLimits {
  documents: number;
  /** `null` means unlimited. */
  dailyQueries: number | null;
}
