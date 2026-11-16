"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { streamChat, toChatMessage } from "@/lib/api/chat";
import { errorMessage, isAbortError } from "@/lib/api/errors";
import { queryKeys } from "@/lib/queries";
import { createId } from "@/lib/utils";
import type { ChatMessage, Usage, User } from "@/types";

export type ChatPhase =
  | { stage: "idle" }
  | { stage: "searching"; passages: number | null }
  | { stage: "writing" };

interface ChatStream {
  /** The optimistic question and the answer streaming in, not yet saved. */
  pending: ChatMessage[];
  phase: ChatPhase;
  error: string | null;
  busy: boolean;
  send: (question: string) => void;
  stop: () => void;
  dismissError: () => void;
}

/**
 * Streams one answer at a time for a document over `POST /chat` (SSE).
 * Saved history lives in the `messages` query; this hook holds only the turn
 * in progress, and swaps it for the server's saved copies on `done`.
 */
export interface UseChatOptions {
  /** Use this token (the temporary demo workspace) instead of the signed-in user. */
  token?: string;
  /** Cache key holding the saved history. Defaults to the signed-in user's messages key. */
  messagesKey?: readonly unknown[];
}

export function useChat(documentId: string, options: UseChatOptions = {}): ChatStream {
  const { token } = options;
  const messagesKey = options.messagesKey ?? queryKeys.messages(documentId);
  const queryClient = useQueryClient();
  const [pending, setPending] = useState<ChatMessage[]>([]);
  const [phase, setPhase] = useState<ChatPhase>({ stage: "idle" });
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  // Leaving the page stops the stream; the server saves nothing for an aborted answer.
  useEffect(() => () => controllerRef.current?.abort(), []);

  const send = useCallback(
    (question: string) => {
      const text = question.trim();
      if (!text || controllerRef.current) return;

      const controller = new AbortController();
      controllerRef.current = controller;
      const userMessage: ChatMessage = { id: createId("local"), role: "user", content: text, citations: [], pending: true };
      const answerId = createId("local");
      let answer: ChatMessage | null = null;

      setError(null);
      setPending([userMessage]);
      setPhase({ stage: "searching", passages: null });

      const showAnswer = (update: (current: ChatMessage) => ChatMessage) => {
        answer = update(answer ?? { id: answerId, role: "assistant", content: "", citations: [], streaming: true });
        setPending([userMessage, answer]);
      };

      const finish = () => {
        controllerRef.current = null;
        setPhase({ stage: "idle" });
      };

      const rollback = (message: string | null) => {
        setPending([]);
        setError(message);
        finish();
      };

      void (async () => {
        try {
          for await (const frame of streamChat(documentId, text, controller.signal, token)) {
            switch (frame.event) {
              case "status":
                setPhase(
                  frame.data.stage === "searching"
                    ? { stage: "searching", passages: frame.data.passages }
                    : { stage: "writing" },
                );
                break;
              case "citation": {
                const { index, page, paragraph } = frame.data;
                // Arrives before the delta that contains its `[index]` marker.
                showAnswer((current) => {
                  const citations = [...current.citations];
                  citations[index - 1] = { page, paragraph };
                  return { ...current, citations };
                });
                break;
              }
              case "delta":
                showAnswer((current) => ({ ...current, content: current.content + frame.data.text }));
                break;
              case "done": {
                const saved = [toChatMessage(frame.data.userMessage), toChatMessage(frame.data.message)];
                queryClient.setQueryData<ChatMessage[]>(messagesKey, (current) => [...(current ?? []), ...saved]);
                setPending([]);
                finish();
                // The demo workspace has no profile or usage in this app's cache.
                if (token) return;
                const queriesToday = frame.data.usage.queriesToday;
                queryClient.setQueryData<User>(queryKeys.me, (me) => (me ? { ...me, queriesToday } : me));
                queryClient.setQueryData<Usage>(queryKeys.usage, (usage) =>
                  usage ? { ...usage, queriesToday: { ...usage.queriesToday, used: queriesToday } } : usage,
                );
                void queryClient.invalidateQueries({ queryKey: queryKeys.usage });
                void queryClient.invalidateQueries({ queryKey: queryKeys.me });
                return;
              }
              case "error":
                // Nothing was saved or counted.
                rollback(frame.data.message);
                return;
            }
          }
          rollback("The answer was cut off before it finished. Please try again.");
        } catch (caught) {
          if (isAbortError(caught) || controller.signal.aborted) {
            rollback(null);
            return;
          }
          rollback(errorMessage(caught, "We couldn't get an answer. Please try again."));
        }
      })();
    },
    // messagesKey is derived from documentId (or a stable caller key), so it isn't a separate dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [documentId, queryClient, token],
  );

  const stop = useCallback(() => controllerRef.current?.abort(), []);
  const dismissError = useCallback(() => setError(null), []);

  return { pending, phase, error, busy: phase.stage !== "idle", send, stop, dismissError };
}
