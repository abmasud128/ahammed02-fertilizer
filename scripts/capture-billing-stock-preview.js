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
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();

  // 1. Log in to Admin
  console.log('1. Logging in to Admin...');
  await page.goto('http://localhost:3000/admin/login', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1000));
  await page.type('input[placeholder="admin@ahammedfertilizer.com"]', 'admin@ahammedfertilizer.com');
  await page.type('input[placeholder="••••••••••••"]', 'Ahammed@2026');
  await page.click('button[type="submit"]');
  await new Promise((r) => setTimeout(r, 2000));

  // 2. POS Screen
  console.log('2. Loading POS Screen...');
  await page.goto('http://localhost:3000/admin/pos', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1500));

  // Add items with variant
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const variantBtn = btns.find(b => b.innerText && b.innerText.includes('50 kg bag'));
    if (variantBtn) {
      variantBtn.click();
    } else {
      const prodCard = btns.find(b => b.innerText && (b.innerText.includes('Urea') || b.innerText.includes('DAP')));
      if (prodCard) prodCard.click();
    }

    const otherProd = btns.find(b => b.innerText && (b.innerText.includes('Coragen') || b.innerText.includes('Bavistin')));
    if (otherProd) otherProd.click();
  });

  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'preview-pos-billing.png') });
  console.log('Saved preview-pos-billing.png');

  // 3. Open Bill / Invoice Modal
  console.log('3. Opening Receipt / Invoice Modal...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const genBtn = btns.find(b => b.innerText && (b.innerText.includes('GENERATE BILL') || b.innerText.includes('COLLECT CASH')));
    if (genBtn) genBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1800));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'preview-pos-invoice.png') });
  console.log('Saved preview-pos-invoice.png');

  // 4. Stock Management Page
  console.log('4. Loading Stock Management...');
  await page.goto('http://localhost:3000/admin/stock', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'preview-stock-management.png') });
  console.log('Saved preview-stock-management.png');

  // 5. Open Stock Adjustment Modal
  console.log('5. Opening Stock Adjustment Modal...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const adjBtn = btns.find(b => b.innerText && (b.innerText.includes('Adjust') || b.innerText.includes('Stock Adjustment')));
    if (adjBtn) adjBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'preview-stock-adjustment.png') });
  console.log('Saved preview-stock-adjustment.png');

  // 6. Close Modal & Switch to Stock Movements Tab
  console.log('6. Switching to Movement Ledger...');
  await page.keyboard.press('Escape');
  await new Promise((r) => setTimeout(r, 600));

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const movTab = btns.find(b => b.innerText && (b.innerText.includes('Movement') || b.innerText.includes('Ledger') || b.innerText.includes('History')));
    if (movTab) movTab.click();
  });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'preview-stock-movements.png') });
  console.log('Saved preview-stock-movements.png');

  // 7. Mobile POS
  console.log('7. Mobile View of POS...');
  await page.setViewport({ width: 390, height: 844, isMobile: true });
  await page.goto('http://localhost:3000/admin/pos', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'preview-mobile-pos.png') });
  console.log('Saved preview-mobile-pos.png');

  await browser.close();
  console.log('ALL PREVIEWS CAPTURED SUCCESSFULLY!');
}

run().catch((err) => {
  console.error('Error during capture:', err);
  process.exit(1);
});
