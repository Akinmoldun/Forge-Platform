import "./setup-test-env";
import React from "react";
import ReactDOMServer from "react-dom/server";
import { MemoryRouter, Routes, Route } from "react-router";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import OverviewPage from "../src/pages/OverviewPage";

const convex = new ConvexReactClient("https://fabulous-falcon-123.convex.cloud");

// Mock browser globals
if (typeof globalThis.window === "undefined") {
  (globalThis as any).window = {
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
    location: { pathname: "/app/workspaces/demo-ws-northstar", search: "" },
    scrollTo: () => {},
    matchMedia: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }),
  };
  (globalThis as any).localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };
  (globalThis as any).sessionStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };
}

try {
  console.log("Starting render of OverviewPage with ConvexAuthProvider...");
  const html = ReactDOMServer.renderToString(
    <ConvexAuthProvider client={convex}>
      <MemoryRouter initialEntries={["/app/workspaces/demo-ws-northstar"]}>
        <Routes>
          <Route path="/app/workspaces/:workspaceId" element={<OverviewPage />} />
        </Routes>
      </MemoryRouter>
    </ConvexAuthProvider>
  );
  console.log("Rendered successfully! Length:", html.length);
} catch (e: any) {
  console.error("CAUGHT ERROR:", e.message, "\nSTACK:\n", e.stack);
}
