import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\Sk Najmul Hasan\\.gemini\\antigravity\\brain\\f30b9712-4688-4c31-8061-eabc4fd00b11\\screenshots';

const WIDTHS = [360, 768, 1024, 1280, 1440, 1920];

async function testHeader() {
  if (!fs.existsSync(ARTIFACT_DIR)) {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  console.log('--- STARTING MULTI-VIEWPORT HEADER TESTS ---');

  for (const width of WIDTHS) {
    const height = width < 768 ? 740 : 800;
    await page.setViewport({ width, height });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 600));

    // Check horizontal scroll / overflow
    const overflowInfo = await page.evaluate(() => {
      const docWidth = document.documentElement.scrollWidth;
      const winWidth = window.innerWidth;
      const header = document.querySelector('header');
      const headerWidth = header ? header.scrollWidth : 0;
      return {
        hasDocOverflow: docWidth > winWidth,
        docWidth,
        winWidth,
        headerWidth,
      };
    });

    console.log(
      `Viewport ${width}px: docWidth=${overflowInfo.docWidth}, winWidth=${overflowInfo.winWidth}, docOverflow=${overflowInfo.hasDocOverflow}`
    );

    // Save screenshot
    const shotPath = path.join(ARTIFACT_DIR, `header-test-${width}px.png`);
    await page.screenshot({
      path: shotPath,
      clip: { x: 0, y: 0, width, height: 160 },
    });
    console.log(`Saved screenshot: header-test-${width}px.png`);

    // If at 1280px or 1440px, test opening Services dropdown
    if (width === 1280 || width === 1440) {
      console.log(`Testing dropdown interaction at ${width}px...`);
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('nav button'));
        const servicesBtn = btns.find((b) => b.textContent && b.textContent.includes('Services') || b.textContent && b.textContent.includes('সেবাসমূহ'));
        if (servicesBtn) (servicesBtn as HTMLButtonElement).click();
      });
      await new Promise((r) => setTimeout(r, 300));
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, `header-dropdown-${width}px.png`),
        clip: { x: 0, y: 0, width, height: 350 },
      });
      console.log(`Saved dropdown screenshot: header-dropdown-${width}px.png`);
    }

    // If at 360px or 768px, test opening mobile drawer
    if (width === 360) {
      console.log(`Testing drawer interaction at ${width}px...`);
      await page.evaluate(() => {
        const hamburger = document.querySelector('button[aria-label*="mobile"]');
        if (hamburger) (hamburger as HTMLButtonElement).click();
      });
      await new Promise((r) => setTimeout(r, 500));
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, `header-drawer-${width}px.png`),
        fullPage: false,
      });
      console.log(`Saved drawer screenshot: header-drawer-${width}px.png`);
    }
  }

  await browser.close();
  console.log('--- ALL MULTI-VIEWPORT TESTS COMPLETED SUCCESSFULLY ---');
}

testHeader().catch((err) => {
  console.error('Multi-viewport test failed:', err);
  process.exit(1);
});
