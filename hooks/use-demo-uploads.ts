"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { deleteDocument, listDocuments, uploadDocument } from "@/lib/api/documents";
import { ApiError, errorMessage } from "@/lib/api/errors";
import { POLL_INTERVAL_MS } from "@/lib/queries";
import { detectFormat } from "@/store/upload-store";
import { DEMO_MAX_FILE_BYTES, DEMO_MAX_UPLOADS, useDemoStore } from "@/store/demo-store";
import { formatBytes } from "@/lib/utils";
import type { DocumentItem } from "@/types";

/** Cache keys for the temporary demo workspace, kept apart from the signed-in user's. */
export const demoKeys = {
  documents: (token: string) => ["demo", token, "documents"] as const,
  document: (token: string, id: string) => ["demo", token, "document", id] as const,
  pages: (token: string, id: string) => ["demo", token, "pages", id] as const,
  suggestions: (token: string, id: string) => ["demo", token, "suggestions", id] as const,
  messages: (token: string, id: string) => ["demo", token, "messages", id] as const,
};

/** A 401 means the backend has already deleted the demo workspace. */
export function isDemoExpired(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}

/** Reads the stored demo workspace once on the client. */
export function useDemoWorkspace() {
  const hydrate = useDemoStore((state) => state.hydrate);
  const workspace = useDemoStore((state) => state.workspace);
  const hydrated = useDemoStore((state) => state.hydrated);
  useEffect(() => hydrate(), [hydrate]);
  return { workspace, hydrated };
}

/**
 * The visitor's uploads in the demo: their files only (not the workspace's
 * seeded samples), polled while any is indexing.
 */
export function useDemoUploads() {
  const { workspace, hydrated } = useDemoWorkspace();
  const uploading = useDemoStore((state) => state.uploading);
  const reset = useDemoStore((state) => state.reset);
  const token = workspace?.accessToken;
  const uploadIds = workspace?.uploadIds;

  const query = useQuery({
    queryKey: token ? demoKeys.documents(token) : ["demo", "none"],
    enabled: Boolean(token && uploadIds?.length),
    queryFn: () => listDocuments({}, { token }),
    select: (documents) => documents.filter((doc) => uploadIds?.includes(doc.id)),
    refetchInterval: (q) => (q.state.data?.some((doc) => doc.status === "indexing") ? POLL_INTERVAL_MS : false),
  });

  // The backend wiped the workspace: forget it here too.
  useEffect(() => {
    if (isDemoExpired(query.error)) reset();
  }, [query.error, reset]);

  return {
    hydrated,
    workspace,
    uploading,
    documents: query.data ?? [],
    isLoading: query.isPending && query.fetchStatus !== "idle",
  };
}

/** Validates and uploads files into the temporary demo workspace. */
export function useDemoUpload() {
  const queryClient = useQueryClient();
  const [errors, setErrors] = useState<string[]>([]);

  const upload = useCallback(
    async (files: File[]) => {
      const store = useDemoStore.getState();
      const next: string[] = [];
      const used = (store.workspace?.uploadIds.length ?? 0) + store.uploading.length;
      let slots = Math.max(0, DEMO_MAX_UPLOADS - used);

      for (const file of files) {
        const format = detectFormat(file.name);
        if (!format) {
          next.push(`“${file.name}” isn't supported. Use PDF, DOCX, MD or TXT.`);
          continue;
        }
        if (file.size > DEMO_MAX_FILE_BYTES) {
          next.push(`“${file.name}” is larger than ${formatBytes(DEMO_MAX_FILE_BYTES)}, the demo limit. Create a free account for files up to 50 MB.`);
          continue;
        }
        if (slots === 0) {
          next.push(`The demo holds ${DEMO_MAX_UPLOADS} uploads. Delete one, or create a free account for more.`);
          break;
        }
        slots -= 1;

        const tempId = store.startUpload({ name: file.name, size: file.size, format });
        void (async () => {
          try {
            const workspace = await useDemoStore.getState().ensureWorkspace();
            const doc = await uploadDocument(file, {
              token: workspace.accessToken,
              onProgress: (percent) => useDemoStore.getState().progressUpload(tempId, percent),
            });
            useDemoStore.getState().addUpload(doc.id);
            const key = demoKeys.documents(workspace.accessToken);
            queryClient.setQueryData<DocumentItem[]>(key, (current) => (current ? [doc, ...current.filter((item) => item.id !== doc.id)] : [doc]));
            void queryClient.invalidateQueries({ queryKey: key });
          } catch (error) {
            if (isDemoExpired(error)) useDemoStore.getState().reset();
            setErrors((current) => [
              ...current,
              `“${file.name}”: ${isDemoExpired(error) ? "Your demo workspace expired. Try uploading again." : errorMessage(error, "The upload failed. Please try again.")}`,
            ]);
          } finally {
            useDemoStore.getState().endUpload(tempId);
          }
        })();
      }
      setErrors(next);
    },
    [queryClient],
  );

  const remove = useCallback(
    async (doc: DocumentItem) => {
      const workspace = useDemoStore.getState().workspace;
      if (!workspace) return;
      try {
        await deleteDocument(doc.id, { token: workspace.accessToken });
      } catch (error) {
        // Already gone (deleted or expired) is fine; anything else is reported.
        if (!(error instanceof ApiError && (error.status === 404 || error.status === 401))) {
          setErrors([`Couldn't delete “${doc.name}”: ${errorMessage(error)}`]);
          return;
        }
      }
      useDemoStore.getState().removeUpload(doc.id);
      queryClient.setQueryData<DocumentItem[]>(demoKeys.documents(workspace.accessToken), (current) =>
        current?.filter((item) => item.id !== doc.id),
      );
    },
    [queryClient],
  );

  return { upload, remove, errors, setErrors };
}
