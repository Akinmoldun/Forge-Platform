import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Menu, X, ArrowUpRight } from 'lucide-react';

const GITHUB_REPO = 'https://github.com/Akinmoldun/forge-platform';

export function Section1Nav() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Engineering decisions', href: '#decisions' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Security', href: '#security' },
    { label: 'GitHub', href: GITHUB_REPO, external: true },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-16 w-full bg-white/80 backdrop-blur-md border-b border-black/[0.06] transition-shadow duration-200 ${
        isScrolled ? 'shadow-[0_2px_12px_rgba(0,0,0,0.04)]' : 'shadow-none'
      }`}
    >
      <div className="max-w-[1200px] h-full mx-auto px-4 sm:px-6 flex items-center justify-between relative">
        {/* Logo (small dark rounded square with the Forge mark plus the word "Forge") on the left */}
        <a
          href="#hero"
          onClick={scrollToTop}
          className="flex items-center gap-2.5 text-[#0D0D0D] font-medium text-[16px] tracking-tight hover:opacity-80 transition-opacity z-10"
        >
          <div className="w-7 h-7 rounded-lg bg-[#0D0D0D] text-white flex items-center justify-center font-bold text-xs select-none">
            F
          </div>
          <span>Forge</span>
        </a>

        {/* Links centered (desktop) */}
        <nav className="hidden md:flex items-center gap-6 text-[14px] text-[#575657] absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-[#0D0D0D] transition-colors"
              >
                {link.label}
                <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
              </a>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-[#0D0D0D] transition-colors"
              >
                {link.label}
              </a>
            )
          )}
        </nav>

        {/* Right: Black pill "Get Started" + mobile hamburger */}
        <div className="flex items-center gap-2 z-10">
          <button
            onClick={() => navigate('/login')}
            className="landing-btn-primary h-9 px-4 sm:px-5 text-[13px] sm:text-[14px] select-none"
          >
            Get Started
          </button>

          {/* Hamburger under 768px with min 44px tap target that closes on tap */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-black/5 text-[#0D0D0D] transition-colors select-none"
            aria-label="Toggle navigation"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer: tap targets at least 44px, closes on tap */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-black/[0.06] p-4 flex flex-col gap-1 shadow-[0_8px_16px_rgba(0,0,0,0.04)]">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noreferrer' : undefined}
              onClick={() => setMobileMenuOpen(false)}
              className="min-h-[44px] px-3 rounded-lg text-[15px] font-medium text-[#575657] hover:text-[#0D0D0D] hover:bg-black/5 flex items-center justify-between transition-colors"
            >
              <span>{link.label}</span>
              {link.external && <ArrowUpRight className="w-4 h-4 opacity-50" />}
            </a>
          ))}
          <div className="pt-2 border-t border-black/5 mt-1">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/login');
              }}
              className="w-full min-h-[44px] landing-btn-primary justify-center text-[14px]"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
