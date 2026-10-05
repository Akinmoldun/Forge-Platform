import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { copy } from './copy';
import { PillButton } from './PillButton';

// Forge Mark SVG (white or brand colored)
export function ForgeLogoMark({
  className = 'w-6 h-6',
  color = 'currentColor',
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" fill={color} />
      <path
        d="M8 10h16M8 16h11M8 22h7"
        stroke="#FFF"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Top Nav inside the orange hero panel
export function HeroNav() {
  return (
    <header className="w-full flex items-center justify-between py-6 px-6 sm:px-10 text-white">
      {/* Brand logo + name */}
      <Link to="/" className="flex items-center gap-2.5 group">
        <ForgeLogoMark className="w-7 h-7" color="#3B1500" />
        <span className="font-['Hanken_Grotesk',sans-serif] font-semibold text-lg tracking-tight">
          {copy.brand.name}
        </span>
      </Link>

      {/* Center navigation links */}
      <nav
        aria-label="Hero navigation"
        className="hidden md:flex items-center gap-8 text-sm font-medium text-white/90"
      >
        <a href="#features" className="hover:text-white transition-colors">
          {copy.nav.features}
        </a>
        <a href="#how-it-works" className="hover:text-white transition-colors">
          {copy.nav.howItWorks}
        </a>
        <a href="#security" className="hover:text-white transition-colors">
          {copy.nav.security}
        </a>
        <a
          href="https://github.com/Akinmoldun/forge-platform"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white transition-colors"
        >
          {copy.nav.github}
        </a>
      </nav>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <Link
          to="/auth"
          className="rounded-full px-4 py-2 text-xs sm:text-sm font-medium border border-white/80 text-white hover:bg-white/10 transition-colors"
        >
          {copy.nav.login}
        </Link>
        <PillButton to="/auth" variant="white" className="text-xs sm:text-sm py-2 px-4 sm:px-5">
          {copy.nav.tryDemo}
        </PillButton>
      </div>
    </header>
  );
}

// Sticky nav that appears after scrolling past the hero
export function StickyNav() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isScrolled) return null;

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-[#FFFBF5]/95 backdrop-blur-md border-b border-[#E8D8CA] transition-all duration-200 py-3.5 px-4 sm:px-8 shadow-xs"
    >
      <div className="max-w-[1100px] mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <ForgeLogoMark className="w-6 h-6" color="#FF4801" />
          <span className="font-['Hanken_Grotesk',sans-serif] font-semibold text-base text-[#3B1500] tracking-tight">
            {copy.brand.name}
          </span>
        </Link>

        {/* Links */}
        <nav
          aria-label="Sticky navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#7A5A4A]"
        >
          <a href="#features" className="hover:text-[#3B1500] transition-colors">
            {copy.nav.features}
          </a>
          <a href="#how-it-works" className="hover:text-[#3B1500] transition-colors">
            {copy.nav.howItWorks}
          </a>
          <a href="#security" className="hover:text-[#3B1500] transition-colors">
            {copy.nav.security}
          </a>
          <a
            href="https://github.com/Akinmoldun/forge-platform"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#3B1500] transition-colors"
          >
            {copy.nav.github}
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/auth"
            className="text-sm font-medium text-[#7A5A4A] hover:text-[#3B1500] px-3 py-1.5 transition-colors hidden sm:inline-block"
          >
            {copy.nav.login}
          </Link>
          <PillButton to="/auth" variant="primary" className="text-xs sm:text-sm py-2 px-4 sm:px-5">
            {copy.nav.tryDemo}
          </PillButton>
        </div>
      </div>
    </header>
  );
}
