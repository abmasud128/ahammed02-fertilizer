import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = 'C:/Users/Sk Najmul Hasan/.gemini/antigravity/brain/f30b9712-4688-4c31-8061-eabc4fd00b11/screenshots';
const EDGE_PATH = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function run() {
  console.log('Launching Edge to test redesigned header/navbar...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Always pre-set sessionStorage so the offer popup doesn't block the screen
  await page.evaluateOnNewDocument(() => {
    sessionStorage.setItem('offer-popup-dismissed', 'true');
  });

  // 1. Desktop 1440px Top of Page
  console.log('1. Capturing Desktop 1440px (Top of Page)...');
  await page.setViewport({ width: 1440, height: 900, isMobile: false });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'header-1440px-top.png'),
    fullPage: false,
  });

  // 2. Desktop 1440px with Products Mega-Menu Open
  console.log('2. Capturing Desktop 1440px with Products Mega-Menu Open...');
  const productsNav = await page.$('a[href="/products"]');
  if (productsNav) {
    const box = await productsNav.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    }
  }
  await new Promise((r) => setTimeout(r, 700));
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'header-1440px-megamenu.png'),
    fullPage: false,
  });

  // 3. Desktop 1440px Scrolled State (Scroll back up a bit so navbar reveals with scrolled glass style)
  console.log('3. Capturing Desktop 1440px Scrolled State...');
  await page.mouse.move(100, 600);
  await page.evaluate(() => {
    window.scrollTo({ top: 350, behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 400));
  // Scroll up 20px so the direction-aware navbar pops back in with scrolled styling
  await page.evaluate(() => {
    window.scrollBy({ top: -30, behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'header-1440px-scrolled.png'),
    fullPage: false,
  });

  // 4. Laptop 1024px
  console.log('4. Capturing Laptop 1024px...');
  await page.setViewport({ width: 1024, height: 768, isMobile: false });
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'header-1024px.png'),
    fullPage: false,
  });

  // 5. Tablet 768px
  console.log('5. Capturing Tablet 768px...');
  await page.setViewport({ width: 768, height: 1024, isMobile: false });
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'header-768px.png'),
    fullPage: false,
  });

  // 6. Mobile 390px (Initial view with Announcement Bar & Sticky MobileBottomBar)
  console.log('6. Capturing Mobile 390px View...');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'header-390px-mobile.png'),
    fullPage: false,
  });

  // 7. Mobile 390px with Mobile Drawer Open & Accordion Toggled
  console.log('7. Capturing Mobile 390px Drawer Open...');
  await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Open menu"]');
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  await page.evaluate(() => {
    const accordionBtn = document.querySelector('button[aria-label="Toggle products categories"]');
    if (accordionBtn) accordionBtn.click();
  });
  await new Promise((r) => setTimeout(r, 500));

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'header-390px-drawer.png'),
    fullPage: false,
  });

  // 8. Compact Mobile 360px
  console.log('8. Capturing Compact Mobile 360px View...');
  await page.setViewport({ width: 360, height: 740, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'header-360px-mobile.png'),
    fullPage: false,
  });

  await browser.close();
  console.log('All header verification screenshots captured successfully!');
}

run().catch((err) => {
  console.error('Error during header screenshot capture:', err);
  process.exit(1);
});
