import { cn } from "@/app/lib/utils";

interface BorderBeamProps {
  className?: string;
  duration?: number;
  size?: number;
  reverse?: boolean;
}

export default function BorderBeam({ className, size = 240, reverse }: BorderBeamProps) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute -inset-px rounded-2xl",
        className
      )}
      style={{
        background: `conic-gradient(from 90deg, transparent, hsl(var(--brand) / 0.4), transparent)`,
        padding: 1,
        transform: reverse ? "scaleX(-1)" : undefined,
        filter: "blur(8px)",
      }}
      aria-hidden
    />
  );
}
