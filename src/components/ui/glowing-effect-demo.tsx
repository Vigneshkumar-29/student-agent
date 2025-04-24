"use client";

import { BookOpen, FileQuestion, Image, Brain, Sparkles, Trophy, ArrowRight, StickyNote, Network } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function GlowingEffectDemo() {
  const navigate = useNavigate();
  
  const items = [
    {
      area: "md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]",
      icon: <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
      title: "Quiz Generator",
      description: "Create dynamic quizzes from any content with our AI-powered quiz generation tools.",
      route: "/quiz-generator"
    },
    {
      area: "md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]",
      icon: <StickyNote className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
      title: "Smart Notes",
      description: "Create, organize and enhance your notes with AI-powered tools like voice-to-text and mind maps.",
      route: "/notes"
    },
    {
      area: "md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]",
      icon: <FileQuestion className="h-5 w-5 text-green-600 dark:text-green-400" />,
      title: "PDF Assistant",
      description: "Extract key information and generate quizzes directly from your PDF documents.",
      route: "/pdf-qa"
    },
    {
      area: "md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]",
      icon: <Image className="h-5 w-5 text-orange-600 dark:text-orange-400" />,
      title: "Image Analysis",
      description: "Analyze and extract information from diagrams, charts, and visual content automatically.",
      route: "/image-qa"
    },
    {
      area: "md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]",
      icon: <Trophy className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
      title: "Performance Tracking",
      description: "Monitor your progress with detailed analytics and personalized insights.",
      route: "/dashboard"
    }
  ];

  return (
    <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-6 xl:max-h-[34rem] xl:grid-rows-2">
      {items.map((item, index) => (
        <GridItem
          key={index}
          area={item.area}
          icon={item.icon}
          title={item.title}
          description={item.description}
          route={item.route}
        />
      ))}
    </ul>
  );
}

interface GridItemProps {
  area: string;
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
  route: string;
}

const GridItem = ({ area, icon, title, description, route }: GridItemProps) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  
  const handleClick = () => {
    navigate(route);
  };
  
  return (
    <li 
      className={cn("min-h-[14rem] list-none cursor-pointer", area)}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-gray-200 dark:border-gray-700 p-2 md:rounded-[1.5rem] md:p-3 transition-all duration-300 hover:shadow-xl">
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
          borderWidth={3}
        />
        <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border-[0.75px] border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)] md:p-6 transition-transform duration-300 hover:translate-y-[-2px]">
          <div className="relative flex flex-1 flex-col justify-between gap-3">
            <div className={cn(
              "w-fit rounded-lg border-[0.75px] border-border bg-muted p-2.5 transition-all duration-300",
              isHovered && "bg-purple-100 dark:bg-purple-900/50 rotate-3 scale-110"
            )}>
              {icon}
            </div>
            <div className="space-y-3">
              <h3 className="pt-0.5 text-xl leading-[1.375rem] font-semibold font-sans tracking-[-0.04em] md:text-2xl md:leading-[1.875rem] text-balance bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-600 dark:from-purple-400 dark:to-indigo-300">
                {title}
              </h3>
              <h2 className="[&_b]:md:font-semibold [&_strong]:md:font-semibold font-sans text-sm leading-[1.125rem] md:text-base md:leading-[1.375rem] text-muted-foreground">
                {description}
              </h2>
            </div>
          </div>
          <div className={cn(
            "flex justify-end items-center transition-all duration-300",
            isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
          )}>
            <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <ArrowRight className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}; 