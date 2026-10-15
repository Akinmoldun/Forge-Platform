import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks/use-auth';
import { enableDemoMode } from '@/lib/demoMode';
import { Loader2 } from 'lucide-react';

export interface TryDemoButtonProps {
  variant?: 'primary' | 'secondary' | 'white' | 'outline-white' | 'outline' | 'link' | 'none';
  children?: React.ReactNode;
  className?: string;
  redirect?: string;
  onClick?: () => void;
}

export function TryDemoButton({
  variant = 'primary',
  children,
  className = '',
  redirect = '/app',
  onClick,
}: TryDemoButtonProps) {
  const { isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const withTimeout = <T,>(promise: Promise<T> | Promise<unknown>, ms = 10000): Promise<T> => {
    return Promise.race([
      promise as Promise<T>,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out')), ms),
      ),
    ]);
  };

  const handleClick = () => {
    setError(null);
    if (onClick) onClick();
    enableDemoMode();
    navigate(redirect);
  };

  const baseStyles =
    variant === 'none'
      ? 'focus-visible:outline-2 focus-visible:outline-[#F36421] focus-visible:outline-offset-2'
      : variant === 'link'
        ? 'inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none text-[13px] p-0 font-normal focus-visible:outline-2 focus-visible:outline-[#F36421] focus-visible:outline-offset-2'
        : 'rounded-full h-[40px] px-[18px] text-[14px] font-medium transition-all duration-200 hover:-translate-y-[1px] active:translate-y-0 inline-flex items-center justify-center gap-2 select-none text-center cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-[#F36421] focus-visible:outline-offset-2';

  const variantStyles = {
    primary: 'bg-[#F36421] hover:bg-[#D9531E] text-white shadow-xs',
    secondary:
      'bg-white border border-[#3B1500] text-[#3B1500] hover:bg-[#FFE5D6]',
    white: 'bg-white text-[#F36421] hover:bg-[#FFEFE4] shadow-xs font-semibold',
    ghost:
      'bg-white/[0.18] border border-white/40 text-white hover:bg-white/[0.28]',
    'outline-white':
      'border border-white/80 text-white hover:bg-white/10 backdrop-blur-xs',
    outline:
      'border border-[#E8D8CA] bg-transparent text-[#3B1500] hover:border-[#F36421] hover:text-[#F36421]',
    link: 'text-[#7A5A4A] hover:text-[#3B1500] bg-transparent',
    none: '',
  }[variant];

  const isFullWidth = className.includes('w-full');

  return (
    <div className={`flex flex-col items-center ${isFullWidth ? 'w-full' : 'inline-flex'}`}>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        aria-busy={loading}
        className={`${baseStyles} ${variantStyles} ${className}`.trim()}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>Starting demo...</span>
          </>
        ) : (
          children || 'Try the demo'
        )}
      </button>
      {error && (
        <p
          role="alert"
          aria-live="polite"
          className="mt-1.5 text-[13px] text-[#B3261E] text-center font-medium max-w-xs"
        >
          {error}
        </p>
      )}
    </div>
  );
}
