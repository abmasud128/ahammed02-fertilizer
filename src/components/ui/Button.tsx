'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'whatsapp';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children?: React.ReactNode;
  href?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  target?: string;
  rel?: string;
  magnetic?: boolean;
  id?: string;
  'aria-label'?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-leaf text-white hover:bg-forest shadow-md hover:shadow-lg shadow-leaf/25 focus-visible:ring-leaf',
  secondary:
    'bg-harvest text-forest hover:bg-amber-400 shadow-sm hover:shadow-md focus-visible:ring-harvest',
  outline:
    'border-2 border-leaf text-leaf hover:bg-leaf/10 dark:hover:bg-leaf/20 focus-visible:ring-leaf',
  ghost:
    'bg-transparent text-forest dark:text-leaf hover:bg-leaf/10 dark:hover:bg-leaf/20 focus-visible:ring-leaf',
  whatsapp:
    'bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg shadow-green-600/30 focus-visible:ring-green-500',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'text-sm py-1.5 px-4 gap-1.5',
  md: 'text-base py-2.5 px-6 gap-2',
  lg: 'text-lg py-3.5 px-8 gap-2.5',
};

/**
 * Reusable Button component with magnetic hover interaction, variant styling,
 * loading state, and optional link mode.
 */
export const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      className = '',
      children,
      href,
      icon,
      iconPosition = 'left',
      loading = false,
      disabled = false,
      type = 'button',
      onClick,
      target,
      rel,
      magnetic = true,
      id,
      'aria-label': ariaLabel,
    },
    forwardedRef
  ) => {
    const localRef = useRef<HTMLElement | null>(null);

    // Magnetic cursor tracking
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
      if (!magnetic || disabled || loading || !localRef.current) return;
      const rect = localRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distanceX = (e.clientX - centerX) * 0.18;
      const distanceY = (e.clientY - centerY) * 0.18;
      mouseX.set(distanceX);
      mouseY.set(distanceY);
    };

    const handleMouseLeave = () => {
      if (!magnetic) return;
      mouseX.set(0);
      mouseY.set(0);
    };

    const setRefs = (element: HTMLElement | null) => {
      localRef.current = element;
      if (typeof forwardedRef === 'function') {
        forwardedRef(element as HTMLButtonElement & HTMLAnchorElement);
      } else if (forwardedRef) {
        (forwardedRef as React.MutableRefObject<HTMLElement | null>).current = element;
      }
    };

    const isDisabled = disabled || loading;

    const baseClasses = [
      'relative inline-flex items-center justify-center font-bold rounded-full transition-colors cursor-pointer select-none',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-dark-bg',
      variantStyles[variant],
      sizeStyles[size],
      isDisabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const content = (
      <>
        {loading ? (
          <span
            className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0"
            aria-hidden="true"
          />
        ) : (
          icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>
        )}
        {children && <span>{children}</span>}
        {!loading && icon && iconPosition === 'right' && (
          <span className="shrink-0">{icon}</span>
        )}
      </>
    );

    const motionProps = {
      ref: setRefs,
      className: baseClasses,
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
      whileHover: !isDisabled ? { scale: 1.02 } : undefined,
      whileTap: !isDisabled ? { scale: 0.98 } : undefined,
      style: magnetic ? { x: springX, y: springY } : undefined,
      'aria-label': ariaLabel,
      'aria-busy': loading,
      id,
    };

    if (href && !isDisabled) {
      return (
        <motion.div
          style={magnetic ? { x: springX, y: springY } : undefined}
          className="inline-block"
        >
          <Link
            ref={setRefs as unknown as React.Ref<HTMLAnchorElement>}
            href={href}
            target={target}
            rel={target === '_blank' ? rel || 'noopener noreferrer' : rel}
            onClick={onClick as React.MouseEventHandler<HTMLAnchorElement>}
            className={baseClasses}
            aria-label={ariaLabel}
          >
            {content}
          </Link>
        </motion.div>
      );
    }

    return (
      <motion.button
        {...motionProps}
        type={type}
        disabled={isDisabled}
        onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
      >
        {content}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
