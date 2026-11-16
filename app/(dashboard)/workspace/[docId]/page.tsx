import type { Metadata } from "next";
import { Suspense } from "react";
import { WorkspaceSkeleton, WorkspaceView } from "@/components/workspace/WorkspaceView";

// The document name is set client-side once it loads (IDs are opaque `doc_...` values).
export const metadata: Metadata = { title: "Workspace" };

async function WorkspaceRoute({ params }: { params: PageProps<"/workspace/[docId]">["params"] }) {
  const { docId } = await params;
  // Key by doc so citation and tab state reset when switching documents.
  return <WorkspaceView key={docId} docId={docId} />;
}

export default function WorkspacePage({ params }: PageProps<"/workspace/[docId]">) {
  // Document IDs are only known at request time, so the view streams in behind Suspense.
  return (
    <Suspense fallback={<WorkspaceSkeleton />}>
      <WorkspaceRoute params={params} />
    </Suspense>
  );
}
