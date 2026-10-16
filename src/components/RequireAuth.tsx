import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { isDemoMode } from "@/lib/demoMode";
import { AlertCircle, RefreshCw } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";

/**
 * Wraps a route that requires a signed-in user.
 * Allows instant bypass ONLY for explicit demoMode visitors.
 * Protects against redirects while an OAuth code exchange is in progress.
 * Enforces an 8-second maximum wait timeout on loading states.
 */
export function RequireAuth({
  children,
  redirectImmediately = false,
}: {
  children: ReactNode;
  title?: string;
  description?: string;
  redirectImmediately?: boolean;
}) {
  const { isSessionPending, isSignedOut, hasOAuthCode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [timedOut, setTimedOut] = useState(false);

  // 8-second timeout for loading / session pending / code exchange
  useEffect(() => {
    if (!isSessionPending && !hasOAuthCode) {
      setTimedOut(false);
      return;
    }
    const timer = setTimeout(() => {
      setTimedOut(true);
    }, 8000);
    return () => clearTimeout(timer);
  }, [isSessionPending, hasOAuthCode]);

  // Demo mode visitors are allowed to view workspaces and pages instantly ONLY IF explicit demo mode is set
  if (isDemoMode()) {
    return <>{children}</>;
  }

  // If loading or OAuth exchange timed out after 8s, show error state with retry
  if (timedOut) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md border-destructive/40 text-center">
          <CardHeader>
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="size-6" />
            </div>
            <CardTitle className="text-lg">Authentication timed out</CardTitle>
            <CardDescription>
              We couldn't verify your session within 8 seconds. Please check your connection or sign in again.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-2">
            <Button
              className="w-full"
              onClick={() => {
                setTimedOut(false);
                window.location.reload();
              }}
            >
              <RefreshCw className="size-4 mr-2" /> Retry
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/login")}
            >
              Return to Sign In
            </Button>
          </CardFooter>
        </Card>
      </main>
    );
  }

  // 4. While a ?code=... exchange is in progress (isLoading false but isAuthenticated still false),
  // no redirect or fallback to guest may happen. Show a silent skeleton, not the word "Loading".
  if (isSessionPending || hasOAuthCode) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#FBFBFC] p-6">
        <div className="size-8 rounded-full border-2 border-border border-t-[#0D0D0D] animate-spin" />
      </main>
    );
  }

  // Confirmed signed out without demo mode -> must redirect to /login
  if (isSignedOut) {
    const returnTo = `${location.pathname}${location.search}`;
    const signInHref = `/login?returnTo=${encodeURIComponent(returnTo)}`;

    if (redirectImmediately || isSignedOut) {
      return <Navigate to={signInHref} replace />;
    }
  }

  return children;
}
