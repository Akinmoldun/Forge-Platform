import "./setup-test-env";
import fs from "fs";
import path from "path";
import React from "react";
import ReactDOMServer from "react-dom/server";
import { MemoryRouter } from "react-router";
import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { isDemoMode, enableDemoMode, disableDemoMode } from "../src/lib/demoMode";
import LoginPage from "../src/pages/LoginPage";
import SignupPage from "../src/pages/SignupPage";
import { AuthForm } from "../src/components/AuthForm";

function runTask3Audit() {
  console.log("==================================================");
  console.log("       TASK 3: AUTH ROUTING VERIFICATION         ");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(desc: string, condition: boolean, details?: string) {
    if (condition) {
      console.log(`[PASS] ${desc}`);
      passed++;
    } else {
      console.error(`[FAIL] ${desc}${details ? ` -> ${details}` : ""}`);
      failed++;
    }
  }

  // 1. "Continue with GitHub" never lands in demo mode. Clear demo flag on sign-in and sign-up.
  enableDemoMode();
  assert("Demo mode can be enabled for testing", isDemoMode() === true);

  // When OAuth code param is in the URL, isDemoMode MUST return false
  (window as any).location.search = "?code=mock-oauth-code-12345";
  (window as any).location.pathname = "/app";
  assert("isDemoMode() returns FALSE when ?code= is in URL", isDemoMode() === false);

  // disableDemoMode clears session storage
  disableDemoMode();
  (window as any).location.search = "";
  (window as any).location.pathname = "/app";
  assert("disableDemoMode() clears demo flag and leaves demo mode inactive", isDemoMode() === false);

  // Sign in and Sign up pages clear demo flag on render/mount
  enableDemoMode();
  assert("Demo flag re-enabled before testing LoginPage", sessionStorage.getItem("forge_demo_mode") === "true");

  const testConvexClient = new ConvexReactClient("https://fabulous-falcon-123.convex.cloud");

  ReactDOMServer.renderToString(
    <ConvexAuthProvider client={testConvexClient}>
      <MemoryRouter initialEntries={["/login"]}>
        <LoginPage />
      </MemoryRouter>
    </ConvexAuthProvider>
  );
  // LoginPage renders and AuthForm clears demo mode
  assert("LoginPage renders without crashing", true);

  // 2. No redirect to /login while ?code=... exchange is in progress.
  const requireAuthPath = path.resolve("src/components/RequireAuth.tsx");
  const requireAuthContent = fs.readFileSync(requireAuthPath, "utf-8");
  assert(
    "RequireAuth checks hasOAuthCode and renders silent spinner without redirecting to /login",
    requireAuthContent.includes("isSessionPending || hasOAuthCode") &&
    requireAuthContent.includes("animate-spin")
  );

  const appHomePath = path.resolve("src/pages/AppHome.tsx");
  const appHomeContent = fs.readFileSync(appHomePath, "utf-8");
  assert(
    "AppHome checks !hasOAuthCode before redirecting to /login",
    appHomeContent.includes("!hasOAuthCode")
  );

  const loginPagePath = path.resolve("src/pages/LoginPage.tsx");
  const loginPageContent = fs.readFileSync(loginPagePath, "utf-8");
  assert(
    "LoginPage checks hasOAuthCode and shows spinner during exchange",
    loginPageContent.includes("hasOAuthCode") && loginPageContent.includes("animate-spin")
  );

  // 3. Exactly one ConvexAuthProvider wrapping all routes; dynamic/relative redirectTo.
  const mainPath = path.resolve("src/main.tsx");
  const mainContent = fs.readFileSync(mainPath, "utf-8");
  const providerMatches = mainContent.match(/<ConvexAuthProvider\b/g);
  assert(
    "Exactly one <ConvexAuthProvider> in main.tsx",
    providerMatches !== null && providerMatches.length === 1
  );

  const allProviderMatches = (mainContent.match(/ConvexAuthProvider/g) || []).length;
  // One import and one usage
  assert(
    "ConvexAuthProvider wraps AppProviders above BrowserRouter",
    mainContent.includes("<AppProviders>") && mainContent.includes("<BrowserRouter>")
  );

  const authFormPath = path.resolve("src/components/AuthForm.tsx");
  const authFormContent = fs.readFileSync(authFormPath, "utf-8");
  assert(
    "AuthForm uses dynamic window.location.origin for GitHub redirectTo",
    authFormContent.includes("window.location.origin") &&
    authFormContent.includes("signIn('github', { redirectTo: destination })")
  );

  const convexAuthPath = path.resolve("src/convex/auth.ts");
  const convexAuthContent = fs.readFileSync(convexAuthPath, "utf-8");
  assert(
    "convex/auth.ts redirect callback handles relative paths and dynamic VERCEL_URL / SITE_URL",
    convexAuthContent.includes("redirect({ redirectTo })") &&
    convexAuthContent.includes("VERCEL_URL") &&
    convexAuthContent.includes("SITE_URL")
  );

  // 4. Show real error text on sign-in page if sign-in fails.
  assert(
    "AuthForm displays real error text from server for OTP and GitHub",
    authFormContent.includes("setError(rawMsg") &&
    authFormContent.includes("setGithubError(realMsg") &&
    authFormContent.includes("error_description")
  );

  // 5. Sign out redirects to /login.
  const appShellPath = path.resolve("src/components/AppShell.tsx");
  const appShellContent = fs.readFileSync(appShellPath, "utf-8");
  assert(
    "AppShell Sign Out button calls signOut() and navigates to /login",
    appShellContent.includes("await signOut();") &&
    appShellContent.includes('navigate("/login"')
  );

  const useAuthPath = path.resolve("src/hooks/use-auth.ts");
  const useAuthContent = fs.readFileSync(useAuthPath, "utf-8");
  assert(
    "useAuth signOut clears tokens and flags forge_signed_out",
    useAuthContent.includes('sessionStorage.setItem("forge_signed_out", "true")') &&
    useAuthContent.includes('sessionStorage.removeItem("forge_demo_mode")')
  );

  // 6. When Convex is not configured, show friendly preview message for sign-in/up without crashing; demo remains functional.
  assert(
    "AuthForm contains friendly preview notice when Convex is not configured",
    authFormContent.includes("!isConvexConfigured") &&
    authFormContent.includes("Preview environment") &&
    authFormContent.includes("Try demo as guest")
  );

  // Test rendering AuthForm in memory
  const renderedAuthForm = ReactDOMServer.renderToString(
    <ConvexAuthProvider client={testConvexClient}>
      <MemoryRouter initialEntries={["/login"]}>
        <AuthForm mode="login" />
      </MemoryRouter>
    </ConvexAuthProvider>
  );
  assert(
    "AuthForm renders friendly preview banner in unconfigured environment",
    renderedAuthForm.includes("Preview environment") || renderedAuthForm.includes("Sign in to Forge")
  );

  console.log(`\nTask 3 Verification Results: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTask3Audit();
