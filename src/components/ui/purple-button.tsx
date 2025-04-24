import React from "react";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface PurpleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  showArrow?: boolean;
}

export function PurpleButton({
  children,
  className,
  showArrow = true,
  ...props
}: PurpleButtonProps) {
  return (
    <button
      className={cn(
        "relative inline-flex items-center justify-center px-8 py-3",
        "bg-[#8A3FFC] hover:bg-[#7732E5] text-white font-medium",
        "rounded-full shadow-lg transition-all duration-300",
        "hover:shadow-[#8A3FFC]/30 hover:translate-y-[-2px]",
        "border border-[#9B5CFF]/20",
        className,
      )}
      {...props}
    >
      <span className="flex items-center">
        {children}
        {showArrow && <ArrowRight className="ml-2 h-4 w-4" />}
      </span>
    </button>
  );
}
