import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/Sk Najmul Hasan/.gemini/antigravity/brain/f30b9712-4688-4c31-8061-eabc4fd00b11/screenshots';

async function main() {
  if (!fs.existsSync(ARTIFACT_DIR)) {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  }

  console.log('--- STARTING SERVICES, CONTACT & FOOTER VERIFICATION ---');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Suppress offer popup
  await page.evaluateOnNewDocument(() => {
    try {
      sessionStorage.setItem('offer-popup-dismissed', 'true');
      localStorage.setItem('offer-popup-dismissed', 'true');
    } catch (e) {}
  });

  // 1. Desktop 1440px: Services & Categories Grid
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1200));

  // Scroll to Services Grid ("Fertilizers, Crop Protection...")
  await page.evaluate(() => {
    const el = document.evaluate("//h2[contains(., 'Fertilizers, Crop Protection')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as HTMLElement;
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    else window.scrollTo({ top: 1200, behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 800));

  const shot1 = path.join(ARTIFACT_DIR, 'redesign-services-grid-1440px.png');
  await page.screenshot({ path: shot1, fullPage: false });
  console.log('Saved 1:', shot1);

  // 2. Desktop 1440px: Contact & Inquiry 3-Column Section
  await page.evaluate(() => {
    const el = document.getElementById('contact');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    else window.scrollTo({ top: 3800, behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 800));

  const shot2 = path.join(ARTIFACT_DIR, 'redesign-contact-3columns-1440px.png');
  await page.screenshot({ path: shot2, fullPage: false });
  console.log('Saved 2:', shot2);

  // 3. Desktop 1440px: Bottom Testimonials, FAQs & Cohesive Background
  await page.evaluate(() => {
    const el = document.evaluate("//h2[contains(., 'What Farmers Say')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as HTMLElement;
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    else window.scrollTo({ top: 2900, behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 800));

  const shot3 = path.join(ARTIFACT_DIR, 'redesign-bottom-testimonials-faq-1440px.png');
  await page.screenshot({ path: shot3, fullPage: false });
  console.log('Saved 3:', shot3);

  // 4. Desktop 1440px: Footer with real-life background
  await page.evaluate(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 800));

  const shot4 = path.join(ARTIFACT_DIR, 'redesign-footer-cohesive-1440px.png');
  await page.screenshot({ path: shot4, fullPage: false });
  console.log('Saved 4:', shot4);

  // 5. Mobile 390px: Contact Section & Services Grid
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1200));

  await page.evaluate(() => {
    const el = document.getElementById('contact');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise((r) => setTimeout(r, 800));

  const shot5 = path.join(ARTIFACT_DIR, 'redesign-contact-mobile-390px.png');
  await page.screenshot({ path: shot5, fullPage: false });
  console.log('Saved 5:', shot5);

  await browser.close();
  console.log('--- ALL VERIFICATION SCREENSHOTS CAPTURED ---');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
