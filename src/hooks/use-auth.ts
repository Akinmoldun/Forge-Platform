import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { useSafeQuery } from "@/hooks/use-safe-query";
import { disableDemoMode, isDemoMode } from "@/lib/demoMode";
import { useState } from "react";

const isConvexConfigured = Boolean(
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_CONVEX_URL) ||
    (typeof process !== "undefined" && process.env?.VITE_CONVEX_URL),
);

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
  const rawUser = useSafeQuery(api.users.currentUser, {});
  const { signIn: rawSignIn, signOut: rawSignOut } = useAuthActions();

  const user = rawUser ?? null;

  const signIn = async (provider: string, args?: unknown) => {
    disableDemoMode();
    return await rawSignIn(provider, args as never);
  };

  const signOut = async () => {
    disableDemoMode();
    try {
      localStorage.removeItem("forge_auth_provider");
      localStorage.removeItem("forge_auth_name");
      localStorage.removeItem("forge_auth_email");
      sessionStorage.removeItem("forge_preview_otp_email");
      sessionStorage.removeItem("forge_demo_mode");
      sessionStorage.removeItem("forge_hide_demo_session");
      sessionStorage.setItem("forge_signed_out", "true");
    } catch {
      // Ignore storage errors in restricted contexts
    }
    await rawSignOut();
  };

  const hasCodeParam =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("code");

  const inDemo = isDemoMode();
  const isPending = inDemo ? false : (isAuthLoading || hasCodeParam);
  const isSignedOut = inDemo ? false : (!isAuthLoading && !isAuthenticated && !hasCodeParam);
  const effectiveAuth = inDemo ? true : isAuthenticated;

  return {
    isLoading: isPending,
    authResolved: inDemo ? true : (!isAuthLoading && !hasCodeParam),
    isAuthenticated: effectiveAuth,
    isSessionPending: isPending,
    isSignedOut,
    hasOAuthCode: hasCodeParam,
    user: inDemo ? (user ?? DEMO_USER) : user,
    signIn,
    signOut,
  };
}

const DEMO_USER: ForgeUser = {
  _id: "demo-user-alex",
  _creationTime: Date.now(),
  name: "Guest",
  email: undefined,
  isAnonymous: true,
};

function useMockAuth() {
  const [currentUser, setCurrentUser] = useState<ForgeUser | null>(() => {
    try {
      if (typeof sessionStorage !== "undefined" && sessionStorage.getItem("forge_signed_out") === "true") {
        return null;
      }
      if (isDemoMode()) {
        return DEMO_USER;
      }
    } catch {
      // ignore
    }
    return null;
  });

  const isAuthenticated = Boolean(currentUser);

  return {
    isLoading: false,
    authResolved: true,
    isAuthenticated,
    isSessionPending: false,
    isSignedOut: !isAuthenticated,
    hasOAuthCode: false,
    user: currentUser,
    signIn: async (_provider?: string, _params?: unknown) => {
      disableDemoMode();
      try {
        sessionStorage.removeItem("forge_signed_out");
      } catch {
        // ignore
      }
      setCurrentUser(DEMO_USER);
      return {
        signingIn: false,
        redirect: undefined as URL | undefined,
      };
    },
    signOut: async () => {
      disableDemoMode();
      try {
        sessionStorage.setItem("forge_signed_out", "true");
        sessionStorage.removeItem("forge_demo_mode");
        sessionStorage.removeItem("forge_hide_demo_session");
      } catch {
        // ignore
      }
      setCurrentUser(null);
    },
  };
}

export const useAuth = isConvexConfigured ? useConvexAuthReal : useMockAuth;
