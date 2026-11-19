import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = 'C:/Users/Sk Najmul Hasan/.gemini/antigravity/brain/f30b9712-4688-4c31-8061-eabc4fd00b11/screenshots';
const EDGE_PATH = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const prefix = process.argv[2] || 'before'; // 'before' or 'after'

const testPages = [
  { name: 'home', path: '/' },
  { name: 'products', path: '/products' },
  { name: 'about', path: '/about' },
  { name: 'contact', path: '/contact' },
];

const viewports = [
  { name: '390px', width: 390, height: 844, isMobile: true, hasTouch: true },
  { name: '768px', width: 768, height: 1024, isMobile: false, hasTouch: false }
];

const auditWidths = [320, 360, 390, 414, 768, 1024, 1440];

async function run() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  console.log(`=== RUNNING AUDIT & SCREENSHOTS (${prefix.toUpperCase()}) ===\n`);

  // 1. Capture visual screenshots for 390px and 768px
  for (const vp of viewports) {
    await page.setViewport({ width: vp.width, height: vp.height, isMobile: vp.isMobile, hasTouch: vp.hasTouch });
    for (const p of testPages) {
      const url = `http://localhost:3000${p.path}`;
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
      await new Promise((r) => setTimeout(r, 1200));

      const filename = `${prefix}-${p.name}-${vp.name}.png`;
      const filePath = path.join(SCREENSHOT_DIR, filename);
      await page.screenshot({ path: filePath, fullPage: false });
      console.log(`Captured ${filename}`);
    }
  }

  // 2. Measure horizontal overflow at all audit widths
  console.log('\n--- Overflow measurements on Home Page ---');
  for (const w of auditWidths) {
    await page.setViewport({ width: w, height: 800 });
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 800));

    const metrics = await page.evaluate(() => {
      const doc = document.documentElement;
      const body = document.body;
      const scrollWidth = Math.max(doc.scrollWidth, body.scrollWidth);
      const innerWidth = window.innerWidth;
      const hasOverflow = scrollWidth > innerWidth;

      // Find overflowing elements
      const overflowingElements = [];
      const all = document.querySelectorAll('*');
      for (const el of all) {
        const rect = el.getBoundingClientRect();
        if (rect.right > innerWidth + 1 || rect.left < -1) {
          overflowingElements.push({
            tag: el.tagName.toLowerCase(),
            className: (el.className || '').toString().slice(0, 50),
            id: el.id,
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width)
          });
        }
      }

      return {
        innerWidth,
        scrollWidth,
        hasOverflow,
        overflowDiff: scrollWidth - innerWidth,
        overflowingCount: overflowingElements.length,
        topOverflowing: overflowingElements.slice(0, 5)
      };
    });

    console.log(`Width ${w}px: scrollWidth=${metrics.scrollWidth} (Diff: ${metrics.overflowDiff}px, Overflow: ${metrics.hasOverflow})`);
    if (metrics.topOverflowing.length > 0) {
      console.log(`   Overflow elements:`, JSON.stringify(metrics.topOverflowing));
    }
  }

  await browser.close();
  console.log('\nAudit complete.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
