import puppeteer from 'puppeteer-core';

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://localhost:3000/farmer/login', { waitUntil: 'networkidle2' });

  // Fill credentials
  await page.type('input[type="tel"]', '9876543210');
  await page.type('input[type="password"]', '1234');
  await page.click('button[type="submit"]');

  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 8000 }).catch(() => {});
  console.log('After login URL:', page.url());

  // Click hamburger menu
  const menuBtn = await page.$('button[aria-label="Toggle Navigation Menu"]');
  if (menuBtn) {
    await menuBtn.click();
    await new Promise((r) => setTimeout(r, 600));
  }

  await page.screenshot({
    path: 'C:/Users/Sk Najmul Hasan/.gemini/antigravity/brain/f30b9712-4688-4c31-8061-eabc4fd00b11/screenshots/farmer-drawer-live.png',
  });
  await browser.close();
  console.log('Successfully saved farmer-drawer-live.png');
}

capture().catch(console.error);
