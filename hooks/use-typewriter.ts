"use client";

import { useEffect, useRef, useState } from "react";

interface TypewriterOptions {
  /** When false the full text is returned immediately. */
  enabled?: boolean;
  /** Milliseconds between ticks. */
  interval?: number;
  /** Delay before the first character appears. */
  startDelay?: number;
  onDone?: () => void;
}

/**
 * Simulates a token stream by revealing `text` a few characters at a time.
 * To restart with new text, remount the consuming component (e.g. via `key`).
 */
export function useTypewriter(
  text: string,
  { enabled = true, interval = 18, startDelay = 0, onDone }: TypewriterOptions = {},
) {
  const [count, setCount] = useState(enabled ? 0 : text.length);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (!enabled) return;

    let revealed = 0;
    let timer: ReturnType<typeof setInterval> | undefined;

    const start = setTimeout(() => {
      timer = setInterval(() => {
        // Variable chunk sizes make the stream feel token-like rather than mechanical.
        revealed = Math.min(text.length, revealed + 1 + Math.floor(Math.random() * 3));
        setCount(revealed);
        if (revealed >= text.length) {
          clearInterval(timer);
          onDoneRef.current?.();
        }
      }, interval);
    }, startDelay);

    return () => {
      clearTimeout(start);
      clearInterval(timer);
    };
  }, [text, enabled, interval, startDelay]);

  const visible = enabled ? text.slice(0, count) : text;
  return { text: visible, done: !enabled || count >= text.length };
}
