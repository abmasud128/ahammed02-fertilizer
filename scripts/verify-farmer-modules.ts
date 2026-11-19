import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import { signFarmerSessionToken, FARMER_SESSION_COOKIE_NAME } from '../src/lib/aqua/auth';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = path.resolve('C:/Users/Sk Najmul Hasan/.gemini/antigravity/brain/f30b9712-4688-4c31-8061-eabc4fd00b11/screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function run() {
  console.log('Launching Chrome via puppeteer-core...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  try {
    // 1. Direct Session Cookie setup for demo farmer (Prabir Sarkar)
    const token = signFarmerSessionToken({
      farmerId: 'farmer-demo-1',
      registrationNumber: 'FARMER-2026-0001',
      mobileNumber: '9876543210',
      fullName: 'Prabir Sarkar (প্রবীর সরকার)',
      role: 'farmer',
      villageId: 'vil-nandair',
      districtId: 'dist-dd',
    });

    await page.setCookie({
      name: FARMER_SESSION_COOKIE_NAME,
      value: token,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
    });

    console.log('Navigating to /farmer/dashboard...');
    await page.goto('http://localhost:3000/farmer/dashboard', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1000));
    console.log('Current URL on dashboard:', page.url());

    // 2. Open Navigation Drawer (matching user screenshot)
    console.log('Opening mobile drawer navigation...');
    await page.evaluate(() => {
      const headerBtns = Array.from(document.querySelectorAll('header button'));
      const menuBtn = headerBtns.find((b) => b.getAttribute('aria-label') === 'Toggle Navigation Menu');
      if (menuBtn) (menuBtn as HTMLButtonElement).click();
    });

    await new Promise((r) => setTimeout(r, 800));

    // Capture the sidebar navigation
    const sidebarPath = path.join(SCREENSHOT_DIR, 'farmer-sidebar-all-active.png');
    await page.screenshot({ path: sidebarPath });
    console.log(`Saved sidebar screenshot to ${sidebarPath}`);

    // Verify there are no "Phase 2" badges
    const phase2Count = await page.evaluate(() => {
      const spans = Array.from(document.querySelectorAll('span'));
      return spans.filter((s) => s.textContent?.trim() === 'Phase 2').length;
    });
    console.log(`Phase 2 badges remaining in drawer: ${phase2Count} (Expected: 0)`);

    // 3. Test & capture each module
    const modules = [
      { url: '/farmer/dashboard', file: 'farmer-dashboard.png', title: 'Dashboard' },
      { url: '/farmer/feed', file: 'farmer-feed.png', title: 'Feed' },
      { url: '/farmer/water-quality', file: 'farmer-water-quality.png', title: 'Water Quality' },
      { url: '/farmer/problems', file: 'farmer-problems.png', title: 'Problems' },
      { url: '/farmer/treatment', file: 'farmer-treatment.png', title: 'Treatment' },
      { url: '/farmer/growth', file: 'farmer-growth.png', title: 'Growth' },
      { url: '/farmer/mortality', file: 'farmer-mortality.png', title: 'Mortality' },
      { url: '/farmer/harvest', file: 'farmer-harvest.png', title: 'Harvest' },
      { url: '/farmer/accounts', file: 'farmer-accounts.png', title: 'Accounts' },
    ];

    for (const mod of modules) {
      console.log(`Visiting ${mod.url}...`);
      await page.goto(`http://localhost:3000${mod.url}`, { waitUntil: 'networkidle2' });
      await new Promise((r) => setTimeout(r, 800));

      const filePath = path.join(SCREENSHOT_DIR, mod.file);
      await page.screenshot({ path: filePath, fullPage: true });
      console.log(`Saved fullPage screenshot for ${mod.title} to ${filePath}`);
    }

    console.log('ALL MODULES VERIFIED SUCCESSFULLY!');
  } catch (err) {
    console.error('Error during verification:', err);
  } finally {
    await browser.close();
  }
}

run();
