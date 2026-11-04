import type { Metadata } from "next";
import { WorkspaceView } from "@/components/workspace/WorkspaceView";
import { MOCK_DOCUMENTS } from "@/mock/documents";

export function generateStaticParams() {
  return MOCK_DOCUMENTS.map((doc) => ({ docId: doc.id }));
}

export async function generateMetadata({ params }: PageProps<"/workspace/[docId]">): Promise<Metadata> {
  const { docId } = await params;
  const doc = MOCK_DOCUMENTS.find((item) => item.id === docId);
  return { title: doc ? doc.name : "Workspace" };
}

export default async function WorkspacePage({ params }: PageProps<"/workspace/[docId]">) {
  const { docId } = await params;
  // Key by doc so citation + tab state resets when switching documents.
  return <WorkspaceView key={docId} docId={docId} />;
}
