import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * PromptDox brand assets are PNGs exported from `public/brand/promptdox-mark.svg`:
 * a document page whose lower edge runs out into a speech-bubble tail, with the
 * cited line marked in highlighter yellow.
 */
const LOCKUP = { src: "/brand/promptdox-logo.png", width: 1192, height: 256 };
const MARK = { src: "/brand/promptdox-mark.png", width: 512, height: 512 };

interface LogoProps {
  variant?: "horizontal" | "icon";
  /** Rendered height in px. Width follows the asset's aspect ratio. */
  height?: number;
  className?: string;
  priority?: boolean;
}

export function Logo({ variant = "horizontal", height = 28, className, priority = false }: LogoProps) {
  const asset = variant === "icon" ? MARK : LOCKUP;
  const width = Math.round((asset.width / asset.height) * height);
  return (
    <Image
      src={asset.src}
      width={width}
      height={height}
      alt="PromptDox"
      priority={priority}
      className={cn("shrink-0 select-none", className)}
      style={{ width, height }}
    />
  );
}

export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return <Logo variant="icon" height={size} className={className} />;
}
