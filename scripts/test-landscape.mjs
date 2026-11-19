import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = 'C:/Users/Sk Najmul Hasan/.gemini/antigravity/brain/f30b9712-4688-4c31-8061-eabc4fd00b11/screenshots';
const EDGE_PATH = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

const landscapeViewports = [
  { name: 'landscape-mobile-844x390', width: 844, height: 390, isMobile: true },
  { name: 'landscape-tablet-1024x768', width: 1024, height: 768, isMobile: false }
];

async function run() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  console.log('--- Testing Landscape Orientations ---');

  for (const vp of landscapeViewports) {
    await page.setViewport({ width: vp.width, height: vp.height, isMobile: vp.isMobile });
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1000));

    const metrics = await page.evaluate(() => {
      const doc = document.documentElement;
      const body = document.body;
      const scrollWidth = Math.max(doc.scrollWidth, body.scrollWidth);
      const innerWidth = window.innerWidth;
      return {
        innerWidth,
        scrollWidth,
        hasOverflow: scrollWidth > innerWidth,
      };
    });

    console.log(`Landscape ${vp.name}: width=${metrics.innerWidth}, scrollWidth=${metrics.scrollWidth}, Overflow: ${metrics.hasOverflow}`);

    const filePath = path.join(SCREENSHOT_DIR, `after-${vp.name}.png`);
    await page.screenshot({ path: filePath, fullPage: false });
    console.log(`Saved screenshot: ${filePath}`);
  }

  await browser.close();
  console.log('Landscape test complete.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
