const fs = require('fs');
const path = require('path');
const { createRequire } = require('module');

function getPlaywright() {
  try {
    return require('playwright');
  } catch {}
  const npxDir = '/root/.npm/_npx';
  if (fs.existsSync(npxDir)) {
    for (const d of fs.readdirSync(npxDir)) {
      const candidate = path.join(npxDir, d, 'node_modules', 'playwright');
      if (fs.existsSync(candidate)) {
        const req = createRequire(candidate + '/index.js');
        return req('playwright');
      }
    }
  }
  throw new Error("Cannot find Playwright in node_modules or _npx cache");
}

const { chromium } = getPlaywright();

const widths = [
  { name: 'Smallest floor (Galaxy Fold cover)', width: 280, height: 653 },
  { name: 'iPhone SE 1st gen', width: 320, height: 568 },
  { name: 'iPhone SE 2/3 / iPhone 8', width: 375, height: 667 },
  { name: 'Common phone (Pixel / Galaxy)', width: 360, height: 640 },
  { name: 'iPhone 12-16', width: 390, height: 844 },
  { name: 'iPhone Plus / Pro Max', width: 430, height: 932 },
  { name: 'Foldable unfolded (square)', width: 673, height: 841 },
  { name: 'Foldable unfolded (wide)', width: 717, height: 512 },
  { name: 'iPad mini', width: 768, height: 1024 },
  { name: 'iPad Pro', width: 1024, height: 1366 },
  { name: 'Landscape phone', width: 667, height: 375 },
  { name: 'Desktop 1440', width: 1440, height: 900 },
];

async function run() {
  const browser = await chromium.launch({ headless: true });
  for (const vp of widths) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    const bad = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const bad = [];
      if (document.documentElement.scrollWidth > vw + 1) bad.push('PAGE scrolls sideways: ' + document.documentElement.scrollWidth + ' > ' + vw);
      document.querySelectorAll('body *').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return;
        if (r.right > vw + 1 || r.left < -1) {
          let p = el.parentElement, scroller = false;
          while (p && p !== document.body) {
            const o = getComputedStyle(p).overflowX;
            if (o === 'auto' || o === 'scroll' || o === 'hidden' || o === 'clip') { scroller = true; break; }
            p = p.parentElement;
          }
          if (!scroller) bad.push(el.tagName + '.' + String(el.className).slice(0, 60) + ' right=' + Math.round(r.right));
        }
      });
      return bad.slice(0, 30);
    });
    console.log(`[${vp.width}x${vp.height}] ${vp.name}: ${bad.length === 0 ? 'PASS (no overflow)' : 'FAIL (' + bad.length + ' offenders)'}`);
    if (bad.length > 0) {
      console.log('   Offenders:', bad.slice(0, 5));
    }
    await page.close();
  }
  await browser.close();
}

run().catch(console.error);
