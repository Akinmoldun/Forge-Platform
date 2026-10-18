const fs = require('fs');
const path = require('path');
const { createRequire } = require('module');

function getPlaywright() {
  try { return require('playwright'); } catch {}
  const npxDir = '/root/.npm/_npx';
  for (const d of fs.readdirSync(npxDir)) {
    const candidate = path.join(npxDir, d, 'node_modules', 'playwright');
    if (fs.existsSync(candidate)) return createRequire(candidate + '/index.js')('playwright');
  }
}

const { chromium } = getPlaywright();
fs.mkdirSync('/tmp/screens', { recursive: true });

async function run() {
  const browser = await chromium.launch({ headless: true });
  for (const [w, h] of [[280, 653], [360, 640], [768, 1024], [1024, 1366], [1440, 900]]) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: w, height: h });
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    const cardHandle = await page.evaluate(() => {
      const h3 = Array.from(document.querySelectorAll('h3')).find(el => el.textContent.includes('Dependencies without loops'));
      if (!h3) return null;
      const card = h3.closest('.unfold-card') || h3.parentElement.parentElement;
      const r = card.getBoundingClientRect();
      const text = h3.parentElement.getBoundingClientRect();
      const rel = card.querySelector('div:has(> span:has-text("Release 2.4"))') || h3.parentElement.nextElementSibling;
      const relRect = rel ? rel.getBoundingClientRect() : null;
      const stage = card.querySelector('[class*="origin-top-left"]') || card.querySelector('svg');
      const stageRect = stage ? stage.getBoundingClientRect() : null;
      return {
        card: { top: r.top, left: r.left, width: r.width, height: r.height },
        text: { top: text.top, left: text.left, width: text.width, height: text.height, bottom: text.bottom },
        rel: relRect ? { top: relRect.top, left: relRect.left, bottom: relRect.bottom } : null,
        stage: stageRect ? { top: stageRect.top, left: stageRect.left, bottom: stageRect.bottom, width: stageRect.width, height: stageRect.height } : null
      };
    });
    console.log(`[${w}x${h}] Card D dimensions:`, JSON.stringify(cardHandle));
    await page.close();
  }
  await browser.close();
}

run().catch(console.error);
