import React from 'react';
import { motion, HTMLMotionProps, Variants } from 'framer-motion';
import { useSmoothScroll } from '../../hooks/useSmoothScroll';

interface ScrollStaggerContainerProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  /**
   * Stagger delay between child items in seconds.
   * Default: 0.08s
   */
  staggerChildren?: number;
  /**
   * Initial delay before starting stagger sequence in seconds.
   * Default: 0
   */
  delayChildren?: number;
  /**
   * Whether to animate only once when entering viewport.
   * Default: true
   */
  once?: boolean;
  className?: string;
}

export function ScrollStaggerContainer({
  children,
  staggerChildren = 0.08,
  delayChildren = 0,
  once = true,
  className = '',
  ...props
}: ScrollStaggerContainerProps) {
  const { isReducedMotion } = useSmoothScroll();

  if (isReducedMotion) {
    return (
      <div className={className} {...(props as any)}>
        {children}
      </div>
    );
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren,
        delayChildren,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: '0px 0px -40px 0px' }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface ScrollStaggerItemProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  distance?: number;
  duration?: number;
  className?: string;
}

export function ScrollStaggerItem({
  children,
  distance = 18,
  duration = 0.45,
  className = '',
  ...props
}: ScrollStaggerItemProps) {
  const { isReducedMotion } = useSmoothScroll();

  if (isReducedMotion) {
    return (
      <div className={className} {...(props as any)}>
        {children}
      </div>
    );
  }

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      y: distance,
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <motion.div variants={itemVariants} className={className} {...props}>
      {children}
    </motion.div>
  );
}
