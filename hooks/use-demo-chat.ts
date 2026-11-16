"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DEMO_SEED_CHATS, findDemoAnswer } from "@/content/demo/knowledge";
import { createId } from "@/lib/utils";
import type { ChatMessage } from "@/types";

const THINK_MS = 900;
const TICK_MS = 16;
const CHARS_PER_TICK = 3;

/**
 * Chat for the public demo. Answers are canned (matched by keyword) and
 * "streamed" in the browser, so the demo needs no account and no API calls.
 * The conversation lives only in this page and resets on reload.
 */
export function useDemoChat(docId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => DEMO_SEED_CHATS[docId] ?? []);
  const [thinking, setThinking] = useState(false);
  const [streaming, setStreaming] = useState<ChatMessage | null>(null);
  const timers = useRef<number[]>([]);

  const cancel = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  useEffect(() => cancel, [cancel]);

  const send = useCallback(
    (question: string) => {
      const text = question.trim();
      if (!text || thinking || streaming) return;
      setMessages((current) => [...current, { id: createId("demo"), role: "user", content: text, citations: [] }]);
      setThinking(true);

      const answer = findDemoAnswer(docId, text);
      const reply: ChatMessage = { id: createId("demo"), role: "assistant", content: "", citations: answer.citations, streaming: true };

      timers.current.push(
        window.setTimeout(() => {
          setThinking(false);
          let shown = 0;
          const tick = () => {
            shown = Math.min(answer.content.length, shown + CHARS_PER_TICK);
            const partial = { ...reply, content: answer.content.slice(0, shown) };
            if (shown >= answer.content.length) {
              setStreaming(null);
              setMessages((current) => [...current, { ...partial, streaming: false }]);
              return;
            }
            setStreaming(partial);
            timers.current.push(window.setTimeout(tick, TICK_MS));
          };
          tick();
        }, THINK_MS),
      );
    },
    [docId, thinking, streaming],
  );

  /** Like the real app: a stopped answer is discarded. */
  const stop = useCallback(() => {
    cancel();
    setThinking(false);
    setStreaming(null);
  }, [cancel]);

  const clear = useCallback(() => {
    stop();
    setMessages([]);
  }, [stop]);

  return {
    messages,
    conversation: streaming ? [...messages, streaming] : messages,
    thinking,
    busy: thinking || streaming !== null,
    send,
    stop,
    clear,
  };
}
