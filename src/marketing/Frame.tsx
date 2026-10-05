import React from 'react';

interface FrameProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

function Crosshair({ className }: { className: string }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      className={`pointer-events-none select-none absolute z-10 ${className}`}
      aria-hidden="true"
    >
      <line x1="5" y1="0" x2="5" y2="10" stroke="#E8D8CA" strokeWidth="1" />
      <line x1="0" y1="5" x2="10" y2="5" stroke="#E8D8CA" strokeWidth="1" />
    </svg>
  );
}

export function Frame({ children, className = '', style }: FrameProps) {
  return (
    <div
      data-reveal-card
      style={style}
      className={`relative rounded-none border border-dashed border-[#E8D8CA] bg-transparent reveal-init ${className}`}
    >
      {/* 4 small "+" crosshair markers centered on the 4 corners */}
      <Crosshair className="-top-[5px] -left-[5px]" />
      <Crosshair className="-top-[5px] -right-[5px]" />
      <Crosshair className="-bottom-[5px] -left-[5px]" />
      <Crosshair className="-bottom-[5px] -right-[5px]" />

      {children}
    </div>
  );
}
