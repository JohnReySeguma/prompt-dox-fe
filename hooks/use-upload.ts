"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { uploadDocument } from "@/lib/api/documents";
import { errorMessage } from "@/lib/api/errors";
import { queryKeys } from "@/lib/queries";
import { MAX_FILE_BYTES, detectFormat, useUploadStore } from "@/store/upload-store";
import { formatBytes } from "@/lib/utils";
import type { DocumentItem } from "@/types";

/** Validates files in the browser, then uploads each one with progress. */
export function useUpload() {
  const queryClient = useQueryClient();

  return useCallback(
    (files: File[]) => {
      const store = useUploadStore.getState();
      const errors: string[] = [];
      const maxBytes = MAX_FILE_BYTES;

      for (const file of files) {
        const format = detectFormat(file.name);
        if (!format) {
          errors.push(`“${file.name}” isn't supported. Use PDF, DOCX, MD or TXT.`);
          continue;
        }
        if (file.size > maxBytes) {
          errors.push(`“${file.name}” is larger than ${formatBytes(maxBytes)}.`);
          continue;
        }

        const tempId = store.start({ name: file.name, size: file.size, format });
        uploadDocument(file, { onProgress: (percent) => useUploadStore.getState().progress(tempId, percent) })
          .then((doc) => {
            queryClient.setQueryData<DocumentItem[]>(queryKeys.documents, (current) =>
              current ? [doc, ...current.filter((item) => item.id !== doc.id)] : [doc],
            );
            useUploadStore.getState().finish(tempId);
            // Refetch so polling starts from the server's view, and usage counts the new file.
            void queryClient.invalidateQueries({ queryKey: queryKeys.documents });
            void queryClient.invalidateQueries({ queryKey: queryKeys.usage });
          })
          .catch((error: unknown) => {
            useUploadStore.getState().fail(tempId, `“${file.name}”: ${errorMessage(error, "The upload failed. Please try again.")}`);
          });
      }

      store.setErrors(errors);
    },
    [queryClient],
  );
}
