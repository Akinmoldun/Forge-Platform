import { useState, useEffect } from "react";
import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";

const isConvexConfigured = Boolean(typeof import.meta !== "undefined" && import.meta.env?.VITE_CONVEX_URL);

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

  // Detect if an OAuth callback / code exchange is actively present in the URL
  const [isExchangingCode, setIsExchangingCode] = useState(() => {
    if (typeof window === "undefined") return false;
    const params = new URLSearchParams(window.location.search);
    return params.has("code") || sessionStorage.getItem("convex_oauth_exchanging") === "true";
  });
  const [exchangeError, setExchangeError] = useState<string | null>(null);

  // When isAuthenticated becomes true, complete the exchange
  useEffect(() => {
    if (isAuthenticated) {
      setIsExchangingCode(false);
      try {
        sessionStorage.removeItem("convex_oauth_exchanging");
      } catch {
        /* ignore */
      }
    }
  }, [isAuthenticated]);

  // Timeout guard for code exchange (max 8 seconds)
  useEffect(() => {
    if (!isExchangingCode || isAuthenticated) return;
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        setIsExchangingCode(false);
        setExchangeError("GitHub sign-in exchange timed out or failed. Please try again.");
        console.error("[Auth] OAuth code exchange timed out after 8s");
        try {
          sessionStorage.removeItem("convex_oauth_exchanging");
        } catch {
          /* ignore */
        }
      }
    }, 8000);
    return () => clearTimeout(timer);
  }, [isExchangingCode, isAuthenticated]);

  const isUserPending = isAuthenticated && rawUser === undefined;
  const isLoading = isAuthLoading || isUserPending || isExchangingCode;
  const user = rawUser ?? null;

  const signIn = async (provider: string, args?: unknown) => {
    if (provider === "github") {
      try {
        sessionStorage.setItem("convex_oauth_exchanging", "true");
      } catch {
        /* ignore */
      }
    }
    return await rawSignIn(provider, args as never);
  };

  const signOut = async () => {
    // Clear any local temporary auth markers and guest demo flags
    try {
      localStorage.removeItem("forge_auth_provider");
      localStorage.removeItem("forge_auth_name");
      localStorage.removeItem("forge_auth_email");
      sessionStorage.removeItem("forge_preview_otp_email");
      sessionStorage.removeItem("forge_demo_mode");
      sessionStorage.removeItem("convex_oauth_exchanging");
    } catch {
      // Ignore storage errors in restricted contexts
    }
    await rawSignOut();
  };

  return {
    isLoading,
    authResolved: !isLoading,
    isAuthenticated,
    isSessionPending: isLoading,
    isSignedOut: !isAuthLoading && !isAuthenticated && !isExchangingCode,
    isExchangingCode,
    exchangeError,
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
    isExchangingCode: false,
    exchangeError: null,
    user: null,
    signIn: async (_provider?: string, _params?: unknown) => ({
      signingIn: false,
      redirect: undefined as URL | undefined,
    }),
    signOut: async () => {},
  };
}

export const useAuth = isConvexConfigured ? useConvexAuthReal : useMockAuth;
