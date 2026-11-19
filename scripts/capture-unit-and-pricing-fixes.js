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

  // 2. POS Screen with Unit Dropdown & Editable Price
  console.log('2. Loading POS Screen...');
  await page.goto('http://localhost:3000/admin/pos', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1500));

  // Add Urea to cart by clicking product card
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const ureaCard = btns.find(b => b.innerText && b.innerText.includes('Urea'));
    if (ureaCard) ureaCard.click();
    const potashCard = btns.find(b => b.innerText && b.innerText.includes('potash'));
    if (potashCard) potashCard.click();
  });
  await new Promise((r) => setTimeout(r, 1000));

  // Switch Urea to 1 kg loose variant and increase quantity to 12
  await page.evaluate(() => {
    const selects = Array.from(document.querySelectorAll('select'));
    selects.forEach(s => {
      const option1kg = Array.from(s.options).find(o => o.text.includes('1 kg') || o.text.includes('1 KG'));
      if (option1kg) {
        s.value = option1kg.value;
        s.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  });
  await new Promise((r) => setTimeout(r, 1000));

  // Increase quantity to 12 using the plus button
  for (let i = 0; i < 11; i++) {
    await page.evaluate(() => {
      const plusBtns = Array.from(document.querySelectorAll('button')).filter(b => b.querySelector('svg.lucide-plus'));
      if (plusBtns[0]) plusBtns[0].click();
    });
    await new Promise((r) => setTimeout(r, 100));
  }
  await new Promise((r) => setTimeout(r, 1000));

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'pos-unit-dropdown-and-price-override.png') });
  console.log('Saved pos-unit-dropdown-and-price-override.png');

  // 3. Product Catalog Table with Dual Base Weight Display
  console.log('3. Loading Product Master Catalog...');
  await page.goto('http://localhost:3000/admin/products', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'product-catalog-dual-stock.png') });
  console.log('Saved product-catalog-dual-stock.png');

  // 4. Open Add Product Modal with Base Weight & Pinned Unit
  console.log('4. Opening Add Product Modal...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const addBtn = btns.find(b => b.innerText && b.innerText.includes('Add New Product'));
    if (addBtn) addBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1000));

  // Type 220 bags in opening quantity to show live badge
  await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input[type="number"]'));
    const openQtyInput = inputs.find(inp => inp.parentElement && inp.parentElement.innerText.includes('Opening Quantity'));
    if (openQtyInput) {
      openQtyInput.value = '220';
      openQtyInput.dispatchEvent(new Event('input', { bubbles: true }));
      openQtyInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'product-add-modal-base-weight.png') });
  console.log('Saved product-add-modal-base-weight.png');

  // 5. Stock Overview Page
  console.log('5. Loading Stock Management Overview...');
  await page.goto('http://localhost:3000/admin/stock', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'stock-overview-dual-display.png') });
  console.log('Saved stock-overview-dual-display.png');

  await browser.close();
  console.log('ALL VERIFICATION SCREENSHOTS CAPTURED SUCCESSFULLY!');
}

run().catch((err) => {
  console.error('Error during capture:', err);
  process.exit(1);
});
