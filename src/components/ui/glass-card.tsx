import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

export function GlassCard({
  children,
  className,
  glowColor = "rgba(94, 72, 232, 0.4)",
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "relative p-8 rounded-2xl transition-all duration-300",
        "backdrop-blur-md bg-white/80 border border-white/30",
        "shadow-lg hover:shadow-xl hover:-translate-y-1",
        className,
      )}
      style={{
        boxShadow: `0 8px 32px ${glowColor}`,
      }}
      {...props}
    >
      {/* Animated border */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        <div className="absolute inset-[-2px] rounded-2xl border-2 border-dashed animate-border-rotate opacity-50" />
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
