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
  return (
    <div
      data-reveal-card
      style={style}
      className={`group p-6 relative flex flex-col transition-colors duration-200 hover:bg-[#FF4801]/[0.04] reveal-init ${className}`}
    >
      {Icon && (
        <div className="mb-3 text-[#3B1500] group-hover:text-[#FF4801] transition-colors duration-200">
          <Icon className="w-4 h-4" strokeWidth={1.5} />
        </div>
      )}

      {title && (
        <h3 className="font-['Hanken_Grotesk',sans-serif] text-[15px] font-semibold text-[#3B1500] leading-snug">
          {title}
        </h3>
      )}

      {description && (
        <p className="mt-2 text-[13px] leading-[1.5] text-[#7A5A47]">
          {description}
        </p>
      )}

      {children}
    </div>
  );
}
