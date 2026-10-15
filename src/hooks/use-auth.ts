import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";

const isConvexConfigured = Boolean(import.meta.env.VITE_CONVEX_URL);

export interface ForgeUser {
  _id: string;
  _creationTime: number;
  name?: string;
  email?: string;
  image?: string;
  isAnonymous?: boolean;
}

function useConvexAuthReal() {
  const { isLoading: isAuthLoading, isAuthenticated } = useConvexAuth();
  const rawUser = useQuery(api.users.currentUser);
  const { signIn: rawSignIn, signOut: rawSignOut } = useAuthActions();

  const user = rawUser ?? null;

  const signIn = async (provider: string, args?: unknown) => {
    return await rawSignIn(provider, args as never);
  };

  const signOut = async () => {
    // Clear any local temporary auth markers
    try {
      localStorage.removeItem("forge_auth_provider");
      localStorage.removeItem("forge_auth_name");
      localStorage.removeItem("forge_auth_email");
      sessionStorage.removeItem("forge_preview_otp_email");
    } catch {
      // Ignore storage errors in restricted contexts
    }
    await rawSignOut();
  };

  const hasCodeParam =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("code");

  const isPending = isAuthLoading || hasCodeParam;
  const isSignedOut = !isAuthLoading && !isAuthenticated && !hasCodeParam;

  return {
    isLoading: isPending,
    authResolved: !isAuthLoading && !hasCodeParam,
    isAuthenticated,
    isSessionPending: isPending,
    isSignedOut,
    hasOAuthCode: hasCodeParam,
    user,
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
