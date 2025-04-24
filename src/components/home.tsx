import React, { useState, useEffect, lazy, Suspense, memo, useCallback, useRef } from "react";
import { Container } from "@/components/ui/container";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { Button } from "./ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { PathsBackground } from "./ui/background-paths";
import { ArrowRight } from "lucide-react";
import { useOptimizedScroll } from "@/hooks/useOptimizedScroll";

// Lazy load components that aren't needed immediately
const QuizHistory = lazy(() => import("./QuizHistory"));

// Import home section components
import { 
  HeroSection,
  FeaturesGrid,
  FeatureSection,
  BenefitsSection,
  CTASection,
  getQuizGeneratorData, 
  getPDFAssistantData, 
  getImageQAData,
  getSmartNotesData,
  containerVariants,
  itemVariants,
  lightVariants
} from "./home/index";

// Import the new components
import { AnimatedTestimonialsDemo } from "./ui/animated-testimonials-demo";
import { MarqueeDemo } from "./ui/marquee-demo";

// Component wrapper for optimized loading
interface LazySectionProps {
  children: React.ReactNode;
  className?: string;
  rootMargin?: string;
  priority?: 'high' | 'medium' | 'low';
}

// Simplified LazySection component without the deferred update hook
const LazySection = memo(({ 
  children, 
  className = "", 
  rootMargin = "200px",
  priority = 'medium' 
}: LazySectionProps) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  
  // Setup intersection observer
  useEffect(() => {
    const threshold = priority === 'high' ? 0.1 : priority === 'medium' ? 0.05 : 0.01;
    const node = sectionRef.current;
    
    if (!node) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold, rootMargin }
    );
    
    observer.observe(node);
    
    return () => {
      observer.disconnect();
    };
  }, [rootMargin, priority]);
  
  // Once it's in view, we'll render it and keep it rendered
  useEffect(() => {
    if (isInView && !shouldRender) {
      setShouldRender(true);
    }
  }, [isInView, shouldRender]);
  
  return (
    <div ref={sectionRef} className={className}>
      {shouldRender ? children : <div className="min-h-[400px]" />}
    </div>
  );
});

// Component to render only once on initial mount
const InitialRender = memo(({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
});

const Home = () => {
  const [showHistory, setShowHistory] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Animation variants based on index - memoized
  const getAnimationVariants = useCallback((index: number) => {
    return index < 2 ? { container: containerVariants, item: itemVariants } : 
                      { container: lightVariants, item: lightVariants };
  }, []);
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("view") === "history") {
      setShowHistory(true);
    } else {
      setShowHistory(false);
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-gray-900">
      {/* Reduce opacity of background graphics for better performance */}
      <PathsBackground className="opacity-[0.03]" reduced={true} />
      <Header />
      
      <main className="pt-24 pb-16">
        {showHistory ? (
          <Container>
            <div className="space-y-6">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="hover:bg-purple-50 hover:text-purple-600 transition-all duration-300"
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
              <Suspense fallback={<div className="p-4 text-center">Loading history...</div>}>
                <QuizHistory />
              </Suspense>
            </div>
          </Container>
        ) : (
          <>
            {/* Hero Section - Always visible on load */}
            <HeroSection 
              containerVariants={containerVariants} 
              itemVariants={itemVariants} 
            />

            {/* Features Grid - Always visible on load */}
            <FeaturesGrid 
              containerVariants={containerVariants} 
              itemVariants={itemVariants} 
            />

            {/* Lazy load feature sections based on scroll position */}
            <LazySection priority="high">
              <FeatureSection 
                containerVariants={getAnimationVariants(0).container}
                itemVariants={getAnimationVariants(0).item}
                {...getQuizGeneratorData()}
              />
            </LazySection>

            <LazySection priority="high">
              <FeatureSection 
                containerVariants={getAnimationVariants(1).container}
                itemVariants={getAnimationVariants(1).item}
                {...getPDFAssistantData()}
              />
            </LazySection>

            <LazySection priority="medium">
              <FeatureSection 
                containerVariants={getAnimationVariants(2).container}
                itemVariants={getAnimationVariants(2).item}
                {...getImageQAData()}
              />
            </LazySection>

            <LazySection priority="medium">
              <FeatureSection 
                containerVariants={getAnimationVariants(3).container}
                itemVariants={getAnimationVariants(3).item}
                {...getSmartNotesData()}
              />
            </LazySection>

            <LazySection priority="medium">
              <BenefitsSection 
                containerVariants={getAnimationVariants(4).container} 
                itemVariants={getAnimationVariants(4).item} 
              />
            </LazySection>

            <LazySection priority="low">
              <AnimatedTestimonialsDemo />
            </LazySection>

            <LazySection priority="low">
              <CTASection 
                containerVariants={getAnimationVariants(5).container} 
                itemVariants={getAnimationVariants(5).item} 
              />
            </LazySection>
            
            {/* Marquee section just above the footer */}
            <LazySection priority="low">
              <Container>
                <MarqueeDemo />
              </Container>
            </LazySection>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default memo(Home);
