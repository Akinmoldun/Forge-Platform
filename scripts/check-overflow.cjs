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
        const req = createRequire(path.join(candidate, 'package.json'));
        return req(candidate);
      }
    }
  }
  throw new Error("Cannot find Playwright in node_modules or _npx cache");
}

const { chromium } = getPlaywright();

const DEFAULT_WIDTHS = [
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

const EXTRA_WIDTHS = [
  { name: 'Galaxy Z Fold 4/5 cover', width: 344, height: 882 },
  { name: 'Pixel 7/8', width: 412, height: 915 },
  { name: '7-inch tablet', width: 600, height: 960 },
  { name: 'iPad mini 6', width: 744, height: 1133 },
  { name: 'iPad 10th gen / Air', width: 820, height: 1180 },
  { name: 'iPad Pro 11-inch', width: 834, height: 1194 },
  { name: 'Surface Pro / Large tablet', width: 1032, height: 1376 },
  { name: 'HD 720p', width: 1280, height: 720 },
  { name: 'Laptop standard', width: 1536, height: 864 },
  { name: 'FHD 1080p', width: 1920, height: 1080 },
  { name: 'QHD 1440p', width: 2560, height: 1440 },
  { name: 'Ultrawide 3440', width: 3440, height: 1440 },
  { name: 'Landscape iPhone 12-16', width: 844, height: 390 },
  { name: 'Landscape iPhone Pro Max', width: 932, height: 430 },
  { name: 'Landscape Pixel', width: 915, height: 412 },
];

function parseArgs() {
  const args = process.argv.slice(2);
  let paths = ['/'];
  let demo = false;
  let allSizes = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--paths') {
      paths = [];
      i++;
      while (i < args.length && !args[i].startsWith('--')) {
        paths.push(args[i]);
        i++;
      }
      i--;
    } else if (args[i] === '--demo') {
      demo = true;
    } else if (args[i] === '--all-sizes') {
      allSizes = true;
    }
  }
  return { paths: paths.length ? paths : ['/'], demo, allSizes };
}

async function run() {
  const { paths, demo, allSizes } = parseArgs();
  const testWidths = allSizes ? [...DEFAULT_WIDTHS, ...EXTRA_WIDTHS] : DEFAULT_WIDTHS;
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

  let browser;
  let hasFailures = false;

  try {
    browser = await chromium.launch({ headless: true });

    for (const testPath of paths) {
      console.log(`\n=== CHECKING PATH: ${testPath} ===`);
      for (const vp of testWidths) {
        const page = await browser.newPage();
        try {
          await page.setViewportSize({ width: vp.width, height: vp.height });

          if (demo) {
            await page.addInitScript(() => {
              try {
                window.sessionStorage.setItem('forge_demo_mode', 'true');
                window.sessionStorage.removeItem('forge_signed_out');
                window.sessionStorage.removeItem('forge_hide_demo_session');
              } catch (e) {}
            });
          }

          const targetUrl = testPath.startsWith('http') ? testPath : `${baseUrl}${testPath}`;
          await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
          await page.waitForTimeout(900);

          // Save screenshot for 360x640 and 768x1024
          if (vp.width === 360 && vp.height === 640) {
            const cleanName = testPath.replace(/[^a-zA-Z0-9]/g, '_').replace(/^_+|_+$/g, '');
            const screenPath = path.join(__dirname, '..', 'test-screens', `${cleanName}-360x640.png`);
            await page.screenshot({ path: screenPath });
          } else if (vp.width === 768 && vp.height === 1024) {
            const cleanName = testPath.replace(/[^a-zA-Z0-9]/g, '_').replace(/^_+|_+$/g, '');
            const screenPath = path.join(__dirname, '..', 'test-screens', `${cleanName}-768x1024.png`);
            await page.screenshot({ path: screenPath });
          }

          const bad = await page.evaluate(() => {
            const vw = document.documentElement.clientWidth;
            const bad = [];
            if (document.documentElement.scrollWidth > vw + 1) {
              bad.push(`PAGE scrolls sideways: ${document.documentElement.scrollWidth} > ${vw}`);
            }
            document.querySelectorAll('body *').forEach((el) => {
              const r = el.getBoundingClientRect();
              if (r.width === 0 || r.height === 0) return;
              if (r.right > vw + 1 || r.left < -1) {
                let p = el.parentElement;
                let scroller = false;
                while (p && p !== document.body) {
                  const o = getComputedStyle(p).overflowX;
                  if (o === 'auto' || o === 'scroll' || o === 'hidden' || o === 'clip') {
                    scroller = true;
                    break;
                  }
                  p = p.parentElement;
                }
                if (!scroller) {
                  bad.push(
                    `${el.tagName}.${String(el.className).slice(0, 60)} right=${Math.round(r.right)} left=${Math.round(r.left)}`
                  );
                }
              }
            });
            return bad.slice(0, 30);
          });

          const status = bad.length === 0 ? 'PASS (no overflow)' : `FAIL (${bad.length} offenders)`;
          if (bad.length > 0) hasFailures = true;
          console.log(`[${vp.width}x${vp.height}] ${vp.name}: ${status}`);
          if (bad.length > 0) {
            console.log('   Offenders:', bad.slice(0, 5));
          }
        } finally {
          await page.close();
        }
      }
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  process.exit(hasFailures ? 1 : 0);
}

run().catch((err) => {
  console.error("Runner error:", err);
  process.exit(1);
});
