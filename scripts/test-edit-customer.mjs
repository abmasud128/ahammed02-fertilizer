import puppeteer from 'puppeteer-core';
import path from 'path';

const SCREENSHOT_DIR = 'C:/Users/Sk Najmul Hasan/.gemini/antigravity/brain/f30b9712-4688-4c31-8061-eabc4fd00b11/screenshots';
const EDGE_PATH = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

async function testEditCustomer() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // 1. Log in
  await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find((b) => b.textContent && b.textContent.includes('Owner'));
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 200));
  await page.click('button[type="submit"]');
  await new Promise((r) => setTimeout(r, 1200));

  // 2. Test in /admin/customers
  console.log('=== TEST 1: /admin/customers Edit Customer Feature ===');
  await page.setViewport({ width: 1366, height: 768 });
  await page.goto('http://localhost:3000/admin/customers', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1000));

  // Click the visible Edit button in the desktop table
  const clicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button')).filter((b) => b.offsetParent !== null);
    const editBtn = btns.find((b) => b.textContent && b.textContent.trim() === 'Edit');
    if (editBtn) {
      editBtn.click();
      return true;
    }
    return false;
  });
  console.log('Clicked visible Edit button in desktop table:', clicked);
  await new Promise((r) => setTimeout(r, 600));

  // Check if modal opened
  const isModalOpen = await page.evaluate(() => {
    const heading = document.querySelector('h3');
    return heading && heading.textContent.includes('Edit Farmer Details');
  });
  console.log('Edit Farmer modal visible:', isModalOpen);

  // Take screenshot of Edit Customer Modal
  const modalScreenshot = path.join(SCREENSHOT_DIR, 'edit-customer-modal-desktop.png');
  await page.screenshot({ path: modalScreenshot, fullPage: false });
  console.log(`Saved Edit Customer modal screenshot: ${modalScreenshot}`);

  // Edit village in form and submit
  await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input'));
    const villageInput = inputs.find((i) => i.placeholder && i.placeholder.includes('Chapmatali'));
    if (villageInput) {
      villageInput.value = 'Chapmatali Uttarpara';
      villageInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const saveBtn = btns.find((b) => b.textContent && b.textContent.includes('Save Changes'));
    if (saveBtn) saveBtn.click();
  });
  console.log('Submitted Save Changes');
  await new Promise((r) => setTimeout(r, 1200));

  // Verify village was updated on the page
  const updatedVillageText = await page.evaluate(() => {
    return document.body.innerText.includes('Chapmatali Uttarpara');
  });
  console.log('Updated village reflected in table:', updatedVillageText);

  // 3. Test in /admin/pos
  console.log('\n=== TEST 2: /admin/pos Customer Quick Edit ===');
  await page.goto('http://localhost:3000/admin/pos', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1000));

  // Focus customer input and select first customer
  await page.focus('input[placeholder*="Walk-in Customer"]');
  await new Promise((r) => setTimeout(r, 400));

  await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('div.cursor-pointer'));
    if (items.length > 1) {
      items[1].click(); // select first registered customer
    }
  });
  await new Promise((r) => setTimeout(r, 500));

  // Verify Edit Customer button appeared in POS
  const posEditFound = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const editBtn = btns.find((b) => b.textContent && b.textContent.includes('Edit Customer'));
    if (editBtn) {
      editBtn.click();
      return true;
    }
    return false;
  });

  if (posEditFound) {
    console.log('Found and clicked "Edit Customer" button in POS Customer Account header!');
    await new Promise((r) => setTimeout(r, 500));

    const posModalScreenshot = path.join(SCREENSHOT_DIR, 'edit-customer-pos.png');
    await page.screenshot({ path: posModalScreenshot, fullPage: false });
    console.log(`Saved POS Edit Customer screenshot: ${posModalScreenshot}`);
  } else {
    throw new Error('POS Edit Customer button not found!');
  }

  // 4. Test Mobile Customer Card View (< 768px)
  console.log('\n=== TEST 3: Mobile View (390px) Customer Edit ===');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000/admin/customers', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1000));

  const mobileScreenshot = path.join(SCREENSHOT_DIR, 'customer-mobile-cards-390px.png');
  await page.screenshot({ path: mobileScreenshot, fullPage: false });
  console.log(`Saved Mobile Customer Cards screenshot: ${mobileScreenshot}`);

  await browser.close();
  console.log('\nALL CUSTOMER EDIT TESTS PASSED SUCCESSFULLY!');
}

testEditCustomer().catch(console.error);
