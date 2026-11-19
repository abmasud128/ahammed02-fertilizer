import React from 'react';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  id?: string;
  className?: string;
  containerClassName?: string;
  background?: 'cream' | 'forest' | 'white' | 'dark' | 'surface' | 'gradient' | 'none';
  padding?: 'sm' | 'md' | 'lg' | 'none';
  container?: boolean;
  children: React.ReactNode;
}

const backgroundStyles: Record<NonNullable<SectionProps['background']>, string> = {
  cream: 'bg-cream dark:bg-dark-bg text-foreground',
  forest: 'bg-forest text-white',
  white: 'bg-white dark:bg-dark-surface text-foreground',
  dark: 'bg-dark-bg text-cream',
  surface: 'bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md text-foreground',
  gradient: 'bg-gradient-to-r from-forest to-leaf text-white',
  none: '',
};

const paddingStyles: Record<NonNullable<SectionProps['padding']>, string> = {
  none: '',
  sm: 'py-8 md:py-12 px-4 sm:px-6',
  md: 'py-14 md:py-20 px-4 sm:px-6 lg:px-8',
  lg: 'py-18 md:py-28 px-4 sm:px-6 lg:px-8',
};

/**
 * Reusable Section layout component with responsive padding scales,
 * semantic container wrappers, and theme-aware backgrounds.
 */
export const Section: React.FC<SectionProps> = ({
  id,
  className = '',
  containerClassName = '',
  background = 'none',
  padding = 'md',
  container = true,
  children,
  ...props
}) => {
  const bgClass = backgroundStyles[background];
  const padClass = paddingStyles[padding];

  return (
    <section
      id={id}
      className={`relative w-full overflow-hidden ${bgClass} ${padClass} ${className}`}
      {...props}
    >
      {container ? (
        <div className={`max-w-7xl mx-auto w-full ${containerClassName}`}>
          {children}
        </div>
      ) : (
        children
      )}
    </section>
  );
};

export default Section;
