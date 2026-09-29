import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import { useEffect, useState } from "react";

// If the auth session or currentUser query has not settled after this long
// (failed query, dropped websocket, stale token), we stop waiting: pages
// render their signed-out/empty state instead of an infinite loading screen.
const AUTH_TIMEOUT_MS = 8000;

export function useAuth() {
  const { isLoading: isAuthLoading, isAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.currentUser);
  const { signIn, signOut } = useAuthActions();

  const unsettled = isAuthLoading || user === undefined;
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!unsettled) {
      setTimedOut(false);
      return;
    }
    const timer = setTimeout(() => {
      console.warn(
        `[useAuth] Auth state did not settle within ${AUTH_TIMEOUT_MS}ms — ` +
          "rendering with isLoading=false instead of waiting forever. " +
          "Check the browser console and Convex deployment logs for the underlying query error.",
      );
      setTimedOut(true);
    }, AUTH_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [unsettled]);

  // Every loading state eventually resolves: either the queries settle or the
  // timeout flips isLoading to false. It can never remain true indefinitely.
  const isLoading = unsettled && !timedOut;

  return {
    isLoading,
    isAuthenticated,
    user: user ?? null,
    signIn,
    signOut,
  };
}
