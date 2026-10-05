import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { TryDemoButton } from './TryDemoButton';

interface AuthFormProps {
  mode: 'login' | 'signup';
  redirectAfterAuth?: string;
}

export function AuthForm({ mode, redirectAfterAuth = '/app' }: AuthFormProps) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirectTarget =
    searchParams.get('returnTo') ||
    searchParams.get('redirect') ||
    redirectAfterAuth ||
    '/app';

  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const codeInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  // If already signed in, redirect immediately to app home
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirectTarget, { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate, redirectTarget]);

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

  const validateEmail = (val: string): boolean => {
    const trimmed = val.trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedEmail = email.trim();
    if (!validateEmail(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.set('email', trimmedEmail);
      await signIn('email-otp', formData);
      setStep('code');
      setCountdown(30);
    } catch (err: unknown) {
      console.error('Send OTP error:', err);
      if (!navigator.onLine) {
        setError('Network error. Please check your internet connection.');
      } else {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.toLowerCase().includes('rate') || msg.toLowerCase().includes('too many')) {
          setError('Too many attempts. Please try again later.');
        } else {
          setError('Failed to send verification code. Please check your email and try again.');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedCode = code.trim();
    if (trimmedCode.length !== 6) {
      setError('Please enter the 6-digit code sent to your email.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.set('email', email.trim());
      formData.set('code', trimmedCode);
      await signIn('email-otp', formData);
      navigate(redirectTarget);
    } catch (err: unknown) {
      console.error('Verify OTP error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      if (!navigator.onLine || msg.toLowerCase().includes('network') || msg.toLowerCase().includes('fetch')) {
        setError('Network error. Please check your internet connection.');
      } else if (msg.toLowerCase().includes('expired')) {
        setError('The verification code has expired. Please request a new one.');
      } else if (msg.toLowerCase().includes('rate') || msg.toLowerCase().includes('too many') || msg.toLowerCase().includes('attempt')) {
        setError('Too many attempts. Please try again in a few minutes.');
      } else {
        setError('The verification code you entered is incorrect.');
      }
      setCode('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0 || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.set('email', email.trim());
      await signIn('email-otp', formData);
      setCountdown(30);
    } catch (err: unknown) {
      console.error('Resend OTP error:', err);
      if (!navigator.onLine) {
        setError('Network error. Please check your internet connection.');
      } else {
        setError('Failed to resend code. Please try again in a moment.');
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

  return (
    <div className="w-full transition-opacity duration-150 motion-reduce:transition-none">
      {step === 'email' ? (
        <div>
          {/* Heading */}
          {mode === 'login' ? (
            <h1 className="font-['Hanken_Grotesk',sans-serif] text-[28px] font-semibold text-[#3B1500] tracking-[-0.02em] leading-tight">
              Sign in to Forge
            </h1>
          ) : (
            <h1 className="font-['Hanken_Grotesk',sans-serif] text-[32px] font-semibold text-[#3B1500] tracking-[-0.02em] leading-tight text-left">
              Build with rules that hold
            </h1>
          )}

          {/* Form */}
          <form onSubmit={handleEmailSubmit} className="mt-8 space-y-4">
            <div>
              <label
                htmlFor="auth-email"
                className="block text-sm font-medium text-[#3B1500] mb-1.5"
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
                disabled={isSubmitting}
                placeholder="name@example.com"
                required
                className="w-full h-[48px] px-3.5 rounded-[8px] border border-[#E8D8CA] bg-white text-[#3B1500] text-base placeholder:text-[#7A5A4A]/50 focus:outline-none focus:ring-2 focus:ring-[#FF4801] focus:border-[#FF4801] transition-shadow disabled:opacity-60"
              />
              {error && (
                <p
                  role="alert"
                  aria-live="polite"
                  className="mt-1.5 text-[13px] text-[#B3261E] font-medium"
                >
                  {error}
                </p>
              )}
            </div>

            {/* Primary button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-[48px] rounded-[8px] bg-[#FF4801] hover:bg-[#E03E00] text-white font-medium text-base transition-colors disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer select-none shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>Sending code...</span>
                </>
              ) : mode === 'login' ? (
                'Send code'
              ) : (
                'Create account'
              )}
            </button>
          </form>

          {/* Mode specific lower area */}
          {mode === 'login' ? (
            <div className="mt-6">
              {/* Divider with OR */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E8D8CA]" />
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-wider">
                  <span className="bg-white px-3 text-[#7A5A4A] font-medium">OR</span>
                </div>
              </div>

              {/* Try demo as guest outlined button */}
              <TryDemoButton
                variant="none"
                redirect={redirectTarget}
                className="w-full h-[48px] rounded-[8px] border border-[#E8D8CA] bg-white hover:bg-[#FFE5D6] text-[#3B1500] font-medium text-sm transition-colors cursor-pointer select-none flex items-center justify-center"
              >
                Try demo as guest
              </TryDemoButton>

              {/* Don't have an account? Sign up */}
              <p className="mt-6 text-center text-sm text-[#7A5A4A]">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="font-semibold text-[#FF4801] hover:underline"
                >
                  Sign up
                </Link>
              </p>

              {/* Terms and privacy line */}
              <p className="mt-4 text-center text-xs text-[#7A5A4A]/80 leading-relaxed">
                By continuing, you agree to the terms and privacy policy.
              </p>
            </div>
          ) : (
            <div className="mt-4">
              {/* Terms line */}
              <p className="text-xs text-[#7A5A4A]/80 leading-relaxed">
                By continuing, you agree to the terms and privacy policy.
              </p>

              {/* Already have an account? Log in */}
              <p className="mt-4 text-sm text-[#7A5A4A]">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-[#FF4801] hover:underline"
                >
                  Log in
                </Link>
              </p>

              {/* Under the form, an outlined "Try demo as guest" button */}
              <div className="mt-6 pt-6 border-t border-[#E8D8CA]">
                <TryDemoButton
                  variant="none"
                  redirect={redirectTarget}
                  className="w-full h-[48px] rounded-[8px] border border-[#E8D8CA] bg-white hover:bg-[#FFE5D6] text-[#3B1500] font-medium text-sm transition-colors cursor-pointer select-none flex items-center justify-center"
                >
                  Try demo as guest
                </TryDemoButton>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* STEP 2: CODE */
        <div className="transition-opacity duration-150 motion-reduce:transition-none">
          <h1 className="font-['Hanken_Grotesk',sans-serif] text-[28px] font-semibold text-[#3B1500] tracking-[-0.02em] leading-tight">
            Check your email
          </h1>
          <p className="mt-2 text-sm text-[#7A5A4A] leading-relaxed">
            We sent a 6-digit code to <strong className="text-[#3B1500]">{email}</strong>
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
                className="w-full h-[48px] text-center font-mono text-[24px] tracking-[0.3em] font-semibold rounded-[8px] border border-[#E8D8CA] bg-white text-[#3B1500] focus:outline-none focus:ring-2 focus:ring-[#FF4801] focus:border-[#FF4801] transition-shadow disabled:opacity-60"
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
              className="w-full h-[48px] rounded-[8px] bg-[#FF4801] hover:bg-[#E03E00] text-white font-medium text-base transition-colors disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer select-none shadow-xs"
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

          {/* Links: Resend code (disabled with 30s countdown) and Use a different email */}
          <div className="mt-6 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={countdown > 0 || isSubmitting}
              className={`text-sm transition-colors cursor-pointer select-none ${
                countdown > 0 || isSubmitting
                  ? 'text-[#7A5A4A]/60 cursor-not-allowed'
                  : 'text-[#FF4801] hover:underline font-medium'
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
              className="text-sm text-[#7A5A4A] hover:text-[#3B1500] transition-colors cursor-pointer"
            >
              Use a different email
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
