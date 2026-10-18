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

async function run() {
  const browser = await chromium.launch({ headless: true });
  for (const [w, h] of [[280, 653], [360, 640], [768, 1024], [1024, 1366], [1440, 900]]) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: w, height: h });
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      document.getElementById('features')?.scrollIntoView();
    });
    await page.waitForTimeout(1000);

    const cardHandle = await page.evaluate(() => {
      const h3 = Array.from(document.querySelectorAll('h3')).find(el => el.textContent.includes('Dependencies without loops'));
      if (!h3) return null;
      const card = h3.closest('.unfold-card') || h3.parentElement.parentElement;
      const r = card.getBoundingClientRect();
      const text = h3.parentElement.getBoundingClientRect();
      const rel = Array.from(card.querySelectorAll('span')).find(el => el.textContent.includes('Release 2.4'))?.closest('div.relative, div.absolute') || h3.parentElement.nextElementSibling;
      const relRect = rel ? rel.getBoundingClientRect() : null;
      const stage = card.querySelector('[class*="origin-top-left"]') || card.querySelector('svg');
      const stageRect = stage ? stage.getBoundingClientRect() : null;
      return {
        card: { top: Math.round(r.top), left: Math.round(r.left), width: Math.round(r.width), height: Math.round(r.height) },
        text: { top: Math.round(text.top), left: Math.round(text.left), width: Math.round(text.width), height: Math.round(text.height), bottom: Math.round(text.bottom) },
        rel: relRect ? { top: Math.round(relRect.top), left: Math.round(relRect.left), bottom: Math.round(relRect.bottom) } : null,
        stage: stageRect ? { top: Math.round(stageRect.top), left: Math.round(stageRect.left), bottom: Math.round(stageRect.bottom), width: Math.round(stageRect.width), height: Math.round(stageRect.height) } : null
      };
    });
    console.log(`[${w}x${h}] Card D dimensions:`, JSON.stringify(cardHandle));
    await page.close();
  }
  await browser.close();
}

run().catch(console.error);
