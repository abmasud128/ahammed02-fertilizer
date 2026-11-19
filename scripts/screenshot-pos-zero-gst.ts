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

  // Login
  console.log('Logging in...');
  await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const ownerBtn = buttons.find((b) => b.textContent && b.textContent.includes('Owner'));
    if (ownerBtn) ownerBtn.click();
  });
  await new Promise((r) => setTimeout(r, 400));

  // Submit form
  await page.evaluate(() => {
    const submitBtn = document.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (submitBtn) submitBtn.click();
  });
  await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
  await new Promise((r) => setTimeout(r, 1200));

  // 1. POS Desktop Desk (Zero GST, Clean Cart, Split Payment Assistance)
  console.log('Navigating to POS Desk (Desktop)...');
  await page.goto('http://localhost:3000/admin/pos', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1200));

  // Add 1 item as full pack and 1 item as loose sale
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('button')).filter((b) => b.querySelector('h4'));
    if (cards.length > 0) cards[0].click();
  });
  await new Promise((r) => setTimeout(r, 500));

  await page.evaluate(() => {
    const looseBtns = Array.from(document.querySelectorAll('button')).filter((b) => b.textContent && b.textContent.includes('Loose'));
    if (looseBtns.length > 1) {
      looseBtns[1].click();
    } else if (looseBtns.length > 0) {
      looseBtns[0].click();
    }
  });
  await new Promise((r) => setTimeout(r, 600));

  // Switch to Split payment mode to show the new allocation helper
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const splitBtn = buttons.find((b) => b.textContent && b.textContent.includes('Split'));
    if (splitBtn) splitBtn.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'pos-zero-gst-desktop.png'),
    fullPage: false,
  });
  console.log('Saved pos-zero-gst-desktop.png');

  // 2. Open Cash Memo / Invoice Modal
  console.log('Generating bill to preview receipt modal...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const genBtn = buttons.find((b) => b.textContent && b.textContent.includes('GENERATE BILL'));
    if (genBtn) genBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1500));

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'pos-cash-memo-modal.png'),
    fullPage: false,
  });
  console.log('Saved pos-cash-memo-modal.png');

  // 3. Mobile View of POS Cart (390px)
  console.log('Capturing mobile view (390px)...');
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://localhost:3000/admin/pos', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1000));

  // Add item
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('button')).filter((b) => b.querySelector('h4'));
    if (cards.length > 0) cards[0].click();
  });
  await new Promise((r) => setTimeout(r, 500));

  // Switch to cart tab
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const cartBtn = buttons.find((b) => b.textContent && b.textContent.includes('Cart'));
    if (cartBtn) cartBtn.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'pos-zero-gst-mobile-390px.png'),
    fullPage: false,
  });
  console.log('Saved pos-zero-gst-mobile-390px.png');

  await browser.close();
  console.log('Screenshot capture finished successfully!');
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});
