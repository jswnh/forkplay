import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/20 text-primary border-primary/30",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive/20 text-destructive border-destructive/30",
        outline: "text-foreground border-border",
        cyber:
          "border-cyan-500/30 bg-cyan-500/10 text-cyan-400 font-mono shadow-[0_0_10px_rgba(6,182,212,0.15)]",
        legendary:
          "border-amber-500/40 bg-amber-500/15 text-amber-300 font-mono shadow-[0_0_12px_rgba(245,158,11,0.2)]",
        epic: "border-purple-500/40 bg-purple-500/15 text-purple-300 font-mono shadow-[0_0_12px_rgba(168,85,247,0.2)]",
        rare: "border-blue-500/40 bg-blue-500/15 text-blue-300 font-mono",
        common: "border-white/10 bg-white/5 text-muted-foreground",
        success:
          "border-emerald-500/40 bg-emerald-500/15 text-emerald-400 font-mono",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
