import React from 'react';

interface SectionHeaderProps {
  id?: string;
  tag?: string;
  title: string | React.ReactNode;
  subtext?: string | React.ReactNode;
  align?: 'center' | 'left';
  className?: string;
}

export function SectionHeader({
  id,
  tag,
  title,
  subtext,
  align = 'center',
  className = '',
}: SectionHeaderProps) {
  const isCenter = align === 'center';

  return (
    <div
      className={`mb-12 sm:mb-16 ${
        isCenter ? 'text-center max-w-3xl mx-auto' : 'max-w-2xl'
      } ${className}`}
    >
      {tag && (
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#FF4801] text-white mb-3">
          {tag}
        </span>
      )}
      <h2
        id={id}
        className="font-['Hanken_Grotesk',sans-serif] font-medium text-3xl sm:text-[44px] text-[#3B1500] leading-tight tracking-[-0.02em]"
      >
        {title}
      </h2>
      {subtext && (
        <p className="mt-4 text-[#7A5A4A] text-base leading-[1.55]">
          {subtext}
        </p>
      )}
    </div>
  );
}
