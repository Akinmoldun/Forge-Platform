import { useSearchParams } from 'react-router';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';

interface AuthPageProps {
  redirectAfterAuth?: string;
}

export default function AuthPage({ redirectAfterAuth = '/app' }: AuthPageProps) {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');

  if (mode === 'signup' || mode === 'register') {
    return <SignupPage redirectAfterAuth={redirectAfterAuth} />;
  }

  return <LoginPage redirectAfterAuth={redirectAfterAuth} />;
}
