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

  // 1. Public Aquaculture Page (Desktop)
  console.log('Capturing Public Aquaculture page...');
  await page.goto('http://localhost:3000/aquaculture', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'aqua-public-knowledge-desktop.png'),
    fullPage: false,
  });

  // 2. Farmer Login Page (Mobile 390px)
  console.log('Capturing Farmer Login page (Mobile)...');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000/farmer/login', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'aqua-farmer-login-mobile.png'),
    fullPage: false,
  });

  // Login as demo farmer
  console.log('Logging in as Farmer...');
  await page.evaluate(() => {
    const fillBtn = document.querySelector('button[type="button"]') as HTMLButtonElement;
    const buttons = Array.from(document.querySelectorAll('button'));
    const prabirBtn = buttons.find((b) => b.textContent && b.textContent.includes('প্রবীর সরকার'));
    if (prabirBtn) prabirBtn.click();
  });
  await new Promise((r) => setTimeout(r, 300));

  await page.evaluate(() => {
    const submitBtn = document.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (submitBtn) submitBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1200));

  // 3. Farmer Dashboard (Mobile 390px)
  console.log('Capturing Farmer Dashboard (Mobile)...');
  await page.goto('http://localhost:3000/farmer/dashboard', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'aqua-farmer-dashboard-mobile.png'),
    fullPage: false,
  });

  // 4. Staff Aquaculture Hub (Desktop 1366px)
  console.log('Logging in as Admin and capturing Staff Aquaculture Hub...');
  await page.setViewport({ width: 1366, height: 768 });
  await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 500));

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const ownerBtn = buttons.find((b) => b.textContent && b.textContent.includes('Owner'));
    if (ownerBtn) ownerBtn.click();
  });
  await new Promise((r) => setTimeout(r, 400));

  await page.evaluate(() => {
    const submitBtn = document.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (submitBtn) submitBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1200));

  await page.goto('http://localhost:3000/admin/aqua', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'aqua-staff-hub-desktop.png'),
    fullPage: false,
  });

  await browser.close();
  console.log('All screenshots captured successfully!');
}

capture().catch((err) => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
