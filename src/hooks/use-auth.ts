import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import { useEffect, useState } from "react";

// If the auth session or currentUser query has not settled after this long
// (failed query, dropped websocket, stale token), we stop waiting: pages
// render instead of showing a loading screen forever. The timeout never
// invents a session state. `authResolved` stays false until Convex actually
// reports it, so the route guard cannot mistake "slow" for "signed out".
const AUTH_TIMEOUT_MS = 8000;

export function useAuth() {
  const { isLoading: isAuthLoading, isAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.currentUser);
  const { signIn, signOut } = useAuthActions();

  // Only the session decides whether someone is signed in. The `currentUser`
  // query can lag behind it on a cold function or a websocket reconnect, and
  // treating that lag as "signed out" used to bounce signed-in users to
  // /auth (and then on to the workspace picker) in the middle of navigating.
  const authResolved = !isAuthLoading;
  const userPending = user === undefined;

  // Derived state, reset during render when `userPending` flips (React's
  // documented pattern for adjusting state on a prop change) so no effect has
  // to set state synchronously.
  const [deadline, setDeadline] = useState({ pending: userPending, timedOut: false });
  let settled = deadline;
  if (settled.pending !== userPending) {
    settled = { pending: userPending, timedOut: false };
    setDeadline(settled);
  }

  useEffect(() => {
    if (!userPending) return;
    // The state update below happens when the grace window expires, not while
    // the effect is running, so it cannot cause a render-phase update.
    const timer = setTimeout(() => {
      console.warn(
        `[useAuth] Auth state did not settle within ${AUTH_TIMEOUT_MS}ms — ` +
          "stopping the loading state instead of waiting forever. " +
          "Check the browser console and Convex deployment logs for the underlying query error.",
      );
      setDeadline({ pending: true, timedOut: true });
    }, AUTH_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [userPending]);

  // Every loading state eventually resolves: either the queries settle or the
  // timeout flips isLoading to false. It can never remain true indefinitely.
  const isLoading = (!authResolved || userPending) && !settled.timedOut;

  return {
    isLoading,
    /**
     * True only once Convex has reported the session state. Route guards must
     * check this before treating `isAuthenticated: false` as "signed out".
     */
    authResolved,
    /** Meaningful only while `authResolved` is true. */
    isAuthenticated: authResolved && isAuthenticated,
    user: user ?? null,
    signIn,
    signOut,
  };
}