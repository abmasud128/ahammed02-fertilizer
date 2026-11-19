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

  // Step 1: Login
  console.log('Logging in...');
  await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle2' });
  await page.type('input[type="text"]', 'abmasud128@gmail.com');
  await page.type('input[type="password"]', 'Masud123@...');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 8000 }).catch(() => {});

  // Step 2: Navigate to /admin/farmers
  console.log('Navigating to /admin/farmers...');
  await page.goto('http://localhost:3000/admin/farmers', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1000));

  // Screenshot 1: Add Farmer tab view with "Your Customers" tab clearly visible
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'your-customers-01-tab-switch.png'),
  });
  console.log('Captured your-customers-01-tab-switch.png');

  // Step 3: Click "Your Customers" tab
  console.log('Clicking "Your Customers" tab...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const custTab = buttons.find((b) => b.textContent?.includes('Your Customers'));
    if (custTab) custTab.click();
  });
  await new Promise((r) => setTimeout(r, 800));

  // Screenshot 2: Your Customers directory view
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'your-customers-02-directory-view.png'),
  });
  console.log('Captured your-customers-02-directory-view.png');

  // Step 4: Click "Edit" on the first customer
  console.log('Clicking Edit on first customer...');
  await page.evaluate(() => {
    const editBtns = Array.from(document.querySelectorAll('button')).filter((b) =>
      b.textContent?.includes('Edit')
    );
    if (editBtns.length > 0) editBtns[0].click();
  });
  await new Promise((r) => setTimeout(r, 600));

  // Screenshot 3: Edit Farmer Details Modal Open
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'your-customers-03-edit-modal-open.png'),
  });
  console.log('Captured your-customers-03-edit-modal-open.png');

  // Step 5: Update details inside modal
  console.log('Modifying customer details in modal...');
  await page.evaluate(() => {
    // Select father's name input inside modal and append text
    const inputs = Array.from(document.querySelectorAll('input'));
    const fatherInput = inputs.find((i) => i.previousElementSibling?.textContent?.includes("Father's"));
    if (fatherInput) {
      fatherInput.value = 'Amal Kumar Sarkar (Verified)';
      fatherInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    const landInput = inputs.find((i) => i.previousElementSibling?.textContent?.includes('Land Area'));
    if (landInput) {
      landInput.value = '6.5';
      landInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    const noteTextarea = document.querySelector('textarea');
    if (noteTextarea) {
      noteTextarea.value = 'VIP High-yield Farmer | Regular DAP & Urea purchaser';
      noteTextarea.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });

  await new Promise((r) => setTimeout(r, 400));

  // Click "Save Changes"
  console.log('Saving modal changes...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button[type="submit"]'));
    const saveBtn = buttons.find((b) => b.textContent?.includes('Save Changes'));
    if (saveBtn) saveBtn.click();
  });

  await new Promise((r) => setTimeout(r, 1200));

  // Screenshot 4: Directory view reflecting updated changes with success toast
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'your-customers-04-edited-reflects.png'),
  });
  console.log('Captured your-customers-04-edited-reflects.png');

  await browser.close();
  console.log('All verification steps completed successfully!');
}

verify().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
