import { Link } from 'react-router';
import { AuthForm } from '@/components/AuthForm';

interface SignupPageProps {
  redirectAfterAuth?: string;
}

export default function SignupPage({ redirectAfterAuth = '/app' }: SignupPageProps) {
  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-[#FFFBF5] px-4 py-6 sm:px-8 sm:py-8">
      {/* Top Header Row: Logo top-left, top-right outlined pill "Log in" */}
      <header className="max-w-[450px] w-full mx-auto flex items-center justify-between">
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

        <Link
          to="/login"
          className="rounded-full border border-[#E8D8CA] bg-white px-5 py-2 text-sm font-medium text-[#3B1500] hover:bg-[#FFE5D6] transition-colors shadow-2xs"
        >
          Log in
        </Link>
      </header>

      {/* Main Single Centered Column: max-width 450px */}
      <main className="max-w-[450px] w-full mx-auto my-auto py-8">
        <AuthForm mode="signup" redirectAfterAuth={redirectAfterAuth} />
      </main>

      {/* Simple footer row, 1px top border, 13px muted text: "Forge" and "(c) 2026". No dead links */}
      <footer className="max-w-[450px] w-full mx-auto pt-6 border-t border-[#E8D8CA] flex items-center justify-between text-[13px] text-[#7A5A4A]">
        <span>Forge</span>
        <span>© 2026</span>
      </footer>
    </div>
  );
}
