import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export interface RevealProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  delayMs?: number;
  index?: number;
  direction?: 'up' | 'left' | 'right' | 'pop';
  className?: string;
  as?: React.ElementType;
}

export function Reveal({
  children,
  delayMs,
  index,
  direction = 'up',
  className = '',
  as: Component = 'div',
  style,
  ...rest
}: RevealProps) {
  const shouldReduce = useReducedMotion();

  // Compute staggered delay with subtle organic variation across items
  const computedDelayMs =
    delayMs !== undefined
      ? delayMs
      : index !== undefined
        ? index * 75 + ((index % 3) * 20)
        : 0;

  const delaySeconds = computedDelayMs / 1000;

  const initialValues = shouldReduce
    ? false
    : {
        opacity: 0,
        y: direction === 'up' ? 36 : direction === 'pop' ? 24 : 0,
        x: direction === 'left' ? -36 : direction === 'right' ? 36 : 0,
        scale: direction === 'pop' ? 0.94 : 0.98,
      };

  const MotionComponent = Component === 'div' ? motion.div : Component === 'section' ? motion.section : motion.div;

  return (
    <MotionComponent
      initial={initialValues}
      whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{
        type: 'spring',
        stiffness: 110,
        damping: 18,
        delay: delaySeconds,
      }}
      className={className}
      style={style}
      {...(rest as React.ComponentProps<typeof motion.div>)}
    >
      {children}
    </MotionComponent>
  );
}

