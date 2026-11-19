import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = 'C:/Users/Sk Najmul Hasan/.gemini/antigravity/brain/f30b9712-4688-4c31-8061-eabc4fd00b11/screenshots';
const EDGE_PATH = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const pagesToCapture = [
  { name: 'home', path: '/' },
  { name: 'products', path: '/products' },
  { name: 'crop-guide', path: '/crop-guide' },
  { name: 'about', path: '/about' },
  { name: 'contact', path: '/contact' },
];

async function capture() {
  console.log('Launching browser via Edge executable...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // 1. Desktop captures (1280x800)
  await page.setViewport({ width: 1280, height: 800 });
  for (const item of pagesToCapture) {
    const url = `http://localhost:3000${item.path}`;
    console.log(`Capturing Desktop: ${item.name} (${url})...`);
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1500)); // allow motion & render
    const filePath = path.join(SCREENSHOT_DIR, `${item.name}-desktop.png`);
    await page.screenshot({ path: filePath, fullPage: false });
    console.log(`Saved: ${filePath}`);
  }

  // 2. Mobile captures (375x812 - iPhone X / modern mobile)
  await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
  for (const item of pagesToCapture) {
    const url = `http://localhost:3000${item.path}`;
    console.log(`Capturing Mobile: ${item.name} (${url})...`);
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1500)); // allow motion & render
    const filePath = path.join(SCREENSHOT_DIR, `${item.name}-mobile.png`);
    await page.screenshot({ path: filePath, fullPage: false });
    console.log(`Saved: ${filePath}`);
  }

  await browser.close();
  console.log('All screenshots captured successfully!');
}

capture().catch((err) => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
