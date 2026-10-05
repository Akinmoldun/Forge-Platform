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

// The auth client keeps the access JWT and the refresh token in separate
// storage entries. When the access JWT is missing or expired it reports
// "signed out" immediately, and only completes a refresh afterwards. Acting on
// that first report is what used to bounce a signed-in user to /auth the moment
// they opened a route that issued fresh queries. A sign-out therefore has to
// hold steady for this long before anything treats it as real.
const SIGN_OUT_CONFIRM_MS = 2500;

const isConvexConfigured = Boolean(import.meta.env.VITE_CONVEX_URL);

function useConvexAuthReal() {
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

  // "No access token" is not proof of a sign-out: it is also what the client
  // reports for the moment before a refresh finishes. Confirm it before any
  // screen acts on it.
  const reportedSignedOut = authResolved && !isAuthenticated;
  const [signOutState, setSignOutState] = useState({
    reported: reportedSignedOut,
    // Only the confirm window below can set this. It stays false for a
    // signed-in session and for a sign-out that has not held steady yet.
    confirmed: false,
  });
  let resolvedSignOut = signOutState;
  if (resolvedSignOut.reported !== reportedSignedOut) {
    resolvedSignOut = { reported: reportedSignedOut, confirmed: false };
    setSignOutState(resolvedSignOut);
  }

  useEffect(() => {
    if (!reportedSignedOut) return;
    // Runs after the confirm window, not while the effect is setting up.
    const timer = setTimeout(
      () => setSignOutState({ reported: true, confirmed: true }),
      SIGN_OUT_CONFIRM_MS,
    );
    return () => clearTimeout(timer);
  }, [reportedSignedOut]);

  return {
    isLoading,
    authResolved,
    isAuthenticated: authResolved && isAuthenticated,
    isSessionPending:
      (!authResolved || (reportedSignedOut && !resolvedSignOut.confirmed)) &&
      !settled.timedOut,
    isSignedOut: resolvedSignOut.confirmed,
    user: user ?? null,
    signIn,
    signOut,
  };
}

function useMockAuth() {
  return {
    isLoading: false,
    authResolved: true,
    isAuthenticated: false,
    isSessionPending: false,
    isSignedOut: true,
    user: null,
    signIn: async () => {},
    signOut: async () => {},
  };
}

export const useAuth = isConvexConfigured ? useConvexAuthReal : useMockAuth;
