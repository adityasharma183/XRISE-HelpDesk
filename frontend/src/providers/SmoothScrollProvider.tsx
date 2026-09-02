import React, { createContext, useContext, useEffect, useRef, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';

interface SmoothScrollContextType {
  lenis: Lenis | null;
  scrollTo: (target: string | number | HTMLElement, options?: { offset?: number; immediate?: boolean; duration?: number }) => void;
  isReducedMotion: boolean;
}

const SmoothScrollContext = createContext<SmoothScrollContextType>({
  lenis: null,
  scrollTo: () => {},
  isReducedMotion: false,
});

export interface SmoothScrollProviderProps {
  children: React.ReactNode;
  /**
   * Animation duration in seconds for smooth interpolation.
   * Default: 1.1s (tuned for restrained, premium feel).
   */
  duration?: number;
}

export function SmoothScrollProvider({ children, duration = 1.1 }: SmoothScrollProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const location = useLocation();

  // 1. Accessibility: Detect prefers-reduced-motion
  const [isReducedMotion, setIsReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // 2. Initialize Lenis instance
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // If reduced motion is requested, do not initialize smooth interpolation
    if (isReducedMotion) {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
        setLenisInstance(null);
      }
      return;
    }

    const lenis = new Lenis({
      duration,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Clean exponential curve
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9, // Restrained, no runaway momentum
      touchMultiplier: 1.1, // Comfortable touch interaction
      infinite: false,
      autoResize: true,
    });

    lenisRef.current = lenis;
    setLenisInstance(lenis);

    let animationFrameId: number;

    const raf = (time: number) => {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    };

    animationFrameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
      lenisRef.current = null;
      setLenisInstance(null);
    };
  }, [isReducedMotion, duration]);

  // 3. Auto-reset scroll position on route changes without animation jank
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  // 4. Exposed scrollTo helper
  const scrollTo = useMemo(() => {
    return (
      target: string | number | HTMLElement,
      options?: { offset?: number; immediate?: boolean; duration?: number }
    ) => {
      if (lenisRef.current && !isReducedMotion) {
        lenisRef.current.scrollTo(target, options);
      } else if (typeof window !== 'undefined') {
        if (typeof target === 'number') {
          window.scrollTo({ top: target, behavior: isReducedMotion ? 'auto' : 'smooth' });
        } else if (typeof target === 'string') {
          const el = document.querySelector(target);
          if (el) {
            el.scrollIntoView({ behavior: isReducedMotion ? 'auto' : 'smooth' });
          }
        } else if (target instanceof HTMLElement) {
          target.scrollIntoView({ behavior: isReducedMotion ? 'auto' : 'smooth' });
        }
      }
    };
  }, [isReducedMotion]);

  const value = useMemo(
    () => ({
      lenis: lenisInstance,
      scrollTo,
      isReducedMotion,
    }),
    [lenisInstance, scrollTo, isReducedMotion]
  );

  return (
    <SmoothScrollContext.Provider value={value}>
      {children}
    </SmoothScrollContext.Provider>
  );
}

export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}
