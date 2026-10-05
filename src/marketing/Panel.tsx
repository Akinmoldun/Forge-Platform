import React from 'react';

interface PanelProps {
  children: React.ReactNode;
  className?: string;
  withCorners?: boolean;
  withDottedGrid?: boolean;
}

export function Panel({
  children,
  className = '',
  withCorners = true,
  withDottedGrid = true,
}: PanelProps) {
  return (
    <div
      className={`border border-[#E8D8CA] rounded-[20px] bg-[#FFFBF5] relative ${
        withDottedGrid ? 'bg-dotted-grid' : ''
      } ${className}`}
    >
      {withCorners && (
        <>
          <span className="absolute -top-2.5 -left-2.5 text-[#E8D8CA] font-mono text-xs select-none pointer-events-none">
            +
          </span>
          <span className="absolute -top-2.5 -right-2.5 text-[#E8D8CA] font-mono text-xs select-none pointer-events-none">
            +
          </span>
          <span className="absolute -bottom-2.5 -left-2.5 text-[#E8D8CA] font-mono text-xs select-none pointer-events-none">
            +
          </span>
          <span className="absolute -bottom-2.5 -right-2.5 text-[#E8D8CA] font-mono text-xs select-none pointer-events-none">
            +
          </span>
        </>
      )}
      {children}
    </div>
  );
}
