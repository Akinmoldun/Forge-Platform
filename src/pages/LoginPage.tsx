import { Link } from 'react-router';
import { AuthForm } from '@/components/AuthForm';
import EarthDome from '@/marketing/EarthDome';

const GITHUB_URL = 'https://github.com/Akinmoldun/forge-platform';

interface LoginPageProps {
  redirectAfterAuth?: string;
}

export default function LoginPage({ redirectAfterAuth = '/app' }: LoginPageProps) {
  return (
    <div className="min-h-screen min-[900px]:h-screen w-full flex flex-col min-[900px]:flex-row min-[900px]:overflow-hidden bg-white">
      {/* Left half: white, content centered, max-width 360px */}
      <div className="w-full min-[900px]:w-1/2 min-h-screen min-[900px]:h-full flex flex-col justify-between p-6 sm:p-10 lg:p-12 bg-white overflow-y-auto min-[900px]:overflow-hidden relative z-10">
        {/* Top-left: Forge logo linking to "/" */}
        <div className="flex items-center justify-between w-full">
          <Link
            to="/"
            aria-label="Forge home"
            className="inline-flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#FF4801] flex items-center justify-center font-bold text-white text-base shadow-xs select-none">
              F
            </div>
            <span className="font-['Hanken_Grotesk',sans-serif] font-bold text-lg tracking-tight text-[#3B1500]">
              Forge
            </span>
          </Link>

          {/* Under 900px: Sign up link moves to the top-right of the white page */}
          <Link
            to="/signup"
            className="min-[900px]:hidden rounded-full border border-[#E8D8CA] px-4 py-1.5 text-xs font-semibold text-[#3B1500] hover:bg-[#FFE5D6] transition-colors"
          >
            Sign up
          </Link>
        </div>

        {/* Form centered, max-width 360px */}
        <div className="w-full max-w-[360px] mx-auto my-auto py-8 min-[900px]:py-0">
          <AuthForm mode="login" redirectAfterAuth={redirectAfterAuth} />
        </div>

        {/* Bottom edge spacer */}
        <div className="h-6" aria-hidden="true" />
      </div>

      {/* Right half: solid #FF4801 panel with globe at 12% white opacity */}
      <div className="hidden min-[900px]:flex min-[900px]:w-1/2 h-full bg-[#FF4801] relative flex-col justify-between p-10 lg:p-12 overflow-hidden select-none text-white">
        {/* Faint thin-line grid / globe background at 12% opacity */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none select-none overflow-hidden opacity-[0.12] flex items-center justify-center"
        >
          <EarthDome />
        </div>

        {/* Top-right: white pill link "Sign up" */}
        <div className="flex justify-end relative z-10">
          <Link
            to="/signup"
            className="rounded-full px-5 py-2 text-sm font-semibold bg-white text-[#FF4801] hover:bg-[#FFE5D6] transition-colors shadow-xs"
          >
            Sign up
          </Link>
        </div>

        {/* Vertically centered text */}
        <div className="relative z-10 my-auto max-w-[440px]">
          {/* 12px mono white label "Forge" */}
          <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-white/90">
            Forge
          </span>

          {/* 36px/500 white heading */}
          <h2 className="font-['Hanken_Grotesk',sans-serif] font-medium text-[36px] text-white leading-[1.15] mt-3">
            Workflows with rules that hold.
          </h2>

          {/* 16px white sentence at 90% opacity */}
          <p className="text-[16px] text-white/90 leading-relaxed mt-4">
            Dependencies, risk and history, enforced on the server.
          </p>

          {/* White pill "View on GitHub" */}
          <div className="mt-8">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full px-6 py-2.5 text-sm font-semibold bg-white text-[#FF4801] hover:bg-[#FFE5D6] transition-colors shadow-xs"
            >
              View on GitHub
            </a>
          </div>
        </div>

        {/* Bottom edge spacer */}
        <div className="h-6" aria-hidden="true" />
      </div>
    </div>
  );
}
