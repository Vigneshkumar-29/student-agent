import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FeatureCardProps {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function FeatureCard({
  title = "Create interactive quizzes",
  description = "Generate questions from any text content",
  buttonText = "Try It Now",
  buttonLink = "/quiz-generator",
  icon = <ArrowRight className="h-6 w-6 text-indigo-600" />,
  className,
}: FeatureCardProps) {
  const navigate = useNavigate();

  return (
    <div
      className={cn(
        "relative p-8 bg-white rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl",
        "before:absolute before:inset-0 before:rounded-xl before:border-2 before:border-dashed",
        "before:animate-border-rotate before:z-0",
        className,
      )}
    >
      <div className="relative z-10 text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate(buttonLink)}
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
}
