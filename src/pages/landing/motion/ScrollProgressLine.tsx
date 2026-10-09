import React from 'react';

export function ScrollProgressLine() {
  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[2px] z-[100] pointer-events-none"
      style={{
        backgroundColor: '#0D0D0D',
        transformOrigin: 'left center',
        transform: 'scaleX(var(--scroll, 0))',
        willChange: 'transform',
      }}
    />
  );
}
