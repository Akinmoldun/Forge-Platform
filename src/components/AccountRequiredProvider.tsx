import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { CreateAccountDialog } from "./CreateAccountDialog";

export interface AccountRequiredContextValue {
  requireAccount: () => void;
}

const AccountRequiredContext = createContext<AccountRequiredContextValue | null>(null);

/**
 * Pure helper function to subscribe to the forge:account-required custom window event.
 * Returns an unsubscribe cleanup function.
 */
export function subscribeAccountRequired(cb: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }
  const handler = () => {
    cb();
  };
  window.addEventListener("forge:account-required", handler);
  return () => {
    window.removeEventListener("forge:account-required", handler);
  };
}

export function useAccountRequired(): AccountRequiredContextValue {
  const context = useContext(AccountRequiredContext);
  if (!context) {
    return {
      requireAccount: () => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("forge:account-required"));
        }
      },
    };
  }
  return context;
}

export function AccountRequiredProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const requireAccount = useCallback(() => {
    setOpen(true);
  }, []);

  useEffect(() => {
    return subscribeAccountRequired(() => {
      setOpen(true);
    });
  }, []);

  const value = useMemo(() => ({ requireAccount }), [requireAccount]);

  return (
    <AccountRequiredContext.Provider value={value}>
      {children}
      <CreateAccountDialog open={open} onOpenChange={setOpen} />
    </AccountRequiredContext.Provider>
  );
}
