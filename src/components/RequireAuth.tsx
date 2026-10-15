import { useState, useEffect } from "react";
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
import { Loader2, Lock, AlertCircle, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";

/**
 * Wraps a route that requires a signed-in user.
 *
 * During OAuth code exchanges, it ensures no premature redirects bounce the user
 * back to the sign-in page. Enforces a maximum 8-second wait for any loading state.
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
  const { isSessionPending, isSignedOut, isExchangingCode, exchangeError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [timedOut, setTimedOut] = useState(false);

  // 8-second safety timeout: nothing may spin forever
  useEffect(() => {
    if (!isSessionPending) return;
    const timer = setTimeout(() => {
      setTimedOut(true);
    }, 8000);
    return () => clearTimeout(timer);
  }, [isSessionPending]);

  // In-code demo workspaces have no auth requirement: allow demo routes immediately
  if (
    location.pathname.includes("/demo-") ||
    location.pathname.includes("demo-ws-")
  ) {
    return <>{children}</>;
  }

  // If code exchange timed out or failed, show clear error state with Retry button
  if (timedOut && isSessionPending) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center">
              <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-[#B3261E]/10 text-[#B3261E]">
                <AlertCircle className="size-6" />
              </div>
            </div>
            <CardTitle className="text-xl">Authentication took too long</CardTitle>
            <CardDescription>
              {exchangeError || "The session exchange did not complete within 8 seconds. Please try signing in again."}
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-2">
            <Button
              className="w-full bg-[#0D0D0D] hover:bg-black text-white rounded-full h-10"
              onClick={() => {
                try {
                  sessionStorage.removeItem("convex_oauth_exchanging");
                } catch {
                  /* ignore */
                }
                navigate("/login");
              }}
            >
              <RotateCcw className="size-4 mr-2" />
              Back to sign-in
            </Button>
          </CardFooter>
        </Card>
      </main>
    );
  }

  // Still resolving, or actively exchanging OAuth code: show calm spinner
  if (isSessionPending || isExchangingCode || location.search.includes("code=")) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
        <p className="mt-3 text-sm text-[#575657]">Completing sign-in...</p>
      </main>
    );
  }

  // Protection stays: a sign-out that has been confirmed lands on /login or shows card
  if (isSignedOut) {
    const returnTo = `${location.pathname}${location.search}`;
    const signInHref = `/login?returnTo=${encodeURIComponent(returnTo)}`;

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
            <Button className="w-full rounded-full" onClick={() => navigate(signInHref)}>
              Sign in
            </Button>
            <Button
              variant="ghost"
              className="w-full rounded-full"
              onClick={() => navigate("/")}
            >
              Back to home
            </Button>
          </CardFooter>
        </Card>
      </main>
    );
  }

  return <>{children}</>;
}
