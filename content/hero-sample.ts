import type { Citation, DocPage } from "@/types";

/**
 * Static content for the landing-page hero animation. This is marketing copy,
 * not app data: the real app reads documents and answers from the API.
 */
export const HERO_DOC = {
  name: "Q3-2026-Financial-Report.pdf",
  chunkCount: 214,
  pages: [
    {
      number: 1,
      heading: "Executive Summary",
      paragraphs: [
        "Northwind Analytics closed Q3 2026 with total revenue of $48.2M, a 23% increase year-over-year, driven primarily by enterprise subscription expansion across North America and APAC.",
        "Gross margin improved to 78.4% (up from 74.1% in Q3 2025) following the migration of inference workloads to reserved GPU capacity, which reduced per-query compute cost by 31%.",
        "Net revenue retention reached 128%, the highest in company history, with 14 customers now exceeding $1M in annual recurring revenue.",
      ],
    },
    {
      number: 2,
      heading: "Revenue Breakdown",
      paragraphs: [
        "Enterprise subscriptions contributed $34.6M (71.8% of total revenue), while self-serve Pro plans generated $9.1M and professional services accounted for the remaining $4.5M.",
        "APAC was the fastest-growing region at 41% YoY, led by new financial-services customers in Singapore and Sydney. EMEA grew 18%, slightly below plan due to delayed procurement cycles in Germany.",
        "Average contract value for new enterprise deals rose to $186K, up from $142K in the prior quarter, reflecting stronger attach of the Compliance Vault add-on.",
      ],
    },
    {
      number: 3,
      heading: "Operating Expenses",
      paragraphs: [
        "Total operating expenses were $39.7M. Research & development remained the largest category at $17.3M (43.6%), reflecting continued investment in retrieval quality and multilingual embeddings.",
        "Sales & marketing spend was $14.2M. Customer acquisition cost payback improved to 14 months, down from 19 months a year earlier.",
        "General & administrative costs held flat at $8.2M despite 12% headcount growth, aided by automation of the finance close process.",
      ],
    },
    {
      number: 4,
      heading: "Outlook & Risks",
      paragraphs: [
        "For Q4 2026, management guides revenue between $52.0M and $53.5M and expects to reach non-GAAP operating break-even by the end of the fiscal year.",
        "Key risks include GPU supply constraints, foreign-exchange headwinds from a strengthening USD, and evolving AI regulatory requirements in the EU.",
        "The board approved a $25M share repurchase program, to be executed opportunistically over the next 18 months.",
      ],
    },
  ] satisfies DocPage[],
};

interface HeroAnswer {
  content: string;
  citations: Citation[];
}

/** Questions whose citations sit on a single page, so the highlight lands where the reader is looking. */
export const HERO_SCRIPT: Array<{ question: string; answer: HeroAnswer }> = [
  {
    question: "What are the key risks in the outlook?",
    answer: {
      content:
        "For Q4 2026, management guides revenue of $52.0M–$53.5M and targets non-GAAP operating break-even by fiscal year end [1]. The main risks called out are GPU supply constraints, FX headwinds from a stronger USD, and evolving EU AI regulation [2].",
      citations: [
        { page: 4, paragraph: 1 },
        { page: 4, paragraph: 2 },
      ],
    },
  },
  {
    question: "What drove the gross margin improvement?",
    answer: {
      content:
        "Gross margin rose to 78.4%, up from 74.1% a year earlier [1]. The improvement came from migrating inference workloads to reserved GPU capacity, which cut per-query compute cost by 31% [1]. Note that GPU supply constraints are also flagged as a forward-looking risk [2].",
      citations: [
        { page: 1, paragraph: 2 },
        { page: 4, paragraph: 2 },
      ],
    },
  },
  {
    question: "How did operating costs change?",
    answer: {
      content:
        "Operating expenses totaled $39.7M, with R&D the largest line at $17.3M (43.6%) [1]. Sales & marketing came in at $14.2M, and CAC payback improved to 14 months from 19 [2]. G&A held flat at $8.2M despite 12% headcount growth [3].",
      citations: [
        { page: 3, paragraph: 1 },
        { page: 3, paragraph: 2 },
        { page: 3, paragraph: 3 },
      ],
    },
  },
];
