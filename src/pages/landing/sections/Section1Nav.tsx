import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Menu, X, ArrowUpRight } from 'lucide-react';

const GITHUB_REPO = 'https://github.com/Akinmoldun/forge-platform';

export function Section1Nav() {
  const { isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = async () => {
    setError(null);
    if (isAuthenticated) {
      navigate('/app');
      return;
    }
    setIsLoading(true);
    try {
      await signIn('anonymous');
      navigate('/app');
    } catch (err) {
      console.error('Anonymous sign-in error:', err);
      setError('Could not start demo. Try again.');
      setIsLoading(false);
    }
  };

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
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-3 sm:py-4 px-4 sm:px-6">
      <div
        className={`max-w-[1120px] mx-auto rounded-full transition-all duration-200 px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between border ${
          isScrolled
            ? 'bg-white/85 backdrop-blur-md border-black/10 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)]'
            : 'bg-white/95 backdrop-blur-sm border-black/6 shadow-[0_2px_8px_rgba(0,0,0,0.03)]'
        }`}
      >
        {/* Logo left */}
        <a
          href="#hero"
          onClick={scrollToTop}
          className="flex items-center gap-2.5 text-[#0D0D0D] font-medium text-[16px] tracking-tight hover:opacity-80 transition-opacity"
        >
          <div className="w-7 h-7 rounded-lg bg-[#0D0D0D] text-white flex items-center justify-center font-bold text-xs select-none">
            F
          </div>
          <span>Forge</span>
        </a>

        {/* Links center (desktop) */}
        <nav className="hidden md:flex items-center gap-6 text-[14px] text-[#575657]">
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

        {/* Right action */}
        <div className="flex items-center gap-2">
          {error && (
            <span className="hidden sm:inline text-xs text-red-600 mr-2">{error}</span>
          )}
          <button
            onClick={handleGetStarted}
            disabled={isLoading}
            className="landing-btn-primary h-9 px-4 sm:px-5 text-[13px] sm:text-[14px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Starting...</span>
              </>
            ) : (
              <span>Get Started</span>
            )}
          </button>

          {/* Hamburger mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/5 text-[#0D0D0D] transition-colors"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 max-w-[1120px] mx-auto bg-white rounded-2xl border border-black/8 shadow-xl p-5 flex flex-col gap-3">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noreferrer' : undefined}
              onClick={() => setMobileMenuOpen(false)}
              className="text-[15px] font-medium text-[#575657] hover:text-[#0D0D0D] py-1.5 flex items-center justify-between"
            >
              <span>{link.label}</span>
              {link.external && <ArrowUpRight className="w-4 h-4 opacity-50" />}
            </a>
          ))}
          <div className="pt-2 border-t border-black/6">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleGetStarted();
              }}
              disabled={isLoading}
              className="w-full landing-btn-primary h-10 text-[14px]"
            >
              {isLoading ? 'Starting...' : 'Get Started'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
