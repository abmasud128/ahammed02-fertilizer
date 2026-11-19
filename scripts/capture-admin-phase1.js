const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = 'C:\\Users\\Sk Najmul Hasan\\.gemini\\antigravity\\brain\\f30b9712-4688-4c31-8061-eabc4fd00b11\\screenshots';

async function run() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    defaultViewport: { width: 1366, height: 850 },
  });

  const page = await browser.newPage();

  console.log('1. Loading login page...');
  await page.goto('http://localhost:3000/admin/login', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'phase1-login.png') });
  console.log('Saved phase1-login.png');

  console.log('2. Submitting login credentials...');
  await page.type('input[placeholder="admin@ahammedfertilizer.com"]', 'admin@ahammedfertilizer.com');
  await page.type('input[placeholder="••••••••••••"]', 'Ahammed@2026');
  await page.click('button[type="submit"]');

  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'phase1-dashboard.png') });
  console.log('Saved phase1-dashboard.png');

  console.log('3. Loading products page...');
  await page.goto('http://localhost:3000/admin/products', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'phase1-products.png') });
  console.log('Saved phase1-products.png');

  console.log('4. Loading stock & batch page...');
  await page.goto('http://localhost:3000/admin/stock', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'phase1-stock.png') });
  console.log('Saved phase1-stock.png');

  console.log('5. Loading suppliers & purchases page...');
  await page.goto('http://localhost:3000/admin/suppliers', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'phase1-suppliers.png') });
  console.log('Saved phase1-suppliers.png');

  // Mobile viewport screenshot of dashboard
  console.log('6. Mobile viewport test of Dashboard...');
  await page.setViewport({ width: 390, height: 844, isMobile: true });
  await page.goto('http://localhost:3000/admin', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'phase1-dashboard-mobile.png') });
  console.log('Saved phase1-dashboard-mobile.png');

  await browser.close();
  console.log('ALL PHASE 1 SCREENSHOTS COMPLETE!');
}

run().catch((err) => {
  console.error('Screenshot script error:', err);
  process.exit(1);
});
