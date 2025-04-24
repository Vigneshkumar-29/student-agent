import React from "react";
import { cn } from "@/lib/utils";

interface GradientButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "purple";
}

export function GradientButton({
  children,
  className,
  variant = "primary",
  ...props
}: GradientButtonProps) {
  const getGradient = () => {
    switch (variant) {
      case "secondary":
        return "bg-gradient-to-r from-emerald-500 to-teal-400";
      case "purple":
        return "bg-gradient-to-r from-purple-600 to-indigo-600";
      case "primary":
      default:
        return "bg-gradient-to-r from-indigo-600 to-blue-500";
    }
  };

  return (
    <button
      className={cn(
        "relative group overflow-hidden rounded-full px-8 py-3",
        getGradient(),
        "shadow-lg hover:shadow-xl transition-all duration-300",
        "hover:scale-105 active:scale-95",
        className,
      )}
      {...props}
    >
      {/* Glow effect */}
      <span className="absolute inset-0 w-full h-full bg-white/30 scale-0 rounded-full group-hover:scale-100 transition-transform duration-500 ease-out" />

      {/* Button content */}
      <span className="relative flex items-center justify-center text-white font-medium z-10">
        {children}
      </span>
    </button>
  );
}
