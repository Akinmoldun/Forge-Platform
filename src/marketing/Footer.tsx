import { Link, useLocation, useNavigate } from 'react-router';
import { copy } from './copy';
import { ForgeLogoMark } from './Nav';
import { TryDemoButton } from '@/components/TryDemoButton';

const GITHUB_URL = 'https://github.com/Akinmoldun/forge-platform';

export function Footer() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
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
    <footer className="w-full bg-[#FFFBF5] border-t border-[#E8D8CA] py-16 px-4 sm:px-6">
      <div className="max-w-[1100px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#E8D8CA]/60">
          {/* Left: Logo & brand */}
          <div className="md:col-span-4 space-y-3">
            <Link to="/" onClick={handleLogoClick} className="flex items-center gap-2.5">
              <ForgeLogoMark className="w-7 h-7" color="#FF4801" />
              <span className="font-['Hanken_Grotesk',sans-serif] font-semibold text-lg text-[#3B1500] tracking-tight">
                {copy.brand.name}
              </span>
            </Link>
            <p className="text-sm text-[#7A5A4A] max-w-xs leading-relaxed">
              {copy.brand.tagline}
            </p>
          </div>

          {/* Right: 3 Link Columns (13px links) */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8 text-[13px]">
            {/* Column 1: Getting started / Product */}
            <div className="space-y-3">
              <h4 className="font-semibold text-[#3B1500]">
                {copy.footer.gettingStarted}
              </h4>
              <ul className="space-y-2 text-[#7A5A4A]">
                <li>
                  <TryDemoButton
                    variant="link"
                    className="hover:text-[#3B1500] transition-colors"
                  >
                    {copy.footer.links.tryDemo}
                  </TryDemoButton>
                </li>
                <li>
                  <Link to="/login" className="hover:text-[#3B1500] transition-colors">
                    {copy.footer.links.signIn}
                  </Link>
                </li>
                <li>
                  <a
                    href={GITHUB_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#3B1500] transition-colors"
                  >
                    {copy.footer.links.github}
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 2: Resources -> GitHub repo with README anchors */}
            <div className="space-y-3">
              <h4 className="font-semibold text-[#3B1500]">
                {copy.footer.resources}
              </h4>
              <ul className="space-y-2 text-[#7A5A4A]">
                <li>
                  <a
                    href={`${GITHUB_URL}#readme`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#3B1500] transition-colors"
                  >
                    {copy.footer.links.readme}
                  </a>
                </li>
                <li>
                  <a
                    href={`${GITHUB_URL}#architecture`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#3B1500] transition-colors"
                  >
                    {copy.footer.links.architecture}
                  </a>
                </li>
                <li>
                  <a
                    href={`${GITHUB_URL}#engineering-decisions`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#3B1500] transition-colors"
                  >
                    {copy.footer.links.decisions}
                  </a>
                </li>
                <li>
                  <a
                    href={`${GITHUB_URL}#security-checklist-coverage`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#3B1500] transition-colors"
                  >
                    {copy.footer.links.securityChecklist}
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Features -> targeted landing sections */}
            <div className="space-y-3">
              <h4 className="font-semibold text-[#3B1500]">
                {copy.footer.features}
              </h4>
              <ul className="space-y-2 text-[#7A5A4A]">
                <li>
                  <a
                    href="/#how-it-works"
                    onClick={(e) => handleNavClick(e, 'how-it-works')}
                    className="hover:text-[#3B1500] transition-colors"
                  >
                    {copy.footer.links.workflows}
                  </a>
                </li>
                <li>
                  <a
                    href="/#how-it-works"
                    onClick={(e) => handleNavClick(e, 'how-it-works')}
                    className="hover:text-[#3B1500] transition-colors"
                  >
                    {copy.footer.links.dependencies}
                  </a>
                </li>
                <li>
                  <a
                    href="/#security"
                    onClick={(e) => handleNavClick(e, 'security')}
                    className="hover:text-[#3B1500] transition-colors"
                  >
                    {copy.footer.links.riskEngine}
                  </a>
                </li>
                <li>
                  <a
                    href="/#primitives"
                    onClick={(e) => handleNavClick(e, 'primitives')}
                    className="hover:text-[#3B1500] transition-colors"
                  >
                    {copy.footer.links.analytics}
                  </a>
                </li>
                <li>
                  <a
                    href="/#primitives"
                    onClick={(e) => handleNavClick(e, 'primitives')}
                    className="hover:text-[#3B1500] transition-colors"
                  >
                    {copy.footer.links.notifications}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#7A5A4A]">
          <p>{copy.brand.copyright}</p>
          <p className="mt-2 sm:mt-0">All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
