import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = 'C:/Users/Sk Najmul Hasan/.gemini/antigravity/brain/f30b9712-4688-4c31-8061-eabc4fd00b11/screenshots';
const EDGE_PATH = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // First, log in as owner
  console.log('Navigating to login page...');
  await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 600));

  // Click Quick Login Demo Profile (Owner Account)
  console.log('Logging in with Owner Account...');
  const ownerBtn = await page.evaluateHandle(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.find((b) => b.textContent && b.textContent.includes('Owner Account'));
  });
  if (ownerBtn) {
    await ownerBtn.click();
    await new Promise((r) => setTimeout(r, 400));
  }
  await page.click('button[type="submit"]');
  await new Promise((r) => setTimeout(r, 1500));

  // 1. Capture POS Mobile (390px) - Catalog View with Floating Cart
  console.log('Testing POS on Mobile (390px)...');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000/admin/pos', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1000));

  // Click first product card to add to cart
  const productButtons = await page.$$('button.rounded-xl.border');
  if (productButtons.length > 0) {
    await productButtons[0].click();
    await new Promise((r) => setTimeout(r, 400));
  }
  if (productButtons.length > 1) {
    await productButtons[1].click();
    await new Promise((r) => setTimeout(r, 400));
  }

  // Save POS Mobile Catalog screenshot
  const posMobileCatalogPath = path.join(SCREENSHOT_DIR, 'pos-mobile-catalog-390px.png');
  await page.screenshot({ path: posMobileCatalogPath, fullPage: false });
  console.log(`Saved: ${posMobileCatalogPath}`);

  // Switch to Cart tab on mobile
  console.log('Switching to Cart tab on mobile...');
  const cartTabBtn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find((b) => b.textContent && b.textContent.includes('Cart'));
  });
  if (cartTabBtn) {
    await cartTabBtn.click();
    await new Promise((r) => setTimeout(r, 800));
  }

  // Save POS Mobile Cart screenshot
  const posMobileCartPath = path.join(SCREENSHOT_DIR, 'pos-mobile-cart-390px.png');
  await page.screenshot({ path: posMobileCartPath, fullPage: false });
  console.log(`Saved: ${posMobileCartPath}`);

  // 2. Capture Admin Products Mobile Cards (390px)
  console.log('Testing Admin Products on Mobile (390px)...');
  await page.goto('http://localhost:3000/admin/products', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1000));
  const adminProductsMobilePath = path.join(SCREENSHOT_DIR, 'admin-products-mobile-390px.png');
  await page.screenshot({ path: adminProductsMobilePath, fullPage: false });
  console.log(`Saved: ${adminProductsMobilePath}`);

  // 3. Capture Admin Dashboard on Mobile (390px)
  console.log('Testing Admin Dashboard on Mobile (390px)...');
  await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1000));
  const adminDashboardMobilePath = path.join(SCREENSHOT_DIR, 'admin-dashboard-mobile-390px.png');
  await page.screenshot({ path: adminDashboardMobilePath, fullPage: false });
  console.log(`Saved: ${adminDashboardMobilePath}`);

  // 4. Capture POS on Tablet (768px)
  console.log('Testing POS on Tablet (768px)...');
  await page.setViewport({ width: 768, height: 1024, isMobile: false, hasTouch: false });
  await page.goto('http://localhost:3000/admin/pos', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1000));
  const posTabletPath = path.join(SCREENSHOT_DIR, 'pos-tablet-768px.png');
  await page.screenshot({ path: posTabletPath, fullPage: false });
  console.log(`Saved: ${posTabletPath}`);

  await browser.close();
  console.log('All mobile POS and admin tests completed successfully!');
}

run().catch((err) => {
  console.error('Error running mobile POS test:', err);
  process.exit(1);
});
