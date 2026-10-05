import React from 'react';

interface CellProps {
  children: React.ReactNode;
  className?: string;
  withPlusTopLeft?: boolean;
  withPlusTopRight?: boolean;
  withPlusBottomLeft?: boolean;
  withPlusBottomRight?: boolean;
}

export function Cell({
  children,
  className = '',
  withPlusTopLeft,
  withPlusTopRight,
  withPlusBottomLeft,
  withPlusBottomRight,
}: CellProps) {
  return (
    <div
      className={`border border-[#E8D8CA] bg-white p-6 relative flex flex-col justify-between ${className}`}
    >
      {withPlusTopLeft && (
        <span className="absolute -top-2.5 -left-2.5 text-[#E8D8CA] font-mono text-xs select-none pointer-events-none">
          +
        </span>
      )}
      {withPlusTopRight && (
        <span className="absolute -top-2.5 -right-2.5 text-[#E8D8CA] font-mono text-xs select-none pointer-events-none">
          +
        </span>
      )}
      {withPlusBottomLeft && (
        <span className="absolute -bottom-2.5 -left-2.5 text-[#E8D8CA] font-mono text-xs select-none pointer-events-none">
          +
        </span>
      )}
      {withPlusBottomRight && (
        <span className="absolute -bottom-2.5 -right-2.5 text-[#E8D8CA] font-mono text-xs select-none pointer-events-none">
          +
        </span>
      )}
      {children}
    </div>
  );
}
