import React from 'react';

interface SectionProps {
  id?: string;
  ariaLabelledby?: string;
  className?: string;
  containerClassName?: string;
  children: React.ReactNode;
}

export function Section({
  id,
  ariaLabelledby,
  className = '',
  containerClassName = '',
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledby}
      className={`py-[72px] lg:py-[120px] px-4 sm:px-6 relative ${className}`}
    >
      <div className={`max-w-[1100px] mx-auto w-full ${containerClassName}`}>
        {children}
      </div>
    </section>
  );
}
