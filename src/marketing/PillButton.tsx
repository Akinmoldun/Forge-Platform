import React from 'react';
import { Link } from 'react-router';

export interface PillButtonProps {
  to?: string;
  href?: string;
  variant?: 'primary' | 'white' | 'ghost' | 'outline' | 'secondary';
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
    'rounded-full h-[40px] px-[18px] text-[14px] font-medium transition-all duration-200 inline-flex items-center justify-center gap-2 select-none text-center cursor-pointer focus-visible:outline-2 focus-visible:outline-[#F36421] focus-visible:outline-offset-2';

  const resolvedVariant = variant === 'secondary' ? 'outline' : variant;

  const variantStyles = {
    primary:
      'bg-[#F36421] hover:bg-[#D9531E] text-white hover:-translate-y-[1px] shadow-xs active:translate-y-0',
    white:
      'bg-white text-[#F36421] hover:bg-[#FFEFE4] hover:-translate-y-[1px] shadow-xs active:translate-y-0',
    ghost:
      'bg-white/[0.18] border border-white/40 text-white hover:bg-white/[0.28] hover:-translate-y-[1px] active:translate-y-0',
    outline:
      'border border-[#E8D8CA] bg-transparent text-[#3B1500] hover:border-[#F36421] hover:text-[#F36421] active:translate-y-0',
  }[resolvedVariant];

  const fullClassName = `${baseStyles} ${variantStyles} ${className}`.trim();

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
