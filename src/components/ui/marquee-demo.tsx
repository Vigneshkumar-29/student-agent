import { Marquee } from "@/components/ui/marquee";
import { Brain, FileQuestion, BookOpen, Image, Sparkles, Trophy } from "lucide-react";

const Logos = {
  quiz: () => (
    <div className="flex items-center gap-3 font-semibold text-xl">
      <Brain className="h-8 w-8 text-purple-600 dark:text-purple-400" />
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-600 dark:from-purple-400 dark:to-indigo-300">
        Quiz Generator
      </span>
    </div>
  ),
  pdfAssistant: () => (
    <div className="flex items-center gap-3 font-semibold text-xl">
      <FileQuestion className="h-8 w-8 text-blue-600 dark:text-blue-400" />
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600 dark:from-blue-400 dark:to-indigo-300">
        PDF Assistant
      </span>
    </div>
  ),
  imageAnalysis: () => (
    <div className="flex items-center gap-3 font-semibold text-xl">
      <Image className="h-8 w-8 text-green-600 dark:text-green-400" />
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-700 to-teal-600 dark:from-green-400 dark:to-teal-300">
        Image Analysis
      </span>
    </div>
  ),
  learningTools: () => (
    <div className="flex items-center gap-3 font-semibold text-xl">
      <BookOpen className="h-8 w-8 text-orange-600 dark:text-orange-400" />
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-700 to-yellow-600 dark:from-orange-400 dark:to-yellow-300">
        Learning Tools
      </span>
    </div>
  ),
  aiPowered: () => (
    <div className="flex items-center gap-3 font-semibold text-xl">
      <Sparkles className="h-8 w-8 text-fuchsia-600 dark:text-fuchsia-400" />
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-700 to-pink-600 dark:from-fuchsia-400 dark:to-pink-300">
        AI Powered
      </span>
    </div>
  ),
  results: () => (
    <div className="flex items-center gap-3 font-semibold text-xl">
      <Trophy className="h-8 w-8 text-amber-600 dark:text-amber-400" />
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-700 to-orange-600 dark:from-amber-400 dark:to-orange-300">
        Proven Results
      </span>
    </div>
  ),
};

export function MarqueeDemo() {
  const arr = [
    Logos.quiz, 
    Logos.pdfAssistant, 
    Logos.imageAnalysis, 
    Logos.learningTools, 
    Logos.aiPowered, 
    Logos.results
  ];

  return (
    <div className="relative py-2">
      {/* Gradient overlay effects */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white dark:from-gray-950 z-20"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white dark:from-gray-950 z-20"></div>
      
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-50/30 to-blue-50/30 dark:from-purple-950/30 dark:to-blue-950/30 -z-10"></div>
      <div className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full bg-purple-200/20 dark:bg-purple-700/10 blur-3xl -z-10"></div>
      <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-blue-200/20 dark:bg-blue-700/10 blur-3xl -z-10"></div>
      
      {/* The marquee component */}
      <Marquee className="py-4" pauseOnHover speed={40}>
        {arr.map((Logo, index) => (
          <div
            key={index}
            className="relative h-full w-fit mx-16 flex items-center justify-start group"
          >
            <div className="transition-transform duration-300 group-hover:scale-110">
              <Logo />
            </div>
          </div>
        ))}
      </Marquee>
    </div>
  );
} 