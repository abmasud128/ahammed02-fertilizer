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

  // 1. Public Book a Test Page (Desktop)
  console.log('Capturing Public Book-Test page (Desktop)...');
  await page.goto('http://localhost:3000/book-test', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'crm-public-book-test-desktop.png'),
    fullPage: false,
  });

  // 2. Public Book a Test Page (Mobile 390px)
  console.log('Capturing Public Book-Test page (Mobile)...');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000/book-test', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'crm-public-book-test-mobile.png'),
    fullPage: false,
  });

  // 3. Admin Login & CRM Hub (Desktop 1366px)
  console.log('Logging in as Admin and capturing CRM Hub...');
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

  // 4. Staff CRM Dashboard
  console.log('Capturing Staff CRM Dashboard...');
  await page.goto('http://localhost:3000/admin/crm', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'crm-staff-dashboard-desktop.png'),
    fullPage: false,
  });

  // 5. Customer Dossier (cust-1)
  console.log('Capturing Customer Farm Dossier...');
  await page.goto('http://localhost:3000/admin/crm/customers/cust-1', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'crm-customer-dossier-desktop.png'),
    fullPage: false,
  });

  // 6. Diagnostic Cases List
  console.log('Capturing Diagnostic Cases Registry...');
  await page.goto('http://localhost:3000/admin/crm/cases', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'crm-cases-registry-desktop.png'),
    fullPage: false,
  });

  // 7. Today's Due Follow-up Calls
  console.log('Capturing Today\'s Due Follow-up Calls...');
  await page.goto('http://localhost:3000/admin/crm/followups', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'crm-todays-calls-desktop.png'),
    fullPage: false,
  });

  // 8. Product Efficacy Analytics
  console.log('Capturing Product Efficacy & Evidence Analytics...');
  await page.goto('http://localhost:3000/admin/crm/analytics', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'crm-efficacy-analytics-desktop.png'),
    fullPage: false,
  });

  await browser.close();
  console.log('🎉 All CRM screenshots captured successfully in artifact dir!');
}

capture().catch((err) => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
