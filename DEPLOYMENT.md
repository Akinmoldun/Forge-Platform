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
| Variable | Description |
|---|---|
| `VITE_CONVEX_URL` | Convex cloud URL (e.g. `https://<deployment>.convex.cloud`) |
| `SITE_URL` | Canonical production URL (e.g. `https://your-domain.vercel.app`) |

### Convex Deployment Secrets (Convex Dashboard)
| Variable | Description |
|---|---|
| `CONVEX_DEPLOY_KEY` | Deployment key from Convex Production Dashboard (set in Vercel CI) |
| `AUTH_GITHUB_ID` | GitHub OAuth application Client ID |
| `AUTH_GITHUB_SECRET` | GitHub OAuth application Client Secret |
| `EMAIL_PROVIDER` | `resend` or `brevo` for transactional OTP delivery |
| `RESEND_API_KEY` | API key for Resend |
| `EMAIL_FROM` | Verified sender address (e.g. `login@yourdomain.com`) |

---

## 3. Demo Mode Resilience

If `VITE_CONVEX_URL` is omitted or Convex is unavailable:
- Forge runs in zero-backend **Demo Mode** instantly without errors.
- Visitors can explore 2 multi-tenant workspaces, 6 projects, 100+ issues, activity logs, workflows, and analytics with 100% frontend reactivity.
- Sign in / Sign up displays a clean preview banner with one-click access to the demo workspace.
