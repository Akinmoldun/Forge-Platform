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
const screenDir = path.join(__dirname, '..', 'test-screens');
if (!fs.existsSync(screenDir)) {
  fs.mkdirSync(screenDir, { recursive: true });
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  console.log('=== STARTING PART 6A VERIFICATION ===\n');

  // ----------------------------------------------------
  // BUG 1: Mobile drawer collapsed state fix
  // ----------------------------------------------------
  console.log('--- TEST BUG 1: Mobile drawer expanded when localStorage collapsed = true ---');
  {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 360, height: 640 });
    await page.addInitScript(() => {
      try {
        window.localStorage.setItem('forge_sidebar_collapsed', 'true');
        window.sessionStorage.setItem('forge_demo_mode', 'true');
        window.sessionStorage.removeItem('forge_signed_out');
      } catch (e) {}
    });

    await page.goto(`${baseUrl}/app/workspaces/demo_ws_northstar`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Open drawer
    const hamburger = page.locator('button[aria-label="Open navigation menu"]');
    await hamburger.click();
    await page.waitForTimeout(500);

    // Inspect drawer content
    const drawerInfo = await page.evaluate(() => {
      const drawer = document.querySelector('.fixed.z-50');
      if (!drawer) return { found: false };
      const workspaceName = drawer.querySelector('button[aria-label="Switch workspace"] span')?.textContent || '';
      const hasSearch = drawer.textContent.includes('Search');
      const hasInbox = drawer.textContent.includes('Inbox');
      const hasProjects = drawer.textContent.includes('Projects');
      const hasOverview = drawer.textContent.includes('Overview');
      const collapseToggle = drawer.querySelector('button[aria-label*="Collapse sidebar"]');
      const expandToggle = drawer.querySelector('button[aria-label*="Expand sidebar"]');

      return {
        found: true,
        workspaceName,
        hasSearch,
        hasInbox,
        hasProjects,
        hasOverview,
        hasCollapseToggle: Boolean(collapseToggle),
        hasExpandToggle: Boolean(expandToggle),
      };
    });

    console.log('Bug 1 measurements:', drawerInfo);
    await page.screenshot({ path: path.join(screenDir, 'bug1-drawer-expanded-360x640.png') });
    await page.close();
  }

  // ----------------------------------------------------
  // BUG 2: Nav middle list touch scroll
  // ----------------------------------------------------
  console.log('\n--- TEST BUG 2: Nav list touch scroll (360x640 and 360x560) ---');
  for (const height of [640, 560]) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 360, height });
    await page.addInitScript(() => {
      try {
        window.sessionStorage.setItem('forge_demo_mode', 'true');
        window.sessionStorage.removeItem('forge_signed_out');
      } catch (e) {}
    });

    await page.goto(`${baseUrl}/app/workspaces/demo_ws_northstar`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Open drawer
    await page.locator('button[aria-label="Open navigation menu"]').click();
    await page.waitForTimeout(500);

    const scrollStats = await page.evaluate(() => {
      // Find the scrollable container inside drawer
      const drawer = document.querySelector('.fixed.z-50');
      const scroller = drawer ? drawer.querySelector('.overflow-y-auto') : null;
      if (!scroller) return null;
      return {
        scrollHeight: scroller.scrollHeight,
        clientHeight: scroller.clientHeight,
        initialScrollTop: scroller.scrollTop,
      };
    });

    // Simulate mouse wheel or touch scroll
    const drawerScroller = page.locator('.fixed.z-50 .overflow-y-auto');
    await drawerScroller.hover();
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(400);

    const afterScrollTop = await page.evaluate(() => {
      const drawer = document.querySelector('.fixed.z-50');
      const scroller = drawer ? drawer.querySelector('.overflow-y-auto') : null;
      return scroller ? scroller.scrollTop : -1;
    });

    console.log(`Bug 2 measurements at 360x${height}:`, {
      ...scrollStats,
      afterScrollTop,
      canScroll: scrollStats ? scrollStats.scrollHeight > scrollStats.clientHeight : false,
      scrollWorked: afterScrollTop > 0,
    });
    await page.close();
  }

  // ----------------------------------------------------
  // BUG 3: Scroll up locked after scrolling down
  // ----------------------------------------------------
  console.log('\n--- TEST BUG 3: Scroll down and up on page, verify body overflow ---');
  {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 360, height: 640 });
    await page.addInitScript(() => {
      try {
        window.sessionStorage.setItem('forge_demo_mode', 'true');
        window.sessionStorage.removeItem('forge_signed_out');
      } catch (e) {}
    });

    await page.goto(`${baseUrl}/app/workspaces/demo_ws_northstar`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Open drawer
    await page.locator('button[aria-label="Open navigation menu"]').click();
    await page.waitForTimeout(500);

    // Tap a project link in drawer
    const projectLink = page.locator('.fixed.z-50 .cursor-pointer:has-text("Mobile"), .fixed.z-50 a[href*="/projects"]').first();
    await projectLink.click();
    await page.waitForTimeout(1000);

    // Check body overflow after drawer closed
    const bodyOverflow = await page.evaluate(() => getComputedStyle(document.body).overflow);

    // Scroll main down by 800px
    const scrollDownStats = await page.evaluate(() => {
      const main = document.querySelector('main');
      if (!main) return null;
      main.scrollTop = 800;
      return {
        scrollTopDown: main.scrollTop,
        scrollHeight: main.scrollHeight,
        clientHeight: main.clientHeight,
      };
    });

    await page.waitForTimeout(300);

    // Scroll main back up to 0
    const scrollUpStats = await page.evaluate(() => {
      const main = document.querySelector('main');
      if (!main) return null;
      main.scrollTop = 0;
      return {
        scrollTopUp: main.scrollTop,
      };
    });

    console.log('Bug 3 measurements:', {
      bodyOverflow,
      scrollDownStats,
      scrollUpStats,
      bodyOverflowRestored: bodyOverflow !== 'hidden',
      scrollUpReturnedToZero: scrollUpStats && scrollUpStats.scrollTopUp === 0,
    });
    await page.close();
  }

  // ----------------------------------------------------
  // BUG 4: Guest demo menu and Sign out tap
  // ----------------------------------------------------
  console.log('\n--- TEST BUG 4: Guest demo "..." menu and Sign out tap ---');
  {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 360, height: 640 });
    await page.addInitScript(() => {
      try {
        window.sessionStorage.setItem('forge_demo_mode', 'true');
        window.sessionStorage.removeItem('forge_signed_out');
      } catch (e) {}
    });

    await page.goto(`${baseUrl}/app/workspaces/demo_ws_northstar`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // 1. Tap banner "..." button
    const bannerMoreBtn = page.locator('button[aria-label="Demo options"]');
    await bannerMoreBtn.click();
    await page.waitForTimeout(500);

    const bannerMenuOpen = await page.evaluate(() => {
      const menu = document.querySelector('[role="menu"]');
      return Boolean(menu && menu.textContent.includes('Reset demo'));
    });
    console.log('Guest banner "..." menu opened:', bannerMenuOpen);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // 2. Open drawer and tap account menu
    await page.locator('button[aria-label="Open navigation menu"]').click();
    await page.waitForTimeout(500);

    const accountBtn = page.locator('.fixed.z-50 button[aria-label="Account menu"]');
    await accountBtn.click();
    await page.waitForTimeout(500);

    const accountMenuInfo = await page.evaluate(() => {
      const menu = document.querySelector('[role="menu"]');
      if (!menu) return { open: false };
      const hasSignOut = menu.textContent.includes('Sign out');
      const hasCreateAccount = menu.textContent.includes('Create an account');
      const zIndex = window.getComputedStyle(menu).zIndex;
      return { open: true, hasSignOut, hasCreateAccount, zIndex };
    });
    console.log('Account menu in drawer:', accountMenuInfo);
    await page.screenshot({ path: path.join(screenDir, 'bug4-guest-menu-open.png') });

    // 3. Click Sign out
    const signOutItem = page.locator('[role="menuitem"]:has-text("Sign out")');
    await signOutItem.click();
    await page.waitForTimeout(1000);

    const afterSignOutUrl = page.url();
    const demoModeAfter = await page.evaluate(() => window.sessionStorage.getItem('forge_demo_mode'));

    console.log('After Sign out:', {
      url: afterSignOutUrl,
      demoModeFlag: demoModeAfter,
      leftDemoMode: demoModeAfter !== 'true',
      isLanding: afterSignOutUrl.endsWith('/') || afterSignOutUrl.includes('localhost:3000/#') || afterSignOutUrl === `${baseUrl}/`,
    });
    await page.close();
  }

  // ----------------------------------------------------
  // BUG 5: Code terminal text clipping in #decisions
  // ----------------------------------------------------
  console.log('\n--- TEST BUG 5: Code terminal in #decisions at 280, 360, 390 ---');
  for (const width of [280, 360, 390]) {
    const page = await browser.newPage();
    await page.setViewportSize({ width, height: 640 });
    await page.goto(`${baseUrl}/#decisions`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);

    const sec = page.locator('#decisions');
    await sec.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const measurements = await page.evaluate((vw) => {
      const section = document.querySelector('#decisions');
      if (!section) return { error: 'No #decisions section' };
      const pres = Array.from(section.querySelectorAll('pre'));
      const panels = Array.from(section.querySelectorAll('.font-mono'));

      const preStats = pres.map((p, idx) => ({
        idx,
        scrollWidth: p.scrollWidth,
        clientWidth: p.clientWidth,
        clipped: p.scrollWidth > p.clientWidth + 1,
      }));

      const panelStats = panels.map((p) => {
        const rect = p.getBoundingClientRect();
        return {
          right: rect.right,
          vw,
          insideViewport: rect.right <= vw + 1,
        };
      });

      return { preStats, panelStats };
    }, width);

    console.log(`Bug 5 at width ${width}:`, measurements);
    if (width === 360) {
      const card = page.locator('#decisions .stack-card').first();
      await card.screenshot({ path: path.join(screenDir, 'bug5-terminal-360x640.png') });
    } else if (width === 280) {
      const card = page.locator('#decisions .stack-card').first();
      await card.screenshot({ path: path.join(screenDir, 'bug5-terminal-280x653.png') });
    }
    await page.close();
  }

  // ----------------------------------------------------
  // BUG 6: Roles and access capability names
  // ----------------------------------------------------
  console.log('\n--- TEST BUG 6: Roles comparison table capability cells at 280, 360, 390 ---');
  for (const width of [280, 360, 390]) {
    const page = await browser.newPage();
    await page.setViewportSize({ width, height: 640 });
    await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' });
    const sec = page.locator('#security');
    await sec.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);

    const cellsInfo = await page.evaluate(() => {
      const section = document.querySelector('#security');
      if (!section) return { error: 'No #security section' };
      const rows = Array.from(section.querySelectorAll('.roles-body-row'));
      return rows.map((r) => {
        const firstCell = r.querySelector('[role="cell"]');
        if (!firstCell) return null;
        return {
          text: firstCell.textContent.trim(),
          scrollWidth: firstCell.scrollWidth,
          clientWidth: firstCell.clientWidth,
          scrollHeight: firstCell.scrollHeight,
          clientHeight: firstCell.clientHeight,
          wClipped: firstCell.scrollWidth > firstCell.clientWidth + 1,
          hClipped: firstCell.scrollHeight > firstCell.clientHeight + 1,
        };
      }).filter(Boolean);
    });

    const anyClipped = cellsInfo.some((c) => c.wClipped || c.hClipped);
    console.log(`Bug 6 at width ${width} (total cells: ${cellsInfo.length}, any clipped: ${anyClipped}):`);
    cellsInfo.forEach((c) => {
      console.log(`  "${c.text.slice(0, 25)}...": sw=${c.scrollWidth} cw=${c.clientWidth} sh=${c.scrollHeight} ch=${c.clientHeight} [clipped: ${c.wClipped || c.hClipped}]`);
    });

    if (width === 360) {
      const table = page.locator('#security [role="table"]').first();
      await table.screenshot({ path: path.join(screenDir, 'bug6-roles-360x640.png') });
    }
    await page.close();
  }

  // ----------------------------------------------------
  // BUG 7: Landing text clipping audit
  // ----------------------------------------------------
  console.log('\n--- TEST BUG 7: Landing text clipping audit across #features, #capabilities, #decisions, #security, #faq ---');
  for (const width of [280, 360, 390]) {
    const page = await browser.newPage();
    await page.setViewportSize({ width, height: 640 });
    await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    const clippedElements = await page.evaluate(() => {
      const sections = ['#features', '#capabilities', '#decisions', '#security', '#faq'];
      const results = [];

      sections.forEach((secId) => {
        const sec = document.querySelector(secId);
        if (!sec) return;
        const allElements = sec.querySelectorAll('*');
        allElements.forEach((el) => {
          // Check if computed overflow is hidden or clip
          const style = window.getComputedStyle(el);
          const hasOverflowHidden = style.overflow === 'hidden' || style.overflow === 'clip' ||
                                    style.overflowX === 'hidden' || style.overflowX === 'clip' ||
                                    style.overflowY === 'hidden' || style.overflowY === 'clip';

          // Must contain direct text
          const hasDirectText = Array.from(el.childNodes).some((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim().length > 0);
          if (hasOverflowHidden && (hasDirectText || ['P', 'SPAN', 'H1', 'H2', 'H3', 'H4', 'PRE', 'CODE'].includes(el.tagName))) {
            const wClip = el.scrollWidth > el.clientWidth + 1;
            const hClip = el.scrollHeight > el.clientHeight + 1;
            if (wClip || hClip) {
              const textSnippet = el.textContent.trim().replace(/\s+/g, ' ').slice(0, 60);
              // Filter out purely decorative artwork or progress bars with no text
              if (textSnippet.length > 0) {
                results.push({
                  section: secId,
                  tag: el.tagName.toLowerCase(),
                  className: (el.className || '').slice(0, 40),
                  scrollWidth: el.scrollWidth,
                  clientWidth: el.clientWidth,
                  scrollHeight: el.scrollHeight,
                  clientHeight: el.clientHeight,
                  text: textSnippet,
                });
              }
            }
          }
        });
      });
      return results;
    });

    console.log(`Bug 7 at width ${width}: found ${clippedElements.length} clipped elements with text:`);
    clippedElements.forEach((el) => {
      console.log(`  [${el.section}] <${el.tag} class="${el.className}">: sw=${el.scrollWidth} cw=${el.clientWidth} sh=${el.scrollHeight} ch=${el.clientHeight} text="${el.text}"`);
    });
    await page.close();
  }

  await browser.close();
  console.log('\n=== PART 6A VERIFICATION COMPLETE ===');
}

run().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
