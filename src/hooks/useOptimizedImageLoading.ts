import { useState, useEffect } from 'react';

/**
 * Hook to optimize image loading, deferring non-critical images
 * until after page interactive state
 */
export function useOptimizedImageLoading(src: string, options: {
  delay?: number;
  eager?: boolean;
  placeholderSrc?: string;
} = {}) {
  const { 
    delay = 200, 
    eager = false,
    placeholderSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIiAvPjwvc3ZnPg==' 
  } = options;
  
  const [currentSrc, setCurrentSrc] = useState(eager ? src : placeholderSrc);
  const [loaded, setLoaded] = useState(eager);
  const [error, setError] = useState(false);
  
  useEffect(() => {
    if (eager) return;
    
    let mounted = true;
    let timeoutId: number | null = null;
    
    // Use requestIdleCallback if available, otherwise setTimeout
    const loadImage = () => {
      // Create a new image to preload
      const img = new Image();
      img.src = src;
      
      img.onload = () => {
        if (mounted) {
          setCurrentSrc(src);
          setLoaded(true);
        }
      };
      
      img.onerror = () => {
        if (mounted) {
          setError(true);
        }
      };
    };
    
    if ('requestIdleCallback' in window) {
      // @ts-ignore (requestIdleCallback is not in TypeScript's lib)
      const idleCallbackId = window.requestIdleCallback(() => {
        timeoutId = window.setTimeout(loadImage, delay);
      });
      
      return () => {
        mounted = false;
        // @ts-ignore
        window.cancelIdleCallback(idleCallbackId);
        if (timeoutId) window.clearTimeout(timeoutId);
      };
    } else {
      // Fallback to setTimeout
      timeoutId = window.setTimeout(loadImage, delay);
      
      return () => {
        mounted = false;
        if (timeoutId) window.clearTimeout(timeoutId);
      };
    }
  }, [src, delay, eager, placeholderSrc]);
  
  return { src: currentSrc, loaded, error };
} 