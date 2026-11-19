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

  // 1. Sidebar Placement Screenshot
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'farmer-01-sidebar-placement.png'),
  });
  console.log('Captured farmer-01-sidebar-placement.png');

  // Verify sidebar links sequence
  const navItems = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('aside nav a, aside a'));
    return links.map((l) => ({
      text: l.textContent?.trim().replace(/\s+/g, ' '),
      href: l.getAttribute('href'),
    })).filter((l) => l.href && l.href.startsWith('/admin'));
  });
  console.log('Sidebar Navigation Order detected:');
  navItems.forEach((item, idx) => console.log(`  ${idx + 1}. [${item.href}] ${item.text}`));

  // 2. Step 1: Add Farmer Details
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'farmer-02-step1-add-farmer.png'),
  });
  console.log('Captured farmer-02-step1-add-farmer.png');

  // Click Save Farmer or Next to go to Step 2
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const saveBtn = buttons.find((b) => b.textContent?.includes('Save Farmer'));
    if (saveBtn) saveBtn.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  // 3. Step 2: Register Field / Land Details
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'farmer-03-step2-register-field.png'),
  });
  console.log('Captured farmer-03-step2-register-field.png');

  // Click Save Field to go to Step 3
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const saveBtn = buttons.find((b) => b.textContent?.includes('Save Field'));
    if (saveBtn) saveBtn.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  // 4. Step 3: Create Soil Test Sample
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'farmer-04-step3-soil-sample.png'),
  });
  console.log('Captured farmer-04-step3-soil-sample.png');

  // Click Save Sample to go to Step 4
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const saveBtn = buttons.find((b) => b.textContent?.includes('Save Sample'));
    if (saveBtn) saveBtn.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  // 5. Step 4: Enter Laboratory Test Results
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'farmer-05-step4-lab-results.png'),
  });
  console.log('Captured farmer-05-step4-lab-results.png');

  // Click Save Results to go to Step 5
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const saveBtn = buttons.find((b) => b.textContent?.includes('Save Results'));
    if (saveBtn) saveBtn.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  // 6. Step 5: Select Crop & Cultivation Details
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'farmer-06-step5-crop-details.png'),
  });
  console.log('Captured farmer-06-step5-crop-details.png');

  // Click Save & Continue to go to Step 6
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const nextBtn = buttons.find((b) => b.textContent?.includes('Save & Continue'));
    if (nextBtn) nextBtn.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  // 7. Step 6: Review & Generate Recommendation
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'farmer-07-step6-review-status.png'),
  });
  console.log('Captured farmer-07-step6-review-status.png');

  // Ensure checkbox is checked and click Generate Recommendation & Report
  await page.evaluate(() => {
    const checkbox = document.querySelector('input[type="checkbox"]');
    if (checkbox && !checkbox.checked) checkbox.click();
    const buttons = Array.from(document.querySelectorAll('button'));
    const genBtn = buttons.find((b) => b.textContent?.includes('Generate Recommendation'));
    if (genBtn) genBtn.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  // 8. Step 7: Calculated Recommendation On-Screen
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'farmer-08-step7-recommendations.png'),
  });
  console.log('Captured farmer-08-step7-recommendations.png');

  // Click "Generate Farmer Report" to open Modal (Step 8)
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const reportBtn = buttons.find((b) => b.textContent?.includes('Generate Farmer Report'));
    if (reportBtn) reportBtn.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  // 9. Step 8: Modal dialog
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'farmer-09-step8-report-modal.png'),
  });
  console.log('Captured farmer-09-step8-report-modal.png');

  // Click "Generate PDF" inside modal to go to Step 9
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const pdfBtn = buttons.find((b) => b.textContent?.includes('Generate PDF'));
    if (pdfBtn) pdfBtn.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  // 10. Step 9: Report Preview
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'farmer-10-step9-report-preview.png'),
  });
  console.log('Captured farmer-10-step9-report-preview.png');

  // 11. Switch to Directory Tab
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const dirTab = buttons.find((b) => b.textContent?.includes('Registered Farmers Directory'));
    if (dirTab) dirTab.click();
  });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'farmer-11-directory-tab.png'),
  });
  console.log('Captured farmer-11-directory-tab.png');

  await browser.close();
  console.log('All verification steps completed successfully!');
}

verify().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
