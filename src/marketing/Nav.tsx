import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Menu, X } from 'lucide-react';
import { copy } from './copy';
import { TryDemoButton } from '@/components/TryDemoButton';

const GITHUB_URL = 'https://github.com/Akinmoldun/forge-platform';

// Forge Mark SVG (brand colored or white)
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
        d="M9 11h14v3.5h-5.25V23h-3.5V14.5H9V11z"
        fill="#FFFFFF"
      />
      <circle cx="23" cy="9" r="2.5" fill="#FF4801" />
    </svg>
  );
}

// Hook to track the active section in view using IntersectionObserver
function useActiveSection() {
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const sectionIds = ['features', 'how-it-works', 'security', 'primitives'];
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-40% 0px -55% 0px',
        threshold: 0,
      }
    );

    sections.forEach((section) => observer.observe(section));

    const handleScrollAtTop = () => {
      if (window.scrollY < 200) {
        setActiveSection('');
      }
    };
    window.addEventListener('scroll', handleScrollAtTop, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScrollAtTop);
    };
  }, []);

  return activeSection;
}

// Hero navigation bar (sits at top inside the hero margin, rounded 16px bar)
export function HeroNav() {
  const location = useLocation();

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (location.pathname === '/' || location.pathname === '') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (window.location.hash) {
        window.history.pushState(null, '', '/');
      }
    }
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    if (location.pathname === '/' || location.pathname === '') {
      e.preventDefault();
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', `/#${id}`);
      }
    }
  };

  return (
    <header className="w-full flex items-center justify-between py-4 px-5 sm:px-8 text-white rounded-[16px]">
      {/* Brand logo + name */}
      <Link to="/" onClick={handleLogoClick} className="flex items-center gap-2.5 group select-none">
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-bold text-[#FF4801] text-base shadow-xs">
          F
        </div>
        <span className="font-['Hanken_Grotesk',sans-serif] font-semibold text-lg tracking-tight text-white">
          {copy.brand.name}
        </span>
      </Link>

      {/* Center navigation links: 14px, --white */}
      <nav
        aria-label="Hero navigation"
        className="hidden md:flex items-center gap-8 text-[14px] font-medium text-white/90"
      >
        <a
          href="/#features"
          onClick={(e) => handleNavClick(e, 'features')}
          className="hover:text-white transition-colors"
        >
          {copy.nav.features}
        </a>
        <a
          href="/#how-it-works"
          onClick={(e) => handleNavClick(e, 'how-it-works')}
          className="hover:text-white transition-colors"
        >
          {copy.nav.howItWorks}
        </a>
        <a
          href="/#security"
          onClick={(e) => handleNavClick(e, 'security')}
          className="hover:text-white transition-colors"
        >
          {copy.nav.security}
        </a>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white transition-colors"
        >
          {copy.nav.github}
        </a>
      </nav>

      {/* Right actions: Log in (ghost) and Try demo (white) */}
      <div className="flex items-center gap-3">
        <Link
          to="/login"
          className="rounded-full h-[40px] px-[18px] text-[14px] font-medium bg-white/[0.18] border border-white/40 text-white hover:bg-white/[0.28] hover:-translate-y-[1px] transition-all duration-200 inline-flex items-center justify-center select-none"
        >
          {copy.nav.login}
        </Link>
        <TryDemoButton variant="white" className="font-semibold">
          {copy.nav.tryDemo}
        </TryDemoButton>
      </div>
    </header>
  );
}

// Sticky nav that appears after scrolling past the hero
export function StickyNav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const activeSection = useActiveSection();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setMobileMenuOpen(false);
    if (location.pathname === '/' || location.pathname === '') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (window.location.hash) {
        window.history.pushState(null, '', '/');
      }
    } else {
      e.preventDefault();
      navigate('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    setMobileMenuOpen(false);
    if (location.pathname === '/' || location.pathname === '') {
      e.preventDefault();
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', `/#${id}`);
      }
    }
  };

  if (!isScrolled) return null;

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-[64px] bg-[rgba(255,251,245,0.85)] backdrop-blur-[12px] border-b border-[#E8D8CA] transition-all duration-[250ms] px-4 sm:px-6 flex items-center shadow-xs"
    >
      <div className="max-w-[1100px] mx-auto w-full flex items-center justify-between">
        {/* Brand */}
        <Link to="/" onClick={handleLogoClick} className="flex items-center gap-2.5 group select-none">
          <div className="w-7 h-7 rounded-lg bg-[#FF4801] flex items-center justify-center font-bold text-white text-sm shadow-xs">
            F
          </div>
          <span className="font-['Hanken_Grotesk',sans-serif] font-semibold text-base text-[#3B1500] tracking-tight">
            {copy.brand.name}
          </span>
        </Link>

        {/* Desktop Links with Active State highlighting */}
        <nav
          aria-label="Sticky navigation"
          className="hidden md:flex items-center gap-8 text-[14px] font-medium"
        >
          <a
            href="/#features"
            onClick={(e) => handleNavClick(e, 'features')}
            className={`transition-colors ${
              activeSection === 'features'
                ? 'text-[#FF4801] font-semibold'
                : 'text-[#3B1500] hover:text-[#FF4801]'
            }`}
          >
            {copy.nav.features}
          </a>
          <a
            href="/#how-it-works"
            onClick={(e) => handleNavClick(e, 'how-it-works')}
            className={`transition-colors ${
              activeSection === 'how-it-works'
                ? 'text-[#FF4801] font-semibold'
                : 'text-[#3B1500] hover:text-[#FF4801]'
            }`}
          >
            {copy.nav.howItWorks}
          </a>
          <a
            href="/#security"
            onClick={(e) => handleNavClick(e, 'security')}
            className={`transition-colors ${
              activeSection === 'security'
                ? 'text-[#FF4801] font-semibold'
                : 'text-[#3B1500] hover:text-[#FF4801]'
            }`}
          >
            {copy.nav.security}
          </a>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#3B1500] hover:text-[#FF4801] transition-colors"
          >
            {copy.nav.github}
          </a>
        </nav>

        {/* Actions & Mobile menu toggle */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-[14px] font-medium text-[#3B1500] hover:text-[#FF4801] px-3 py-1.5 transition-colors hidden sm:inline-block"
          >
            {copy.nav.login}
          </Link>
          <TryDemoButton variant="primary">
            {copy.nav.tryDemo}
          </TryDemoButton>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            className="md:hidden p-2 text-[#3B1500] hover:text-[#FF4801] cursor-pointer"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Full-width Sheet (<768px), closes on link tap */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-[64px] bg-[#FFFBF5]/98 backdrop-blur-[12px] border-b border-[#E8D8CA] p-6 flex flex-col gap-4 shadow-lg md:hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <a
            href="/#features"
            onClick={(e) => handleNavClick(e, 'features')}
            className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeSection === 'features'
                ? 'text-[#FF4801] font-semibold bg-[#FFEFE4]'
                : 'text-[#3B1500] hover:text-[#FF4801]'
            }`}
          >
            {copy.nav.features}
          </a>
          <a
            href="/#how-it-works"
            onClick={(e) => handleNavClick(e, 'how-it-works')}
            className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeSection === 'how-it-works'
                ? 'text-[#FF4801] font-semibold bg-[#FFEFE4]'
                : 'text-[#3B1500] hover:text-[#FF4801]'
            }`}
          >
            {copy.nav.howItWorks}
          </a>
          <a
            href="/#security"
            onClick={(e) => handleNavClick(e, 'security')}
            className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeSection === 'security'
                ? 'text-[#FF4801] font-semibold bg-[#FFEFE4]'
                : 'text-[#3B1500] hover:text-[#FF4801]'
            }`}
          >
            {copy.nav.security}
          </a>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileMenuOpen(false)}
            className="px-3 py-2.5 rounded-lg text-sm font-medium text-[#3B1500] hover:text-[#FF4801] transition-colors"
          >
            {copy.nav.github}
          </a>
          <Link
            to="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="px-3 py-2.5 rounded-lg text-sm font-medium text-[#3B1500] hover:text-[#FF4801] transition-colors sm:hidden"
          >
            {copy.nav.login}
          </Link>
        </div>
      )}
    </header>
  );
}
