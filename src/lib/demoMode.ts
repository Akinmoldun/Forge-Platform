/**
 * Client-side demo mode session state.
 * Allows instant access to demo workspaces without backend calls or waiting.
 * Guest/demo mode exists ONLY when the explicit local demo flag was set by clicking Try Demo.
 */

let inMemoryDemoActive = false;

export function isDemoMode(): boolean {
  if (typeof window === "undefined") return inMemoryDemoActive;

  // In-memory flag overrides any storage inconsistencies
  if (inMemoryDemoActive) return true;

  try {
    // If an OAuth code exchange is in progress (?code=...), NEVER land in demo mode
    if (window.location.search.includes("code=")) return false;

    const isSessionDemo = sessionStorage.getItem("forge_demo_mode") === "true";
    const isUrlExplicitDemo = window.location.search.includes("demo=true");
    const isDemoRoute =
      window.location.pathname.includes("demo-ws") ||
      window.location.pathname.includes("demo-proj") ||
      window.location.pathname.includes("demo-issue");

    // Explicit demo flag set via "Try Demo", explicit demo=true URL param, or demo route
    if (isSessionDemo || isUrlExplicitDemo || isDemoRoute) {
      return true;
    }

    // Only if demo is not active, check if the user explicitly signed out
    if (sessionStorage.getItem("forge_signed_out") === "true") return false;

    return false;
  } catch {
    return inMemoryDemoActive;
  }
}

export function enableDemoMode(): void {
  inMemoryDemoActive = true;
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem("forge_demo_mode", "true");
    sessionStorage.removeItem("forge_signed_out");
    sessionStorage.removeItem("forge_hide_demo_session");
  } catch {
    // ignore storage restrictions
  }
}

export function disableDemoMode(): void {
  inMemoryDemoActive = false;
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem("forge_demo_mode");
    sessionStorage.removeItem("forge_hide_demo_session");
  } catch {
    // ignore
  }
}
