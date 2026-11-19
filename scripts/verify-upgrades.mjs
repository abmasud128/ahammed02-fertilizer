import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = 'C:/Users/Sk Najmul Hasan/.gemini/antigravity/brain/f30b9712-4688-4c31-8061-eabc4fd00b11/screenshots';
const EDGE_PATH = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function run() {
  console.log('Launching browser for verification...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.evaluateOnNewDocument(() => {
    sessionStorage.setItem('offer-popup-dismissed', 'true');
  });

  // ── 1. Desktop Verification (1440x900) ─────────────────────────
  console.log('Testing Desktop 1440px...');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2000));

  // Capture Desktop Hero
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'upgrade-desktop-hero-1440px.png'),
  });
  console.log('Saved: upgrade-desktop-hero-1440px.png');

  // Scroll to Signature Sprout Sequence
  await page.evaluate(() => {
    window.scrollTo({ top: 900, behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'upgrade-desktop-sprout-1440px.png'),
  });
  console.log('Saved: upgrade-desktop-sprout-1440px.png');

  // Scroll to Featured Products (NPK 19:19:19, Zinc Plus, Crop Guard)
  await page.evaluate(() => {
    const el = document.querySelector('h2');
    const sections = Array.from(document.querySelectorAll('section'));
    const prodSection = sections.find(s => s.textContent.includes('Featured Products'));
    if (prodSection) prodSection.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'upgrade-desktop-products-1440px.png'),
  });
  console.log('Saved: upgrade-desktop-products-1440px.png');

  // Scroll to Contact Section & Google Maps
  await page.evaluate(() => {
    const contactSection = document.getElementById('contact');
    if (contactSection) contactSection.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'upgrade-desktop-contact-1440px.png'),
  });
  console.log('Saved: upgrade-desktop-contact-1440px.png');

  // ── 2. Mobile Verification (390x844) ───────────────────────────
  console.log('Testing Mobile 390px...');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 2000));

  // Mobile Hero with Sticky Bar
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'upgrade-mobile-hero-390px.png'),
  });
  console.log('Saved: upgrade-mobile-hero-390px.png');

  // Mobile Sprout Sequence
  await page.evaluate(() => {
    window.scrollTo({ top: 850, behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'upgrade-mobile-sprout-390px.png'),
  });
  console.log('Saved: upgrade-mobile-sprout-390px.png');

  // Mobile Featured Products
  await page.evaluate(() => {
    window.scrollTo({ top: 1800, behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'upgrade-mobile-products-390px.png'),
  });
  console.log('Saved: upgrade-mobile-products-390px.png');

  // Mobile Contact & Maps
  await page.evaluate(() => {
    window.scrollTo({ top: 4800, behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'upgrade-mobile-contact-390px.png'),
  });
  console.log('Saved: upgrade-mobile-contact-390px.png');

  // ── 3. Mobile Hamburger Menu Drawer ───────────────────────────
  console.log('Testing Mobile Hamburger Menu Drawer...');
  await page.evaluate(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 800));

  // Click hamburger button
  const hamburgerBtn = await page.$('button[aria-label="Open mobile menu"]');
  if (hamburgerBtn) {
    await hamburgerBtn.click();
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'upgrade-mobile-drawer-390px.png'),
    });
    console.log('Saved: upgrade-mobile-drawer-390px.png');
  }

  // ── 4. Verify No Horizontal Overflow ──────────────────────────
  const overflow = await page.evaluate(() => {
    const docWidth = document.documentElement.offsetWidth;
    const bodyWidth = document.body.scrollWidth;
    return {
      innerWidth: window.innerWidth,
      docWidth,
      bodyWidth,
      hasOverflow: bodyWidth > window.innerWidth,
    };
  });
  console.log('Mobile Overflow Check Result:', JSON.stringify(overflow));

  await browser.close();
  console.log('Verification completed successfully!');
}

run().catch((err) => {
  console.error('Error during verification:', err);
  process.exit(1);
});
