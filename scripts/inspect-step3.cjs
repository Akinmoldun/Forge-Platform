const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const screensDir = '/app/applet/test-screens';
if (!fs.existsSync(screensDir)) {
  fs.mkdirSync(screensDir, { recursive: true });
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  try {
    const viewports = [
      [280, 653],
      [360, 640],
      [768, 1024],
      [1024, 1366],
    ];

    for (const [w, h] of viewports) {
      console.log(`\n=== INSPECTING STEP 3 SECTIONS AT ${w}x${h} ===`);
      const page = await browser.newPage();
      try {
        await page.setViewportSize({ width: w, height: h });
        await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
        await page.waitForTimeout(500);

        // 1. B3: Hero Marquee & Sun layers
        const hero = await page.$('#hero');
        if (hero) {
          const marquee = await page.$('.marquee-track, [class*="marquee"]');
          console.log(`[${w}x${h}] B3 Hero: exists, marquee: ${!!marquee}`);
          if (w === 360) {
            await hero.screenshot({ path: `${screensDir}/step3-b3-hero-${w}x${h}.png` });
          }
        }

        // 2. B10: What's included (#capabilities-included)
        const whatsIncluded = await page.$('#capabilities-included');
        if (whatsIncluded) {
          await whatsIncluded.scrollIntoViewIfNeeded();
          await page.waitForTimeout(400);
          const r = await whatsIncluded.boundingBox();
          console.log(`[${w}x${h}] B10 Whats included: width=${Math.round(r.width)}, height=${Math.round(r.height)}`);
          if (w === 360 || w === 280) {
            await whatsIncluded.screenshot({ path: `${screensDir}/step3-b10-whats-included-${w}x${h}.png` });
          }
        }

        // 3. B12: Why teams choose Forge
        const whyTeams = await page.evaluateHandle(() => {
          const headings = Array.from(document.querySelectorAll('h2, h3'));
          const h = headings.find(el => el.textContent.includes('Why teams choose'));
          return h ? h.closest('section') : null;
        });
        const whyTeamsEl = whyTeams.asElement();
        if (whyTeamsEl) {
          await whyTeamsEl.scrollIntoViewIfNeeded();
          await page.waitForTimeout(400);
          const r = await whyTeamsEl.boundingBox();
          console.log(`[${w}x${h}] B12 Why teams choose: width=${Math.round(r.width)}, height=${Math.round(r.height)}`);
          if (w === 360) {
            await whyTeamsEl.screenshot({ path: `${screensDir}/step3-b12-why-teams-${w}x${h}.png` });
          }
        }

        // 4. B13: Engineering decisions (#decisions)
        const decisions = await page.$('#decisions');
        if (decisions) {
          await decisions.scrollIntoViewIfNeeded();
          await page.waitForTimeout(400);
          const r = await decisions.boundingBox();
          console.log(`[${w}x${h}] B13 Engineering decisions: width=${Math.round(r.width)}, height=${Math.round(r.height)}`);
          if (w === 360) {
            await decisions.screenshot({ path: `${screensDir}/step3-b13-decisions-${w}x${h}.png` });
          }
        }

        // 5. B14: FAQ (#faq)
        const faq = await page.$('#faq');
        if (faq) {
          await faq.scrollIntoViewIfNeeded();
          await page.waitForTimeout(400);
          const r = await faq.boundingBox();
          console.log(`[${w}x${h}] B14 FAQ: width=${Math.round(r.width)}, height=${Math.round(r.height)}`);
          if (w === 360) {
            await faq.screenshot({ path: `${screensDir}/step3-b14-faq-${w}x${h}.png` });
          }
        }

        // 6. B15: Final CTA
        const finalCTA = await page.evaluateHandle(() => {
          const headings = Array.from(document.querySelectorAll('h3'));
          const h = headings.find(el => el.textContent.includes('Ready to eliminate workflow chaos?'));
          return h ? h.closest('section') : null;
        });
        const finalCTAEl = finalCTA.asElement();
        if (finalCTAEl) {
          await finalCTAEl.scrollIntoViewIfNeeded();
          await page.waitForTimeout(400);
          const r = await finalCTAEl.boundingBox();
          console.log(`[${w}x${h}] B15 Final CTA: width=${Math.round(r.width)}, height=${Math.round(r.height)}`);
          if (w === 360) {
            await finalCTAEl.screenshot({ path: `${screensDir}/step3-b15-final-cta-${w}x${h}.png` });
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
