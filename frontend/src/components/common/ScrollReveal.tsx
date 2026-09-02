import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { useSmoothScroll } from '../../hooks/useSmoothScroll';

export interface ScrollRevealProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  /**
   * Direction from which the element enters.
   * Default: 'up'
   */
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  /**
   * Pixel distance for the entrance offset.
   * Default: 18 (restrained vertical offset).
   */
  distance?: number;
  /**
   * Delay before animating in seconds.
   * Default: 0
   */
  delay?: number;
  /**
   * Duration of the animation in seconds.
   * Default: 0.5 (fast, crisp, unobtrusive).
   */
  duration?: number;
  /**
   * Whether to animate only once when entering viewport.
   * Default: true
   */
  once?: boolean;
  /**
   * Threshold fraction of element visible before triggering.
   * Default: 0.15
   */
  threshold?: number;
  /**
   * Additional custom CSS classes.
   */
  className?: string;
}

export function ScrollReveal({
  children,
  direction = 'up',
  distance = 18,
  delay = 0,
  duration = 0.5,
  once = true,
  threshold = 0.15,
  className = '',
  ...props
}: ScrollRevealProps) {
  const { isReducedMotion } = useSmoothScroll();

  // If user requested reduced motion, render immediately without translation or opacity fades
  if (isReducedMotion) {
    return (
      <div className={className} {...(props as any)}>
        {children}
      </div>
    );
  }

  const getInitialOffset = () => {
    switch (direction) {
      case 'up':
        return { y: distance, x: 0 };
      case 'down':
        return { y: -distance, x: 0 };
      case 'left':
        return { x: distance, y: 0 };
      case 'right':
        return { x: -distance, y: 0 };
      case 'none':
      default:
        return { x: 0, y: 0 };
    }
  };

  const initialOffset = getInitialOffset();

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: initialOffset.x,
        y: initialOffset.y,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
      }}
      viewport={{
        once,
        amount: threshold,
        margin: '0px 0px -40px 0px',
      }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1], // Smooth cubic-bezier curve
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
