"use client";

import { useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { getMessages } from "@/lib/api/chat";
import { getDocument, getPages, getSuggestions, listDocuments } from "@/lib/api/documents";
import { getMe, getSettings, getUsage } from "@/lib/api/me";
import type { DocumentItem } from "@/types";

export const queryKeys = {
  me: ["me"] as const,
  usage: ["usage"] as const,
  settings: ["settings"] as const,
  documents: ["documents"] as const,
  document: (id: string) => ["document", id] as const,
  pages: (id: string) => ["pages", id] as const,
  suggestions: (id: string) => ["suggestions", id] as const,
  messages: (id: string) => ["messages", id] as const,
};

/** While anything is indexing the API has no push channel, so we poll. */
export const POLL_INTERVAL_MS = 3000;

/** True once the Auth.js session (and so the API token) is available. */
export function useAuthReady(): boolean {
  return useSession().status === "authenticated";
}

/** When a document finishes indexing, the data that depends on it is stale. */
function invalidateFinished(queryClient: QueryClient, previous: DocumentItem[] | undefined, next: DocumentItem[]) {
  if (!previous) return;
  const before = new Map(previous.map((doc) => [doc.id, doc.status]));
  let finished = false;
  for (const doc of next) {
    if (before.get(doc.id) === "indexing" && doc.status !== "indexing") {
      finished = true;
      queryClient.setQueryData(queryKeys.document(doc.id), doc);
      void queryClient.invalidateQueries({ queryKey: queryKeys.pages(doc.id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.suggestions(doc.id) });
    }
  }
  if (finished) void queryClient.invalidateQueries({ queryKey: queryKeys.usage });
}

export function useDocuments() {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: queryKeys.documents,
    enabled: useAuthReady(),
    queryFn: async () => {
      const previous = queryClient.getQueryData<DocumentItem[]>(queryKeys.documents);
      const next = await listDocuments();
      invalidateFinished(queryClient, previous, next);
      return next;
    },
    refetchInterval: (query) => (query.state.data?.some((doc) => doc.status === "indexing") ? POLL_INTERVAL_MS : false),
  });
}

export function useDocument(id: string) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: queryKeys.document(id),
    enabled: useAuthReady(),
    queryFn: async () => {
      const previous = queryClient.getQueryData<DocumentItem>(queryKeys.document(id));
      const next = await getDocument(id);
      if (previous) invalidateFinished(queryClient, [previous], [next]);
      return next;
    },
    initialData: () => queryClient.getQueryData<DocumentItem[]>(queryKeys.documents)?.find((doc) => doc.id === id),
    initialDataUpdatedAt: () => queryClient.getQueryState(queryKeys.documents)?.dataUpdatedAt,
    refetchInterval: (query) => (query.state.data?.status === "indexing" ? POLL_INTERVAL_MS : false),
  });
}

export function usePages(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.pages(id),
    enabled: useAuthReady() && enabled,
    queryFn: () => getPages(id),
    staleTime: Infinity,
  });
}

export function useSuggestions(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.suggestions(id),
    enabled: useAuthReady() && enabled,
    queryFn: () => getSuggestions(id),
    staleTime: Infinity,
  });
}

export function useMessages(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.messages(id),
    enabled: useAuthReady() && enabled,
    queryFn: () => getMessages(id),
    staleTime: Infinity,
  });
}

export function useMe() {
  return useQuery({ queryKey: queryKeys.me, enabled: useAuthReady(), queryFn: getMe });
}

export function useUsage() {
  return useQuery({ queryKey: queryKeys.usage, enabled: useAuthReady(), queryFn: getUsage });
}

export function useSettings() {
  return useQuery({ queryKey: queryKeys.settings, enabled: useAuthReady(), queryFn: getSettings, staleTime: Infinity });
}
