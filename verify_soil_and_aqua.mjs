import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const SCREENSHOTS_DIR = 'C:/Users/Sk Najmul Hasan/.gemini/antigravity/brain/f30b9712-4688-4c31-8061-eabc4fd00b11/screenshots';

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function run() {
  console.log('Launching Puppeteer browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  // 1. Visit Admin Login to authenticate as owner
  console.log('Logging in as Admin...');
  await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle2' });
  await page.type('input[type="email"], input[name="email"]', 'owner@ahammed.com');
  await page.type('input[type="password"], input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
  await new Promise((r) => setTimeout(r, 1000));

  // 2. Visit Soil Testing Platform (/admin/soil-testing)
  console.log('Testing /admin/soil-testing...');
  await page.goto('http://localhost:3000/admin/soil-testing', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'soil-01-add-farmer.png') });

  // Click Step 4 (Lab Results)
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Lab Results')) {
      await b.click();
      break;
    }
  }
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'soil-04-lab-results.png') });

  // Click Step 6 (Review & Verify)
  const buttons2 = await page.$$('button');
  for (const b of buttons2) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Review & Verify')) {
      await b.click();
      break;
    }
  }
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'soil-06-review-interpretation.png') });

  // Click Step 7 (Calculated Recommendation)
  const buttons3 = await page.$$('button');
  for (const b of buttons3) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Recommendation')) {
      await b.click();
      break;
    }
  }
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'soil-07-calculated-recommendation.png') });

  // Click Step 9 (PDF Report)
  const buttons4 = await page.$$('button');
  for (const b of buttons4) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('PDF Report')) {
      await b.click();
      break;
    }
  }
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'soil-09-final-farmer-report.png') });

  // 3. Visit Admin Aquaculture Hub
  console.log('Testing /admin/aqua...');
  await page.goto('http://localhost:3000/admin/aqua', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'admin-aqua-01-dashboard.png') });

  // 4. Visit Farmer Login & Farmer Modules
  console.log('Testing Farmer Login as Prabir Sarkar...');
  await page.goto('http://localhost:3000/farmer/login', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 800));

  // Click Aquaculture Option
  const aquaCards = await page.$$('div, button');
  for (const c of aquaCards) {
    const text = await page.evaluate(el => el.textContent, c);
    if (text && text.includes('Aquaculture') && text.includes('Fish')) {
      await c.click().catch(() => {});
      break;
    }
  }
  await new Promise((r) => setTimeout(r, 800));

  // Fill mobile and password
  const mobileInput = await page.$('input[type="tel"], input[placeholder*="mobile"], input[placeholder*="মোবাইল"]');
  if (mobileInput) {
    await mobileInput.type('9091017035');
  }
  const passInput = await page.$('input[type="password"]');
  if (passInput) {
    await passInput.type('909101');
  }
  const loginSubmit = await page.$('button[type="submit"]');
  if (loginSubmit) {
    await loginSubmit.click();
  }
  await new Promise((r) => setTimeout(r, 1500));

  // Test farmer problems (read-only)
  await page.goto('http://localhost:3000/farmer/problems', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'farmer-problems-read-only.png') });

  // Test farmer treatment (read-only)
  await page.goto('http://localhost:3000/farmer/treatment', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'farmer-treatment-read-only.png') });

  console.log('All tests and screenshots completed successfully!');
  await browser.close();
}

run().catch((err) => {
  console.error('Error running script:', err);
  process.exit(1);
});
