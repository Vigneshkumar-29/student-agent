"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface TubelightNavbarProps {
  items: { text: string; href: string }[];
  onNavigate: (href: string) => void;
  className?: string;
}

export function TubelightNavbar({
  items,
  onNavigate,
  className,
}: TubelightNavbarProps) {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <nav className={cn("flex items-center gap-2", className)}>
      {items.map((item) => {
        const isActive = activeItem === item.text;
        const isHovered = hoveredItem === item.text;

        return (
          <button
            key={item.text}
            onClick={() => {
              setActiveItem(item.text);
              onNavigate(item.href);
            }}
            onMouseEnter={() => setHoveredItem(item.text)}
            onMouseLeave={() => setHoveredItem(null)}
            className={cn(
              "relative px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              "hover:text-purple-700 focus:outline-none",
              isActive || item.text === "About" 
                ? "text-purple-700 font-semibold" 
                : "text-gray-600 font"
            )}
          >
            {(isActive || isHovered) && (
              <motion.span
                layoutId="bubble"
                className="absolute inset-0 bg-purple-100 rounded-lg -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            {item.text}
          </button>
        );
      })}
    </nav>
  );
} 