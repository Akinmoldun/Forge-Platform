import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router';
import { useAuth } from '@/hooks/use-auth';
import { enableDemoMode, disableDemoMode } from '@/lib/demoMode';
import { isConvexConfigured } from '@/hooks/use-safe-query';
import { Loader2, User, Info, Eye, EyeOff } from 'lucide-react';

interface AuthFormProps {
  mode: 'login' | 'signup';
  redirectAfterAuth?: string;
}

export function AuthForm({ mode, redirectAfterAuth = '/app' }: AuthFormProps) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const rawTarget =
    searchParams.get('returnTo') ||
    searchParams.get('redirect') ||
    redirectAfterAuth ||
    '/app';

  // Guard against self-redirect loops if returnTo was pointing to auth routes
  const safeRedirect =
    rawTarget === '/login' ||
    rawTarget === '/signup' ||
    rawTarget === '/auth' ||
    rawTarget.startsWith('/login?') ||
    rawTarget.startsWith('/signup?') ||
    rawTarget.startsWith('/auth?')
      ? '/app'
      : rawTarget;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isGuestLoading = false;
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guestError, setGuestError] = useState<string | null>(null);
  const [githubError, setGithubError] = useState<string | null>(null);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const emailInputRef = useRef<HTMLInputElement>(null);

  // Capture real OAuth errors from URL query parameters (e.g. from GitHub or Google redirect failure)
  useEffect(() => {
    const oauthError = searchParams.get('error_description') || searchParams.get('error');
    if (oauthError) {
      console.error('[OAuth] Authentication error from redirect:', oauthError);
      setGithubError(`Authentication failed: ${oauthError}`);
    }
  }, [searchParams]);

  // If already signed in, redirect immediately to app home
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(safeRedirect, { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate, safeRedirect]);

  // Focus email input on mount
  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  const withTimeout = <T,>(promise: Promise<T> | Promise<unknown>, ms = 10000): Promise<T> => {
    return Promise.race([
      promise as Promise<T>,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out')), ms),
      ),
    ]);
  };

  const validateEmail = (val: string): boolean => {
    const trimmed = val.trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting || isGuestLoading || isGitHubLoading || isGoogleLoading) return;

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !validateEmail(trimmedEmail)) {
      setError('Enter a valid email');
      return;
    }

    if (!password) {
      setError('Enter your password');
      return;
    }

    if (mode === 'signup' && password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    disableDemoMode();
    setError(null);
    setGithubError(null);
    setGoogleError(null);
    setGuestError(null);

    if (!isConvexConfigured) {
      setError("Email & password sign-in requires a connected Convex deployment. Use 'Try the demo as guest' to test Forge.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.set('email', trimmedEmail);
      formData.set('password', password);
      formData.set('flow', mode === 'login' ? 'signIn' : 'signUp');

      await withTimeout(signIn('password', formData), 10000);
      navigate(safeRedirect, { replace: true });
    } catch (err: unknown) {
      console.error('Password sign-in error:', err);
      const rawMsg = err instanceof Error ? err.message : String(err);
      const dataStr = (err as { data?: unknown })?.data
        ? String((err as { data?: unknown }).data)
        : '';
      const combined = `${dataStr} ${rawMsg}`.toLowerCase();

      if (combined.includes('timed out') || combined.includes('timeout')) {
        setError('The request timed out, please try again');
      } else if (
        combined.includes('too many') ||
        combined.includes('rate') ||
        combined.includes('maxfailedattemps')
      ) {
        setError('Too many attempts, try again later');
      } else if (mode === 'login') {
        setError('Incorrect email or password');
      } else {
        setError('We could not create your account. If you already have one, sign in instead.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isGoogleLoading || isGitHubLoading || isSubmitting || isGuestLoading) return;
    disableDemoMode();
    setGoogleError(null);
    setGithubError(null);
    setError(null);
    setGuestError(null);

    if (!isConvexConfigured) {
      setGoogleError("Google sign-in requires a connected Convex deployment with AUTH_GOOGLE_ID & AUTH_GOOGLE_SECRET configured. Use 'Try the demo as guest' to test Forge.");
      return;
    }

    setIsGoogleLoading(true);

    try {
      const destination = typeof window !== 'undefined' && window.location.origin
        ? `${window.location.origin}${safeRedirect.startsWith('/') ? safeRedirect : '/' + safeRedirect}`
        : safeRedirect;
      await signIn('google', { redirectTo: destination });
    } catch (err: unknown) {
      console.error('Google sign-in error:', err);
      setGoogleError("Google sign-in is not available yet");
      setIsGoogleLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    if (isGitHubLoading || isGoogleLoading || isSubmitting || isGuestLoading) return;
    disableDemoMode();
    setGithubError(null);
    setGoogleError(null);
    setError(null);
    setGuestError(null);

    if (!isConvexConfigured) {
      setGithubError("GitHub sign-in requires a connected Convex deployment with AUTH_GITHUB_ID & AUTH_GITHUB_SECRET configured. Use 'Try the demo as guest' to test Forge.");
      return;
    }

    setIsGitHubLoading(true);

    try {
      const destination = typeof window !== 'undefined' && window.location.origin
        ? `${window.location.origin}${safeRedirect.startsWith('/') ? safeRedirect : '/' + safeRedirect}`
        : safeRedirect;
      await signIn('github', { redirectTo: destination });
    } catch (err: unknown) {
      console.error('GitHub sign-in error:', err);
      const realMsg = err instanceof Error ? err.message : String(err);
      const msg = realMsg.toLowerCase();
      if (msg.includes('not configured') || msg.includes('missing auth_github')) {
        setGithubError("GitHub sign-in is not yet configured on Convex Cloud. Set AUTH_GITHUB_ID & AUTH_GITHUB_SECRET and deploy.");
      } else {
        setGithubError(realMsg || "Couldn't sign in with GitHub, try again");
      }
      setIsGitHubLoading(false);
    }
  };

  const handleGuestSignIn = () => {
    if (isSubmitting || isGitHubLoading || isGoogleLoading) return;
    setGuestError(null);
    setError(null);
    setGithubError(null);
    setGoogleError(null);
    enableDemoMode();
    navigate(safeRedirect || '/app', { replace: true });
  };

  return (
    <div className="w-full">
      <style>{`
        .auth-field-input:focus {
          border-color: #0D0D0D !important;
          outline: 3px solid rgba(0, 0, 0, 0.08) !important;
          outline-offset: 0 !important;
          box-shadow: none !important;
        }
      `}</style>

      <div className="transition-opacity duration-150 motion-reduce:transition-none">
        {/* Heading */}
        <h1 className="text-[32px] font-medium tracking-[-0.03em] text-[#0D0D0D] leading-[1.2]">
          {mode === 'login' ? 'Sign in to Forge' : 'Create your Forge account'}
        </h1>

        {/* Subheading */}
        <p className="mt-2 text-[15px] text-[#575657] leading-relaxed">
          {mode === 'login'
            ? 'Enter your email and password.'
            : 'Choose an email and a password (at least 8 characters).'}
        </p>

        {/* Friendly preview notice when Convex is not configured */}
        {!isConvexConfigured && (
          <div className="mt-5 rounded-[12px] border border-amber-200 bg-amber-50/90 p-3.5 text-left">
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-[13px] text-amber-900 leading-relaxed">
                <span className="font-semibold">Preview environment:</span> Real accounts require a connected Convex backend. You can explore all Forge workspaces and features right now with{" "}
                <button
                  type="button"
                  onClick={handleGuestSignIn}
                  className="font-semibold underline hover:text-black cursor-pointer"
                >
                  Try the demo as guest
                </button>
                .
              </div>
            </div>
          </div>
        )}

        {/* Email + Password form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label
              htmlFor="auth-email"
              className="block text-[14px] font-medium text-[#0D0D0D] mb-2"
            >
              Email
            </label>
            <input
              ref={emailInputRef}
              id="auth-email"
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              disabled={isSubmitting || isGuestLoading || isGitHubLoading || isGoogleLoading}
              placeholder="name@example.com"
              required
              className="auth-field-input w-full h-[48px] px-4 rounded-[12px] border border-black/[0.12] bg-white text-[#0D0D0D] text-[16px] placeholder:text-[#575657]/50 transition-all disabled:opacity-60"
              style={{ boxShadow: 'none' }}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="auth-password"
                className="block text-[14px] font-medium text-[#0D0D0D]"
              >
                Password
              </label>
            </div>
            <div className="relative">
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                disabled={isSubmitting || isGuestLoading || isGitHubLoading || isGoogleLoading}
                placeholder={mode === 'signup' ? 'At least 8 characters' : 'Enter your password'}
                required
                className="auth-field-input w-full h-[48px] pl-4 pr-12 rounded-[12px] border border-black/[0.12] bg-white text-[#0D0D0D] text-[16px] placeholder:text-[#575657]/50 transition-all disabled:opacity-60"
                style={{ boxShadow: 'none' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={isSubmitting}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-[44px] h-[44px] flex items-center justify-center text-[#575657] hover:text-[#0D0D0D] transition-colors cursor-pointer disabled:opacity-60 rounded-full hover:bg-black/5"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 shrink-0" />
                ) : (
                  <Eye className="w-4 h-4 shrink-0" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <p
              role="alert"
              aria-live="polite"
              className="mt-2 text-[13px] text-[#B3261E] font-medium"
            >
              {error}
            </p>
          )}

          {/* Primary button */}
          <button
            type="submit"
            disabled={
              isSubmitting ||
              isGuestLoading ||
              isGitHubLoading ||
              isGoogleLoading ||
              !email.trim() ||
              !password
            }
            className="w-full h-[48px] rounded-full bg-[#0D0D0D] hover:bg-[#232325] hover:scale-[1.01] active:scale-[0.99] text-white text-[15px] font-medium transition-all duration-200 disabled:opacity-60 disabled:hover:scale-100 disabled:hover:bg-[#0D0D0D] disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer select-none"
            style={{ boxShadow: 'none' }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>{mode === 'login' ? 'Signing in...' : 'Creating account...'}</span>
              </>
            ) : (
              mode === 'login' ? 'Sign in' : 'Create account'
            )}
          </button>
        </form>

        {/* Thin divider with "or continue with" */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-black/[0.08]" />
          </div>
          <div className="relative flex justify-center text-[13px]">
            <span className="bg-white px-3 text-[#575657]">or continue with</span>
          </div>
        </div>

        {/* Two equal-width outline buttons side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* GitHub button */}
          <button
            type="button"
            onClick={handleGitHubSignIn}
            disabled={isGitHubLoading || isGoogleLoading || isSubmitting || isGuestLoading}
            className="w-full h-[44px] rounded-full bg-white border border-black/[0.12] hover:border-[#0D0D0D] active:bg-black/[0.02] text-[#0D0D0D] text-[14px] font-medium transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer select-none"
            style={{ boxShadow: 'none' }}
          >
            {isGitHubLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0 text-[#0D0D0D]" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4 shrink-0 fill-current text-[#0D0D0D]"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
                <span>GitHub</span>
              </>
            )}
          </button>

          {/* Google button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isGitHubLoading || isSubmitting || isGuestLoading}
            className="w-full h-[44px] rounded-full bg-white border border-black/[0.12] hover:border-[#0D0D0D] active:bg-black/[0.02] text-[#0D0D0D] text-[14px] font-medium transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer select-none"
            style={{ boxShadow: 'none' }}
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0 text-[#0D0D0D]" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4 shrink-0"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Google</span>
              </>
            )}
          </button>
        </div>

        {(githubError || googleError) && (
          <div className="mt-2 space-y-1">
            {githubError && (
              <p
                role="alert"
                aria-live="polite"
                className="text-[13px] text-[#B3261E] font-medium text-center"
              >
                {githubError}
              </p>
            )}
            {googleError && (
              <p
                role="alert"
                aria-live="polite"
                className="text-[13px] text-[#B3261E] font-medium text-center"
              >
                {googleError}
              </p>
            )}
          </div>
        )}

        {/* Guest demo as plain text link */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={handleGuestSignIn}
            disabled={isGuestLoading || isSubmitting || isGitHubLoading || isGoogleLoading}
            className="inline-flex items-center gap-1.5 text-[13px] text-[#575657] hover:text-[#0D0D0D] transition-colors py-1.5 px-3 rounded-full hover:bg-black/[0.04] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer select-none"
          >
            {isGuestLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0 text-[#0D0D0D]" />
                <span>Starting demo...</span>
              </>
            ) : (
              <>
                <User className="w-3.5 h-3.5 shrink-0 text-[#575657]" />
                <span>Try the demo as guest</span>
              </>
            )}
          </button>

          {guestError && (
            <p
              role="alert"
              aria-live="polite"
              className="mt-1 text-[13px] text-[#B3261E] font-medium text-center"
            >
              {guestError}
            </p>
          )}
        </div>

        {/* Navigation link */}
        <p className="mt-6 text-center text-[14px] text-[#575657]">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-[#0D0D0D] font-medium hover:underline"
              >
                Sign up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-[#0D0D0D] font-medium hover:underline"
              >
                Log in
              </Link>
            </>
          )}
        </p>

        {/* Terms line */}
        <p className="mt-3 text-center text-[13px] text-[#575657] leading-relaxed">
          By continuing, you agree to the terms and privacy policy.
        </p>
      </div>
    </div>
  );
}
