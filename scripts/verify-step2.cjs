const fs = require('fs');
const path = require('path');
const { createRequire } = require('module');

function getPlaywright() {
  try { return require('playwright'); } catch {}
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
  throw new Error("Playwright not found in _npx cache");
}

const { chromium } = getPlaywright();
const screensDir = '/app/applet/test-screens';
if (!fs.existsSync(screensDir)) {
  fs.mkdirSync(screensDir, { recursive: true });
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  try {
    // 1. TEST NAV MENU INTERACTION AT 360x640 and 667x375
    console.log('=== TEST 1: NAV MENU INTERACTION ===');
    {
      const page = await browser.newPage();
      try {
        await page.setViewportSize({ width: 360, height: 640 });
        await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
        const navButton = await page.waitForSelector('button[aria-label="Toggle navigation"]', { timeout: 10000 });
        const btnBox = await navButton.boundingBox();
        console.log(`Nav toggle button box: ${btnBox.width}x${btnBox.height} (target >= 44x44)`);

        // Click to open menu
        await navButton.click();
        await page.waitForTimeout(400);

        // Check drawer visibility and links
        const menuLinks = await page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a[href^="#"], a[target="_blank"]'));
          const visible = links.filter(l => {
            const r = l.getBoundingClientRect();
            return r.height >= 40;
          });
          return visible.map(l => ({ text: l.textContent.trim(), h: Math.round(l.getBoundingClientRect().height) }));
        });
        console.log(`Open menu link count: ${menuLinks.length}, heights:`, menuLinks.map(l => `${l.text}:${l.h}px`).join(', '));

        await page.screenshot({ path: `${screensDir}/nav-menu-open-360x640.png` });
        console.log(`Saved ${screensDir}/nav-menu-open-360x640.png`);

        // Test closing on Escape
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
        const isOpenAfterEscape = await page.evaluate(() => {
          const btn = document.querySelector('button[aria-label="Toggle navigation"]');
          return btn ? btn.getAttribute('aria-expanded') === 'true' : false;
        });
        console.log(`Menu closed on Escape: ${!isOpenAfterEscape}`);
      } finally {
        await page.close();
      }
    }

    // Nav in landscape (667x375)
    {
      const page = await browser.newPage();
      try {
        await page.setViewportSize({ width: 667, height: 375 });
        await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
        const navButton = await page.waitForSelector('button[aria-label="Toggle navigation"]', { timeout: 10000 });
        if (navButton) {
          await navButton.click();
          await page.waitForTimeout(400);
          await page.screenshot({ path: `${screensDir}/nav-menu-landscape-667x375.png` });
          console.log(`Saved ${screensDir}/nav-menu-landscape-667x375.png`);
        }
      } finally {
        await page.close();
      }
    }

    // 2. TEST NUMBERS SECTION AT 280, 360, 768, 1440
    console.log('\n=== TEST 2: NUMBERS SECTION ===');
    for (const [w, h] of [[280, 653], [360, 640], [768, 1024], [1440, 900]]) {
      const page = await browser.newPage();
      try {
        await page.setViewportSize({ width: w, height: h });
        await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
        await page.evaluate(() => {
          const el = Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('guarantees'));
          el?.scrollIntoView({ block: 'center', behavior: 'instant' });
        });
        await page.waitForTimeout(1000);

        const cardLayout = await page.evaluate(() => {
          const cards = Array.from(document.querySelectorAll('.number-card'));
          return cards.map(c => {
            const r = c.getBoundingClientRect();
            return { w: Math.round(r.width), h: Math.round(r.height), left: Math.round(r.left), top: Math.round(r.top) };
          });
        });
        console.log(`Numbers at ${w}x${h}: ${cardLayout.length} cards, widths: ${cardLayout.map(c => c.w + 'px').join(', ')}, top positions: ${cardLayout.map(c => c.top + 'px').join(', ')}`);
        if (w === 360) {
          const sec = await page.$('.number-card');
          if (sec) {
            const parentSection = await page.evaluateHandle(el => el.closest('section'), sec);
            const parentEl = parentSection.asElement();
            if (parentEl) {
              await parentEl.screenshot({ path: `${screensDir}/numbers-section-360x640.png` });
              console.log(`Saved ${screensDir}/numbers-section-360x640.png`);
            }
          }
        }
      } finally {
        await page.close();
      }
    }

    // 3. TEST HEATMAP SECTION AT 360x640 (Tap tooltip, scroller)
    console.log('\n=== TEST 3: ACTIVITY HEATMAP ===');
    {
      const page = await browser.newPage();
      try {
        await page.setViewportSize({ width: 360, height: 640 });
        await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
        await page.evaluate(() => {
          document.getElementById('activity')?.scrollIntoView({ block: 'center', behavior: 'instant' });
        });
        await page.waitForTimeout(800);

        const activitySec = await page.$('#activity');
        if (activitySec) {
          await activitySec.screenshot({ path: `${screensDir}/heatmap-360x640.png` });
          console.log(`Saved ${screensDir}/heatmap-360x640.png`);
        }
      } finally {
        await page.close();
      }
    }

    // 4. TEST WORKFLOWS SECTION AT 360 and 768
    console.log('\n=== TEST 4: WORKFLOWS SECTION ===');
    for (const [w, h] of [[360, 640], [768, 1024], [1440, 900]]) {
      const page = await browser.newPage();
      try {
        await page.setViewportSize({ width: w, height: h });
        await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
        await page.evaluate(() => {
          document.getElementById('how-it-works')?.scrollIntoView({ block: 'center', behavior: 'instant' });
        });
        await page.waitForTimeout(1000);

        const gridData = await page.evaluate(() => {
          const cards = Array.from(document.querySelectorAll('.reliability-card'));
          return cards.map(c => {
            const r = c.getBoundingClientRect();
            return { w: Math.round(r.width), h: Math.round(r.height), left: Math.round(r.left), top: Math.round(r.top) };
          });
        });
        console.log(`Workflows at ${w}x${h}: ${gridData.length} cards, col widths: ${gridData[0]?.w}px, unique columns: ${new Set(gridData.map(c => c.left)).size}`);
        if (w === 360) {
          const wfEl = await page.$('#how-it-works');
          if (wfEl) {
            await wfEl.screenshot({ path: `${screensDir}/workflows-360x640.png` });
            console.log(`Saved ${screensDir}/workflows-360x640.png`);
          }
        }
      } finally {
        await page.close();
      }
    }

    // 5. TEST ROLES SECTION AT 360 and 768
    console.log('\n=== TEST 5: ROLES TABLE SECTION ===');
    for (const [w, h] of [[360, 640], [768, 1024]]) {
      const page = await browser.newPage();
      try {
        await page.setViewportSize({ width: w, height: h });
        await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
        await page.evaluate(() => {
          document.getElementById('security')?.scrollIntoView({ block: 'center', behavior: 'instant' });
        });
        await page.waitForTimeout(1000);

        const rolesData = await page.evaluate(() => {
          const row = document.querySelector('.roles-grid-row');
          if (!row) return null;
          const firstCol = row.children[0];
          const cs = window.getComputedStyle(firstCol);
          return {
            rowWidth: Math.round(row.getBoundingClientRect().width),
            firstColPosition: cs.position,
            firstColLeft: cs.left,
            firstColWidth: Math.round(firstCol.getBoundingClientRect().width)
          };
        });
        console.log(`Roles at ${w}x${h}:`, rolesData);
        if (w === 360) {
          const secEl = await page.$('#security');
          if (secEl) {
            await secEl.screenshot({ path: `${screensDir}/roles-360x640.png` });
            console.log(`Saved ${screensDir}/roles-360x640.png`);
          }
        }
      } finally {
        await page.close();
      }
    }

  } finally {
    await browser.close();
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
