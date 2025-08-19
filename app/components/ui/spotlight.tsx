import { cn } from "@/app/lib/utils";

interface SpotlightProps {
  className?: string;
  gradientFirst?: string;
  gradientSecond?: string;
  gradientThird?: string;
}

export default function Spotlight({ className, gradientFirst, gradientSecond, gradientThird }: SpotlightProps) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 -z-10", className)} aria-hidden>
      <div
        className="absolute -top-32 left-1/4 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl"
        style={{ backgroundImage: gradientFirst || "radial-gradient(circle, hsl(var(--brand) / 0.2), transparent 60%)" }}
      />
      <div
        className="absolute right-1/4 -bottom-24 h-80 w-80 translate-x-1/2 rounded-full blur-3xl"
        style={{ backgroundImage: gradientSecond || "radial-gradient(circle, hsl(var(--brand) / 0.15), transparent 60%)" }}
      />
      <div
        className="absolute top-1/3 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full blur-3xl"
        style={{ backgroundImage: gradientThird || "radial-gradient(circle, hsl(var(--brand) / 0.1), transparent 60%)" }}
      />
    </div>
  );
}
