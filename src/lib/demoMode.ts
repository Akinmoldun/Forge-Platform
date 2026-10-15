/**
 * Client-side demo mode session state.
 * Allows instant access to demo workspaces without backend calls or waiting.
 */

export function isDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const isSessionDemo = sessionStorage.getItem("forge_demo_mode") === "true";
    const isUrlDemo =
      window.location.pathname.includes("demo-ws") ||
      window.location.pathname.includes("demo-proj") ||
      window.location.pathname.includes("demo-issue") ||
      window.location.search.includes("demo=true");
    return isSessionDemo || isUrlDemo;
  } catch {
    return false;
  }
}

export function enableDemoMode(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem("forge_demo_mode", "true");
  } catch {
    // ignore storage restrictions
  }
}

export function disableDemoMode(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem("forge_demo_mode");
  } catch {
    // ignore
  }
}
