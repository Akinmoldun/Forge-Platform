import { Link } from 'react-router';
import { copy } from './copy';
import { ForgeLogoMark } from './Nav';

export function Footer() {
  return (
    <footer className="w-full bg-[#FFFBF5] border-t border-[#E8D8CA] py-16 px-4 sm:px-6">
      <div className="max-w-[1100px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#E8D8CA]/60">
          {/* Left: Logo & brand */}
          <div className="md:col-span-4 space-y-3">
            <Link to="/" className="flex items-center gap-2.5">
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
            {/* Column 1: Getting started */}
            <div className="space-y-3">
              <h4 className="font-semibold text-[#3B1500]">
                {copy.footer.gettingStarted}
              </h4>
              <ul className="space-y-2 text-[#7A5A4A]">
                <li>
                  <Link to="/auth" className="hover:text-[#3B1500] transition-colors">
                    {copy.footer.links.tryDemo}
                  </Link>
                </li>
                <li>
                  <Link to="/auth" className="hover:text-[#3B1500] transition-colors">
                    {copy.footer.links.signIn}
                  </Link>
                </li>
                <li>
                  <a
                    href="https://github.com/Akinmoldun/forge-platform"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#3B1500] transition-colors"
                  >
                    {copy.footer.links.github}
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 2: Resources */}
            <div className="space-y-3">
              <h4 className="font-semibold text-[#3B1500]">
                {copy.footer.resources}
              </h4>
              <ul className="space-y-2 text-[#7A5A4A]">
                <li>
                  <a
                    href="https://github.com/Akinmoldun/forge-platform#readme"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#3B1500] transition-colors"
                  >
                    {copy.footer.links.readme}
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-[#3B1500] transition-colors">
                    {copy.footer.links.architecture}
                  </a>
                </li>
                <li>
                  <a href="#quote" className="hover:text-[#3B1500] transition-colors">
                    {copy.footer.links.decisions}
                  </a>
                </li>
                <li>
                  <a href="#security" className="hover:text-[#3B1500] transition-colors">
                    {copy.footer.links.securityChecklist}
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Features */}
            <div className="space-y-3">
              <h4 className="font-semibold text-[#3B1500]">
                {copy.footer.features}
              </h4>
              <ul className="space-y-2 text-[#7A5A4A]">
                <li>
                  <a href="#diagram" className="hover:text-[#3B1500] transition-colors">
                    {copy.footer.links.workflows}
                  </a>
                </li>
                <li>
                  <a href="#diagram" className="hover:text-[#3B1500] transition-colors">
                    {copy.footer.links.dependencies}
                  </a>
                </li>
                <li>
                  <a href="#risk" className="hover:text-[#3B1500] transition-colors">
                    {copy.footer.links.riskEngine}
                  </a>
                </li>
                <li>
                  <a href="#analytics" className="hover:text-[#3B1500] transition-colors">
                    {copy.footer.links.analytics}
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-[#3B1500] transition-colors">
                    {copy.footer.links.activityHistory}
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
