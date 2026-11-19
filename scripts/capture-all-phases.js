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

  console.log('1. Logging in as Owner...');
  await page.goto('http://localhost:3000/admin/login', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1000));
  await page.type('input[placeholder="admin@ahammedfertilizer.com"]', 'admin@ahammedfertilizer.com');
  await page.type('input[placeholder="••••••••••••"]', 'Ahammed@2026');
  await page.click('button[type="submit"]');
  await new Promise((r) => setTimeout(r, 2000));

  console.log('2. Capturing Dashboard...');
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'desktop-dashboard.png') });
  console.log('Saved desktop-dashboard.png');

  console.log('3. Loading POS screen and billing a sample cart...');
  await page.goto('http://localhost:3000/admin/pos', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1500));

  // Click the first product to add to cart
  const productButtons = await page.$$('button');
  // Click first 2 product items in catalog
  for (let btn of productButtons) {
    const text = await page.evaluate((el) => el.innerText, btn);
    if (text.includes('IFFCO Neem Coated Urea') || text.includes('FMC Coragen')) {
      await btn.click();
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'desktop-pos.png') });
  console.log('Saved desktop-pos.png');

  console.log('4. Generating Bill / Completing Sale for Invoice...');
  // Click Generate Bill
  const allBtns = await page.$$('button');
  for (let btn of allBtns) {
    const text = await page.evaluate((el) => el.innerText, btn);
    if (text.includes('GENERATE BILL')) {
      await btn.click();
      break;
    }
  }
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'desktop-invoice.png') });
  console.log('Saved desktop-invoice.png');

  console.log('5. Loading Customers Credit Ledger...');
  await page.goto('http://localhost:3000/admin/customers', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'desktop-customers.png') });
  console.log('Saved desktop-customers.png');

  console.log('6. Loading Reports & P&L...');
  await page.goto('http://localhost:3000/admin/reports', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'desktop-reports.png') });
  console.log('Saved desktop-reports.png');

  console.log('7. Loading Shop Expenses...');
  await page.goto('http://localhost:3000/admin/expenses', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'desktop-expenses.png') });
  console.log('Saved desktop-expenses.png');

  console.log('8. Loading Store Settings...');
  await page.goto('http://localhost:3000/admin/settings', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'desktop-settings.png') });
  console.log('Saved desktop-settings.png');

  console.log('9. Mobile POS Viewport Test (390px)...');
  await page.setViewport({ width: 390, height: 844, isMobile: true });
  await page.goto('http://localhost:3000/admin/pos', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'mobile-pos.png') });
  console.log('Saved mobile-pos.png');

  await browser.close();
  console.log('🎉 ALL SCREENSHOTS SUCCESSFULLY CAPTURED!');
}

run().catch((err) => {
  console.error('Error during capture:', err);
  process.exit(1);
});
