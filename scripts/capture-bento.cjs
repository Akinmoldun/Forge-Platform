const path = require('path');
const fs = require('fs');
const { createRequire } = require('module');

function getPlaywright() {
  const npxDir = '/root/.npm/_npx';
  for (const d of fs.readdirSync(npxDir)) {
    const candidate = path.join(npxDir, d, 'node_modules', 'playwright');
    if (fs.existsSync(candidate)) {
      const req = createRequire(path.join(candidate, 'package.json'));
      return req(candidate);
    }
  }
}

const { chromium } = getPlaywright();

async function run() {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    for (const [w, h] of [[280, 653], [360, 640]]) {
      const page = await browser.newPage();
      try {
        await page.setViewportSize({ width: w, height: h });
        await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(600);
        const bento = await page.$('#features');
        if (bento) {
          await bento.scrollIntoViewIfNeeded();
          await page.waitForTimeout(1500);
          const outDir = path.resolve(__dirname, '../test-screens');
          if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
          await bento.screenshot({ path: path.join(outDir, `bento-${w}x${h}.png`) });
        }
      } finally {
        await page.close();
      }
    }
    console.log('Bento screenshots captured');
  } finally {
    if (browser) await browser.close();
  }
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
