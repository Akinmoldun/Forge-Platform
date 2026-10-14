import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks/use-auth';
import { ArrowUpRight } from 'lucide-react';
import { Reveal } from '../Reveal';
import { ForgeLogo } from '../ForgeLogo';

const GITHUB_REPO = 'https://github.com/Akinmoldun/forge-platform';

export function Section13Footer() {
  const { isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();

  const handleDemo = async () => {
    try {
      if (!isAuthenticated) {
        await Promise.race([
          signIn('anonymous'),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000)),
        ]).catch(() => {
          // Demo requires no auth, proceed immediately
        });
      }
    } catch {
      // Proceed to demo workspace
    }
    navigate('/app/workspaces/demo-ws-northstar');
  };

  const scrollToTop = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      style={{ backgroundColor: '#0D0D0D', width: '100%' }}
      className="w-full pt-12 pb-8 text-left relative z-1"
    >
      <div className="landing-container max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 pb-8">
          {/* Col 1 & 2: Brand & Tagline */}
          <Reveal index={0} className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <ForgeLogo className="text-white" onClick={scrollToTop} />
              <span className="text-[16px] font-semibold tracking-tight text-white select-none">
                Forge
              </span>
            </div>

            <p className="text-[14px] text-[#A1A1A6] max-w-[320px] leading-relaxed">
              Deterministic workflow orchestration, cycle-free dependency graphs, and explainable risk evaluation for engineering teams.
            </p>
          </Reveal>

          {/* Col 3: Product */}
          <Reveal index={1} className="space-y-3">
            <h4 className="text-[14px] font-[500] text-[#FFFFFF]">Product</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#features"
                  className="text-[14px] text-[#A1A1A6] hover:text-[#FFFFFF] transition-colors"
                >
                  Productivity Features
                </a>
              </li>
              <li>
                <a
                  href="#capabilities"
                  className="text-[14px] text-[#A1A1A6] hover:text-[#FFFFFF] transition-colors"
                >
                  Key Capabilities
                </a>
              </li>
              <li>
                <a
                  href="#decisions"
                  className="text-[14px] text-[#A1A1A6] hover:text-[#FFFFFF] transition-colors"
                >
                  Engineering Decisions
                </a>
              </li>
              <li>
                <a
                  href="#security"
                  className="text-[14px] text-[#A1A1A6] hover:text-[#FFFFFF] transition-colors"
                >
                  Roles & Governance
                </a>
              </li>
            </ul>
          </Reveal>

          {/* Col 4: Platform */}
          <Reveal index={2} className="space-y-3">
            <h4 className="text-[14px] font-[500] text-[#FFFFFF]">Platform</h4>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="text-[14px] text-[#A1A1A6] hover:text-[#FFFFFF] transition-colors text-left cursor-pointer"
                >
                  Create Account
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-[14px] text-[#A1A1A6] hover:text-[#FFFFFF] transition-colors text-left cursor-pointer"
                >
                  Sign In
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleDemo}
                  className="text-[14px] text-[#A1A1A6] hover:text-[#FFFFFF] transition-colors text-left cursor-pointer"
                >
                  Instant Guest Demo
                </button>
              </li>
              <li>
                <a
                  href={GITHUB_REPO}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[14px] text-[#A1A1A6] hover:text-[#FFFFFF] transition-colors"
                >
                  <span>GitHub Repository</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  className="text-[14px] text-[#A1A1A6] hover:text-[#FFFFFF] transition-colors"
                >
                  FAQ & Guides
                </a>
              </li>
            </ul>
          </Reveal>

          {/* Col 5: Security */}
          <Reveal index={3} className="space-y-3">
            <h4 className="text-[14px] font-[500] text-[#FFFFFF]">Security</h4>
            <ul className="space-y-2 text-[14px] text-[#A1A1A6]">
              <li>
                <span>Multi-Tenant Isolation</span>
              </li>
              <li>
                <span>Append-Only Audit</span>
              </li>
              <li>
                <span>DFS Cycle Prevention</span>
              </li>
              <li>
                <span>Role-Based Access Control</span>
              </li>
            </ul>
          </Reveal>
        </div>

        {/* Legal row with 1px top divider at rgba(255, 255, 255, 0.12) */}
        <div
          style={{ borderTop: '1px solid rgba(255, 255, 255, 0.12)' }}
          className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[13px] text-[#8E8E93]"
        >
          <div>© 2026 Forge. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={scrollToTop}
              className="text-[13px] text-[#8E8E93] hover:text-[#FFFFFF] transition-colors cursor-pointer"
            >
              Back to top ↑
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
