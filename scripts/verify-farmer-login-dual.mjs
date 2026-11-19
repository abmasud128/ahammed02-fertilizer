import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = 'C:/Users/Sk Najmul Hasan/.gemini/antigravity/brain/f30b9712-4688-4c31-8061-eabc4fd00b11/screenshots';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function verify() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });

  page.on('console', (msg) => {
    const text = msg.text();
    if (!text.includes('Download the React DevTools')) {
      console.log('BROWSER LOG:', text);
    }
  });

  // Step 1: Navigate to /farmer/login
  console.log('Navigating to /farmer/login...');
  await page.goto('http://localhost:3000/farmer/login', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 600));

  // Screenshot 1: Dual Options (Fertilizer vs Aquaculture)
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'farmer-login-01-dual-options.png'),
  });
  console.log('Captured farmer-login-01-dual-options.png');

  // Step 2: Click "For Fertilizer"
  console.log('Clicking "1. For Fertilizer" option...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const fertBtn = buttons.find((b) => b.textContent?.includes('সার ও কৃষি চাষী') || b.textContent?.includes('For Fertilizer'));
    if (fertBtn) fertBtn.click();
  });
  await new Promise((r) => setTimeout(r, 500));

  // Step 3: Enter Phone Number and Password (first 6 digits)
  console.log('Entering credentials for Fertilizer Farmer Subrata Roy...');
  await page.type('input[placeholder*="10-digit mobile"]', '9832145678');
  await page.type('input[placeholder*="৬টি সংখ্যা"], input[placeholder*="first 6 digits"]', '983214');
  await new Promise((r) => setTimeout(r, 400));

  // Screenshot 2: Fertilizer Login Form with Phone & 6-digit Password
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'farmer-login-02-fertilizer-login-form.png'),
  });
  console.log('Captured farmer-login-02-fertilizer-login-form.png');

  // Step 4: Click Log In to Fertilizer Records
  console.log('Submitting login form...');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 8000 }).catch(() => {});
  await new Promise((r) => setTimeout(r, 1000));

  console.log('Current URL after login:', page.url());

  // Screenshot 3: Fertilizer Records Dashboard (Public details only)
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'farmer-login-03-fertilizer-records-dashboard.png'),
  });
  console.log('Captured farmer-login-03-fertilizer-records-dashboard.png');

  // Step 5: Test Aquaculture Login Option
  console.log('Testing Aquaculture Login Option...');
  await page.goto('http://localhost:3000/farmer/login', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 600));

  // Click "For Aquaculture"
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const aquaBtn = buttons.find((b) => b.textContent?.includes('মৎস্য চাষী') || b.textContent?.includes('For Aquaculture'));
    if (aquaBtn) aquaBtn.click();
  });
  await new Promise((r) => setTimeout(r, 500));

  // Enter Aqua Mobile 9876543210 and password 987654 (first 6 digits)
  await page.type('input[placeholder*="10-digit mobile"]', '9876543210');
  await page.type('input[placeholder*="৬টি সংখ্যা"], input[placeholder*="first 6 digits"]', '987654');
  await new Promise((r) => setTimeout(r, 400));

  // Screenshot 4: Aqua Login Form
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'farmer-login-04-aqua-login-form.png'),
  });
  console.log('Captured farmer-login-04-aqua-login-form.png');

  // Submit Aqua Login
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 8000 }).catch(() => {});
  await new Promise((r) => setTimeout(r, 1000));

  console.log('Current URL after aqua login:', page.url());

  // Screenshot 5: Aqua Dashboard
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'farmer-login-05-aqua-dashboard.png'),
  });
  console.log('Captured farmer-login-05-aqua-dashboard.png');

  await browser.close();
  console.log('All verification steps completed successfully!');
}

verify().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
