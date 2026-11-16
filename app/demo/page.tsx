import type { Metadata } from "next";
import { DemoLibrary } from "@/components/demo/DemoLibrary";

export const metadata: Metadata = {
  title: "Demo",
  description: "Explore PromptDox with sample documents. No account needed.",
};

export default function DemoPage() {
  return <DemoLibrary />;
}
