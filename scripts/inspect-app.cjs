const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
const screensDir = path.join(__dirname, '..', 'test-screens');
if (!fs.existsSync(screensDir)) {
  fs.mkdirSync(screensDir, { recursive: true });
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('--- ENTERING DEMO MODE ---');
  await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  // Click Try demo
  const tryDemo = await page.$('text=Try demo');
  if (tryDemo) {
    await tryDemo.click();
    await page.waitForTimeout(1000);
  }

  const appUrl = page.url();
  console.log('App URL after entering demo mode:', appUrl);

  // If on /app workspaces picker, click the first workspace
  if (appUrl.endsWith('/app')) {
    const wsCard = await page.$('a[href^="/app/workspaces/"]');
    if (wsCard) {
      await wsCard.click();
      await page.waitForTimeout(1000);
    }
  }

  const wsUrl = page.url();
  console.log('Workspace URL:', wsUrl);

  // Extract workspace ID
  const wsMatch = wsUrl.match(/\/app\/workspaces\/([^\/?#]+)/);
  const workspaceId = wsMatch ? wsMatch[1] : 'demo-ws-northstar';
  console.log('Resolved Workspace ID:', workspaceId);

  // Find a project and issue link to get real IDs
  const projLink = await page.$('a[href*="/app/projects/"]');
  let projectId = 'demo-proj-mob';
  if (projLink) {
    const href = await projLink.getAttribute('href');
    const pMatch = href && href.match(/\/app\/projects\/([^\/?#]+)/);
    if (pMatch) projectId = pMatch[1];
  }
  console.log('Resolved Project ID:', projectId);

  // Navigate to project to find issue ID
  await page.goto(`${baseUrl}/app/projects/${projectId}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  const issueLink = await page.$('a[href*="/app/issues/"]');
  let issueId = 'demo-issue-mob-1';
  if (issueLink) {
    const href = await issueLink.getAttribute('href');
    const iMatch = href && href.match(/\/app\/issues\/([^\/?#]+)/);
    if (iMatch) issueId = iMatch[1];
  }
  console.log('Resolved Issue ID:', issueId);

  console.log('\n--- TESTING D1 APP SHELL AT 360x640 ---');
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto(`${baseUrl}/app/workspaces/${workspaceId}/overview`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);

  // 1. Measure hamburger button
  const hamburger = await page.$('header button[aria-label="Open navigation menu"]');
  if (!hamburger) {
    throw new Error('Hamburger button not found in header at 360x640!');
  }
  const hBox = await hamburger.boundingBox();
  console.log(`Hamburger size at 360x640: ${hBox.width.toFixed(1)}px x ${hBox.height.toFixed(1)}px (needs >= 44x44)`);

  // 2. Open drawer
  await hamburger.click();
  await page.waitForTimeout(500);

  // Check body scroll lock
  const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
  console.log('Body overflow with drawer open:', bodyOverflow, '(expected: hidden)');

  // Measure drawer links
  const drawerLinks = await page.$$eval('.fixed.inset-0.z-50 aside nav a, .fixed.inset-0.z-50 aside button, .fixed.inset-0.z-50 aside a', (links) => {
    return links.slice(0, 10).map((el) => {
      const rect = el.getBoundingClientRect();
      const text = (el.innerText || el.getAttribute('aria-label') || '').trim().replace(/\n/g, ' ');
      return { text: text.slice(0, 20), w: Math.round(rect.width), h: Math.round(rect.height) };
    });
  });
  console.log('Drawer sample link dimensions (width x height):', drawerLinks);

  // Screenshot open drawer
  const drawerScreenPath = path.join(screensDir, 'shell-360-drawer-open.png');
  await page.screenshot({ path: drawerScreenPath });
  console.log('Screenshot saved:', drawerScreenPath);

  // 3. Test Escape closes drawer
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  let drawerExists = await page.$('.fixed.inset-0.z-50');
  console.log('Drawer in DOM after Escape:', !!drawerExists, '(expected: false)');

  // 4. Test overlay tap closes drawer
  await hamburger.click();
  await page.waitForTimeout(300);
  // Click outside drawer on overlay (e.g. at x: 340, y: 300)
  await page.mouse.click(340, 300);
  await page.waitForTimeout(300);
  drawerExists = await page.$('.fixed.inset-0.z-50');
  console.log('Drawer in DOM after overlay click:', !!drawerExists, '(expected: false)');

  // 5. Test link navigation closes drawer
  await hamburger.click();
  await page.waitForTimeout(300);
  const projectsNavLink = await page.$('.fixed.inset-0.z-50 aside a[href*="/projects"]');
  if (projectsNavLink) {
    await projectsNavLink.click();
    await page.waitForTimeout(800);
  }
  drawerExists = await page.$('.fixed.inset-0.z-50');
  console.log('Drawer in DOM after link navigation:', !!drawerExists, '(expected: false)');
  console.log('Current URL after navigation:', page.url());

  // Check header & breadcrumbs on 280px and 360px
  console.log('\n--- TESTING HEADER & BREADCRUMBS OVERFLOW AT 280, 360, 768, 1024, 1440 ---');
  const viewports = [
    { w: 280, h: 653, name: '280x653' },
    { w: 360, h: 640, name: '360x640' },
    { w: 768, h: 1024, name: '768x1024' },
    { w: 1024, h: 768, name: '1024x768' },
    { w: 1440, h: 900, name: '1440x900' },
  ];

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.w, height: vp.h });
    await page.goto(`${baseUrl}/app/workspaces/${workspaceId}/overview`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    const metrics = await page.evaluate(() => {
      const docW = document.documentElement.clientWidth;
      const scrollW = document.documentElement.scrollWidth;
      const header = document.querySelector('header');
      const headerScrollW = header ? header.scrollWidth : 0;
      const headerClientW = header ? header.clientWidth : 0;
      return { docW, scrollW, headerScrollW, headerClientW };
    });

    const pass = metrics.scrollW <= metrics.docW + 1 && metrics.headerScrollW <= metrics.headerClientW + 1;
    console.log(`Viewport ${vp.name}: clientW=${metrics.docW}, scrollW=${metrics.scrollW}, headerClientW=${metrics.headerClientW}, headerScrollW=${metrics.headerScrollW} -> ${pass ? 'PASS' : 'FAIL'}`);

    if (vp.w === 360) {
      await page.screenshot({ path: path.join(screensDir, 'shell-360-overview.png') });
    } else if (vp.w === 1440) {
      await page.screenshot({ path: path.join(screensDir, 'shell-1440-overview.png') });
    }
  }

  await browser.close();
  console.log('\nApp Shell inspection complete.');
  console.log(JSON.stringify({ workspaceId, projectId, issueId }, null, 2));
}

run().catch((err) => {
  console.error('App Shell inspection error:', err);
  process.exit(1);
});
