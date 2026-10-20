const fs = require('fs');
const path = require('path');
const { createRequire } = require('module');

function getPlaywright() {
  try {
    return require('playwright');
  } catch {}
  const bunPath = '/root/.bun/install/global/node_modules/playwright';
  if (fs.existsSync(bunPath)) {
    return require(bunPath);
  }
  const npxDir = '/root/.npm/_npx';
  if (fs.existsSync(npxDir)) {
    for (const d of fs.readdirSync(npxDir)) {
      const candidate = path.join(npxDir, d, 'node_modules', 'playwright');
      if (fs.existsSync(candidate)) {
        const req = createRequire(path.join(candidate, 'package.json'));
        return req(candidate);
      }
    }
  }
  throw new Error("Cannot find Playwright");
}

const { chromium } = getPlaywright();
const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

const VIEWPORTS = [
  { width: 360, height: 640 },
  { width: 280, height: 653 },
  { width: 390, height: 844 },
];

async function runAudit() {
  const browser = await chromium.launch({ headless: true });
  console.log('=== STARTING TEXT CLIPPING AUDIT (Bug 7) ===\n');

  let totalViolations = 0;

  for (const vp of VIEWPORTS) {
    console.log(`\n========================================`);
    console.log(`TESTING VIEWPORT: ${vp.width}x${vp.height}`);
    console.log(`========================================`);

    // 1. LANDING PAGE
    {
      const page = await browser.newPage();
      await page.setViewportSize(vp);
      await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);

      const landingResults = await page.evaluate(() => {
        const sections = ['#features', '#capabilities', '#decisions', '#security', '#faq'];
        const issues = [];

        sections.forEach((secId) => {
          const sec = document.querySelector(secId);
          if (!sec) return;

          const elements = sec.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, button, a, div');
          elements.forEach((el) => {
            // Must have visible text
            const text = el.innerText ? el.innerText.trim() : '';
            if (!text || text.length === 0) return;

            // Direct text or leaf element
            const hasDirectText = Array.from(el.childNodes).some(
              (n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim().length > 0
            );
            const isTextTag = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'SPAN', 'A', 'BUTTON'].includes(el.tagName);
            if (!hasDirectText && !isTextTag) return;

            const style = window.getComputedStyle(el);
            const isOverflowHidden =
              style.overflow === 'hidden' || style.overflow === 'clip' ||
              style.overflowX === 'hidden' || style.overflowX === 'clip';

            if (!isOverflowHidden) return;

            // Check if text is clipped horizontally or vertically
            const scrollWidth = el.scrollWidth;
            const clientWidth = el.clientWidth;
            const scrollHeight = el.scrollHeight;
            const clientHeight = el.clientHeight;

            // Exclude intentional truncation classes
            const className = el.className || '';
            const isIntentionalTruncate =
              typeof className === 'string' &&
              (className.includes('truncate') ||
               className.includes('line-clamp') ||
               className.includes('sr-only') ||
               className.includes('invisible') ||
               style.textOverflow === 'ellipsis');

            // If scrollWidth > clientWidth + 1 and not intentional truncation
            if (scrollWidth > clientWidth + 1 && !isIntentionalTruncate) {
              issues.push({
                section: secId,
                tag: el.tagName.toLowerCase(),
                className: typeof className === 'string' ? className.slice(0, 50) : '',
                scrollWidth,
                clientWidth,
                text: text.slice(0, 80).replace(/\s+/g, ' '),
                reason: 'scrollWidth > clientWidth in overflow:hidden',
              });
            }
          });
        });

        return issues;
      });

      console.log(`Landing (${vp.width}x${vp.height}): found ${landingResults.length} unhandled clipped text items.`);
      if (landingResults.length > 0) {
        landingResults.forEach((item) => {
          console.log(`  [LANDING ${item.section}] <${item.tag} class="${item.className}">: sw=${item.scrollWidth} cw=${item.clientWidth} text="${item.text}"`);
        });
        totalViolations += landingResults.length;
      }
      await page.close();
    }

    // 2. /app DEMO MODE (overview, project board, project list, issues, settings)
    const APP_ROUTES = [
      '/app',
      '/app/workspaces/demo_ws_northstar',
      '/app/workspaces/demo_ws_northstar/projects',
      '/app/projects/demo_proj_mobile_app',
      '/app/projects/demo_proj_mobile_app/settings/workflows',
    ];

    for (const route of APP_ROUTES) {
      const page = await browser.newPage();
      await page.setViewportSize(vp);
      await page.addInitScript(() => {
        try {
          window.sessionStorage.setItem('forge_demo_mode', 'true');
          window.sessionStorage.removeItem('forge_signed_out');
        } catch (e) {}
      });

      await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1200);

      const routeResults = await page.evaluate((currentRoute) => {
        const issues = [];
        const main = document.querySelector('main') || document.body;
        const elements = main.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, button, a, div');

        elements.forEach((el) => {
          const text = el.innerText ? el.innerText.trim() : '';
          if (!text || text.length === 0) return;

          const hasDirectText = Array.from(el.childNodes).some(
            (n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim().length > 0
          );
          const isTextTag = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'SPAN', 'A', 'BUTTON'].includes(el.tagName);
          if (!hasDirectText && !isTextTag) return;

          const style = window.getComputedStyle(el);
          const isOverflowHidden =
            style.overflow === 'hidden' || style.overflow === 'clip' ||
            style.overflowX === 'hidden' || style.overflowX === 'clip';

          if (!isOverflowHidden) return;

          const scrollWidth = el.scrollWidth;
          const clientWidth = el.clientWidth;

          const className = el.className || '';
          const isIntentionalTruncate =
            typeof className === 'string' &&
            (className.includes('truncate') ||
             className.includes('line-clamp') ||
             className.includes('sr-only') ||
             className.includes('invisible') ||
             style.textOverflow === 'ellipsis');

          if (scrollWidth > clientWidth + 1 && !isIntentionalTruncate) {
            issues.push({
              route: currentRoute,
              tag: el.tagName.toLowerCase(),
              className: typeof className === 'string' ? className.slice(0, 50) : '',
              scrollWidth,
              clientWidth,
              text: text.slice(0, 80).replace(/\s+/g, ' '),
              reason: 'scrollWidth > clientWidth in overflow:hidden',
            });
          }
        });

        return issues;
      }, route);

      console.log(`Route ${route} (${vp.width}x${vp.height}): found ${routeResults.length} unhandled clipped text items.`);
      if (routeResults.length > 0) {
        routeResults.forEach((item) => {
          console.log(`  [APP ${item.route}] <${item.tag} class="${item.className}">: sw=${item.scrollWidth} cw=${item.clientWidth} text="${item.text}"`);
        });
        totalViolations += routeResults.length;
      }
      await page.close();
    }
  }

  await browser.close();
  console.log(`\n=== TEXT CLIPPING AUDIT COMPLETE: total unhandled violations = ${totalViolations} ===`);
  if (totalViolations > 0) {
    process.exit(1);
  } else {
    console.log('PASS: No unhandled text clipping detected across any viewport.');
    process.exit(0);
  }
}

runAudit().catch((err) => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
