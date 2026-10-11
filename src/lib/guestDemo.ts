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

/**
 * Ensures the authenticated anonymous guest has demo workspaces.
 * Only calls the server function guestDemo.ensure (or guestDemo/seed:ensure).
 * No browser-side fake creation fallback is allowed.
 */
export async function ensureGuestWorkspace(
  convex: ConvexReactClient,
): Promise<GuestDemoResult> {
  const typedApi = api as unknown as ApiWithGuestDemo;
  const guestSeed = typedApi.guestDemo?.ensure || typedApi.guestDemo?.seed?.ensure;

  if (!guestSeed) {
    throw new Error("Demo is unavailable right now");
  }

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
  }
}

/**
 * Reset demo helper: calls server function to reset guest demo workspaces.
 */
export async function resetGuestDemo(
  convex: ConvexReactClient,
  _workspaceId?: string,
): Promise<GuestDemoResult> {
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
 * No fake fallback (no renaming to [Deleted] or project deletion fallback).
 * Any error from the backend is thrown directly to the caller.
 */
export async function deleteOrLeaveWorkspace(
  convex: ConvexReactClient,
  workspaceId: string,
): Promise<void> {
  await convex.mutation(api.workspaces.deleteWorkspace, {
    workspaceId: workspaceId as never,
  });
}
