import { cn } from "@/lib/utils"
import { TestimonialCard, TestimonialAuthor } from "@/components/ui/testimonial-card"
import { useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"

interface TestimonialsSectionProps {
  title: string
  description: string
  testimonials: Array<{
    author: TestimonialAuthor
    text: string
    href?: string
  }>
  className?: string
}

export function TestimonialsSection({ 
  title,
  description,
  testimonials,
  className 
}: TestimonialsSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll functionality
  useEffect(() => {
    if (!autoplay) return;
    
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [autoplay, testimonials.length]);

  // Manual scroll to selected testimonials
  const scrollToIndex = (index: number) => {
    setActiveIndex(index);
    setAutoplay(false);
    setTimeout(() => setAutoplay(true), 10000);
  };

  // Scroll to next/previous
  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
    setAutoplay(false);
    setTimeout(() => setAutoplay(true), 10000);
  };
  
  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
    setAutoplay(false);
    setTimeout(() => setAutoplay(true), 10000);
  };

  return (
    <section className={cn(
      "relative bg-gradient-to-b from-purple-50/50 to-white dark:from-gray-900/50 dark:to-gray-950",
      "py-16 sm:py-24 md:py-32 px-4 overflow-hidden",
      className
    )}>
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-purple-300/10 dark:bg-purple-700/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-300/10 dark:bg-blue-700/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-300/10 dark:bg-pink-700/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="flex flex-col items-center gap-6 text-center mb-12">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-semibold">
            <Quote className="h-4 w-4 mr-2" />
            Testimonials
          </span>
          
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 dark:from-purple-400 dark:via-indigo-300 dark:to-blue-400">
            {title}
          </h2>
          
          <p className="text-lg max-w-[600px] text-gray-600 dark:text-gray-300 md:text-xl">
            {description}
          </p>
        </div>

        {/* Desktop view - card carousel */}
        <div className="hidden md:block relative mx-auto max-w-5xl">
          <div 
            className="grid grid-cols-3 gap-8 transition-all duration-500 ease-in-out"
            style={{ transform: `translateX(-${activeIndex * 100 / testimonials.length}%)` }}
            ref={scrollRef}
          >
            {testimonials.map((testimonial, i) => (
              <div 
                key={i} 
                className={cn(
                  "transition-all duration-500",
                  i === activeIndex ? "scale-105 shadow-xl" : "scale-100"
                )}
              >
                <TestimonialCard {...testimonial} />
              </div>
            ))}
          </div>

          {/* Navigation controls */}
          <div className="flex justify-center items-center mt-10 gap-3">
            <button 
              onClick={handlePrev}
              className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
            
            <div className="flex space-x-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollToIndex(i)}
                  className={cn(
                    "w-3 h-3 rounded-full transition-all",
                    i === activeIndex 
                      ? "bg-purple-600 dark:bg-purple-400 w-6" 
                      : "bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600"
                  )}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
            
            <button 
              onClick={handleNext}
              className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Mobile view - continuous scroll */}
        <div className="md:hidden relative w-full overflow-hidden">
          <div className="flex overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbar">
            {testimonials.map((testimonial, i) => (
              <div 
                key={i} 
                className="snap-center flex-shrink-0 w-[85vw] max-w-[320px] mx-2 first:ml-4 last:mr-4"
              >
                <TestimonialCard {...testimonial} />
              </div>
            ))}
          </div>
          
          {/* Mobile indicators */}
          <div className="flex justify-center mt-4 space-x-2">
            {testimonials.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  i === activeIndex 
                    ? "bg-purple-600 dark:bg-purple-400 w-4" 
                    : "bg-gray-300 dark:bg-gray-700"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
} 