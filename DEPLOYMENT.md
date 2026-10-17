# Deployment Guide: Forge Platform

This guide outlines the production deployment workflow for Forge to Vercel and Convex Cloud.

---

## 1. Vercel Configuration

- **Framework Preset**: Vite
- **Build Command**: `npx convex deploy --cmd 'npm run build'` (or `npm run build` if Convex is deployed independently)
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Routing**: Handled by `/vercel.json` SPA rewrite:
  ```json
  {
    "rewrites": [
      {
        "source": "/(.*)",
        "destination": "/index.html"
      }
    ]
  }
  ```

---

## 2. Environment Variables

### Client Environment Variables (Vercel)
Note: Vercel only needs `VITE_CONVEX_URL`. Only `VITE_`-prefixed variables are exposed to the client bundle.

| Variable | Description |
|---|---|
| `VITE_CONVEX_URL` | Convex cloud URL (e.g. `https://<deployment>.convex.cloud`) |

### Convex Deployment Secrets (Convex Dashboard)
| Variable | Description |
|---|---|
| `SITE_URL` | Canonical Vercel production URL (e.g. `https://your-domain.vercel.app`). Used server-side by Convex Auth for OIDC and email verification redirects. |
| `CONVEX_DEPLOY_KEY` | Deployment key from Convex Production Dashboard (set in Vercel CI) |
| `AUTH_GITHUB_ID` | GitHub OAuth application Client ID |
| `AUTH_GITHUB_SECRET` | GitHub OAuth application Client Secret |
| `AUTH_GOOGLE_ID` | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret |
| `EMAIL_PROVIDER` | `resend` or `brevo` for transactional OTP delivery |
| `RESEND_API_KEY` | API key for Resend |
| `EMAIL_FROM` | Verified sender address (e.g. `login@yourdomain.com`) |

### GitHub OAuth Setup
In your GitHub Developer Settings (OAuth App), configure:
- **Homepage URL**: Your Vercel production `SITE_URL` (e.g. `https://your-domain.vercel.app`)
- **Authorization callback URL**: `https://<your-convex-deployment>.convex.site/api/auth/callback/github`
  *(Note: Must use `.convex.site`, not `.convex.cloud`)*

### Google OAuth Setup
In Google Cloud Console:
1. Create a project in Google Cloud Console.
2. Configure the OAuth consent screen (User type: External, scopes: `openid`, `email`, `profile`).
3. Create credentials: OAuth client ID of application type "Web application".
4. Set **Authorized JavaScript origins** to your production site URL (e.g. `https://your-domain.vercel.app`).
5. Set **Authorized redirect URIs** to `https://<your-convex-deployment>.convex.site/api/auth/callback/google` *(Note: Must use `.convex.site`, not `.convex.cloud`)*.
6. Copy the Client ID and Client Secret into Convex environment variables as `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`.

---

## 3. Demo Mode Resilience

If `VITE_CONVEX_URL` is omitted or Convex is unavailable:
- Forge runs in zero-backend **Demo Mode** instantly without errors.
- Visitors can explore 2 multi-tenant workspaces, 6 projects, 100+ issues, activity logs, workflows, and analytics with 100% frontend reactivity.
- Sign in / Sign up displays a clean preview banner with one-click access to the demo workspace.
