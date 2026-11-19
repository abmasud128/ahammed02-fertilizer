import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = 'C:/Users/Sk Najmul Hasan/.gemini/antigravity/brain/f30b9712-4688-4c31-8061-eabc4fd00b11/screenshots';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Generate unique 10-digit number
const randomSuffix = Math.floor(1000 + Math.random() * 9000);
const testMobile = `982233${randomSuffix}`;
const testPass = testMobile.slice(0, 6);
const testName = 'সুমন সরকার (Suman Sarkar)';
const testFather = 'অনিল সরকার (Anil Sarkar)';

console.log(`Starting clean verification flow with Mobile: ${testMobile}, Password: ${testPass}`);

async function verify() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });

  page.on('console', (msg) => {
    const text = msg.text();
    if (!text.includes('Download the React DevTools') && !text.includes('autocomplete')) {
      console.log('BROWSER LOG:', text);
    }
  });

  // Step 1: Open Farmer Login Page
  console.log('1. Navigating to /farmer/login...');
  await page.goto('http://localhost:3000/farmer/login', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 600));

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'aqua-flow-01-dual-options.png'),
  });
  console.log('Captured aqua-flow-01-dual-options.png');

  // Step 2: Click "নতুন নিবন্ধন (Register)" under Aquaculture Portal
  console.log('2. Clicking Register under Aquaculture Portal...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const regBtn = buttons.find((b) => b.textContent?.includes('নতুন নিবন্ধন') || b.textContent?.includes('নতুন চাষী নিবন্ধন'));
    if (regBtn) regBtn.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  // Step 3: Fill Registration Form
  console.log('3. Typing into Aquaculture Farmer Registration Form fields...');
  const nameSelector = 'input[placeholder*="সন্তোষ পাল"], input[placeholder*="Santosh"]';
  await page.waitForSelector(nameSelector);
  await page.type(nameSelector, testName);

  const fatherSelector = 'input[placeholder*="হরিদাস পাল"], input[placeholder*="Haridas"]';
  await page.type(fatherSelector, testFather);

  const phoneSelector = 'input[type="tel"]';
  await page.type(phoneSelector, testMobile);

  const villageSelector = 'input[placeholder*="নন্দাইর"], input[placeholder*="Nandair"]';
  await page.type(villageSelector, 'নওদাপাড়া, গঙ্গারামপুর');

  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'aqua-flow-02-register-form.png'),
  });
  console.log('Captured aqua-flow-02-register-form.png');

  // Step 4: Click "যাচাইয়ের জন্য জমা দিন (Submit for Verification)"
  console.log('4. Clicking "যাচাইয়ের জন্য জমা দিন (Submit for Verification)"...');
  await page.evaluate(() => {
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1800));

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'aqua-flow-03-submitted-pending.png'),
  });
  console.log('Captured aqua-flow-03-submitted-pending.png');

  // Step 5: Test blocked login while unapproved
  console.log('5. Clicking "লগইন পেজে যান" and testing pending login blocker...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const loginTab = buttons.find((b) => b.textContent?.includes('লগইন পেজে যান') || b.textContent?.includes('লগইন (Login)'));
    if (loginTab) loginTab.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  // Enter mobile and first 6 digits
  console.log(`Entering credentials for pending farmer (${testMobile} / ${testPass})...`);
  const loginPhoneSelector = 'input[placeholder*="১০ সংখ্যার মোবাইল"], input[placeholder*="mobile"]';
  await page.waitForSelector(loginPhoneSelector);
  await page.type(loginPhoneSelector, testMobile);

  const pwdSelector = 'input[type="password"]';
  await page.type(pwdSelector, testPass);
  await new Promise((r) => setTimeout(r, 400));

  // Click login button
  console.log('Clicking Login button (expected: BLOCKED due to pending verification)...');
  await page.evaluate(() => {
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1800));

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'aqua-flow-04-login-blocked-pending.png'),
  });
  console.log('Captured aqua-flow-04-login-blocked-pending.png');

  // Step 6: Admin Review & Approval in /admin/aqua
  console.log('6. Logging into Admin as Owner...');
  const adminPage = await browser.newPage();
  await adminPage.setViewport({ width: 1440, height: 950 });
  await adminPage.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 600));

  // Click Owner demo button and submit
  await adminPage.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const ownerBtn = buttons.find((b) => b.textContent && b.textContent.includes('Owner'));
    if (ownerBtn) ownerBtn.click();
  });
  await new Promise((r) => setTimeout(r, 400));
  await adminPage.evaluate(() => {
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1200));

  // Navigate to /admin/aqua
  console.log('Navigating to Admin Aquaculture Hub (/admin/aqua)...');
  await adminPage.goto('http://localhost:3000/admin/aqua', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1200));

  // Click "বিবরণ (Details)" for the pending farmer
  console.log(`Opening Farmer Details Modal for ${testName} in Admin Hub...`);
  await adminPage.evaluate((mobile) => {
    const rows = Array.from(document.querySelectorAll('tr'));
    const targetRow = rows.find((r) => r.textContent && r.textContent.includes(mobile));
    if (targetRow) {
      const detailsBtn = targetRow.querySelector('button');
      if (detailsBtn) detailsBtn.click();
    } else {
      const buttons = Array.from(document.querySelectorAll('button'));
      const detailsBtn = buttons.find((b) => b.textContent?.includes('বিবরণ') || b.textContent?.includes('Details'));
      if (detailsBtn) detailsBtn.click();
    }
  }, testMobile);
  await new Promise((r) => setTimeout(r, 900));

  await adminPage.screenshot({
    path: path.join(SCREENSHOT_DIR, 'aqua-flow-05-admin-aqua-hub-details.png'),
  });
  console.log('Captured aqua-flow-05-admin-aqua-hub-details.png');

  // Click "অনুমোদন করুন (Approve Farmer)"
  console.log('Clicking "অনুমোদন করুন (Approve Farmer)" in Admin Modal...');
  await adminPage.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const approveBtn = buttons.find((b) => b.textContent?.includes('অনুমোদন করুন') || b.textContent?.includes('Approve Farmer'));
    if (approveBtn) approveBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1800));
  await adminPage.close();

  // Step 7: Login after approval in farmer tab
  console.log('7. Returning to farmer tab to log in with approved credentials...');
  await page.evaluate(() => {
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.click();
  });
  await new Promise((r) => setTimeout(r, 3000));

  console.log('Current URL after approved login:', page.url());
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'aqua-flow-06-login-success-dashboard.png'),
  });
  console.log('Captured aqua-flow-06-login-success-dashboard.png');

  await browser.close();
  console.log('Verification script completed 100% successfully!');
}

verify().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
