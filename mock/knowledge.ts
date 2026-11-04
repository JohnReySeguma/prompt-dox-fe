import type { ChatMessage, DocKnowledge, MockAnswer } from "@/types";

/**
 * Canned answers per document. Each answer's `[n]` markers point at `citations[n - 1]`.
 * A question is matched to the answer with the most keyword hits.
 */
export const MOCK_KNOWLEDGE: Record<string, DocKnowledge> = {
  "q3-financial-report": {
    suggestions: [
      "How much revenue did we make in Q3?",
      "What drove the gross margin improvement?",
      "What are the key risks in the outlook?",
    ],
    answers: [
      {
        keywords: ["revenue", "make", "made", "growth", "grow", "sales", "total"],
        content:
          "Northwind closed Q3 2026 with $48.2M in total revenue, up 23% year-over-year [1]. Enterprise subscriptions made up the bulk at $34.6M (71.8%), with Pro plans adding $9.1M and services $4.5M [2]. Growth was strongest in APAC at 41% YoY, while EMEA lagged plan at 18% [3].",
        citations: [
          { page: 1, paragraph: 1 },
          { page: 2, paragraph: 1 },
          { page: 2, paragraph: 2 },
        ],
      },
      {
        keywords: ["margin", "gross", "compute", "gpu", "cost", "improvement"],
        content:
          "Gross margin rose to 78.4%, up from 74.1% a year earlier [1]. The improvement came from migrating inference workloads to reserved GPU capacity, which cut per-query compute cost by 31% [1]. Note that GPU supply constraints are also flagged as a forward-looking risk [2].",
        citations: [
          { page: 1, paragraph: 2 },
          { page: 4, paragraph: 2 },
        ],
      },
      {
        keywords: ["risk", "risks", "outlook", "guidance", "q4", "forecast", "next quarter"],
        content:
          "For Q4 2026, management guides revenue of $52.0M–$53.5M and targets non-GAAP operating break-even by fiscal year end [1]. The main risks called out are GPU supply constraints, FX headwinds from a stronger USD, and evolving EU AI regulation [2].",
        citations: [
          { page: 4, paragraph: 1 },
          { page: 4, paragraph: 2 },
        ],
      },
      {
        keywords: ["expense", "expenses", "opex", "spend", "r&d", "research", "marketing", "cac"],
        content:
          "Operating expenses totaled $39.7M, with R&D the largest line at $17.3M (43.6%) [1]. Sales & marketing came in at $14.2M, and CAC payback improved to 14 months from 19 [2]. G&A held flat at $8.2M despite 12% headcount growth [3].",
        citations: [
          { page: 3, paragraph: 1 },
          { page: 3, paragraph: 2 },
          { page: 3, paragraph: 3 },
        ],
      },
      {
        keywords: ["retention", "nrr", "customers", "churn", "arr", "buyback", "repurchase"],
        content:
          "Net revenue retention hit 128%, a company record, and 14 customers now exceed $1M in ARR [1]. Separately, the board approved a $25M share repurchase program over the next 18 months [2].",
        citations: [
          { page: 1, paragraph: 3 },
          { page: 4, paragraph: 3 },
        ],
      },
    ],
  },
  "employee-handbook": {
    suggestions: [
      "How many PTO days do I get?",
      "Can I work from another country?",
      "How do I report a security incident?",
    ],
    answers: [
      {
        keywords: ["pto", "vacation", "time off", "days", "holiday", "carry"],
        content:
          "Full-time employees accrue 22 days of PTO per year, credited monthly, and up to 5 unused days can roll into Q1 of the next year [1]. Sick leave is separate and unlimited for short-term illness [2].",
        citations: [
          { page: 1, paragraph: 1 },
          { page: 1, paragraph: 3 },
        ],
      },
      {
        keywords: ["remote", "abroad", "country", "travel", "home", "office", "stipend"],
        content:
          "You can work remotely up to four days a week, with Wednesday as the in-office anchor day [1]. Working from abroad is allowed for up to 30 days per year, as long as the destination isn't on the restricted list [2]. There's also a $750 home-office stipend after 60 days [3].",
        citations: [
          { page: 2, paragraph: 1 },
          { page: 2, paragraph: 2 },
          { page: 2, paragraph: 3 },
        ],
      },
      {
        keywords: ["security", "incident", "report", "breach", "laptop", "device", "ai tools"],
        content:
          "Report any suspected security incident to security@northwind.example within one hour of discovery, even if the impact is unclear [1]. Also remember that customer data must never be pasted into unapproved third-party AI tools [2].",
        citations: [
          { page: 3, paragraph: 3 },
          { page: 3, paragraph: 2 },
        ],
      },
      {
        keywords: ["parental", "maternity", "paternity", "baby", "adoption", "leave"],
        content:
          "Parental leave is 16 weeks fully paid for every parent, and it can be split into up to three blocks within 12 months of the birth or adoption [1].",
        citations: [{ page: 1, paragraph: 2 }],
      },
    ],
  },
  "payments-api-spec": {
    suggestions: [
      "What are the API rate limits?",
      "How do I verify webhook signatures?",
      "How should I handle retries safely?",
    ],
    answers: [
      {
        keywords: ["rate", "limit", "limits", "429", "throttle", "requests per second"],
        content:
          "Each tenant gets 100 requests/second with a burst allowance of 200, while search endpoints are capped separately at 20 req/s [1]. Exceeding a limit returns HTTP 429 with a Retry-After header [2], and clients should back off exponentially with jitter from 250ms up to 8s [3].",
        citations: [
          { page: 2, paragraph: 1 },
          { page: 2, paragraph: 2 },
          { page: 2, paragraph: 3 },
        ],
      },
      {
        keywords: ["webhook", "signature", "verify", "hmac", "signing", "events"],
        content:
          "Webhooks arrive as signed POSTs; verify the Payments-Signature header with HMAC-SHA256 using your endpoint's signing secret [1]. Since events can be duplicated or arrive out of order, treat the event id as an idempotency key [2].",
        citations: [
          { page: 3, paragraph: 1 },
          { page: 3, paragraph: 3 },
        ],
      },
      {
        keywords: ["retry", "retries", "idempotency", "duplicate", "safely", "backoff"],
        content:
          "Send an Idempotency-Key header on POST requests; keys are honored for 24 hours, so retries never create duplicate charges [1]. Combine this with exponential backoff and jitter between attempts [2].",
        citations: [
          { page: 4, paragraph: 3 },
          { page: 2, paragraph: 3 },
        ],
      },
      {
        keywords: ["auth", "authentication", "token", "key", "keys", "oauth", "rotate"],
        content:
          "Authenticate with a bearer token issued per tenant via OAuth 2.0 client credentials; tokens expire after 60 minutes [1]. When rotating secret keys, deploy the new secret before revoking the old one, because rotation invalidates the previous key immediately [2].",
        citations: [
          { page: 1, paragraph: 1 },
          { page: 1, paragraph: 3 },
        ],
      },
    ],
  },
  "vendor-msa": {
    suggestions: [
      "When can we terminate the agreement?",
      "What is the uptime SLA?",
      "Does the contract auto-renew?",
    ],
    answers: [
      {
        keywords: ["terminate", "termination", "cancel", "breach", "exit"],
        content:
          "Either party can terminate for a material breach that remains uncured 30 days after written notice [1]. After termination, the provider must return or destroy all customer data within 30 days [2].",
        citations: [
          { page: 3, paragraph: 2 },
          { page: 3, paragraph: 3 },
        ],
      },
      {
        keywords: ["uptime", "sla", "availability", "credits", "incident", "downtime"],
        content:
          "The provider commits to 99.95% monthly uptime, excluding maintenance announced 72 hours ahead [1]. Shortfalls earn service credits of 10% per 0.1% missed, capped at 50% of monthly fees [2].",
        citations: [
          { page: 2, paragraph: 1 },
          { page: 2, paragraph: 2 },
        ],
      },
      {
        keywords: ["renew", "renewal", "auto", "term", "notice", "price increase"],
        content:
          "Yes. After the initial 36-month term the agreement auto-renews for 12-month periods unless notice is given at least 90 days before term end [1][2]. Renewal pricing can rise by at most 5% [3].",
        citations: [
          { page: 1, paragraph: 1 },
          { page: 1, paragraph: 2 },
          { page: 1, paragraph: 3 },
        ],
      },
    ],
  },
};

const FALLBACK: MockAnswer = {
  keywords: [],
  content:
    "I couldn't find a passage that answers that directly, so here is the closest match. The opening section sets out the document's main context [1], and the following section adds supporting detail [2]. Try rephrasing with terms that appear in the document for a more precise answer.",
  citations: [
    { page: 1, paragraph: 1 },
    { page: 2, paragraph: 1 },
  ],
};

export function getSuggestions(docId: string): string[] {
  return (
    MOCK_KNOWLEDGE[docId]?.suggestions ?? [
      "Summarize this document",
      "What are the key sections?",
      "What should I verify first?",
    ]
  );
}

export function findAnswer(docId: string, question: string): MockAnswer {
  const q = question.toLowerCase();
  const answers = MOCK_KNOWLEDGE[docId]?.answers ?? [];
  let best: MockAnswer | null = null;
  let bestScore = 0;
  for (const answer of answers) {
    const score = answer.keywords.reduce((total, keyword) => total + (q.includes(keyword) ? 1 : 0), 0);
    if (score > bestScore) {
      best = answer;
      bestScore = score;
    }
  }
  return best ?? FALLBACK;
}

export const INITIAL_CHATS: Record<string, ChatMessage[]> = {
  "q3-financial-report": [
    {
      id: "seed-user-1",
      role: "user",
      content: "Give me the headline numbers for this quarter.",
      citations: [],
    },
    {
      id: "seed-assistant-1",
      role: "assistant",
      content:
        "Headline: revenue of $48.2M, up 23% YoY [1], gross margin of 78.4% [2], and record net revenue retention of 128% [3]. Click any citation to jump to the exact passage.",
      citations: [
        { page: 1, paragraph: 1 },
        { page: 1, paragraph: 2 },
        { page: 1, paragraph: 3 },
      ],
    },
  ],
};
