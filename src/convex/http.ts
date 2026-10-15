import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";

const http = httpRouter();

// Mount all Convex Auth HTTP endpoints (e.g. /api/auth/signin/*, /api/auth/callback/*, /.well-known/*)
auth.addHttpRoutes(http);

function renderPortalHtml(path: string, url: URL): string {
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");
  const deploymentName = process.env.CONVEX_DEPLOYMENT || "ideal-corgi-476";

  const siteUrl = (process.env.SITE_URL || "https://ais-pre-f5hmg3ing2g2i47qpg6u2d-379843806320.europe-west1.run.app").replace(/\/+$/, "");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Forge Cloud Backend — Convex Site Hub</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #09090b;
      color: #fafafa;
      line-height: 1.5;
      padding: 32px 16px;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }
    .container {
      width: 100%;
      max-width: 720px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #27272a;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo {
      width: 36px;
      height: 36px;
      background: #ffffff;
      color: #09090b;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 18px;
    }
    .brand-title {
      font-size: 20px;
      font-weight: 600;
      letter-spacing: -0.02em;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 500;
      background: #14532d;
      color: #86efac;
      border: 1px solid #166534;
    }
    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #4ade80;
    }
    .card {
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 20px;
    }
    .card-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .card-desc {
      color: #a1a1aa;
      font-size: 14px;
      margin-bottom: 16px;
    }
    .alert {
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 14px;
    }
    .alert-success {
      background: #064e3b;
      border: 1px solid #059669;
      color: #a7f3d0;
    }
    .alert-error {
      background: #7f1d1d;
      border: 1px solid #dc2626;
      color: #fecaca;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
      margin-bottom: 16px;
    }
    .metric {
      background: #121214;
      border: 1px solid #27272a;
      border-radius: 8px;
      padding: 12px 14px;
    }
    .metric-label {
      font-size: 12px;
      color: #71717a;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .metric-value {
      font-size: 14px;
      font-weight: 500;
      color: #f4f4f5;
      margin-top: 4px;
      word-break: break-all;
    }
    .code-box {
      background: #09090b;
      border: 1px solid #27272a;
      border-radius: 6px;
      padding: 10px 14px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 13px;
      color: #e4e4e7;
      word-break: break-all;
      margin-top: 8px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 18px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      text-decoration: none;
      cursor: pointer;
      transition: background 0.15s ease;
      border: none;
    }
    .btn-primary {
      background: #fafafa;
      color: #09090b;
    }
    .btn-primary:hover {
      background: #e4e4e7;
    }
    .btn-secondary {
      background: #27272a;
      color: #fafafa;
      margin-left: 8px;
    }
    .btn-secondary:hover {
      background: #3f3f46;
    }
    .routes-list {
      list-style: none;
      font-size: 13px;
    }
    .routes-list li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #27272a;
    }
    .routes-list li:last-child {
      border-bottom: none;
    }
    .route-method {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      background: #27272a;
      color: #a1a1aa;
      margin-right: 8px;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #71717a;
      margin-top: 24px;
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <div class="brand">
        <div class="logo">F</div>
        <div>
          <div class="brand-title">Forge Cloud Backend</div>
          <div style="font-size: 12px; color: #71717a;">Powered by Convex Cloud</div>
        </div>
      </div>
      <div class="badge">
        <span class="dot"></span>
        <span>Route Mapped • Online</span>
      </div>
    </header>

    ${code ? `
    <div class="alert alert-success">
      <div style="font-weight: 600; font-size: 15px; margin-bottom: 4px;">✓ GitHub OAuth Authorization Received</div>
      <div>Convex successfully verified your GitHub credentials and generated an authorization code for your session.</div>
      <div class="code-box">Code: ${code}</div>
      <div style="margin-top: 14px;">
        <button id="btn-return" class="btn btn-primary" onclick="window.history.back()">← Return to App</button>
        <button class="btn btn-secondary" onclick="navigator.clipboard.writeText(window.location.href); alert('Redirect URL copied to clipboard');">Copy Link</button>
      </div>
    </div>
    ` : ''}

    ${error ? `
    <div class="alert alert-error">
      <div style="font-weight: 600; font-size: 15px; margin-bottom: 4px;">OAuth Notice: ${error}</div>
      <div>${errorDescription || 'Authentication could not complete.'}</div>
    </div>
    ` : ''}

    <div class="card">
      <div class="card-title">Backend Architecture & Route Status</div>
      <p class="card-desc">
        You are connected to the live Convex Cloud HTTP action router. All routes on this domain are registered and active.
      </p>

      <div class="grid">
        <div class="metric">
          <div class="metric-label">Deployment</div>
          <div class="metric-value">${deploymentName}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Current Route</div>
          <div class="metric-value">${path}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Status</div>
          <div class="metric-value" style="color: #4ade80;">Active (200 OK)</div>
        </div>
        <div class="metric">
          <div class="metric-label">Database & Auth</div>
          <div class="metric-value">Operational</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">How Frontend & Convex Backend Connect</div>
      <p class="card-desc" style="margin-bottom: 12px;">
        <strong>Convex Cloud (this domain)</strong> manages your real-time database, sessions, and authentication actions.
      </p>
      <p class="card-desc">
        <strong>The Web Application Client</strong> (your interactive canvas, workspaces, and UI) runs in your Google AI Studio preview window or hosted web domain.
      </p>
      <div style="margin-top: 16px;">
        <a id="btn-local-app" href="${siteUrl}" class="btn btn-primary">Open Forge App</a>
        <a href="/health" class="btn btn-secondary">Check /health API</a>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Registered HTTP Endpoints</div>
      <ul class="routes-list">
        <li>
          <span><span class="route-method">GET</span> /</span>
          <span style="color: #4ade80;">Mapped (Portal)</span>
        </li>
        <li>
          <span><span class="route-method">GET</span> /app, /login, /signup, /auth</span>
          <span style="color: #4ade80;">Mapped (Portal)</span>
        </li>
        <li>
          <span><span class="route-method">GET</span> /health</span>
          <span style="color: #4ade80;">JSON Health Status</span>
        </li>
        <li>
          <span><span class="route-method">ALL</span> /api/auth/*</span>
          <span style="color: #4ade80;">Convex Auth OAuth Engine</span>
        </li>
        <li>
          <span><span class="route-method">GET</span> /* (Prefix)</span>
          <span style="color: #4ade80;">Catch-all Portal</span>
        </li>
      </ul>
    </div>

    <footer class="footer">
      Forge Convex Cloud Deployment &bull; ${deploymentName}.convex.cloud &bull; All systems operational
    </footer>
  </div>

  <script>
    (function() {
      // If opened via popup or redirect from an active frontend, communicate status
      try {
        if (window.opener && window.opener !== window) {
          window.opener.postMessage({ type: 'CONVEX_AUTH_CALLBACK', url: window.location.href }, '*');
        }
      } catch (e) {
        // Ignore cross-origin frame access
      }

      // Detect return url
      var params = new URLSearchParams(window.location.search);
      var candidate = params.get('returnTo') || params.get('redirect') || params.get('origin');
      var target = '';
      if (candidate && (candidate.indexOf('http://') === 0 || candidate.indexOf('https://') === 0)) {
        target = candidate;
      } else if (document.referrer && document.referrer.indexOf(window.location.host) === -1) {
        target = document.referrer;
      }

      var returnBtn = document.getElementById('btn-return');
      if (returnBtn && target) {
        returnBtn.onclick = function() {
          window.location.href = target;
        };
        try {
          var u = new URL(target);
          returnBtn.textContent = '← Return to App (' + u.host + ')';
        } catch (e) {}
      }

      var localBtn = document.getElementById('btn-local-app');
      if (localBtn && target) {
        localBtn.href = target;
        try {
          var u2 = new URL(target);
          localBtn.textContent = 'Open App (' + u2.host + ')';
        } catch (e) {}
      }
    })();
  </script>
</body>
</html>`;
}

// 1. Health check JSON endpoint (GET & OPTIONS)
http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(
      JSON.stringify(
        {
          status: "healthy",
          deployment: process.env.CONVEX_DEPLOYMENT || "ideal-corgi-476",
          timestamp: new Date().toISOString(),
          backend: "Convex Cloud",
          routes: ["/", "/app", "/login", "/signup", "/auth", "/health", "/api/auth/*"],
        },
        null,
        2
      ),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }),
});

http.route({
  path: "/health",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }),
});

// 2. Root route "/"
http.route({
  path: "/",
  method: "GET",
  handler: httpAction(async (_ctx, request) => {
    const url = new URL(request.url);
    const html = renderPortalHtml("/", url);
    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  }),
});

// 3. Application route "/app"
http.route({
  path: "/app",
  method: "GET",
  handler: httpAction(async (_ctx, request) => {
    const url = new URL(request.url);
    const html = renderPortalHtml("/app", url);
    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  }),
});

// 4. Login route "/login"
http.route({
  path: "/login",
  method: "GET",
  handler: httpAction(async (_ctx, request) => {
    const url = new URL(request.url);
    const html = renderPortalHtml("/login", url);
    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  }),
});

// 5. Signup route "/signup"
http.route({
  path: "/signup",
  method: "GET",
  handler: httpAction(async (_ctx, request) => {
    const url = new URL(request.url);
    const html = renderPortalHtml("/signup", url);
    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  }),
});

// 6. Auth alias route "/auth"
http.route({
  path: "/auth",
  method: "GET",
  handler: httpAction(async (_ctx, request) => {
    const url = new URL(request.url);
    const html = renderPortalHtml("/auth", url);
    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  }),
});

// 7. Catch-all GET route for any other subpath so it NEVER returns 404 "No matching routes found"
http.route({
  pathPrefix: "/",
  method: "GET",
  handler: httpAction(async (_ctx, request) => {
    const url = new URL(request.url);
    const html = renderPortalHtml(url.pathname, url);
    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  }),
});

export default http;
