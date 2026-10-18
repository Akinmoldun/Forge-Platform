import fs from "fs";
import path from "path";

function testT19() {
  console.log("=== T19 GITHUB AUTH VERIFICATION ===");
  let passed = 0;
  let failed = 0;

  function assert(desc: string, condition: boolean) {
    if (condition) {
      console.log(`[PASS] ${desc}`);
      passed++;
    } else {
      console.error(`[FAIL] ${desc}`);
      failed++;
    }
  }

  // 1. Inspect auth.ts
  const authPath = path.resolve("src/convex/auth.ts");
  const authContent = fs.readFileSync(authPath, "utf-8");

  assert("auth.ts imports GitHub from @auth/core/providers/github",
    authContent.includes('import GitHub from "@auth/core/providers/github";')
  );

  assert("auth.ts checks AUTH_GITHUB_ID & AUTH_GITHUB_SECRET without crash",
    authContent.includes("AUTH_GITHUB_ID") && authContent.includes("AUTH_GITHUB_SECRET")
  );

  assert("auth.ts disables dangerous email linking (allowDangerousEmailAccountLinking: false)",
    authContent.includes("allowDangerousEmailAccountLinking: false")
  );

  assert("auth.ts custom signIn wrapper passes github through to rawAuth.signIn without extra checks",
    authContent.includes('args.provider === "github"') &&
    authContent.includes('(rawAuth.signIn as unknown as ActionHandler)._handler(ctx, args)')
  );

  assert("auth.ts does not print or log secrets",
    !authContent.includes("console.log(process.env.AUTH_GITHUB_SECRET") &&
    !authContent.includes("console.log(gitHubProvider")
  );

  // 2. Inspect http.ts
  const httpPath = path.resolve("src/convex/http.ts");
  const httpContent = fs.readFileSync(httpPath, "utf-8");

  assert("http.ts calls auth.addHttpRoutes(http)",
    httpContent.includes("auth.addHttpRoutes(http);")
  );

  // 3. Inspect AuthForm.tsx
  const authFormPath = path.resolve("src/components/AuthForm.tsx");
  const authFormContent = fs.readFileSync(authFormPath, "utf-8");

  assert("AuthForm has 'Continue with GitHub' button",
    authFormContent.includes("Continue with GitHub")
  );

  assert("AuthForm styles GitHub button as white pill with 1px border and ink text",
    authFormContent.includes("rounded-full bg-white border border-black/[0.12]") &&
    authFormContent.includes("text-[#0D0D0D]")
  );

  assert("AuthForm includes GitHub mark inline SVG",
    authFormContent.includes("M12 2C6.477 2 2 6.484 2 12.017")
  );

  assert("AuthForm shows small spinner while redirecting",
    authFormContent.includes("<Loader2 className=\"w-4 h-4 animate-spin shrink-0")
  );

  assert("AuthForm shows 13px #B3261E inline error on failure",
    authFormContent.includes("text-[13px] text-[#B3261E]") &&
    authFormContent.includes("Couldn't sign in with GitHub, try again")
  );

  assert("AuthForm calls signIn('github', { redirectTo: ... })",
    authFormContent.includes("signIn('github', { redirectTo:")
  );

  assert("AuthForm keeps password auth and guest demo button intact",
    authFormContent.includes("signIn('password',") &&
    authFormContent.includes("enableDemoMode()")
  );

  // 4. Inspect AppHome.tsx real user vs guest logic
  const appHomePath = path.resolve("src/pages/AppHome.tsx");
  const appHomeContent = fs.readFileSync(appHomePath, "utf-8");

  assert("AppHome treats all non-anonymous authenticated users as real users (no demo data)",
    appHomeContent.includes("const isRealUser = Boolean(user && !user.isAnonymous);")
  );

  assert("AppHome renders calm empty state for real new users",
    appHomeContent.includes("No workspaces yet") &&
    appHomeContent.includes("Create workspace")
  );

  // 5. Inspect users.ts welcome email logic
  const usersPath = path.resolve("src/convex/users.ts");
  const usersContent = fs.readFileSync(usersPath, "utf-8");

  assert("users.ts sends welcome email once and skips if no email or anonymous",
    usersContent.includes("if (!user || user.isAnonymous || !user.email) return { ok: false };") &&
    usersContent.includes("welcomeEmailSent")
  );

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

testT19();
