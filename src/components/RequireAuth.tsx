import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { isDemoMode } from "@/lib/demoMode";
import { AlertCircle, Loader2, Lock, RefreshCw } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";

/**
 * Wraps a route that requires a signed-in user.
 * Allows instant bypass for demoMode visitors.
 * Protects against redirects while an OAuth code exchange is in progress.
 * Enforces an 8-second maximum wait timeout on loading states.
 */
export function RequireAuth({
  children,
  title = "Sign in to continue",
  description = "This page is only available to signed-in users.",
  redirectImmediately = false,
}: {
  children: ReactNode;
  /** Headline on the blocked screen. */
  title?: string;
  /** Says what the visitor gets by signing in. */
  description?: string;
  /** Skip the explanation and go straight to `/auth`. */
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

  // Demo mode visitors are allowed to view workspaces and pages instantly
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

  // Still resolving auth or exchanging OAuth code: show spinner
  if (isSessionPending || hasOAuthCode) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground mb-3" />
        {hasOAuthCode && (
          <p className="text-sm font-medium text-muted-foreground">
            Signing you in with GitHub...
          </p>
        )}
      </main>
    );
  }

  // Confirmed signed out
  if (isSignedOut) {
    const returnTo = `${location.pathname}${location.search}`;
    const signInHref = `/auth?returnTo=${encodeURIComponent(returnTo)}`;

    if (redirectImmediately) {
      return <Navigate to={signInHref} replace />;
    }

    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center">
              <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
                <Lock className="size-5 text-muted-foreground" />
              </div>
            </div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            You'll come straight back to this page once you're signed in.
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button className="w-full" onClick={() => navigate(signInHref)}>
              Sign in
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => navigate("/")}
            >
              Back to home
            </Button>
          </CardFooter>
        </Card>
      </main>
    );
  }

  return children;
}
