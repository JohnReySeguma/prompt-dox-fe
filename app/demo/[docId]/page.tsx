import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DemoWorkspace } from "@/components/demo/DemoWorkspace";
import { WorkspaceSkeleton } from "@/components/workspace/WorkspaceView";
import { DEMO_DOCUMENTS, getDemoDocument } from "@/content/demo/documents";

// The demo's documents are fixed, so every demo page is prerendered.
export function generateStaticParams() {
  return DEMO_DOCUMENTS.map((doc) => ({ docId: doc.id }));
}

export async function generateMetadata({ params }: PageProps<"/demo/[docId]">): Promise<Metadata> {
  const { docId } = await params;
  return { title: getDemoDocument(docId)?.name ?? "Demo" };
}

async function DemoDocument({ params }: { params: PageProps<"/demo/[docId]">["params"] }) {
  const { docId } = await params;
  const doc = getDemoDocument(docId);
  if (!doc) notFound();
  // Key by doc so the conversation and citation state reset when switching documents.
  return <DemoWorkspace key={doc.id} doc={doc} />;
}

export default function DemoDocumentPage({ params }: PageProps<"/demo/[docId]">) {
  // Reading the route params inside Suspense keeps navigation into the page instant.
  return (
    <Suspense fallback={<WorkspaceSkeleton />}>
      <DemoDocument params={params} />
    </Suspense>
  );
}
