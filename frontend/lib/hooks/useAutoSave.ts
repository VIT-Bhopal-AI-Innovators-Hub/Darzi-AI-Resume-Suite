import { useEffect, useRef } from 'react';

interface UseAutoSaveOptions<T> {
  data: T;
  onSave: () => Promise<void>;
  delay?: number; // delay in milliseconds
  enabled?: boolean;
}

export function useAutoSave<T>({ 
  data, 
  onSave, 
  delay = 5000, // 5 seconds default
  enabled = true 
}: UseAutoSaveOptions<T>) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousDataRef = useRef(data);

  useEffect(() => {
    if (!enabled) return;

    // Check if data has actually changed
    const hasChanged = JSON.stringify(data) !== JSON.stringify(previousDataRef.current);
    
    if (hasChanged) {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout for auto-save
      timeoutRef.current = setTimeout(async () => {
        try {
          await onSave();
          previousDataRef.current = data;
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }, delay);
    }

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, onSave, delay, enabled]);

  // Update previous data reference when save is successful
  useEffect(() => {
    previousDataRef.current = data;
  }, [data]);
}
