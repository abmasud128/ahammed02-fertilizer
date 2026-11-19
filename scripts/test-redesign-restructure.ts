import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\Sk Najmul Hasan\\.gemini\\antigravity\\brain\\f30b9712-4688-4c31-8061-eabc4fd00b11\\screenshots';

async function testRedesign() {
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

  console.log('--- STARTING COMPREHENSIVE REDESIGN VERIFICATION ---');

  // 1. Desktop Homepage Top (Hero + Action Panel) - 1440x900
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1200));

  const shot1 = path.join(ARTIFACT_DIR, 'redesign-hero-action-panel-1440px.png');
  await page.screenshot({ path: shot1, fullPage: false });
  console.log('Saved 1:', shot1);

  // 2. Scroll to Plant Biology Section
  await page.evaluate(() => {
    window.scrollTo({ top: 780, behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 1000));
  const shot2 = path.join(ARTIFACT_DIR, 'redesign-plant-biology-1440px.png');
  await page.screenshot({ path: shot2, fullPage: false });
  console.log('Saved 2:', shot2);

  // 3. Scroll to Products & Services Slider & Full-Width Photo
  await page.evaluate(() => {
    window.scrollTo({ top: 1550, behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 1000));
  const shot3 = path.join(ARTIFACT_DIR, 'redesign-products-services-1440px.png');
  await page.screenshot({ path: shot3, fullPage: false });
  console.log('Saved 3:', shot3);

  // 4. Scroll to Full-Width Banner
  await page.evaluate(() => {
    window.scrollTo({ top: 2350, behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 1000));
  const shot4 = path.join(ARTIFACT_DIR, 'redesign-fullwidth-farm-banner-1440px.png');
  await page.screenshot({ path: shot4, fullPage: false });
  console.log('Saved 4:', shot4);

  // 5. Scroll to Crop Fertilizer Calculator
  await page.evaluate(() => {
    window.scrollTo({ top: 3100, behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 1000));
  const shot5 = path.join(ARTIFACT_DIR, 'redesign-crop-calculator-1440px.png');
  await page.screenshot({ path: shot5, fullPage: false });
  console.log('Saved 5:', shot5);

  // 6. Test Dedicated Aquaculture Page (/aquaculture)
  await page.goto('http://localhost:3000/aquaculture', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1200));
  const shot6 = path.join(ARTIFACT_DIR, 'redesign-aquaculture-portal-hero-1440px.png');
  await page.screenshot({ path: shot6, fullPage: false });
  console.log('Saved 6:', shot6);

  // Scroll on Aquaculture Page to view moved tools & calculator
  await page.evaluate(() => {
    window.scrollTo({ top: 850, behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 1000));
  const shot7 = path.join(ARTIFACT_DIR, 'redesign-aquaculture-tools-calc-1440px.png');
  await page.screenshot({ path: shot7, fullPage: false });
  console.log('Saved 7:', shot7);

  // 7. Mobile View (390x844) - Homepage Hero + Action Panel
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1200));
  const shot8 = path.join(ARTIFACT_DIR, 'redesign-hero-mobile-390px.png');
  await page.screenshot({ path: shot8, fullPage: false });
  console.log('Saved 8:', shot8);

  await browser.close();
  console.log('--- ALL REDESIGN SCREENSHOTS CAPTURED ---');
}

testRedesign().catch(err => {
  console.error('Error in test:', err);
  process.exit(1);
});
