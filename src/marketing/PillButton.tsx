import React from 'react';
import { Link } from 'react-router';

interface PillButtonProps {
  to?: string;
  href?: string;
  variant?: 'primary' | 'secondary' | 'white' | 'outline-white';
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function PillButton({
  to,
  href,
  variant = 'primary',
  children,
  className = '',
  onClick,
}: PillButtonProps) {
  const baseStyles =
    'rounded-full py-3 px-6 text-sm font-medium transition-all inline-flex items-center justify-center gap-2 select-none text-center';

  const variantStyles = {
    primary: 'bg-[#FF4801] hover:bg-[#E03E00] text-white shadow-xs',
    secondary:
      'bg-white border border-[#3B1500] text-[#3B1500] hover:bg-[#FFE5D6]',
    white: 'bg-white hover:bg-[#FFE5D6] text-[#FF4801] shadow-xs font-semibold',
    'outline-white':
      'border border-white/80 text-white hover:bg-white/10 backdrop-blur-xs',
  }[variant];

  const fullClassName = `${baseStyles} ${variantStyles} ${className}`;

  if (to) {
    return (
      <Link to={to} className={fullClassName} onClick={onClick}>
        {children}
      </Link>
    );
  }

  if (href) {
    const isExternal = href.startsWith('http');
    return (
      <a
        href={href}
        className={fullClassName}
        onClick={onClick}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    );
  }

  return (
    <button type="button" className={fullClassName} onClick={onClick}>
      {children}
    </button>
  );
}
