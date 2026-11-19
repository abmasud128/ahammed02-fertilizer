const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = 'C:\\Users\\Sk Najmul Hasan\\.gemini\\antigravity\\brain\\f30b9712-4688-4c31-8061-eabc4fd00b11\\screenshots';

async function run() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  // Find Chrome or Edge executable
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const executablePath = fs.existsSync(chromePath) ? chromePath : edgePath;

  console.log('Launching browser with:', executablePath);
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();

  // 1. Capture Public Website Homepage
  console.log('Capturing Public Website Homepage...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'public-home-1440px.png') });

  // 2. Capture Public Website Products
  console.log('Capturing Public Products...');
  await page.goto('http://localhost:3000/products', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'public-products-1440px.png') });

  // 3. Log in to Admin
  console.log('Logging in to Admin...');
  await page.goto('http://localhost:3000/admin/login', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1000));
  await page.type('input[placeholder="admin@ahammedfertilizer.com"]', 'admin@ahammedfertilizer.com');
  await page.type('input[placeholder="••••••••••••"]', 'Ahammed@2026');
  await page.click('button[type="submit"]');
  await new Promise((r) => setTimeout(r, 2000));

  // 4. Capture Admin POS with Variants and Billing Enhancements
  console.log('Capturing POS with unit variants...');
  await page.goto('http://localhost:3000/admin/pos', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1500));

  // Add Urea 50kg bag variant and Coragen to cart
  const buttons = await page.$$('button');
  for (let btn of buttons) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text.includes('50 kg bag')) {
      await btn.click();
      await new Promise(r => setTimeout(r, 400));
      break;
    }
  }

  // Type a customer discount
  const discountInput = await page.$('input[placeholder="0"]');
  if (discountInput) {
    await discountInput.type('50');
  }

  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'pos-variants-desk.png') });

  // 5. Open invoice modal
  const allBtns = await page.$$('button');
  for (let btn of allBtns) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text.includes('GENERATE BILL') || text.includes('COLLECT CASH')) {
      await btn.click();
      break;
    }
  }
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'pos-thermal-invoice.png') });

  // 6. Mobile View (390x844)
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'public-home-mobile.png') });

  await browser.close();
  console.log('All fresh screenshots captured!');
}

run().catch((err) => {
  console.error('Error during capture:', err);
  process.exit(1);
});
