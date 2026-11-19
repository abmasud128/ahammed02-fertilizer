const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = 'C:\\Users\\Sk Najmul Hasan\\.gemini\\antigravity\\brain\\f30b9712-4688-4c31-8061-eabc4fd00b11\\screenshots';

async function run() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  let chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  if (!fs.existsSync(chromePath)) {
    chromePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  }

  console.log('Using browser at:', chromePath);

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();

  // 1. Gallery Desktop
  console.log('1. Capturing Gallery page...');
  await page.goto('http://localhost:3000/gallery', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'shop-photos-gallery-top.png') });

  // Scroll down to view the masonry grid
  await page.evaluate(() => window.scrollBy(0, 450));
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'shop-photos-gallery-grid.png') });

  // Click on the first card to open modal lightbox
  console.log('2. Clicking first gallery card to open lightbox modal...');
  const firstCard = await page.$('.columns-1 > div');
  if (firstCard) {
    await firstCard.click();
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'shop-photos-gallery-modal.png') });
    // Close modal
    await page.keyboard.press('Escape');
    await new Promise((r) => setTimeout(r, 500));
  }

  // 3. Homepage About section
  console.log('3. Capturing Homepage About section...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1000));
  // Dismiss promotional modal if open
  await page.keyboard.press('Escape');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find((b) => b.innerText.includes('✕') || b.innerText.includes('Close') || b.getAttribute('aria-label') === 'Close');
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 500));
  await page.evaluate(() => {
    const img = document.querySelector('img[src*="storefront-exterior"]');
    if (img) img.scrollIntoView({ behavior: 'instant', block: 'center' });
    else window.scrollBy(0, 850);
  });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'shop-photos-home-about.png') });

  // 4. About page - Facility
  console.log('4. Capturing About page facility...');
  await page.goto('http://localhost:3000/about', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1000));
  await page.evaluate(() => {
    const h = Array.from(document.querySelectorAll('h2, h3, h4')).find(e => e.innerText.includes('Premises') || e.innerText.includes('গুদামঘর'));
    if (h) h.scrollIntoView({ behavior: 'instant', block: 'start' });
    else window.scrollBy(0, 2100);
  });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'shop-photos-about-facility.png') });

  // 5. Contact page
  console.log('5. Capturing Contact page...');
  await page.goto('http://localhost:3000/contact', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1500));
  await page.evaluate(() => window.scrollBy(0, 450));
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'shop-photos-contact.png') });

  // 6. Mobile Gallery (390px)
  console.log('6. Capturing Mobile Gallery...');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000/gallery', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1500));
  await page.evaluate(() => window.scrollBy(0, 250));
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'shop-photos-gallery-mobile.png') });

  await browser.close();
  console.log('All screenshots captured successfully!');
}

run().catch((err) => {
  console.error('Capture failed:', err);
  process.exit(1);
});
