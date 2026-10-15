import { GlobalWindow } from "happy-dom";

const window = new GlobalWindow({ url: "http://localhost:3000/app/workspaces/demo-ws-northstar" });
(globalThis as any).window = window;
(globalThis as any).document = window.document;
try {
  (globalThis as any).navigator = window.navigator;
} catch {
  Object.defineProperty(globalThis, "navigator", { value: window.navigator, configurable: true, writable: true });
}
(globalThis as any).location = window.location;
(globalThis as any).HTMLElement = window.HTMLElement;
(globalThis as any).Element = window.Element;
(globalThis as any).Node = window.Node;
(globalThis as any).requestAnimationFrame = (cb: any) => setTimeout(cb, 0);
(globalThis as any).cancelAnimationFrame = (id: any) => clearTimeout(id);
class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as any).IntersectionObserver = MockIntersectionObserver;
(window as any).IntersectionObserver = MockIntersectionObserver;

// Storage
(globalThis as any).localStorage = window.localStorage;
(globalThis as any).sessionStorage = window.sessionStorage;

import React from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter, Routes, Route } from "react-router";
import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import OverviewPage from "../src/pages/OverviewPage";
import { Section2Hero } from "../src/pages/landing/sections/Section2Hero";
import SignupPage from "../src/pages/SignupPage";
import AppHome from "../src/pages/AppHome";

const convex = new ConvexReactClient("https://fabulous-falcon-123.convex.cloud");

const container = window.document.createElement("div");
window.document.body.appendChild(container);
const root = createRoot(container as any);

console.log("Mounting OverviewPage in DOM...");
let caughtError: any = null;
window.addEventListener("error", (e) => {
  console.error("Window error event:", e.message, e.error);
  caughtError = e.error || e.message;
});

try {
  root.render(
    <ConvexAuthProvider client={convex}>
      <MemoryRouter initialEntries={["/app/workspaces/demo-ws-northstar"]}>
        <Routes>
          <Route path="/app/workspaces/:workspaceId" element={<OverviewPage />} />
        </Routes>
      </MemoryRouter>
    </ConvexAuthProvider>
  );
  console.log("Initial render triggered. Waiting 1000ms for effects/renders...");
  await new Promise((r) => setTimeout(r, 1000));
  console.log("OverviewPage DOM rendered without crash. HTML length:", container.innerHTML.length);
} catch (err: any) {
  console.error("Crash during render:", err);
}

// Now test Hero -> Try demo -> Workspace
console.log("Testing Section2Hero...");
const heroContainer = window.document.createElement("div");
window.document.body.appendChild(heroContainer);
const heroRoot = createRoot(heroContainer as any);
try {
  heroRoot.render(
    <ConvexAuthProvider client={convex}>
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<Section2Hero />} />
          <Route path="/app/workspaces/:workspaceId" element={<OverviewPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </MemoryRouter>
    </ConvexAuthProvider>
  );
  await new Promise((r) => setTimeout(r, 500));
  console.log("Section2Hero mounted cleanly.");
} catch (err: any) {
  console.error("Section2Hero crashed:", err);
}

process.exit(0);
