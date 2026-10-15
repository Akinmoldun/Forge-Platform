import type { ConvexReactClient } from "convex/react";
import type { FunctionReference } from "convex/server";
import { api } from "@/convex/_generated/api";

export interface GuestDemoResult {
  workspaceId: string;
  slug?: string;
  isNew: boolean;
}

type MutationRef = FunctionReference<"mutation">;

interface ApiWithGuestDemo {
  guestDemo?: {
    ensure?: MutationRef;
    resetDemo?: MutationRef;
    seed?: {
      ensure?: MutationRef;
      resetDemo?: MutationRef;
    };
  };
}

let inFlightEnsure: Promise<GuestDemoResult> | null = null;

import { isDemoMode } from "./demoMode";
import { demoStore } from "@/data/in-memory-demo-store";

/**
 * Ensures the authenticated anonymous guest has demo workspaces.
 */
export async function ensureGuestWorkspace(
  convex?: ConvexReactClient | null,
): Promise<GuestDemoResult> {
  if (isDemoMode() || !import.meta.env.VITE_CONVEX_URL || !convex) {
    const workspaces = demoStore.getWorkspaces();
    return {
      workspaceId: workspaces[0]?._id ?? "demo-ws-northstar",
      slug: workspaces[0]?.slug ?? "demo-northstar-labs",
      isNew: false,
    };
  }

  if (inFlightEnsure) return inFlightEnsure;

  const typedApi = api as unknown as ApiWithGuestDemo;
  const guestSeed = typedApi.guestDemo?.ensure || typedApi.guestDemo?.seed?.ensure;

  if (!guestSeed) {
    throw new Error("Demo is unavailable right now");
  }

  inFlightEnsure = (async () => {
    try {
      const res = (await convex.mutation(guestSeed, {})) as GuestDemoResult | null;
      if (!res || !res.workspaceId) {
        throw new Error("Demo is unavailable right now");
      }
      return res;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      if (errorMsg.includes("Could not find public function")) {
        throw new Error("Demo is unavailable right now");
      }
      throw err;
    } finally {
      inFlightEnsure = null;
    }
  })();

  return inFlightEnsure;
}

/**
 * Reset demo helper: calls server function to reset guest demo workspaces.
 */
export async function resetGuestDemo(
  convex?: any,
  _workspaceId?: string,
): Promise<GuestDemoResult> {
  if (isDemoMode() || !import.meta.env.VITE_CONVEX_URL || !convex) {
    demoStore.reset();
    return {
      workspaceId: "demo-ws-northstar",
      slug: "demo-northstar-labs",
      isNew: true,
    };
  }

  const typedApi = api as unknown as ApiWithGuestDemo;
  const backendReset =
    typedApi.guestDemo?.resetDemo || typedApi.guestDemo?.seed?.resetDemo;

  if (!backendReset) {
    throw new Error("Demo is unavailable right now");
  }

  try {
    const res = (await convex.mutation(backendReset, {})) as GuestDemoResult | null;
    if (!res || !res.workspaceId) {
      throw new Error("Demo is unavailable right now");
    }
    return res;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (errorMsg.includes("Could not find public function")) {
      throw new Error("Demo is unavailable right now");
    }
    throw err;
  }
}

/**
 * Deletes a workspace using the real backend mutation workspaces.deleteWorkspace.
 */
export async function deleteOrLeaveWorkspace(
  convex: ConvexReactClient | any,
  workspaceId: string,
  typedName?: string,
): Promise<void> {
  if (isDemoMode() || !import.meta.env.VITE_CONVEX_URL || !convex?.mutation) {
    demoStore.deleteWorkspace(workspaceId);
    return;
  }

  await convex.mutation(api.workspaces.deleteWorkspace, {
    workspaceId: workspaceId as never,
    typedName,
  });
}
