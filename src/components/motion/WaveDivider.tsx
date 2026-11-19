import React from 'react';

export interface WaveDividerProps {
  variant?: 'wave' | 'leaves';
  flip?: boolean;
  className?: string;
  color?: string; // Tailwind fill or color code
}

export default function WaveDivider({
  variant = 'wave',
  flip = false,
  className = '',
  color = 'fill-emerald-800',
}: WaveDividerProps) {
  const flipClass = flip ? 'rotate-180 transform' : '';

  if (variant === 'leaves') {
    return (
      <div
        className={`w-full overflow-hidden leading-none ${flipClass} ${className}`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className={`relative block w-full h-[60px] md:h-[80px] ${color}`}
        >
          {/* Decorative agricultural foliage / leaf undulating pattern */}
          <path d="M0,0 C150,90 350,-40 500,45 C650,130 850,-10 1000,50 C1100,90 1170,30 1200,0 L1200,120 L0,120 Z" />
          {/* Subtle secondary leaf curves */}
          <path
            opacity="0.25"
            d="M0,30 C200,110 400,10 600,70 C800,130 1000,20 1200,60 L1200,120 L0,120 Z"
          />
        </svg>
      </div>
    );
  }

  // Default: 'wave'
  return (
    <div
      className={`w-full overflow-hidden leading-none ${flipClass} ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className={`relative block w-full h-[60px] md:h-[80px] ${color}`}
      >
        {/* Smooth natural wave divider */}
        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118,152.47,131.5,232,118.5,263.29,113.4,293.42,88.4,321.39,56.44Z" />
      </svg>
    </div>
  );
}
