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
      data-reveal-header
      className={`reveal-init mb-[56px] ${
        isCenter ? 'text-center max-w-3xl mx-auto' : 'max-w-2xl'
      } ${className}`}
    >
      {tag && (
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#F36421] text-white mb-3">
          {tag}
        </span>
      )}
      <h2
        id={id}
        className="font-['Hanken_Grotesk',sans-serif] font-medium text-[30px] md:text-[44px] text-[#3B1500] leading-[1.1] tracking-[-0.02em]"
      >
        {title}
      </h2>
      {subtext && (
        <p className="mt-[16px] text-[#7A5A47] text-[16px] leading-[1.6] max-w-[560px] mx-auto text-center">
          {subtext}
        </p>
      )}
    </div>
  );
}
