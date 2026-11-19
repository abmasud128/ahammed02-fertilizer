import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\Sk Najmul Hasan\\.gemini\\antigravity\\brain\\f30b9712-4688-4c31-8061-eabc4fd00b11\\screenshots';

async function main() {
  if (!fs.existsSync(ARTIFACT_DIR)) {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  }

  console.log('--- STARTING PREMIUM HEADER & HERO VERIFICATION ---');
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

  // 1. Top Header & Hero Section (Desktop 1440x900)
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1500));

  const shot1 = path.join(ARTIFACT_DIR, 'premium-hero-header-1440px.png');
  await page.screenshot({ path: shot1, fullPage: false });
  console.log('Saved 1:', shot1);

  // 2. Scrolled Header (showing glassmorphism with Call Section)
  await page.evaluate(() => {
    window.scrollTo({ top: 380, behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 800));
  const shot2 = path.join(ARTIFACT_DIR, 'premium-header-scrolled-1440px.png');
  await page.screenshot({ path: shot2, clip: { x: 0, y: 0, width: 1440, height: 160 } });
  console.log('Saved 2:', shot2);

  // 3. Clean Light Real-Life Background: About Us Section
  await page.evaluate(() => {
    window.scrollTo({ top: 1800, behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 800));
  const shot3 = path.join(ARTIFACT_DIR, 'premium-about-light-bg-1440px.png');
  await page.screenshot({ path: shot3, fullPage: false });
  console.log('Saved 3:', shot3);

  // 4. Clean Light Real-Life Background: Featured Products Section
  await page.evaluate(() => {
    window.scrollTo({ top: 2350, behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 800));
  const shot4 = path.join(ARTIFACT_DIR, 'premium-featured-products-light-bg-1440px.png');
  await page.screenshot({ path: shot4, fullPage: false });
  console.log('Saved 4:', shot4);

  // 5. Mobile Viewport (390x844)
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1200));

  const shot5 = path.join(ARTIFACT_DIR, 'premium-hero-header-mobile-390px.png');
  await page.screenshot({ path: shot5, fullPage: false });
  console.log('Saved 5:', shot5);

  await browser.close();
  console.log('--- ALL PREMIUM SCREENSHOTS CAPTURED ---');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
