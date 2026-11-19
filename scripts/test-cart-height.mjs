import puppeteer from 'puppeteer-core';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 667, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000/admin/login');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Owner'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 300));
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 1200));

  await page.goto('http://localhost:3000/admin/pos');
  await new Promise(r => setTimeout(r, 1000));

  // Add 4 items
  const items = await page.$$('button.rounded-xl.border');
  for (let i = 0; i < Math.min(4, items.length); i++) {
    await items[i].click();
    await new Promise(r => setTimeout(r, 150));
  }

  // Switch to Cart
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent && b.textContent.includes('Cart'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  const listInfo = await page.evaluate(() => {
    const list = document.querySelector('div.flex-1.overflow-y-auto.p-3.space-y-2');
    const rect = list ? list.getBoundingClientRect() : null;
    const parent = list ? list.parentElement : null;
    const pRect = parent ? parent.getBoundingClientRect() : null;
    const summary = document.querySelector('div.p-3.bg-gray-50.dark\\:bg-white\\/5.border-t');
    const sRect = summary ? summary.getBoundingClientRect() : null;
    return {
      listRect: rect ? { top: rect.top, bottom: rect.bottom, height: rect.height } : null,
      parentRect: pRect ? { top: pRect.top, bottom: pRect.bottom, height: pRect.height } : null,
      summaryRect: sRect ? { top: sRect.top, bottom: sRect.bottom, height: sRect.height } : null,
      children: list ? list.children.length : 0,
      windowHeight: window.innerHeight
    };
  });
  console.log('Layout at 390x667:', JSON.stringify(listInfo, null, 2));
  await page.screenshot({ path: 'C:/Users/Sk Najmul Hasan/.gemini/antigravity/brain/f30b9712-4688-4c31-8061-eabc4fd00b11/screenshots/cart-390x667.png' });
  await browser.close();
}
run().catch(console.error);
