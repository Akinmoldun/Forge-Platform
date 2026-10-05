import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface CellProps {
  icon?: LucideIcon | React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Cell({
  icon: Icon,
  title,
  description,
  children,
  className = '',
  style,
}: CellProps) {
  const hasPadding = className.includes('p-') || className.includes('frame-cell');

  return (
    <div
      data-reveal-card
      style={style}
      className={`group ${hasPadding ? '' : 'p-6'} relative flex flex-col justify-start bg-transparent transition-colors duration-200 hover:bg-[#F36421]/[0.04] reveal-init ${className}`}
    >
      {Icon && (
        <div className="mb-3 text-[#3B1500] group-hover:text-[#F36421] transition-colors duration-200">
          <Icon className="w-4 h-4" strokeWidth={1.5} />
        </div>
      )}

      {title && (
        <h3 className="font-['Hanken_Grotesk',sans-serif] text-[15px] font-semibold text-[#3B1500] leading-snug">
          {title}
        </h3>
      )}

      {description && (
        <p className="mt-2 text-[14px] leading-[1.6] text-[#7A5A47]">
          {description}
        </p>
      )}

      {children}
    </div>
  );
}
