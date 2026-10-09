import React, { useRef, useState } from 'react';
import { useMotion } from './MotionProvider';

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  maxDistance?: number;
  maxDisplacement?: number;
}

export function MagneticButton({
  children,
  className = '',
  maxDistance = 80,
  maxDisplacement = 6,
  style,
  ...rest
}: MagneticButtonProps) {
  const { isReducedMotion } = useMotion();
  const btnRef = useRef<HTMLButtonElement>(null);
  const [transform, setTransform] = useState<string>('translate3d(0, 0, 0)');
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isReducedMotion) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const btn = btnRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= maxDistance && dist > 0) {
      const factor = Math.min(1, dist / maxDistance);
      const moveX = (dx / dist) * (factor * maxDisplacement);
      const moveY = (dy / dist) * (factor * maxDisplacement);
      setTransform(`translate3d(${moveX.toFixed(2)}px, ${moveY.toFixed(2)}px, 0)`);
    }
  };

  const handleMouseEnter = () => {
    if (isReducedMotion || window.matchMedia('(pointer: coarse)').matches) return;
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setTransform('translate3d(0, 0, 0)');
  };

  return (
    <button
      ref={btnRef}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{
        ...style,
        transform,
        transition: isHovering
          ? 'transform 100ms ease-out'
          : 'transform 500ms cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: isHovering ? 'transform' : 'auto',
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
