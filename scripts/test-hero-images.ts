import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\Sk Najmul Hasan\\.gemini\\antigravity\\brain\\f30b9712-4688-4c31-8061-eabc4fd00b11\\screenshots';

async function testHero() {
  if (!fs.existsSync(ARTIFACT_DIR)) {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Helper to suppress offer popup modal completely
  await page.evaluateOnNewDocument(() => {
    try {
      sessionStorage.setItem('offer-popup-dismissed', 'true');
      localStorage.setItem('offer-popup-dismissed', 'true');
    } catch (e) {}
  });

  console.log('--- RE-TESTING PERFECTED REAL LIFE HERO IMAGES ---');

  // 1. Desktop - Agriculture (1440x900)
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1000));

  const shot1 = path.join(ARTIFACT_DIR, 'hero-real-life-desktop-agri.png');
  await page.screenshot({ path: shot1, fullPage: false });
  console.log('Saved:', shot1);

  // 2. Click Aquaculture tab using data-testid
  await page.click('[data-testid="hero-tab-aquaculture"]');
  await new Promise((r) => setTimeout(r, 1000));
  const shot2 = path.join(ARTIFACT_DIR, 'hero-real-life-desktop-aqua.png');
  await page.screenshot({ path: shot2, fullPage: false });
  console.log('Saved:', shot2);

  // 3. Click Shop & Godown tab using data-testid
  await page.click('[data-testid="hero-tab-shop-stock"]');
  await new Promise((r) => setTimeout(r, 1000));
  const shot3 = path.join(ARTIFACT_DIR, 'hero-real-life-desktop-shop.png');
  await page.screenshot({ path: shot3, fullPage: false });
  console.log('Saved:', shot3);

  // 4. Tablet - 768x1024
  await page.setViewport({ width: 768, height: 1024 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1000));
  const shotTablet = path.join(ARTIFACT_DIR, 'hero-real-life-tablet-768px.png');
  await page.screenshot({ path: shotTablet, fullPage: false });
  console.log('Saved:', shotTablet);

  // 5. Mobile - 390x844
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1000));
  const shotMobile = path.join(ARTIFACT_DIR, 'hero-real-life-mobile-390px.png');
  await page.screenshot({ path: shotMobile, fullPage: false });
  console.log('Saved:', shotMobile);

  await browser.close();
  console.log('--- ALL SCREENSHOTS SUCCESSFULLY CAPTURED ---');
}

testHero().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
