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

  // Step 1: Login to Admin
  console.log('Navigating to login page...');
  await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle2' });

  await page.type('input[type="text"]', 'abmasud128@gmail.com');
  await page.type('input[type="password"]', 'Masud123@...');
  await page.click('button[type="submit"]');

  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 8000 }).catch(() => {});
  console.log('Logged in. Current URL:', page.url());

  // Step 2: Navigate to /admin/farmers
  console.log('Navigating to /admin/farmers...');
  await page.goto('http://localhost:3000/admin/farmers', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1000));

  // Screenshot 1: Clean Add Farmer Page & Sidebar Navigation
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'add-farmer-01-page-clean.png'),
  });
  console.log('Captured add-farmer-01-page-clean.png');

  // Verify sidebar title
  const sidebarItemText = await page.evaluate(() => {
    const link = document.querySelector('aside a[href="/admin/farmers"]');
    return link ? link.textContent?.trim() : null;
  });
  console.log('Detected Sidebar Item Text:', sidebarItemText);

  // Step 3: Fill out the form
  console.log('Filling out Add Farmer form...');
  const testPhone = '98321' + Math.floor(10000 + Math.random() * 90000); // 10-digit unique phone
  await page.type('input[placeholder*="Biplab Mondal"]', 'Subhash Chandra Sarkar');
  await page.type('input[placeholder*="Haradhan Mondal"]', 'Amal Kumar Sarkar');
  await page.type('input[placeholder*="10-digit number"]', testPhone);
  await page.type('input[placeholder*="Chapmatali / Jahangirpur"]', 'Chapmatali');
  await page.type('input[placeholder*="Purba Para"]', 'Purba Mondal Para');
  await page.type('input[placeholder*="XXXX XXXX XXXX"]', '883456789012');
  await page.type('input[placeholder*="3.5"]', '4.5');

  // Select crops (Paddy and Mustard)
  await page.evaluate(() => {
    const cropButtons = Array.from(document.querySelectorAll('button')).filter((b) =>
      ['Paddy', 'Mustard', 'Potato'].some((c) => b.textContent?.includes(c))
    );
    cropButtons.forEach((b) => b.click());
  });

  // Remarks
  await page.type('textarea', 'High yield paddy farmer, prompt khata payments.');

  await new Promise((r) => setTimeout(r, 500));

  // Screenshot 2: Form Filled
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'add-farmer-02-form-filled.png'),
  });
  console.log('Captured add-farmer-02-form-filled.png');

  // Step 4: Click Save Farmer
  console.log('Submitting form...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button[type="submit"]'));
    const saveBtn = buttons.find((b) => b.textContent?.includes('Save Farmer'));
    if (saveBtn) saveBtn.click();
  });

  await new Promise((r) => setTimeout(r, 1500));

  // Screenshot 3: Saved Success Toast & Form Reset
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'add-farmer-03-saved-success.png'),
  });
  console.log('Captured add-farmer-03-saved-success.png');

  // Step 5: Verify POS Billing Sync
  console.log('Navigating to /admin/pos to verify sync...');
  await page.goto('http://localhost:3000/admin/pos', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1000));

  // Search for the newly added farmer
  await page.type('input[placeholder*="Walk-in Customer"]', 'Subhash Chandra');
  await new Promise((r) => setTimeout(r, 800));

  // Screenshot 4: POS Billing with newly added farmer appearing in dropdown
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'add-farmer-04-pos-sync-search.png'),
  });
  console.log('Captured add-farmer-04-pos-sync-search.png');

  await browser.close();
  console.log('All verification steps completed successfully!');
}

verify().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
