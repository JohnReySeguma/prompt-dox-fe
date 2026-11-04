import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: React.ReactNode;
  description?: string;
  className?: string;
  as?: "h1" | "h2";
}

export function SectionHeading({ title, description, className, as: Tag = "h2" }: SectionHeadingProps) {
  return (
    <div className={cn("max-w-[640px]", className)}>
      <Tag
        className={cn(
          "font-semibold tracking-[-0.03em] text-balance",
          Tag === "h1" ? "text-[clamp(2.4rem,4.6vw,3.6rem)] leading-[1.05]" : "text-[clamp(1.9rem,3.2vw,2.6rem)] leading-[1.1]",
        )}
      >
        {title}
      </Tag>
      {description && <p className="mt-4 max-w-[56ch] text-[17px] leading-relaxed text-muted-foreground">{description}</p>}
    </div>
  );
}
