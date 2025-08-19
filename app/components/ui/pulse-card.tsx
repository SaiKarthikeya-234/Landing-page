import { cn } from "@/app/lib/utils";
import { ReactNode } from "react";

interface CardHoverEffectProps {
  icon: ReactNode;
  title: string;
  description: string;
  variant?: "purple" | "blue" | "amber" | "rose";
  glowEffect?: boolean;
  size?: "sm" | "md" | "lg";
}

const variantMap: Record<string, string> = {
  purple: "from-primary/10 to-accent/10",
  blue: "from-primary/10 to-accent/10",
  amber: "from-primary/10 to-accent/10",
  rose: "from-primary/10 to-accent/10",
};

export function CardHoverEffect({ icon, title, description, variant = "rose", glowEffect = true, size = "md" }: CardHoverEffectProps) {
  const padding = size === "lg" ? "p-6" : size === "md" ? "p-5" : "p-4";

  return (
    <div
      className={cn(
        "group rounded-2xl border bg-card transition-all duration-200 hover:shadow-md",
        padding
      )}
    >
      <div className={cn("inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br", variantMap[variant])}>
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-1 text-sm">{description}</p>
      {glowEffect && <div className="mt-4 h-px w-full bg-gradient-primary opacity-50" />}
    </div>
  );
}

export default CardHoverEffect;
