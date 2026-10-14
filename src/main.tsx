import '@vly-ai/integrations';
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { VlyToolbar } from "../vly-toolbar-readonly.tsx";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import React, { StrictMode, useEffect, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/jetbrains-mono/700.css";
import "@fontsource/hanken-grotesk/400.css";
import "@fontsource/hanken-grotesk/500.css";
import "@fontsource/hanken-grotesk/600.css";
import "@fontsource/hanken-grotesk/700.css";
import "./index.css";
const HomePage = safeLazy(() => import("./pages/HomePage"));

/** Safe lazy loader that auto-retries failed dynamic imports (e.g. dev server restarts) */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function safeLazy<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
) {
  return lazy(() =>
    factory().catch((err) => {
      console.warn("[Router] Retrying dynamic import...", err);
      return new Promise<{ default: T }>((resolve) =>
        setTimeout(resolve, 800),
      ).then(factory);
    }),
  );
}

const RequireAuth = safeLazy(() =>
  import("./components/RequireAuth").then((module) => ({
    default: module.RequireAuth,
  })),
);
const LoginPage = safeLazy(() => import("./pages/LoginPage"));
const SignupPage = safeLazy(() => import("./pages/SignupPage"));
const AuthPage = safeLazy(() => import("./pages/Auth"));
const AppHome = safeLazy(() => import("./pages/AppHome"));
const OverviewPage = safeLazy(() => import("./pages/OverviewPage"));
const ProjectsPage = safeLazy(() => import("./pages/ProjectsPage"));
const WorkflowPage = safeLazy(() => import("./pages/WorkflowPage"));
const AnalyticsPage = safeLazy(() => import("./pages/AnalyticsPage"));
const TeamsPage = safeLazy(() => import("./pages/TeamsPage"));
const ActivityPage = safeLazy(() => import("./pages/ActivityPage"));
const ProjectPage = safeLazy(() => import("./pages/ProjectPage"));
const IssuePage = safeLazy(() => import("./pages/IssuePage"));
const ProjectSettings = safeLazy(() => import("./pages/ProjectSettings"));
const WorkspaceSettings = safeLazy(() => import("./pages/WorkspaceSettings"));
const NotificationsPage = safeLazy(() => import("./pages/NotificationsPage"));
const ProfileSettingsPage = safeLazy(() => import("./pages/ProfileSettingsPage"));
const InvitePage = safeLazy(() => import("./pages/InvitePage"));
const NotFound = safeLazy(() => import("./pages/NotFound"));

// Simple loading fallback for route transitions
function RouteLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>
  );
}

/** Silent error boundary — if VlyToolbar crashes it renders nothing instead of
 *  crashing the whole app (e.g. hook errors in the browser runtime). */
class ToolbarErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err: Error) {
    console.warn("[VlyToolbar] Caught error, toolbar disabled:", err.message);
  }
  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

/** Hard guard so runtime errors never leave the preview as a blank page. */
class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string; stack: string }
> {
  state = { hasError: false, message: "", stack: "" };
  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      message: error.message || "Unknown runtime error",
      stack: error.stack || "",
    };
  }
  componentDidCatch(err: Error) {
    console.error("[Preview] Root crash:", err);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
          <div className="max-w-lg text-center">
            <p className="text-sm font-semibold">Preview runtime error</p>
            <p className="mt-2 text-xs text-muted-foreground break-words">
              {this.state.message}
            </p>
            {this.state.stack && (
              <pre className="mt-3 text-left text-[10px] leading-4 text-muted-foreground/80 max-h-40 overflow-auto rounded border border-border/60 p-2">
                {this.state.stack}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const rawConvexUrl = import.meta.env.VITE_CONVEX_URL;
// Normalize to .convex.cloud for WebSocket connection if someone supplied .convex.site
const convexUrl = rawConvexUrl
  ? rawConvexUrl.replace(/\.convex\.site\/?$/, ".convex.cloud").replace(/\/$/, "")
  : null;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

function BackendSetupNotice() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-lg rounded-lg border border-border bg-card p-7 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Backend configuration required
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">
          Connect a Convex deployment to open the Forge app
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          The public product pages work without a backend. Sign-in, workspaces,
          and project data need a valid VITE_CONVEX_URL.
        </p>
        <a
          className="mt-6 inline-flex rounded-md border border-border px-3 py-2 text-sm transition-colors hover:bg-secondary"
          href="/"
        >
          Return to Forge
        </a>
      </div>
    </main>
  );
}

/**
 * The Convex auth session is mounted ONCE, above the router.
 *
 * It used to be created per route element, so every client-side navigation
 * tore the session state down and built it back up: `isLoading` reset to true
 * and `isAuthenticated` reset to false until the stored token was read again.
 * A route guard that looked at that window treated a signed-in user as signed
 * out and sent them to /auth, which then forwarded to the workspace picker.
 * One provider for the whole app keeps the session stable across navigation.
 */
function AppProviders({ children }: { children: React.ReactNode }) {
  if (!convex) return <>{children}</>;
  return <ConvexAuthProvider client={convex}>{children}</ConvexAuthProvider>;
}

/**
 * Route elements call this to ensure Convex is connected before rendering
 * authenticated views. If no Convex URL is configured, a friendly setup
 * notice is displayed with a link back to public Forge pages.
 */
function withConvexAuth(children: React.ReactNode) {
  if (
    typeof window !== "undefined" &&
    (window.location.pathname.includes("/demo-") ||
      window.location.pathname.includes("demo-ws-"))
  ) {
    return children;
  }
  if (!convex) return <BackendSetupNotice />;
  return children;
}

/**
 * Route-level error boundary: a crash in one page renders an error card with
 * the REAL error message and a manual retry button. It never reloads the page
 * automatically (which could loop) and never leaves a blank screen.
 */
class RouteErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error) {
    console.error("[Route] Render error:", error);
  }
  render() {
    if (this.state.error) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-background p-6">
          <div className="w-full max-w-lg rounded-lg border border-destructive/40 bg-card p-6">
            <p className="text-sm font-semibold text-destructive">
              This page failed to render
            </p>
            <p className="mt-2 break-words text-sm text-foreground">
              {this.state.error.message || "Unknown error"}
            </p>
            {this.state.error.stack && (
              <pre className="mt-3 max-h-40 overflow-auto rounded border border-border/60 p-2 text-left text-[10px] leading-4 text-muted-foreground">
                {this.state.error.stack}
              </pre>
            )}
            <div className="mt-4 flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  if (
                    this.state.error?.message?.includes("dynamically imported module")
                  ) {
                    window.location.reload();
                  } else {
                    this.setState({ error: null });
                  }
                }}
              >
                Try again
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => this.setState({ error: null })}
              >
                Dismiss
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Check the browser console for the full error, including failed
              queries or actions.
            </p>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}

function RouteSyncer() {
  const location = useLocation();
  useEffect(() => {
    window.parent.postMessage(
      { type: "iframe-route-change", path: location.pathname },
      "*",
    );
  }, [location.pathname]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "navigate") {
        if (event.data.direction === "back") window.history.back();
        if (event.data.direction === "forward") window.history.forward();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootErrorBoundary>
      <ToolbarErrorBoundary>
        <VlyToolbar />
      </ToolbarErrorBoundary>
      <AppProviders>
        <BrowserRouter>
          <RouteSyncer />
          <Suspense fallback={<RouteLoading />}>
            <RouteErrorBoundary>
              <Routes>
              <Route
                path="/"
                element={<HomePage />}
              />
              <Route
                path="/workflows"
                element={<HomePage />}
              />
              <Route
                path="/analytics"
                element={<HomePage />}
              />
              <Route
                path="/enterprise"
                element={<HomePage />}
              />
              <Route
                path="/capabilities"
                element={<HomePage />}
              />
              <Route
                path="/about"
                element={<HomePage />}
              />
              <Route
                path="/product"
                element={<HomePage />}
              />
              <Route
                path="/workflow"
                element={<HomePage />}
              />
              <Route
                path="/teams"
                element={<HomePage />}
              />
              <Route
                path="/login"
                element={withConvexAuth(
                  <LoginPage redirectAfterAuth="/app" />,
                )}
              />
              <Route
                path="/signup"
                element={withConvexAuth(
                  <SignupPage redirectAfterAuth="/app" />,
                )}
              />
              <Route
                path="/auth"
                element={withConvexAuth(
                  <AuthPage redirectAfterAuth="/app" />,
                )}
              />
              <Route
                path="/app"
                element={withConvexAuth(
                  <RequireAuth redirectImmediately>
                    <AppHome />
                  </RequireAuth>,
                )}
              />
              <Route
                path="/app/workspaces/:workspaceId"
                element={withConvexAuth(
                  <RequireAuth redirectImmediately>
                    <OverviewPage />
                  </RequireAuth>,
                )}
              />
              <Route
                path="/app/workspaces/:workspaceId/overview"
                element={withConvexAuth(
                  <RequireAuth redirectImmediately>
                    <OverviewPage />
                  </RequireAuth>,
                )}
              />
              <Route
                path="/app/workspaces/:workspaceId/projects"
                element={withConvexAuth(
                  <RequireAuth redirectImmediately>
                    <ProjectsPage />
                  </RequireAuth>,
                )}
              />
              <Route
                path="/app/workspaces/:workspaceId/workflow"
                element={withConvexAuth(
                  <RequireAuth redirectImmediately>
                    <WorkflowPage />
                  </RequireAuth>,
                )}
              />
              <Route
                path="/app/workspaces/:workspaceId/analytics"
                element={withConvexAuth(
                  <RequireAuth redirectImmediately>
                    <AnalyticsPage />
                  </RequireAuth>,
                )}
              />
              <Route
                path="/app/workspaces/:workspaceId/teams"
                element={withConvexAuth(
                  <RequireAuth redirectImmediately>
                    <TeamsPage />
                  </RequireAuth>,
                )}
              />
              <Route
                path="/app/workspaces/:workspaceId/members"
                element={withConvexAuth(
                  <RequireAuth redirectImmediately>
                    <TeamsPage />
                  </RequireAuth>,
                )}
              />
              <Route
                path="/app/workspaces/:workspaceId/activity"
                element={withConvexAuth(
                  <RequireAuth redirectImmediately>
                    <ActivityPage />
                  </RequireAuth>,
                )}
              />
              <Route
                path="/app/workspaces/:workspaceId/settings"
                element={withConvexAuth(
                  <RequireAuth redirectImmediately>
                    <WorkspaceSettings />
                  </RequireAuth>,
                )}
              />
              <Route
                path="/app/workspaces/:workspaceId/notifications"
                element={withConvexAuth(
                  <RequireAuth redirectImmediately>
                    <NotificationsPage />
                  </RequireAuth>,
                )}
              />
              <Route
                path="/app/projects/:projectId"
                element={withConvexAuth(
                  <RequireAuth redirectImmediately>
                    <ProjectPage />
                  </RequireAuth>,
                )}
              />
              <Route
                path="/app/projects/:projectId/board"
                element={withConvexAuth(
                  <RequireAuth redirectImmediately>
                    <ProjectPage />
                  </RequireAuth>,
                )}
              />
              <Route
                path="/app/projects/:projectId/analytics"
                element={withConvexAuth(
                  <RequireAuth redirectImmediately>
                    <ProjectPage tab="analytics" />
                  </RequireAuth>,
                )}
              />
              <Route
                path="/app/projects/:projectId/activity"
                element={withConvexAuth(
                  <RequireAuth redirectImmediately>
                    <ProjectPage tab="activity" />
                  </RequireAuth>,
                )}
              />
              <Route
                path="/app/projects/:projectId/settings/workflows"
                element={withConvexAuth(
                  <RequireAuth redirectImmediately>
                    <ProjectSettings />
                  </RequireAuth>,
                )}
              />
              <Route
                path="/app/issues/:issueId"
                element={withConvexAuth(
                  <RequireAuth redirectImmediately>
                    <IssuePage />
                  </RequireAuth>,
                )}
              />
              <Route
                path="/app/notifications"
                element={<Navigate to="/app" replace />}
              />
              <Route
                path="/app/settings/profile"
                element={withConvexAuth(
                  <RequireAuth redirectImmediately>
                    <ProfileSettingsPage />
                  </RequireAuth>,
                )}
              />
              <Route
                path="/app/profile"
                element={withConvexAuth(
                  <RequireAuth redirectImmediately>
                    <ProfileSettingsPage />
                  </RequireAuth>,
                )}
              />
              <Route
                path="/invite"
                element={withConvexAuth(<InvitePage />)}
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
            </RouteErrorBoundary>
          </Suspense>
        </BrowserRouter>
        <Toaster />
      </AppProviders>
    </RootErrorBoundary>
  </StrictMode>,
);
