'use client';

import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  tilt?: boolean;
  onClick?: () => void;
}

/**
 * Glassmorphism Card component with 3D tilt interaction and hover lift.
 * Uses CSS transforms via Framer Motion springs for smooth performance.
 */
export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = true,
  tilt = false,
  onClick,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // Normalized mouse coordinates from -0.5 to 0.5 relative to card dimensions
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for rotation with max 5deg tilt
  const springConfig = { damping: 25, stiffness: 220, mass: 0.1 };
  const rotateXSpring = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), springConfig);
  const rotateYSpring = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tilt || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    if (!tilt) return;
    mouseX.set(0);
    mouseY.set(0);
  };

  const baseClasses = [
    // Glassmorphism styling
    'relative rounded-2xl p-6 transition-shadow duration-300',
    'bg-white/70 dark:bg-dark-surface/70',
    'backdrop-blur-lg',
    'border border-white/20 dark:border-white/10',
    'shadow-lg dark:shadow-black/20',
    hover ? 'hover:shadow-2xl hover:border-leaf/30 dark:hover:border-leaf/30' : '',
    onClick ? 'cursor-pointer' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <motion.div
      ref={cardRef}
      className={baseClasses}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileHover={
        hover
          ? {
              y: -4,
              transition: { duration: 0.25, ease: 'easeOut' },
            }
          : undefined
      }
      whileTap={onClick ? { scale: 0.99 } : undefined}
      style={{
        transformStyle: 'preserve-3d',
        perspective: tilt ? 1000 : undefined,
        rotateX: tilt ? rotateXSpring : 0,
        rotateY: tilt ? rotateYSpring : 0,
      }}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
};

Card.displayName = 'Card';
export default Card;
