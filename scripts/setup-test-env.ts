import React from "react";

(globalThis as any).React = React;

if (typeof globalThis.window === "undefined") {
  const eventListeners: Record<string, Set<(e: any) => void>> = {};

  (globalThis as any).window = {
    addEventListener: (type: string, listener: (e: any) => void) => {
      if (!eventListeners[type]) eventListeners[type] = new Set();
      eventListeners[type].add(listener);
    },
    removeEventListener: (type: string, listener: (e: any) => void) => {
      if (eventListeners[type]) eventListeners[type].delete(listener);
    },
    dispatchEvent: (event: any) => {
      const listeners = eventListeners[event.type];
      if (listeners) {
        listeners.forEach((fn) => fn(event));
      }
      return true;
    },
    location: {
      pathname: "/app/workspaces/demo-ws-northstar",
      search: "",
      origin: "https://ais-pre-f5hmg3ing2g2i47qpg6u2d-379843806320.europe-west1.run.app",
    },
    scrollTo: () => {},
    matchMedia: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }),
  };
  (globalThis as any).document = {
    createElement: () => ({
      setAttribute: () => {},
      classList: { add: () => {}, remove: () => {} },
      appendChild: () => {},
      style: {},
    }),
    createTextNode: (text: string) => ({ text }),
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    head: { appendChild: () => {} },
    body: { appendChild: () => {} },
  };
  const localMap = new Map<string, string>();
  (globalThis as any).localStorage = {
    getItem: (k: string) => localMap.get(k) ?? null,
    setItem: (k: string, v: string) => localMap.set(k, String(v)),
    removeItem: (k: string) => localMap.delete(k),
  };
  const sessionMap = new Map<string, string>();
  (globalThis as any).sessionStorage = {
    getItem: (k: string) => sessionMap.get(k) ?? null,
    setItem: (k: string, v: string) => sessionMap.set(k, String(v)),
    removeItem: (k: string) => sessionMap.delete(k),
  };
}
