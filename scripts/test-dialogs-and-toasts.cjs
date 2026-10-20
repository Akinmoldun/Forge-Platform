const path = require('path');
const { chromium } = require('playwright');

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
const screensDir = path.join(__dirname, '..', 'test-screens');

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 360, height: 640 });

  await page.addInitScript(() => {
    try {
      window.sessionStorage.setItem('forge_demo_mode', 'true');
    } catch (e) {}
  });

  console.log('--- 1. TESTING COMMAND PALETTE AT 360x640 ---');
  await page.goto(`${baseUrl}/app/workspaces/demo-ws-northstar/overview`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);

  // Press Meta+K / Control+K to open Command Palette
  await page.keyboard.down('Meta');
  await page.keyboard.press('KeyK');
  await page.keyboard.up('Meta');
  await page.waitForTimeout(500);

  let cmdPalette = await page.$('[role="dialog"]');
  if (!cmdPalette) {
    // Try Ctrl+K
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyK');
    await page.keyboard.up('Control');
    await page.waitForTimeout(500);
    cmdPalette = await page.$('[role="dialog"]');
  }

  const cmdScreenshotPath = path.join(screensDir, 'dialog-360-command-palette.png');
  await page.screenshot({ path: cmdScreenshotPath });
  console.log('Command palette screenshot saved:', cmdScreenshotPath);

  const cmdOverflow = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const dialog = document.querySelector('[role="dialog"]');
    if (!dialog) return { found: false };
    const r = dialog.getBoundingClientRect();
    return {
      found: true,
      w: Math.round(r.width),
      h: Math.round(r.height),
      left: Math.round(r.left),
      right: Math.round(r.right),
      fits: r.left >= 0 && r.right <= vw,
    };
  });
  console.log('Command palette metrics:', cmdOverflow);

  // Close Command Palette
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  console.log('\n--- 2. TESTING CREATE ISSUE DIALOG AT 360x640 ---');
  // Click Create issue button on overview
  const createBtn = await page.$('button:has-text("Create issue")');
  if (createBtn) {
    await createBtn.click();
    await page.waitForTimeout(600);
  }

  const createScreenshotPath = path.join(screensDir, 'dialog-360-create-issue.png');
  await page.screenshot({ path: createScreenshotPath });
  console.log('Create issue dialog screenshot saved:', createScreenshotPath);

  const createOverflow = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const dialog = document.querySelector('[role="dialog"]');
    if (!dialog) return { found: false };
    const r = dialog.getBoundingClientRect();
    return {
      found: true,
      w: Math.round(r.width),
      h: Math.round(r.height),
      left: Math.round(r.left),
      right: Math.round(r.right),
      fits: r.left >= 0 && r.right <= vw + 1,
    };
  });
  console.log('Create issue dialog metrics:', createOverflow);

  // Close dialog
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  console.log('\n--- 3. TESTING ALERT DIALOG AT 360x640 ---');
  await page.goto(`${baseUrl}/app/issues/demo-issue-mob-1`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);

  // Click Delete button to trigger AlertDialog
  const deleteBtn = await page.$('button:has-text("Delete")');
  if (deleteBtn) {
    await deleteBtn.click();
    await page.waitForTimeout(600);
  }

  const alertScreenshotPath = path.join(screensDir, 'dialog-360-alert-dialog.png');
  await page.screenshot({ path: alertScreenshotPath });
  console.log('Alert dialog screenshot saved:', alertScreenshotPath);

  const alertOverflow = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const dialog = document.querySelector('[role="alertdialog"]');
    if (!dialog) return { found: false };
    const r = dialog.getBoundingClientRect();
    return {
      found: true,
      w: Math.round(r.width),
      h: Math.round(r.height),
      left: Math.round(r.left),
      right: Math.round(r.right),
      fits: r.left >= 0 && r.right <= vw + 1,
    };
  });
  console.log('Alert dialog metrics:', alertOverflow);

  // Close alert dialog by clicking Cancel
  const cancelBtn = await page.$('button:has-text("Cancel")');
  if (cancelBtn) {
    await cancelBtn.click();
    await page.waitForTimeout(400);
  }

  console.log('\n--- 4. TESTING TOAST AT 360x640 ---');
  // Trigger a sonner toast via evaluation or action
  await page.evaluate(() => {
    // Sonner can be triggered or we can dispatch an action that toasts
    const sonner = window[Symbol.for('sonner')] || window.sonner;
    if (window.toast) {
      window.toast('Changes saved successfully');
    }
  });

  // Try clicking archive or copy link which calls toast
  const archiveBtn = await page.$('button:has-text("Archive")');
  if (archiveBtn) {
    await archiveBtn.click();
    await page.waitForTimeout(400);
  }

  const toastScreenshotPath = path.join(screensDir, 'toast-360.png');
  await page.screenshot({ path: toastScreenshotPath });
  console.log('Toast screenshot saved:', toastScreenshotPath);

  const toastMetrics = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;
    const toastEl = document.querySelector('[data-sonner-toaster] [data-sonner-toast], [data-sonner-toast]');
    if (!toastEl) return { found: false };
    const r = toastEl.getBoundingClientRect();
    return {
      found: true,
      w: Math.round(r.width),
      h: Math.round(r.height),
      left: Math.round(r.left),
      right: Math.round(r.right),
      top: Math.round(r.top),
      bottom: Math.round(r.bottom),
      fitsHorizontal: r.left >= 0 && r.right <= vw + 1,
      fitsVertical: r.bottom <= vh,
    };
  });
  console.log('Toast metrics:', toastMetrics);

  await browser.close();
  console.log('\nDialogs and toasts testing complete.');
}

run().catch((err) => {
  console.error('Error running dialogs/toasts test:', err);
  process.exit(1);
});
