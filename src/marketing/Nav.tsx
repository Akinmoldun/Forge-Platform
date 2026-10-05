import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Menu, X, Cloud, ChevronDown } from 'lucide-react';
import { copy } from './copy';
import { TryDemoButton } from '@/components/TryDemoButton';

const GITHUB_URL = 'https://github.com/Akinmoldun/forge-platform';

// Cloudflare / Forge Mark SVG
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
      <path
        d="M26 18c0-3.3-2.7-6-6-6-.4 0-.8.05-1.2.14A8.003 8.003 0 0 0 4 17c0 4.4 3.6 8 8 8h13a5 5 0 0 0 1-9.9V18z"
        fill={color}
      />
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
    <header className="w-full flex items-center justify-between py-4 px-4 sm:px-8 text-white">
      {/* Brand logo + name matching Cloudflare Workers Platform header */}
      <Link to="/" onClick={handleLogoClick} className="flex items-center gap-2.5 group select-none">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white">
          <Cloud className="w-6 h-6 text-white fill-white" />
        </div>
        <div className="flex flex-col text-left leading-none">
          <span className="text-[9px] tracking-widest uppercase font-bold text-white/80">FORGE</span>
          <span className="text-[16px] font-bold tracking-tight text-white mt-0.5">Workers Platform</span>
        </div>
      </Link>

      {/* Center navigation links matching screenshot */}
      <nav
        aria-label="Hero navigation"
        className="hidden lg:flex items-center gap-7 text-[14px] font-medium text-white/90"
      >
        <a
          href="/#workflows"
          onClick={(e) => handleNavClick(e, 'workflows')}
          className="hover:text-white transition-colors inline-flex items-center gap-1"
        >
          <span>Products</span>
          <ChevronDown className="w-3.5 h-3.5 opacity-80" />
        </a>
        <a
          href="/#use-cases"
          onClick={(e) => handleNavClick(e, 'use-cases')}
          className="hover:text-white transition-colors inline-flex items-center gap-1"
        >
          <span>Solutions</span>
          <ChevronDown className="w-3.5 h-3.5 opacity-80" />
        </a>
        <a
          href="/#pricing"
          onClick={(e) => handleNavClick(e, 'pricing')}
          className="hover:text-white transition-colors"
        >
          Pricing
        </a>
        <a
          href="/#primitives"
          onClick={(e) => handleNavClick(e, 'primitives')}
          className="hover:text-white transition-colors"
        >
          Documentation
        </a>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white transition-colors"
        >
          Blog
        </a>
      </nav>

      {/* Right actions: Log in (text link) and Start building (white pill button with orange text) */}
      <div className="flex items-center gap-5">
        <Link
          to="/login"
          className="text-[14px] font-medium text-white hover:text-white/90 transition-colors select-none"
        >
          Login
        </Link>
        <Link
          to="/auth"
          className="bg-white text-[#F36421] text-[13px] sm:text-[14px] font-semibold px-5 py-2 rounded-full shadow-xs hover:bg-white/95 transition-all select-none"
        >
          Start building
        </Link>
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
          <div className="w-7 h-7 rounded-lg bg-[#F36421] flex items-center justify-center font-bold text-white text-sm shadow-xs">
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
                ? 'text-[#F36421] font-semibold'
                : 'text-[#3B1500] hover:text-[#F36421]'
            }`}
          >
            {copy.nav.features}
          </a>
          <a
            href="/#how-it-works"
            onClick={(e) => handleNavClick(e, 'how-it-works')}
            className={`transition-colors ${
              activeSection === 'how-it-works'
                ? 'text-[#F36421] font-semibold'
                : 'text-[#3B1500] hover:text-[#F36421]'
            }`}
          >
            {copy.nav.howItWorks}
          </a>
          <a
            href="/#security"
            onClick={(e) => handleNavClick(e, 'security')}
            className={`transition-colors ${
              activeSection === 'security'
                ? 'text-[#F36421] font-semibold'
                : 'text-[#3B1500] hover:text-[#F36421]'
            }`}
          >
            {copy.nav.security}
          </a>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#3B1500] hover:text-[#F36421] transition-colors"
          >
            {copy.nav.github}
          </a>
        </nav>

        {/* Actions & Mobile menu toggle */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-[14px] font-medium text-[#3B1500] hover:text-[#F36421] px-3 py-1.5 transition-colors hidden sm:inline-block"
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
            className="md:hidden p-2 text-[#3B1500] hover:text-[#F36421] cursor-pointer"
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
                ? 'text-[#F36421] font-semibold bg-[#FFEFE4]'
                : 'text-[#3B1500] hover:text-[#F36421]'
            }`}
          >
            {copy.nav.features}
          </a>
          <a
            href="/#how-it-works"
            onClick={(e) => handleNavClick(e, 'how-it-works')}
            className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeSection === 'how-it-works'
                ? 'text-[#F36421] font-semibold bg-[#FFEFE4]'
                : 'text-[#3B1500] hover:text-[#F36421]'
            }`}
          >
            {copy.nav.howItWorks}
          </a>
          <a
            href="/#security"
            onClick={(e) => handleNavClick(e, 'security')}
            className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeSection === 'security'
                ? 'text-[#F36421] font-semibold bg-[#FFEFE4]'
                : 'text-[#3B1500] hover:text-[#F36421]'
            }`}
          >
            {copy.nav.security}
          </a>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileMenuOpen(false)}
            className="px-3 py-2.5 rounded-lg text-sm font-medium text-[#3B1500] hover:text-[#F36421] transition-colors"
          >
            {copy.nav.github}
          </a>
          <Link
            to="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="px-3 py-2.5 rounded-lg text-sm font-medium text-[#3B1500] hover:text-[#F36421] transition-colors sm:hidden"
          >
            {copy.nav.login}
          </Link>
        </div>
      )}
    </header>
  );
}
