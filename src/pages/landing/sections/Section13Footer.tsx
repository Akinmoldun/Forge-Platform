import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks/use-auth';
import { ArrowUpRight } from 'lucide-react';

const GITHUB_REPO = 'https://github.com/Akinmoldun/forge-platform';

export function Section13Footer() {
  const { isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();

  const handleDemo = async () => {
    if (isAuthenticated) {
      navigate('/app');
      return;
    }
    try {
      await signIn('anonymous');
      navigate('/app');
    } catch {
      navigate('/login');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white border-t border-black/6 pt-10 pb-6 text-left">
      <div className="landing-container">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 pb-6 border-b border-black/6">
          {/* Col 1 & 2: Brand & Tagline */}
          <div className="md:col-span-2 space-y-3">
            <button
              onClick={scrollToTop}
              className="flex items-center gap-2.5 text-[#0D0D0D] font-medium text-[16px] tracking-tight hover:opacity-80 transition-opacity"
            >
              <div className="w-7 h-7 rounded-lg bg-[#0D0D0D] text-white flex items-center justify-center font-bold text-xs select-none">
                F
              </div>
              <span>Forge</span>
            </button>

            <p className="text-xs text-[#575657] max-w-[320px] leading-relaxed">
              Deterministic workflow orchestration, cycle-free dependency graphs, and explainable risk evaluation for engineering teams.
            </p>
          </div>

          {/* Col 3: Product */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#0D0D0D]">Product</h4>
            <ul className="space-y-1.5 text-xs text-[#575657]">
              <li>
                <a href="#features" className="hover:text-[#0D0D0D] transition-colors">
                  Productivity Features
                </a>
              </li>
              <li>
                <a href="#capabilities" className="hover:text-[#0D0D0D] transition-colors">
                  Key Capabilities
                </a>
              </li>
              <li>
                <a href="#decisions" className="hover:text-[#0D0D0D] transition-colors">
                  Engineering Decisions
                </a>
              </li>
              <li>
                <a href="#security" className="hover:text-[#0D0D0D] transition-colors">
                  Roles & Governance
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#0D0D0D]">Platform</h4>
            <ul className="space-y-1.5 text-xs text-[#575657]">
              <li>
                <button
                  onClick={handleDemo}
                  className="hover:text-[#0D0D0D] transition-colors text-left"
                >
                  Instant Guest Demo
                </button>
              </li>
              <li>
                <a
                  href={GITHUB_REPO}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-[#0D0D0D] transition-colors"
                >
                  <span>GitHub Repository</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-[#0D0D0D] transition-colors">
                  FAQ & Guides
                </a>
              </li>
            </ul>
          </div>

          {/* Col 5: Security */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#0D0D0D]">Security</h4>
            <ul className="space-y-1.5 text-xs text-[#575657]">
              <li>
                <span className="text-[#575657]">Multi-Tenant Isolation</span>
              </li>
              <li>
                <span className="text-[#575657]">Append-Only Audit</span>
              </li>
              <li>
                <span className="text-[#575657]">DFS Cycle Prevention</span>
              </li>
              <li>
                <span className="text-[#575657]">Role-Based Access Control</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#575657]">
          <div>© 2026 Forge. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <button onClick={scrollToTop} className="hover:text-[#0D0D0D] transition-colors">
              Back to top ↑
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
