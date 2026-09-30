import '@vly-ai/integrations';
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { RequireAuth } from "@/components/RequireAuth";
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
const Landing = lazy(() => import("./pages/Landing"));
const AuthPage = lazy(() => import("./pages/Auth"));
const AppHome = lazy(() => import("./pages/AppHome"));
const WorkspacePage = lazy(() => import("./pages/WorkspacePage"));
const ProjectPage = lazy(() => import("./pages/ProjectPage"));
const IssuePage = lazy(() => import("./pages/IssuePage"));
const ProjectSettings = lazy(() => import("./pages/ProjectSettings"));
const WorkspaceSettings = lazy(() => import("./pages/WorkspaceSettings"));
const MembersPage = lazy(() => import("./pages/MembersPage"));
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

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

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
          <div className="w-full max-w-lg rounded-xl border border-destructive/40 bg-card p-6">
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
      <ConvexAuthProvider client={convex}>
        <BrowserRouter>
          <RouteSyncer />
          <Suspense fallback={<RouteLoading />}>
            <RouteErrorBoundary>
              <Routes>
              <Route path="/" element={<Landing />} />
              <Route
                path="/auth"
                element={<AuthPage redirectAfterAuth="/app" />}
              />
              <Route path="/app" element={<RequireAuth redirectImmediately><AppHome /></RequireAuth>} />
              <Route path="/app/workspaces/:workspaceId" element={<RequireAuth redirectImmediately><WorkspacePage /></RequireAuth>} />
              <Route path="/app/workspaces/:workspaceId/activity" element={<RequireAuth redirectImmediately><WorkspacePage tab="activity" /></RequireAuth>} />
              <Route path="/app/workspaces/:workspaceId/members" element={<RequireAuth redirectImmediately><MembersPage /></RequireAuth>} />
              <Route path="/app/workspaces/:workspaceId/settings" element={<RequireAuth redirectImmediately><WorkspaceSettings /></RequireAuth>} />
              <Route path="/app/projects/:projectId" element={<RequireAuth redirectImmediately><ProjectPage /></RequireAuth>} />
              <Route path="/app/projects/:projectId/board" element={<RequireAuth redirectImmediately><ProjectPage /></RequireAuth>} />
              <Route path="/app/projects/:projectId/analytics" element={<RequireAuth redirectImmediately><ProjectPage tab="analytics" /></RequireAuth>} />
              <Route path="/app/projects/:projectId/activity" element={<RequireAuth redirectImmediately><ProjectPage tab="activity" /></RequireAuth>} />
              <Route path="/app/projects/:projectId/settings/workflows" element={<RequireAuth redirectImmediately><ProjectSettings /></RequireAuth>} />
              <Route path="/app/issues/:issueId" element={<RequireAuth redirectImmediately><IssuePage /></RequireAuth>} />
              <Route path="/app/notifications" element={<RequireAuth redirectImmediately><NotificationsPage /></RequireAuth>} />
              <Route path="/invite" element={<InvitePage />} />
              <Route path="*" element={<NotFound />} />
              </Routes>
            </RouteErrorBoundary>
          </Suspense>
        </BrowserRouter>
        <Toaster />
      </ConvexAuthProvider>
    </RootErrorBoundary>
  </StrictMode>,
);
