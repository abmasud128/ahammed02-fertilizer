import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\Sk Najmul Hasan\\.gemini\\antigravity\\brain\\f30b9712-4688-4c31-8061-eabc4fd00b11\\screenshots';

async function capture() {
  if (!fs.existsSync(ARTIFACT_DIR)) {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    defaultViewport: { width: 1366, height: 768 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // 1. Home Page: Aquaculture Showcase and Agri-Aqua Calculator (Desktop)
  console.log('Capturing Home Page with Aquaculture & Agri-Aqua Calculator (Desktop)...');
  await page.setViewport({ width: 1366, height: 850 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1000));
  
  // Scroll down to the Agri-Aqua calculator section
  await page.evaluate(() => {
    window.scrollBy(0, 1600);
  });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'home-aquaculture-and-calculator-desktop.png'),
    fullPage: false,
  });

  // 2. Home Page: Mobile 390px view of calculator
  console.log('Capturing Home Page Calculator (Mobile 390px)...');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1000));
  await page.evaluate(() => {
    window.scrollBy(0, 2200);
  });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'home-calculator-mobile-390px.png'),
    fullPage: false,
  });

  // 3. Upgraded Aquaculture Knowledge & Troubleshooter Page (Desktop)
  console.log('Capturing Upgraded Aquaculture Knowledge & Troubleshooter Page (Desktop)...');
  await page.setViewport({ width: 1366, height: 850 });
  await page.goto('http://localhost:3000/aquaculture', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'aquaculture-troubleshooter-desktop.png'),
    fullPage: false,
  });

  // 4. Aquaculture Products Catalog (Desktop)
  console.log('Capturing Products Catalog with Aquaculture Category (Desktop)...');
  await page.goto('http://localhost:3000/products?category=aquaculture', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'products-aquaculture-catalog-desktop.png'),
    fullPage: false,
  });

  console.log('All elevated storefront screenshots captured successfully!');
  await browser.close();
}

capture().catch((err) => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
