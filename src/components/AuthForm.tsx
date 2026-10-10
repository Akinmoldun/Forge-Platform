import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, User } from 'lucide-react';

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

  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guestError, setGuestError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const codeInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  // If already signed in, redirect immediately to app home
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(safeRedirect, { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate, safeRedirect]);

  // Escape key returns to step 1 from step 2, focus moves to code input on step 2
  useEffect(() => {
    if (step === 'code') {
      codeInputRef.current?.focus();
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setStep('email');
          setError(null);
          setCode('');
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    } else {
      emailInputRef.current?.focus();
    }
  }, [step]);

  // Resend 30s countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

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

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting || isGuestLoading) return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;

    if (!validateEmail(trimmedEmail)) {
      setError('Enter a valid email');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.set('email', trimmedEmail);
      await withTimeout(signIn('email-otp', formData), 10000);
      setStep('code');
      setCountdown(30);
    } catch (err: unknown) {
      console.error('Send OTP error:', err);
      const msg = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
      if (msg.includes('rate') || msg.includes('too many')) {
        setError('Too many attempts, try again later');
      } else {
        setError("We couldn't send the code, try again");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isGuestLoading) return;

    const trimmedCode = code.trim();
    if (trimmedCode.length !== 6) {
      setError('That code is incorrect');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.set('email', email.trim());
      formData.set('code', trimmedCode);
      await withTimeout(signIn('email-otp', formData), 10000);
      navigate(safeRedirect, { replace: true });
    } catch (err: unknown) {
      console.error('Verify OTP error:', err);
      const msg = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
      if (msg.includes('expired')) {
        setError('That code has expired');
      } else if (msg.includes('rate') || msg.includes('too many')) {
        setError('Too many attempts, try again later');
      } else {
        setError('That code is incorrect');
      }
      setCode('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0 || isSubmitting || isGuestLoading) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.set('email', email.trim());
      await withTimeout(signIn('email-otp', formData), 10000);
      setCountdown(30);
    } catch (err: unknown) {
      console.error('Resend OTP error:', err);
      const msg = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
      if (msg.includes('rate') || msg.includes('too many')) {
        setError('Too many attempts, try again later');
      } else {
        setError("We couldn't send the code, try again");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(raw);
    if (error) setError(null);
  };

  const handleCodePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      setCode(pasted);
      if (error) setError(null);
    }
  };

  const handleGuestSignIn = async () => {
    if (isGuestLoading || isSubmitting) return;
    setGuestError(null);

    if (isAuthenticated) {
      navigate(safeRedirect, { replace: true });
      return;
    }

    setIsGuestLoading(true);
    try {
      await withTimeout(signIn('anonymous'), 10000);
      navigate(safeRedirect, { replace: true });
    } catch (err: unknown) {
      console.error('Guest sign-in error:', err);
      const msg = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
      if (msg.includes('rate') || msg.includes('too many')) {
        setGuestError('Too many attempts, try again later');
      } else {
        setGuestError("We couldn't start the demo, try again");
      }
    } finally {
      setIsGuestLoading(false);
    }
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

      {step === 'email' ? (
        <div className="transition-opacity duration-150 motion-reduce:transition-none">
          {/* Heading */}
          <h1 className="text-[32px] font-medium tracking-[-0.03em] text-[#0D0D0D] leading-[1.2]">
            {mode === 'login' ? 'Sign in to Forge' : 'Create your Forge account'}
          </h1>

          {/* Subheading */}
          <p className="mt-2 text-[15px] text-[#575657] leading-relaxed">
            {mode === 'login'
              ? "Enter your email and we'll send you a one-time code."
              : "No password. We'll email you a one-time code."}
          </p>

          {/* Email form */}
          <form onSubmit={handleEmailSubmit} className="mt-8 space-y-4">
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
                disabled={isSubmitting || isGuestLoading}
                placeholder="name@example.com"
                required
                className="auth-field-input w-full h-[48px] px-4 rounded-[12px] border border-black/[0.12] bg-white text-[#0D0D0D] text-[15px] placeholder:text-[#575657]/50 transition-all disabled:opacity-60"
                style={{ boxShadow: 'none' }}
              />
              {error && (
                <p
                  role="alert"
                  aria-live="polite"
                  className="mt-2 text-[13px] text-[#B3261E] font-medium"
                >
                  {error}
                </p>
              )}
            </div>

            {/* Primary button */}
            <button
              type="submit"
              disabled={isSubmitting || isGuestLoading || !email.trim()}
              className="w-full h-[48px] rounded-full bg-[#0D0D0D] hover:bg-[#232325] hover:scale-[1.01] active:scale-[0.99] text-white text-[15px] font-medium transition-all duration-200 disabled:opacity-60 disabled:hover:scale-100 disabled:hover:bg-[#0D0D0D] disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer select-none"
              style={{ boxShadow: 'none' }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>{mode === 'login' ? 'Sending code...' : 'Creating account...'}</span>
                </>
              ) : mode === 'login' ? (
                'Send code'
              ) : (
                'Create account'
              )}
            </button>
          </form>

          {/* Divider "or" */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-black/[0.08]" />
            </div>
            <div className="relative flex justify-center text-[13px]">
              <span className="bg-white px-3 text-[#575657]">or</span>
            </div>
          </div>

          {/* Secondary button: Try demo as guest */}
          <div>
            <button
              type="button"
              onClick={handleGuestSignIn}
              disabled={isGuestLoading || isSubmitting}
              className="w-full h-[48px] rounded-full bg-white border border-black/[0.12] hover:border-[#0D0D0D] active:bg-black/[0.02] text-[#0D0D0D] text-[15px] font-medium transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer select-none"
              style={{ boxShadow: 'none' }}
            >
              {isGuestLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>Starting demo...</span>
                </>
              ) : (
                <>
                  <User className="w-4 h-4 shrink-0 text-[#0D0D0D]" />
                  <span>Try demo as guest</span>
                </>
              )}
            </button>

            {guestError && (
              <p
                role="alert"
                aria-live="polite"
                className="mt-2 text-[13px] text-[#B3261E] font-medium text-center"
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
      ) : (
        /* STEP 2 OF THE FORM */
        <div className="transition-opacity duration-150 motion-reduce:transition-none">
          <h1 className="text-[32px] font-medium tracking-[-0.03em] text-[#0D0D0D] leading-[1.2]">
            Check your email
          </h1>
          <p className="mt-2 text-[15px] text-[#575657] leading-relaxed">
            We sent a 6-digit code to <strong className="text-[#0D0D0D] font-medium">{email}</strong>
          </p>

          <form onSubmit={handleCodeSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="auth-code" className="sr-only">
                6-digit verification code
              </label>
              <input
                ref={codeInputRef}
                id="auth-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={handleCodeChange}
                onPaste={handleCodePaste}
                disabled={isSubmitting}
                placeholder="······"
                autoFocus
                className="auth-field-input w-full h-[56px] text-center font-mono text-[28px] tracking-[0.35em] font-medium rounded-[12px] border border-black/[0.12] bg-white text-[#0D0D0D] placeholder:text-[#575657]/40 transition-all disabled:opacity-60"
                style={{ boxShadow: 'none' }}
              />
              {error && (
                <p
                  role="alert"
                  aria-live="polite"
                  className="mt-2 text-[13px] text-[#B3261E] font-medium text-center"
                >
                  {error}
                </p>
              )}
            </div>

            {/* Verify and sign in */}
            <button
              type="submit"
              disabled={isSubmitting || code.length !== 6}
              className="w-full h-[48px] rounded-full bg-[#0D0D0D] hover:bg-[#232325] hover:scale-[1.01] active:scale-[0.99] text-white text-[15px] font-medium transition-all duration-200 disabled:opacity-60 disabled:hover:scale-100 disabled:hover:bg-[#0D0D0D] disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer select-none"
              style={{ boxShadow: 'none' }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>Verifying...</span>
                </>
              ) : (
                'Verify and sign in'
              )}
            </button>
          </form>

          {/* Links under button: Resend code + Use a different email */}
          <div className="mt-6 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={countdown > 0 || isSubmitting}
              className={`text-[14px] transition-colors select-none ${
                countdown > 0 || isSubmitting
                  ? 'text-[#575657]/50 cursor-not-allowed'
                  : 'text-[#0D0D0D] font-medium hover:underline cursor-pointer'
              }`}
            >
              {countdown > 0 ? `Resend code (${countdown}s)` : 'Resend code'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('email');
                setError(null);
                setCode('');
              }}
              disabled={isSubmitting}
              className="text-[14px] text-[#575657] hover:text-[#0D0D0D] transition-colors cursor-pointer"
            >
              Use a different email
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
