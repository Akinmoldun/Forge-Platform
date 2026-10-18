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

const screensDir = path.resolve(__dirname, '../test-screens');
if (!fs.existsSync(screensDir)) {
  fs.mkdirSync(screensDir, { recursive: true });
}

async function run() {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const viewports = [
      [280, 653],
      [360, 640],
      [390, 844],
      [768, 1024],
      [1024, 1366],
      [1440, 900],
    ];

    for (const [w, h] of viewports) {
      const page = await browser.newPage();
      try {
        await page.setViewportSize({ width: w, height: h });
        await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(800);

        // Measure Hero Try Demo button bottom edge
        const heroData = await page.evaluate(() => {
          const btn = Array.from(document.querySelectorAll('a, button')).find(el => el.textContent.includes('Try demo'));
          if (!btn) return null;
          const r = btn.getBoundingClientRect();
          return { top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width), height: Math.round(r.height) };
        });
        console.log(`[${w}x${h}] Hero "Try demo" button:`, JSON.stringify(heroData));

        // Scroll Card D directly into center view so whileInView triggers
        await page.evaluate(() => {
          const h3 = Array.from(document.querySelectorAll('h3')).find(el => el.textContent.includes('Dependencies without loops'));
          if (h3) {
            h3.scrollIntoView({ block: 'center', behavior: 'instant' });
          } else {
            document.getElementById('features')?.scrollIntoView();
          }
        });
        // Give animation 1.5s to fully finish unfolding
        await page.waitForTimeout(1500);

        // Measure Card D dimensions
        const cardDHandle = await page.evaluate(() => {
          const h3 = Array.from(document.querySelectorAll('h3')).find(el => el.textContent.includes('Dependencies without loops'));
          if (!h3) return null;
          const card = h3.closest('.unfold-card') || h3.parentElement?.parentElement;
          if (!card) return null;
          const r = card.getBoundingClientRect();
          const text = h3.parentElement ? h3.parentElement.getBoundingClientRect() : null;
          const stage = card.querySelector('[class*="origin-top-left"]') || card.querySelector('svg');
          const stageRect = stage ? stage.getBoundingClientRect() : null;
          return {
            card: { top: Math.round(r.top), left: Math.round(r.left), width: Math.round(r.width), height: Math.round(r.height) },
            text: text ? { top: Math.round(text.top), left: Math.round(text.left), width: Math.round(text.width), height: Math.round(text.height), bottom: Math.round(text.bottom) } : null,
            stage: stageRect ? { top: Math.round(stageRect.top), left: Math.round(stageRect.left), bottom: Math.round(stageRect.bottom), width: Math.round(stageRect.width), height: Math.round(stageRect.height) } : null
          };
        });
        console.log(`[${w}x${h}] Card D dimensions:`, JSON.stringify(cardDHandle));

        // Measure Cards A, B, C right edges relative to card container
        const cardsABC = await page.evaluate(() => {
          const cards = Array.from(document.querySelectorAll('.bento-card, .landing-card, [class*="bento"]'));
          return cards.slice(0, 4).map((c, idx) => {
            const cr = c.getBoundingClientRect();
            // check any elements inside that exceed cr.right
            let maxChildRight = cr.left;
            c.querySelectorAll('*').forEach(el => {
              const er = el.getBoundingClientRect();
              if (er.width > 0 && er.height > 0) {
                if (er.right > maxChildRight) maxChildRight = er.right;
              }
            });
            return {
              idx,
              cardRight: Math.round(cr.right),
              cardWidth: Math.round(cr.width),
              maxChildRight: Math.round(maxChildRight),
              overflow: Math.round(maxChildRight - cr.right)
            };
          });
        });
        console.log(`[${w}x${h}] Bento cards right-edge alignment:`, JSON.stringify(cardsABC));

        // Save screenshot of Card D & hero
        const cardDEl = await page.evaluateHandle(() => {
          const h3 = Array.from(document.querySelectorAll('h3')).find(el => el.textContent.includes('Dependencies without loops'));
          return h3 ? (h3.closest('.unfold-card') || h3.parentElement?.parentElement) : null;
        });
        if (cardDEl && cardDEl.asElement()) {
          const el = cardDEl.asElement();
          await el.scrollIntoViewIfNeeded();
          await page.waitForTimeout(600);
          await el.screenshot({ path: `${screensDir}/card-d-${w}x${h}.png` });
        }
      } finally {
        await page.close();
      }
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
  process.exit(0);
}

run().catch((err) => {
  console.error("Inspect error:", err);
  process.exit(1);
});
