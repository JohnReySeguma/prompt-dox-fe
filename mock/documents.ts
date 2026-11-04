import type { DocPage, DocumentItem } from "@/types";

function pages(entries: Array<[heading: string, paragraphs: string[]]>): DocPage[] {
  return entries.map(([heading, paragraphs], index) => ({ number: index + 1, heading, paragraphs }));
}

export const MOCK_DOCUMENTS: DocumentItem[] = [
  {
    id: "q3-financial-report",
    name: "Q3-2026-Financial-Report.pdf",
    format: "pdf",
    sizeBytes: 2_480_312,
    uploadedAt: "2026-10-28T09:14:00Z",
    status: "ready",
    progress: 100,
    chunkCount: 214,
    summary: "Quarterly results for Northwind Analytics: revenue, margins, operating costs and Q4 guidance.",
    pages: pages([
      [
        "Executive Summary",
        [
          "Northwind Analytics closed Q3 2026 with total revenue of $48.2M, a 23% increase year-over-year, driven primarily by enterprise subscription expansion across North America and APAC.",
          "Gross margin improved to 78.4% (up from 74.1% in Q3 2025) following the migration of inference workloads to reserved GPU capacity, which reduced per-query compute cost by 31%.",
          "Net revenue retention reached 128%, the highest in company history, with 14 customers now exceeding $1M in annual recurring revenue.",
        ],
      ],
      [
        "Revenue Breakdown",
        [
          "Enterprise subscriptions contributed $34.6M (71.8% of total revenue), while self-serve Pro plans generated $9.1M and professional services accounted for the remaining $4.5M.",
          "APAC was the fastest-growing region at 41% YoY, led by new financial-services customers in Singapore and Sydney. EMEA grew 18%, slightly below plan due to delayed procurement cycles in Germany.",
          "Average contract value for new enterprise deals rose to $186K, up from $142K in the prior quarter, reflecting stronger attach of the Compliance Vault add-on.",
        ],
      ],
      [
        "Operating Expenses",
        [
          "Total operating expenses were $39.7M. Research & development remained the largest category at $17.3M (43.6%), reflecting continued investment in retrieval quality and multilingual embeddings.",
          "Sales & marketing spend was $14.2M. Customer acquisition cost payback improved to 14 months, down from 19 months a year earlier.",
          "General & administrative costs held flat at $8.2M despite 12% headcount growth, aided by automation of the finance close process.",
        ],
      ],
      [
        "Outlook & Risks",
        [
          "For Q4 2026, management guides revenue between $52.0M and $53.5M and expects to reach non-GAAP operating break-even by the end of the fiscal year.",
          "Key risks include GPU supply constraints, foreign-exchange headwinds from a strengthening USD, and evolving AI regulatory requirements in the EU.",
          "The board approved a $25M share repurchase program, to be executed opportunistically over the next 18 months.",
        ],
      ],
    ]),
  },
  {
    id: "employee-handbook",
    name: "Employee-Handbook-v4.docx",
    format: "docx",
    sizeBytes: 864_204,
    uploadedAt: "2026-10-21T15:42:00Z",
    status: "ready",
    progress: 100,
    chunkCount: 96,
    summary: "Company policies covering time off, remote work, equipment and information security.",
    pages: pages([
      [
        "Time Off & Leave",
        [
          "Full-time employees accrue 22 days of paid time off per calendar year, credited monthly. Up to 5 unused days may be carried over into the first quarter of the following year.",
          "Parental leave is 16 weeks fully paid for all parents, regardless of gender, and may be taken in up to three blocks within 12 months of the birth or adoption.",
          "Sick leave is unlimited for short-term illness. Absences longer than five consecutive working days require a note from a licensed medical practitioner.",
        ],
      ],
      [
        "Remote Work Policy",
        [
          "Employees may work remotely up to four days per week. Team anchor day is Wednesday, when in-office attendance is expected unless agreed with your manager.",
          "Working from abroad is permitted for up to 30 days per year, provided the destination is not on the restricted-country list maintained by People Ops.",
          "A one-time home-office stipend of $750 is available after 60 days of employment, plus a $50 monthly internet allowance.",
        ],
      ],
      [
        "Security & Devices",
        [
          "All company laptops must use full-disk encryption and the managed endpoint agent. Personal devices may only access email and chat through the approved mobile management profile.",
          "Customer data must never be copied to personal storage, unmanaged cloud drives, or third-party AI tools that are not on the approved vendor list.",
          "Suspected security incidents must be reported to security@northwind.example within one hour of discovery, even if the impact is unclear.",
        ],
      ],
    ]),
  },
  {
    id: "payments-api-spec",
    name: "payments-api-spec.md",
    format: "md",
    sizeBytes: 148_920,
    uploadedAt: "2026-10-30T11:05:00Z",
    status: "ready",
    progress: 100,
    chunkCount: 58,
    summary: "REST API reference for the Payments platform: auth, rate limits, webhooks and errors.",
    pages: pages([
      [
        "Authentication",
        [
          "All requests must include a bearer token in the Authorization header. Tokens are issued per tenant via the OAuth 2.0 client-credentials flow and expire after 60 minutes.",
          "Secret keys are prefixed with sk_live_ or sk_test_. Test-mode keys can only access sandbox resources and never move real funds.",
          "Rotating a key immediately invalidates the previous secret. Plan rotations during low-traffic windows and deploy the new secret before revoking the old one.",
        ],
      ],
      [
        "Rate Limits",
        [
          "The default limit is 100 requests per second per tenant, with a burst allowance of 200. Search endpoints are limited separately to 20 requests per second.",
          "When a limit is exceeded the API responds with HTTP 429 and a Retry-After header indicating how many seconds to wait before retrying.",
          "Clients should implement exponential backoff with jitter, starting at 250ms and capping at 8 seconds between attempts.",
        ],
      ],
      [
        "Webhooks",
        [
          "Webhook events are delivered as signed POST requests. Verify the Payments-Signature header using HMAC-SHA256 with your endpoint's signing secret.",
          "Failed deliveries are retried up to 12 times over 72 hours using exponential backoff. Endpoints must respond with a 2xx status within 10 seconds.",
          "Events may arrive out of order or more than once. Use the event id as an idempotency key and fetch the latest object state when ordering matters.",
        ],
      ],
      [
        "Error Handling",
        [
          "Errors return a JSON body containing type, code, message and request_id. Always log the request_id; support uses it to trace requests end to end.",
          "card_declined and insufficient_funds errors are safe to show to end users. All other error messages are intended for developers and should not be displayed verbatim.",
          "Idempotency-Key headers are honored for 24 hours on all POST endpoints, so retried requests never create duplicate charges.",
        ],
      ],
    ]),
  },
  {
    id: "vendor-msa",
    name: "Vendor-Master-Services-Agreement.pdf",
    format: "pdf",
    sizeBytes: 1_312_480,
    uploadedAt: "2026-10-12T08:30:00Z",
    status: "ready",
    progress: 100,
    chunkCount: 132,
    summary: "Master services agreement with Helix Cloud covering term, SLAs, liability and termination.",
    pages: pages([
      [
        "Term & Renewal",
        [
          "This Agreement commences on the Effective Date and continues for an initial term of thirty-six (36) months.",
          "Thereafter it renews automatically for successive twelve (12) month periods unless either party gives written notice of non-renewal at least ninety (90) days before the end of the then-current term.",
          "Pricing for any renewal term may increase by no more than five percent (5%) over the fees applicable in the preceding term.",
        ],
      ],
      [
        "Service Levels",
        [
          "Provider shall maintain monthly uptime of at least 99.95% for production services, excluding scheduled maintenance announced 72 hours in advance.",
          "If uptime falls below the commitment, Customer is entitled to service credits of 10% of monthly fees for each 0.1% shortfall, capped at 50% of monthly fees.",
          "Severity 1 incidents require an initial response within 15 minutes and status updates at least every 60 minutes until resolved.",
        ],
      ],
      [
        "Liability & Termination",
        [
          "Except for breaches of confidentiality or indemnification obligations, each party's aggregate liability is limited to the fees paid in the twelve (12) months preceding the claim.",
          "Either party may terminate for material breach that remains uncured thirty (30) days after written notice describing the breach in reasonable detail.",
          "Upon termination Provider shall return or destroy all Customer Data within thirty (30) days and certify the destruction in writing upon request.",
        ],
      ],
    ]),
  },
  {
    id: "product-roadmap-2027",
    name: "Product-Roadmap-2027.docx",
    format: "docx",
    sizeBytes: 642_118,
    uploadedAt: "2026-11-01T17:20:00Z",
    status: "ready",
    progress: 100,
    chunkCount: 71,
    summary: "Planned product themes and milestones for 2027, from agentic workflows to on-prem deployment.",
    pages: pages([
      [
        "Strategic Themes",
        [
          "2027 investment centers on three themes: agentic document workflows, enterprise-grade governance, and a 3× improvement in retrieval latency for collections over 1M chunks.",
          "We will sunset the legacy keyword-search pipeline by Q2, migrating all tenants to hybrid dense + sparse retrieval with re-ranking.",
          "Success is measured by weekly active workspaces, answer acceptance rate, and citation click-through rate.",
        ],
      ],
      [
        "Milestones",
        [
          "Q1: multi-document chat and shared workspaces with granular permissions. Q2: workflow builder beta with Slack and Teams triggers.",
          "Q3: self-hosted deployment on Kubernetes for regulated industries, including bring-your-own-key encryption and air-gapped model serving.",
          "Q4: native audio and video transcript ingestion with speaker-aware citations.",
        ],
      ],
    ]),
  },
  {
    id: "vector-search-notes",
    name: "vector-search-research.txt",
    format: "txt",
    sizeBytes: 38_412,
    uploadedAt: "2026-11-04T08:02:00Z",
    status: "indexing",
    progress: 100,
    chunkCount: 0,
    summary: "Research notes comparing HNSW and IVF-PQ indexes for large tenant collections.",
    pages: pages([
      [
        "Index Benchmarks",
        [
          "HNSW (M=32, efSearch=128) achieved 0.982 recall@10 at 11ms p95 on the 5M-chunk benchmark set, but required 2.4× the memory of IVF-PQ.",
          "IVF-PQ with 4096 lists and 64-byte codes reached 0.941 recall@10 at 7ms p95. Re-ranking the top 100 with full vectors recovered recall to 0.976.",
          "Recommendation: HNSW for tenants under 2M chunks, IVF-PQ with re-ranking above that threshold.",
        ],
      ],
      [
        "Chunking Experiments",
        [
          "Semantic chunking with 15% overlap outperformed fixed 512-token windows by 6.3 points on answer faithfulness.",
          "Keeping section headings as chunk prefixes improved citation precision by 9%, especially in long legal documents.",
          "Chunks shorter than 80 tokens hurt retrieval quality and should be merged with their nearest sibling.",
        ],
      ],
    ]),
  },
  {
    id: "onboarding-guide",
    name: "customer-onboarding-guide.md",
    format: "md",
    sizeBytes: 72_960,
    uploadedAt: "2026-10-05T13:48:00Z",
    status: "ready",
    progress: 100,
    chunkCount: 41,
    summary: "Step-by-step guide for onboarding new enterprise customers in their first 30 days.",
    pages: pages([
      [
        "First 30 Days",
        [
          "Day 1: provision the tenant, configure SSO via SAML or OIDC, and invite the customer's workspace admins.",
          "Week 1: run a guided ingestion session covering at least three priority document collections and validate citation quality together with the customer.",
          "Day 30: hold a value review measuring query volume, answer acceptance, and time saved against the goals agreed at kickoff.",
        ],
      ],
      [
        "Escalation Paths",
        [
          "Technical blockers go to the Solutions Engineering queue with a target response time of four business hours.",
          "Commercial questions, including plan changes and invoicing, are owned by the assigned Account Executive.",
          "Any data-handling concern must be escalated to the Trust team immediately and logged in the compliance tracker.",
        ],
      ],
    ]),
  },
];

/** Placeholder pages for documents "uploaded" during the session. */
export function buildPlaceholderPages(fileName: string): DocPage[] {
  const title = fileName.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
  return pages([
    [
      "Overview",
      [
        `This is a simulated preview of “${title}”. In the live product, the original file would be parsed and split into semantically meaningful chunks.`,
        "Each chunk is embedded into a tenant-isolated vector index, so questions are answered only from content inside your workspace.",
        "Answers reference exact pages and paragraphs, letting you verify every claim against the source in a single click.",
      ],
    ],
    [
      "Key Sections",
      [
        "Headings, tables and lists are preserved as structural metadata, which improves retrieval precision for long, deeply nested documents.",
        "Because this is a UI prototype, the content you see here is placeholder text generated for demonstration purposes.",
        "Try asking a question in the chat panel to see simulated streaming answers with clickable citations.",
      ],
    ],
  ]);
}
