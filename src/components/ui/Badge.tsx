import React from 'react';

export type BadgeVariant = 'green' | 'yellow' | 'red' | 'gray' | 'default' | 'outline';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, { container: string; dot: string }> = {
  green: {
    container:
      'bg-leaf/15 text-forest dark:bg-leaf/25 dark:text-leaf border border-leaf/30',
    dot: 'bg-leaf',
  },
  default: {
    container:
      'bg-leaf/15 text-forest dark:bg-leaf/25 dark:text-leaf border border-leaf/30',
    dot: 'bg-leaf',
  },
  outline: {
    container:
      'bg-transparent text-forest dark:text-leaf border border-forest/30 dark:border-leaf/30',
    dot: 'bg-leaf',
  },
  yellow: {
    container:
      'bg-harvest/35 text-amber-900 dark:bg-harvest/25 dark:text-amber-300 border border-harvest/50',
    dot: 'bg-harvest',
  },
  red: {
    container:
      'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-850',
    dot: 'bg-red-500',
  },
  gray: {
    container:
      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700',
    dot: 'bg-gray-400',
  },
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2.5 py-0.5 text-xs',
  md: 'px-3.5 py-1 text-sm',
};

/**
 * Compact rounded-full Badge/tag component with multiple status color variants.
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'green',
  size = 'sm',
  className = '',
  dot = false,
  ...props
}) => {
  const styles = variantStyles[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full select-none ${
        styles.container
      } ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${styles.dot}`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
};

Badge.displayName = 'Badge';
export default Badge;
