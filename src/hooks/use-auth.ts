import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";

const isConvexConfigured = Boolean(import.meta.env.VITE_CONVEX_URL);

function useConvexAuthReal() {
  const { isLoading: isAuthLoading, isAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.currentUser);
  const { signIn, signOut } = useAuthActions();

  return {
    isLoading: isAuthLoading,
    authResolved: !isAuthLoading,
    isAuthenticated,
    isSessionPending: isAuthLoading,
    isSignedOut: !isAuthLoading && !isAuthenticated,
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
    signIn: async (_provider?: string, _params?: unknown) => ({
      signingIn: false,
      redirect: undefined as URL | undefined,
    }),
    signOut: async () => {},
  };
}

export const useAuth = isConvexConfigured ? useConvexAuthReal : useMockAuth;
