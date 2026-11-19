import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = 'C:/Users/Sk Najmul Hasan/.gemini/antigravity/brain/f30b9712-4688-4c31-8061-eabc4fd00b11/screenshots';
const EDGE_PATH = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const viewports = [
  { name: 'hero-360px', width: 360, height: 740, isMobile: true },
  { name: 'hero-390px', width: 390, height: 844, isMobile: true },
  { name: 'hero-768px', width: 768, height: 1024, isMobile: false },
  { name: 'hero-1024px', width: 1024, height: 768, isMobile: false },
  { name: 'hero-1440px', width: 1440, height: 900, isMobile: false },
];

async function run() {
  console.log('Launching browser to capture hero across all viewports...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Test across all 5 viewports
  for (const vp of viewports) {
    console.log(`Setting viewport: ${vp.width}x${vp.height} (${vp.name})...`);
    await page.setViewport({
      width: vp.width,
      height: vp.height,
      isMobile: vp.isMobile,
      hasTouch: vp.isMobile,
      deviceScaleFactor: 1,
    });

    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });
    await page.evaluate(() => sessionStorage.setItem('offer-popup-dismissed', 'true'));
    // Allow Framer Motion reveal and 3D canvas mount
    await new Promise((r) => setTimeout(r, 1800));

    const initialPath = path.join(SCREENSHOT_DIR, `${vp.name}.png`);
    await page.screenshot({ path: initialPath, fullPage: false });
    console.log(`Saved: ${initialPath}`);
  }

  // Also capture scroll parallax state at 1440px
  console.log('Capturing scroll parallax state at 1440px...');
  await page.setViewport({ width: 1440, height: 900, isMobile: false });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    sessionStorage.setItem('offer-popup-dismissed', 'true');
    window.scrollBy({ top: 220, behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 800));
  const scrollPath = path.join(SCREENSHOT_DIR, 'hero-1440px-scrolled.png');
  await page.screenshot({ path: scrollPath, fullPage: false });
  console.log(`Saved: ${scrollPath}`);

  // Also capture Bengali version (reset scroll position first)
  console.log('Capturing Bengali mode at 1440px...');
  await page.evaluate(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    localStorage.setItem('ahammed_language', 'bn');
    sessionStorage.setItem('offer-popup-dismissed', 'true');
    window.location.reload();
  });
  await new Promise((r) => setTimeout(r, 2200));
  await page.evaluate(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 500));
  const bnPath = path.join(SCREENSHOT_DIR, 'hero-1440px-bengali.png');
  await page.screenshot({ path: bnPath, fullPage: false });
  console.log(`Saved: ${bnPath}`);

  await browser.close();
  console.log('All hero viewport tests completed!');
}

run().catch((err) => {
  console.error('Error during viewport tests:', err);
  process.exit(1);
});
