import puppeteer from 'puppeteer-core';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Prevent popup modal
  await page.evaluateOnNewDocument(() => {
    sessionStorage.setItem('offer-popup-dismissed', 'true');
  });

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });

  // 1. Desktop 1440px Header & Hero English
  await page.screenshot({
    path: 'C:/Users/Sk Najmul Hasan/.gemini/antigravity/brain/f30b9712-4688-4c31-8061-eabc4fd00b11/screenshots/fix-01-header-hero-en-1440px.png',
  });
  console.log('Captured fix-01-header-hero-en-1440px.png');

  // 2. Switch to Bengali
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const bnBtn = buttons.find((b) => b.textContent && b.textContent.includes('বাংলা'));
    if (bnBtn) bnBtn.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  // Screenshot Hero in Bengali to verify NO underline overlap
  await page.screenshot({
    path: 'C:/Users/Sk Najmul Hasan/.gemini/antigravity/brain/f30b9712-4688-4c31-8061-eabc4fd00b11/screenshots/fix-02-header-hero-bn-1440px.png',
  });
  console.log('Captured fix-02-header-hero-bn-1440px.png');

  // 3. Scroll to Plant Biology (Roots, Stems & Grains)
  await page.evaluate(() => {
    window.scrollTo(0, 750);
  });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({
    path: 'C:/Users/Sk Najmul Hasan/.gemini/antigravity/brain/f30b9712-4688-4c31-8061-eabc4fd00b11/screenshots/fix-03-plant-biology-compact-1440px.png',
  });
  console.log('Captured fix-03-plant-biology-compact-1440px.png');

  // 4. Scroll to Footer properly
  await page.evaluate(() => {
    const footer = document.querySelector('footer');
    if (footer) footer.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({
    path: 'C:/Users/Sk Najmul Hasan/.gemini/antigravity/brain/f30b9712-4688-4c31-8061-eabc4fd00b11/screenshots/fix-04-footer-high-contrast-1440px.png',
  });
  console.log('Captured fix-04-footer-high-contrast-1440px.png');

  // 5. Test at 1280px (xl breakpoint) in Bengali and English to check header spacing
  await page.setViewport({ width: 1280, height: 800 });
  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({
    path: 'C:/Users/Sk Najmul Hasan/.gemini/antigravity/brain/f30b9712-4688-4c31-8061-eabc4fd00b11/screenshots/fix-05-header-1280px-bn.png',
  });
  console.log('Captured fix-05-header-1280px-bn.png');

  // Switch back to English at 1280px
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const enBtn = buttons.find((b) => b.textContent && b.textContent.trim() === 'EN');
    if (enBtn) enBtn.click();
  });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({
    path: 'C:/Users/Sk Najmul Hasan/.gemini/antigravity/brain/f30b9712-4688-4c31-8061-eabc4fd00b11/screenshots/fix-06-header-1280px-en.png',
  });
  console.log('Captured fix-06-header-1280px-en.png');

  await browser.close();
  console.log('All verification screenshots captured successfully!');
}

run().catch(console.error);
