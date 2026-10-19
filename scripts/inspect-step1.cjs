const fs = require('fs');
const path = require('path');
const { createRequire } = require('module');

function getPlaywright() {
  try { return require('playwright'); } catch {}
  const specific = '/root/.npm/_npx/e41f203b7505f1fb/node_modules/playwright';
  if (fs.existsSync(specific)) {
    const req = createRequire(path.join(specific, 'package.json'));
    return req(specific);
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
    // 1. Measure Hero Try Demo at 320x568, 375x667, 667x375, 280x653, 360x640, 390x844
    const heroSizes = [
      [320, 568],
      [375, 667],
      [667, 375],
      [280, 653],
      [360, 640],
      [390, 844],
    ];

    console.log('=== HERO "TRY DEMO" MEASUREMENTS ===');
    for (const [w, h] of heroSizes) {
      const page = await browser.newPage();
      try {
        await page.setViewportSize({ width: w, height: h });
        await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
        const btn = await page.waitForSelector('.landing-btn-primary', { timeout: 8000 }).catch(() => null);
        const btnData = await page.evaluate(() => {
          const b = document.querySelector('.landing-btn-primary') || Array.from(document.querySelectorAll('a, button')).find(el => el.textContent.includes('Try demo'));
          if (!b) return null;
          const r = b.getBoundingClientRect();
          return { top: Math.round(r.top), bottom: Math.round(r.bottom), height: Math.round(r.height) };
        });
        const isVisibleInViewport = btnData ? btnData.bottom <= h : false;
        console.log(`Hero ${w}x${h}: button bottom = ${btnData ? btnData.bottom : 'N/A'}px (viewport height ${h}px, visible: ${isVisibleInViewport})`);
      } finally {
        await page.close();
      }
    }

    // 2. Measure Bento Cards A, B, C, D at 280, 360, 768, 1024, 1440
    console.log('\n=== BENTO CARDS A, B, C, D MEASUREMENTS ===');
    const bentoSizes = [
      [280, 653],
      [360, 640],
      [768, 1024],
      [1024, 1366],
      [1440, 900],
    ];

    for (const [w, h] of bentoSizes) {
      const page = await browser.newPage();
      try {
        await page.setViewportSize({ width: w, height: h });
        await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(600);
        await page.evaluate(() => {
          document.getElementById('features')?.scrollIntoView({ behavior: 'instant' });
        });
        await page.waitForTimeout(1200);

        const cardData = await page.evaluate(() => {
          const cards = Array.from(document.querySelectorAll('.unfold-card'));
          return cards.map((c, i) => {
            const r = c.getBoundingClientRect();
            const h3 = c.querySelector('h3');
            return {
              index: i,
              title: h3 ? h3.textContent.trim() : 'no title',
              width: Math.round(r.width),
              height: Math.round(r.height),
              top: Math.round(r.top),
              left: Math.round(r.left)
            };
          });
        });
        console.log(`Bento at ${w}x${h}:`);
        cardData.forEach(c => {
          console.log(`  Card ${c.index} ("${c.title}"): w=${c.width}px, h=${c.height}px, left=${c.left}px, top=${c.top}px`);
        });

        // Screenshot full bento section at 768 and 1024
        if (w === 768 || w === 1024) {
          const featuresEl = await page.$('#features');
          if (featuresEl) {
            await featuresEl.screenshot({ path: `${screensDir}/bento-section-${w}x${h}.png` });
            console.log(`  Saved ${screensDir}/bento-section-${w}x${h}.png`);
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
