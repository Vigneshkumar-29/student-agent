import { useEffect, useState, useRef } from 'react';

interface ScrollOptions {
  threshold?: number;
  rootMargin?: string;
}

/**
 * Custom hook for optimizing scroll performance
 * Returns whether an element is in viewport using Intersection Observer
 */
export function useOptimizedScroll({ threshold = 0.1, rootMargin = '100px' }: ScrollOptions = {}) {
  const [isInView, setIsInView] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  // Update scrollY value - only when needed
  useEffect(() => {
    // Initial value
    setScrollY(window.scrollY);
    
    // Use passive event listener for better scroll performance
    const handleScroll = () => {
      // Use requestAnimationFrame to avoid layout thrashing
      requestAnimationFrame(() => {
        setScrollY(window.scrollY);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Setup intersection observer
  useEffect(() => {
    if (elementRef.current) {
      // Clean up previous observer if it exists
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      
      // Create new observer
      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          setIsInView(entry.isIntersecting);
        },
        { threshold, rootMargin }
      );
      
      // Start observing
      observerRef.current.observe(elementRef.current);
    }
    
    // Cleanup on unmount
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold, rootMargin, elementRef.current]);

  // Simple ref setter
  const ref = (node: HTMLElement | null) => {
    elementRef.current = node;
  };

  return { ref, isInView, scrollY };
} 