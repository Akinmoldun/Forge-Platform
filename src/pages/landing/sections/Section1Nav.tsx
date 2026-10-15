import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { ForgeLogo } from '../ForgeLogo';
import { useMotion } from '../motion/MotionProvider';
import { MagneticButton } from '../motion/MagneticButton';
import { useAuth } from '@/hooks/use-auth';

const GITHUB_REPO = 'https://github.com/Akinmoldun/forge-platform';

interface NavLinkItem {
  label: string;
  href: string;
  id?: string;
  external?: boolean;
}

const navLinks: NavLinkItem[] = [
  { label: 'Features', href: '#features', id: 'features' },
  { label: 'Engineering decisions', href: '#decisions', id: 'decisions' },
  { label: 'FAQ', href: '#faq', id: 'faq' },
  { label: 'Security', href: '#security', id: 'security' },
  { label: 'GitHub', href: GITHUB_REPO, external: true },
];

export function Section1Nav() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { scrollTo } = useMotion();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const [navVisible, setNavVisible] = useState(true);
  const lastScrollY = useRef(0);
  const navContainerRef = useRef<HTMLDivElement>(null);

  // Hide nav on scroll down after 120px, show on scroll up (250ms translateY).
  // Never hide while mobile menu is open.
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (mobileMenuOpen) {
        setNavVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      if (currentScrollY > 120) {
        if (currentScrollY > lastScrollY.current + 4) {
          // Scrolling down
          setNavVisible(false);
        } else if (currentScrollY < lastScrollY.current - 4) {
          // Scrolling up
          setNavVisible(true);
        }
      } else {
        setNavVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mobileMenuOpen]);

  // IntersectionObserver to observe sections and highlight the currently active link
  useEffect(() => {
    const sectionIds = ['features', 'decisions', 'faq', 'security'];
    const observedElements: HTMLElement[] = [];

    const observerCallback: IntersectionObserverCallback = (entries) => {
      const intersectingEntries = entries.filter((entry) => entry.isIntersecting);
      if (intersectingEntries.length > 0) {
        // Pick the entry closest to the top of the viewing area
        const topEntry = intersectingEntries.reduce((prev, current) => {
          return Math.abs(current.boundingClientRect.top - 88) <
            Math.abs(prev.boundingClientRect.top - 88)
            ? current
            : prev;
        });
        setActiveSection(topEntry.target.id);
      }
    };

    const observer = new IntersectionObserver(observerCallback, {
      rootMargin: '-88px 0px -40% 0px',
      threshold: [0.1, 0.25, 0.5],
    });

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
        observedElements.push(el);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Close mobile menu on outside tap and on Escape
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        navContainerRef.current &&
        !navContainerRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  // Smooth scroll to top when clicking brand (or go to dashboard if logged in)
  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      navigate('/app');
      return;
    }
    scrollTo(0, { offset: 0, duration: 1.4 });
    setMobileMenuOpen(false);
  };

  // Smooth scroll with an offset of -96px so headings are not hidden
  const handleLinkClick = (e: React.MouseEvent, link: NavLinkItem) => {
    if (link.external) {
      setMobileMenuOpen(false);
      return;
    }
    e.preventDefault();
    setMobileMenuOpen(false);
    if (!link.id) return;
    scrollTo(`#${link.id}`, { offset: -96, duration: 1.4 });
  };

  return (
    <div
      ref={navContainerRef}
      className="fixed top-[12px] left-0 right-0 mx-auto z-50 transition-transform duration-250 ease-out"
      style={{
        width: 'min(1200px, calc(100% - 24px))',
        transform: `translateY(${navVisible || mobileMenuOpen ? '0px' : '-130%'})`,
      }}
    >
      {/* Floating rounded bar */}
      <header
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.78)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
        }}
        className="w-full h-[56px] rounded-[999px] border border-black/[0.06] pl-[18px] pr-[8px] flex items-center justify-between shadow-none relative"
      >
        {/* Left: Nav icon */}
        <ForgeLogo onClick={scrollToTop} />

        {/* Center: Links (Features, Engineering decisions, FAQ, Security, GitHub) */}
        <nav className="hidden md:flex items-center gap-6 text-[14px] font-medium absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => {
            const isCurrentInView = !link.external && link.id === activeSection;
            if (link.external) {
              return (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#575657] hover:text-[#0D0D0D] transition-colors"
                >
                  <span>{link.label}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                </a>
              );
            }
            return (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link)}
                className={`transition-colors ${
                  isCurrentInView ? 'text-[#0D0D0D]' : 'text-[#575657] hover:text-[#0D0D0D]'
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* Right: "Sign in" link + Black pill "Get Started" + mobile hamburger */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="hidden sm:inline-flex items-center text-[14px] font-medium text-[#575657] hover:text-[#0D0D0D] px-2.5 py-1.5 transition-colors cursor-pointer select-none"
          >
            Sign in
          </button>

          <MagneticButton
            type="button"
            onClick={() => navigate('/signup')}
            className="h-[40px] px-[20px] rounded-[999px] bg-[#0D0D0D] text-white text-[14px] font-medium border border-[#0D0D0D] transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] inline-flex items-center justify-center select-none shadow-none cursor-pointer"
          >
            <span className="hidden sm:inline">Get Started</span>
            <span className="sm:hidden inline">Start</span>
          </MagneticButton>

          {/* Mobile hamburger button: 44px next to Get Started */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-[44px] h-[44px] flex items-center justify-center rounded-full hover:bg-black/5 text-[#0D0D0D] transition-colors select-none cursor-pointer border-0 bg-transparent"
            aria-label="Toggle navigation"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile drawer: rounded white panel under the bar (radius 24px, 1px border, 16px padding), links 48px tall */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
          }}
          className="md:hidden mt-2 w-full rounded-[24px] border border-black/[0.06] p-[16px] flex flex-col gap-1 shadow-none"
        >
          {navLinks.map((link) => {
            const isCurrentInView = !link.external && link.id === activeSection;
            return (
              <a
                key={link.label}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                onClick={(e) => handleLinkClick(e, link)}
                className={`min-h-[48px] px-4 rounded-xl text-[15px] font-medium flex items-center justify-between transition-colors ${
                  isCurrentInView
                    ? 'text-[#0D0D0D] bg-black/5'
                    : 'text-[#575657] hover:text-[#0D0D0D] hover:bg-black/5'
                }`}
              >
                <span>{link.label}</span>
                {link.external && <ArrowUpRight className="w-4 h-4 opacity-50" />}
              </a>
            );
          })}

          <div className="pt-2 mt-1 border-t border-black/[0.06] flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/login');
              }}
              className="min-h-[44px] px-4 rounded-xl text-[15px] font-medium text-[#575657] hover:text-[#0D0D0D] hover:bg-black/5 flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/signup');
              }}
              className="min-h-[44px] px-4 rounded-xl text-[15px] font-medium bg-[#0D0D0D] text-white flex items-center justify-center transition-opacity hover:opacity-90 cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

