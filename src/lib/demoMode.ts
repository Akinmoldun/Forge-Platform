/**
 * Client-side demo mode session state.
 * Allows instant access to demo workspaces without backend calls or waiting.
 * Guest/demo mode exists ONLY when the explicit local demo flag was set by clicking Try Demo.
 */

export function isDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    // If an OAuth code exchange is in progress (?code=...), NEVER land in demo mode
    if (window.location.search.includes("code=")) return false;

    // If the user explicitly signed out, do not enter demo mode
    if (sessionStorage.getItem("forge_signed_out") === "true") return false;

    const isSessionDemo = sessionStorage.getItem("forge_demo_mode") === "true";
    const isUrlExplicitDemo = window.location.search.includes("demo=true");
    const isDemoRoute =
      window.location.pathname.includes("demo-ws") ||
      window.location.pathname.includes("demo-proj") ||
      window.location.pathname.includes("demo-issue");

    // Explicit demo flag set via "Try Demo" or explicit demo=true URL param,
    // or actively on a demo route when session demo was started
    return isSessionDemo || isUrlExplicitDemo || (isSessionDemo && isDemoRoute);
  } catch {
    return false;
  }
}

export function enableDemoMode(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem("forge_demo_mode", "true");
    sessionStorage.removeItem("forge_signed_out");
  } catch {
    // ignore storage restrictions
  }
}

export function disableDemoMode(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem("forge_demo_mode");
    sessionStorage.removeItem("forge_hide_demo_session");
  } catch {
    // ignore
  }
}
