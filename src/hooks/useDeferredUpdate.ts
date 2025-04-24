import { useEffect, useState, useCallback } from 'react';

/**
 * Custom hook that defers non-critical state updates
 * to improve rendering performance during scrolling
 */
export function useDeferredUpdate<T>(initialValue: T, options: { delay?: number } = {}) {
  const { delay = 100 } = options;
  const [value, setValue] = useState<T>(initialValue);
  const [deferredValue, setDeferredValue] = useState<T>(initialValue);
  const [isScrolling, setIsScrolling] = useState(false);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);

  // Update immediate value
  const updateValue = useCallback((newValue: T) => {
    setValue(newValue);
  }, []);

  // Effect to track scrolling state
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);
      
      // Clear previous timeout
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      
      // Set new timeout to mark end of scrolling
      const id = window.setTimeout(() => {
        setIsScrolling(false);
      }, delay);
      
      setTimeoutId(Number(id));
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [delay, timeoutId]);

  // Update deferred value when not scrolling
  useEffect(() => {
    if (!isScrolling) {
      setDeferredValue(value);
    }
  }, [value, isScrolling]);

  return [value, deferredValue, updateValue, isScrolling] as const;
} 