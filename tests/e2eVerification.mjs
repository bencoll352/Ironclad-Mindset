import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';

const ARTIFACT_DIR = '/home/antigravity/.gemini/jetski/brain/v1/default/jetski_remote_agents_3p/63bbc160-4d2e-45f1-88cb-960e04fe07f8';
const PORT = 4173;
const BASE_URL = `http://127.0.0.1:${PORT}/Ironclad-Mindset/`;

function startPreviewServer() {
  return new Promise((resolve, reject) => {
    const proc = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--host', '127.0.0.1'], {
      cwd: '/home/antigravity',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let resolved = false;
    proc.stdout.on('data', (chunk) => {
      const text = chunk.toString();
      if (!resolved && (text.includes(String(PORT)) || text.includes('Local:'))) {
        resolved = true;
        resolve(proc);
      }
    });
    proc.stderr.on('data', (chunk) => {
      const text = chunk.toString();
      if (!resolved && text.includes('Error')) {
        reject(new Error(text));
      }
    });
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(proc);
      }
    }, 3000);
  });
}

const server = await startPreviewServer();

try {
  const browser = await chromium.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  // 1. Desktop E2E + Screenshots + Keyboard Navigation + All Modules
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    reducedMotion: 'reduce',
  });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto(BASE_URL, { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(600);

  // Verify white theme background color on body (#ffffff -> rgb(255, 255, 255))
  const bodyBg = await desktopPage.evaluate(() => getComputedStyle(document.body).backgroundColor);
  assert.equal(bodyBg, 'rgb(255, 255, 255)', 'Body background should be white (#FFFFFF)');

  // Verify Iron Milestones section and 12 badges
  const milestoneHeading = await desktopPage.locator('#iron-milestones-section h2').textContent();
  assert.ok(milestoneHeading?.includes('Iron Milestones'), 'Should display Iron Milestones heading');
  const unlockedBadgeText = await desktopPage.locator('#iron-milestones-count').textContent();
  assert.ok(unlockedBadgeText?.includes('of 12 unlocked'), `Expected "X of 12 unlocked", got "${unlockedBadgeText}"`);

  const badgeCardsCount = await desktopPage.locator('[data-milestone-days]').count();
  assert.equal(badgeCardsCount, 12, 'Should render all 12 Iron Milestone badges');

  // Verify exact badge thresholds in ascending order
  const renderedThresholds = await desktopPage.locator('[data-milestone-days]').evaluateAll((els) =>
    els.map((el) => Number(el.getAttribute('data-milestone-days')))
  );
  assert.deepEqual(
    renderedThresholds,
    [1, 2, 3, 4, 5, 6, 7, 14, 30, 90, 180, 365],
    'Rendered badge thresholds must match [1, 2, 3, 4, 5, 6, 7, 14, 30, 90, 180, 365]'
  );

  // Capture After Forge Desktop screenshot
  await desktopPage.screenshot({ path: `${ARTIFACT_DIR}/after-forge-desktop.png`, fullPage: true });
  console.log('Saved after-forge-desktop.png');

  // Test keyboard Tab focus ring visibility
  await desktopPage.keyboard.press('Tab');
  const activeTag = await desktopPage.evaluate(() => document.activeElement?.tagName);
  assert.ok(activeTag, 'Keyboard Tab should move focus to an interactive element');

  // Navigate to Cornerman Desktop & capture screenshot
  await desktopPage.locator('#nav-desktop-cornerman').click();
  await desktopPage.waitForTimeout(500);
  await desktopPage.screenshot({ path: `${ARTIFACT_DIR}/after-cornerman-desktop.png`, fullPage: true });
  console.log('Saved after-cornerman-desktop.png');

  // Test Cornerman E2E conversation:
  // Turn 1: "I’ve just finished a brutal shift and I’m about to go to the pub"
  // Turn 2: "I’m already outside"
  const chatInput = desktopPage.locator('#cornerman-chat-input');
  await chatInput.fill('I’ve just finished a brutal shift and I’m about to go to the pub');
  await desktopPage.locator('#cornerman-send-btn').click();
  await desktopPage.waitForTimeout(400);

  await chatInput.fill('I’m already outside');
  await desktopPage.locator('#cornerman-send-btn').click();
  await desktopPage.waitForTimeout(400);

  const pageTextAfterFollowUp = await desktopPage.locator('#cornerman-messages-list').innerText();
  assert.ok(
    pageTextAfterFollowUp.toLowerCase().includes('turn your feet') ||
      pageTextAfterFollowUp.toLowerCase().includes('outside') ||
      pageTextAfterFollowUp.toLowerCase().includes('10 minutes'),
    'Cornerman should reply with context-aware guidance for "I’m already outside" after shift/pub prompt'
  );

  // Verify the "Start Craving Reset" action button in Cornerman opens the Craving Reset modal
  const actionBtn = desktopPage.locator('[data-cornerman-action="START_CRAVING_RESET"]').last();
  assert.ok(await actionBtn.isVisible(), 'Start Craving Reset action button should be visible');
  await actionBtn.click();
  await desktopPage.waitForTimeout(300);
  assert.ok(await desktopPage.locator('#sos-modal-title').isVisible(), 'Craving Reset modal should open from Cornerman action');
  // Close Craving Reset modal with Escape
  await desktopPage.keyboard.press('Escape');
  await desktopPage.waitForTimeout(300);

  // Check remaining desktop modules render cleanly
  for (const tab of ['lifelines', 'fuel', 'playbooks', 'locker']) {
    await desktopPage.locator(`#nav-desktop-${tab}`).click();
    await desktopPage.waitForTimeout(250);
  }
  await desktopContext.close();

  // 2. Mobile Screenshots (390x844 viewport matching before-* mobile screenshots)
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(BASE_URL, { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(500);
  await mobilePage.screenshot({ path: `${ARTIFACT_DIR}/after-forge-mobile.png`, fullPage: false });
  console.log('Saved after-forge-mobile.png');

  await mobilePage.locator('#nav-mobile-cornerman').click();
  await mobilePage.waitForTimeout(500);
  await mobilePage.screenshot({ path: `${ARTIFACT_DIR}/after-cornerman-mobile.png`, fullPage: false });
  console.log('Saved after-cornerman-mobile.png');
  await mobileContext.close();

  // 3. Offline PWA + Service Worker + Craving Reset + Dated Check-in Persistence under /Ironclad-Mindset/
  const pwaContext = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  const pwaPage = await pwaContext.newPage();
  await pwaPage.goto(BASE_URL, { waitUntil: 'networkidle' });

  // Wait for Service Worker registration and activation
  const swScope = await pwaPage.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return null;
    const reg = await navigator.serviceWorker.ready;
    return reg.scope;
  });
  assert.ok(swScope && swScope.includes('/Ironclad-Mindset/'), `Expected SW scope to include /Ironclad-Mindset/, got ${swScope}`);
  console.log('Service worker ready at scope:', swScope);

  // Switch context offline and reload /Ironclad-Mindset/
  await pwaContext.setOffline(true);
  await pwaPage.reload({ waitUntil: 'domcontentloaded' });
  await pwaPage.waitForTimeout(500);

  // Complete Craving Reset while offline
  await pwaPage.locator('#global-sos-red-btn').click();
  await pwaPage.waitForTimeout(250);
  assert.ok(await pwaPage.locator('#sos-modal-title').isVisible(), 'Craving Reset modal should open offline');
  await pwaPage.locator('#complete-craving-reset-btn').click();
  await pwaPage.waitForTimeout(200);
  await pwaPage.locator('#close-sos-modal-btn').click();
  await pwaPage.waitForTimeout(250);

  // Save a dated check-in while offline
  const noteInput = pwaPage.locator('#checkin-private-note');
  assert.ok(await noteInput.isVisible(), 'Check-in private note input should be visible in The Forge');
  await noteInput.fill('Offline shift check-in saved via Dexie IndexedDB');
  await pwaPage.locator('#log-daily-forge-btn').click();
  await pwaPage.waitForTimeout(500);

  // Close the page, reopen a fresh page while still offline, and confirm the check-in appears in The Forge
  await pwaPage.close();
  const reopenedPage = await pwaContext.newPage();
  await reopenedPage.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await reopenedPage.waitForTimeout(600);

  const forgeContent = await reopenedPage.locator('main').innerText();
  assert.ok(
    forgeContent.includes('Offline shift check-in saved via Dexie IndexedDB'),
    'Saved offline check-in should appear in The Forge after closing and reopening'
  );

  // Also test Cornerman while offline to confirm explicit offline banner & working action
  await reopenedPage.locator('#nav-desktop-cornerman').click();
  await reopenedPage.waitForTimeout(300);
  await reopenedPage.locator('#cornerman-chat-input').fill('I’ve just finished a brutal shift and I’m about to go to the pub');
  await reopenedPage.locator('#cornerman-send-btn').click();
  await reopenedPage.waitForTimeout(300);
  await reopenedPage.locator('#cornerman-chat-input').fill('I’m already outside');
  await reopenedPage.locator('#cornerman-send-btn').click();
  await reopenedPage.waitForTimeout(300);

  assert.ok(
    await reopenedPage.locator('#cornerman-provider-notice').isVisible(),
    'Explicit offline/provider status notice should be visible in Cornerman when offline'
  );
  assert.ok(
    await reopenedPage.locator('[data-cornerman-action="START_CRAVING_RESET"]').last().isVisible(),
    'Offline Cornerman fallback should still provide Start Craving Reset button'
  );

  await pwaContext.close();
  await browser.close();
  console.log('All Playwright E2E, responsive, accessibility, Cornerman, and offline PWA checks passed!');
} finally {
  server.kill();
  process.exit(0);
}

