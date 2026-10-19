const path = require('path');
const fs = require('fs');
const { createRequire } = require('module');

function getPlaywright() {
  try { return require('playwright'); } catch {}
  try { return require('/root/.bun/install/global/node_modules/playwright'); } catch {}
  throw new Error('Playwright not found');
}

const { chromium } = getPlaywright();

async function run() {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    for (const [w, h] of [[280, 653], [360, 640], [768, 1024], [1024, 1366]]) {
      const page = await browser.newPage();
      try {
        await page.setViewportSize({ width: w, height: h });
        await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(600);
        await page.evaluate(() => window.scrollTo(0, 1800));
        await page.waitForSelector('#capabilities', { timeout: 8000 });
        const sec = await page.$('#capabilities');
        if (sec) {
          await sec.scrollIntoViewIfNeeded();
          await page.waitForTimeout(1000);
          const outDir = path.resolve(__dirname, '../test-screens');
          await sec.screenshot({ path: path.join(outDir, `capabilities-${w}x${h}.png`) });
          const r = await sec.boundingBox();
          console.log(`[${w}x${h}] Section 4 height: ${Math.round(r.height)}`);
        }
      } finally {
        await page.close();
      }
    }
  } finally {
    if (browser) await browser.close();
  }
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
