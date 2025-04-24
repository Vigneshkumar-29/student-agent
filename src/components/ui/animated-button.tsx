import React from "react";
import { cn } from "@/lib/utils";

interface AnimatedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedButton({
  children,
  className,
  ...props
}: AnimatedButtonProps) {
  return (
    <button
      className={cn(
        "relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-medium text-white bg-[#5E48E8] rounded-xl group hover:bg-[#4A38D5] transition-all duration-300",
        "shadow-lg hover:shadow-[#5E48E8]/30 hover:translate-y-[-2px]",
        className,
      )}
      {...props}
    >
      <span className="relative z-10 flex items-center">{children}</span>
    </button>
  );
}
