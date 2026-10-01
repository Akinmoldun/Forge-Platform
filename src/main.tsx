import '@vly-ai/integrations';
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { VlyToolbar } from "../vly-toolbar-readonly.tsx";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import React, { StrictMode, useEffect, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import "./index.css";

// Lazy load route components for better code splitting. Relative,
// extensionless paths — Vite compiles these into hashed /assets/*.js chunks;
// the raw /src/*.tsx URLs never exist in a production build.
const MarketingReferencePage = lazy(
  () => import("./pages/marketing-reference/MarketingReferencePage"),
);
const RequireAuth = lazy(() =>
  import("./components/RequireAuth").then((module) => ({
    default: module.RequireAuth,
  })),
);
const AuthPage = lazy(() => import("./pages/Auth"));
const AppHome = lazy(() => import("./pages/AppHome"));
const OverviewPage = lazy(() => import("./pages/OverviewPage"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));
const WorkflowPage = lazy(() => import("./pages/WorkflowPage"));
const WorkspaceRouteRedirect = lazy(
  () => import("./pages/WorkspaceRouteRedirect"),
);
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const TeamsPage = lazy(() => import("./pages/TeamsPage"));
const ActivityPage = lazy(() => import("./pages/ActivityPage"));
const ProjectPage = lazy(() => import("./pages/ProjectPage"));
const IssuePage = lazy(() => import("./pages/IssuePage"));
const ProjectSettings = lazy(() => import("./pages/ProjectSettings"));
const WorkspaceSettings = lazy(() => import("./pages/WorkspaceSettings"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const InvitePage = lazy(() => import("./pages/InvitePage"));
const NotFound = lazy(() => import("./pages/NotFound"));

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

const convexUrl = import.meta.env.VITE_CONVEX_URL;
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

function WithConvexAuth({ children }: { children: React.ReactNode }) {
  if (!convex) return <BackendSetupNotice />;
  return <ConvexAuthProvider client={convex}>{children}</ConvexAuthProvider>;
}

function withConvexAuth(element: React.ReactNode) {
  return <WithConvexAuth>{element}</WithConvexAuth>;
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
                onClick={() => this.setState({ error: null })}
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
      <BrowserRouter>
        <RouteSyncer />
        <Suspense fallback={<RouteLoading />}>
          <RouteErrorBoundary>
            <Routes>
              <Route
                path="/"
                element={<MarketingReferencePage pageKey="home" />}
              />
              {/* "Workflow" used to be a marketing landing page here. It now
                  resolves into the authenticated workspace editor, so every
                  marketing link to it lands on the real screen. */}
              <Route
                path="/workflows"
                element={withConvexAuth(
                  <RequireAuth redirectImmediately>
                    <WorkspaceRouteRedirect view="workflow" />
                  </RequireAuth>,
                )}
              />
              <Route
                path="/analytics"
                element={<MarketingReferencePage pageKey="analytics" />}
              />
              <Route
                path="/enterprise"
                element={<MarketingReferencePage pageKey="enterprise" />}
              />
              <Route
                path="/capabilities"
                element={<MarketingReferencePage pageKey="capabilities" />}
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
                element={withConvexAuth(
                  <RequireAuth redirectImmediately>
                    <NotificationsPage />
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
    </RootErrorBoundary>
  </StrictMode>,
);
