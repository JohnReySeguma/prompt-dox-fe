export function TypingDots({ label = "Thinking" }: { label?: string }) {
  return (
    <span className="flex items-center gap-2 text-[13px] text-muted-foreground" role="status">
      <span className="flex gap-1" aria-hidden>
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            className="size-1.5 animate-pulse-soft rounded-full bg-primary"
            style={{ animationDelay: `${dot * 0.18}s` }}
          />
        ))}
      </span>
      {label}…
    </span>
  );
}
