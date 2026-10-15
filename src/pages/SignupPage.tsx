import { Link, Navigate } from 'react-router';
import { useAuth } from '@/hooks/use-auth';
import { AuthForm } from '@/components/AuthForm';
import { AuthDecorativePanel } from '@/components/AuthDecorativePanel';

interface SignupPageProps {
  redirectAfterAuth?: string;
}

export default function SignupPage({ redirectAfterAuth = '/app' }: SignupPageProps) {
  const { isAuthenticated, user } = useAuth();

  // If already signed in with a real account (non-anonymous), redirect to app
  if (isAuthenticated && !user?.isAnonymous) {
    return <Navigate to={redirectAfterAuth} replace />;
  }

  return (
    <div className="min-h-screen min-[900px]:h-screen w-full flex flex-col min-[900px]:flex-row min-[900px]:overflow-hidden bg-[#FBFBFC]">
      {/* Left half: white background, content vertically centered, max-width 380px */}
      <div className="w-full min-[900px]:w-1/2 min-h-screen min-[900px]:h-full flex flex-col justify-between bg-white overflow-y-auto min-[900px]:overflow-hidden relative z-10">
        {/* Top-left: Forge logo and wordmark (padding 32px 48px on desktop) */}
        <div className="flex items-center justify-between w-full p-6 sm:p-8 min-[900px]:px-12 min-[900px]:py-8">
          <Link
            to="/"
            aria-label="Forge home"
            className="inline-flex items-center gap-2.5 group select-none text-[#0D0D0D] hover:opacity-80 transition-opacity"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 32 32"
              className="w-[28px] h-[28px] text-[#0D0D0D]"
              aria-hidden="true"
            >
              <path d="M0 0h32v32H0z" fill="none" />
              <path fill="currentColor" d="M8 4v4H4V4zM2 2v8h8V2Zm16 5v4h-4V7zm-6-2v8h8V5ZM8 16v4H4v-4zm-6-2v8h8v-8Z" />
              <path fill="currentColor" d="M22 10v6h-6v6h-6v8h20V10Zm-4 8h4v4h-4Zm-2 10h-4v-4h4Zm6 0h-4v-4h4Zm6 0h-4v-4h4Zm0-6h-4v-4h4Zm-4-6v-4h4v4Z" />
            </svg>
            <span className="text-[17px] font-semibold tracking-tight text-[#0D0D0D]">
              Forge
            </span>
          </Link>

          {/* Under 900px: Log in link moves to top-right */}
          <Link
            to="/login"
            className="min-[900px]:hidden rounded-full border border-black/[0.08] px-3.5 py-1.5 text-[13px] font-medium text-[#0D0D0D] hover:border-black/20 transition-colors"
          >
            Log in
          </Link>
        </div>

        {/* Form centered, max-width 380px, padding 24px under 900px */}
        <div className="w-full max-w-[380px] mx-auto my-auto px-6 py-8 min-[900px]:px-0 min-[900px]:py-0">
          <AuthForm mode="signup" redirectAfterAuth={redirectAfterAuth} />
          {import.meta.env.DEV && (
            <div className="mt-4 p-2 rounded bg-black/[0.04] text-center font-mono text-[11px] text-[#575657]">
              Origin: {typeof window !== "undefined" ? window.location.origin : ""}
            </div>
          )}
        </div>

        {/* Bottom edge spacer */}
        <div className="h-8 min-[900px]:px-12 min-[900px]:py-4" aria-hidden="true" />
      </div>

      {/* Right half: decorative panel */}
      <AuthDecorativePanel mode="signup" />
    </div>
  );
}
