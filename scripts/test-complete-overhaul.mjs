import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/Sk Najmul Hasan/.gemini/antigravity/brain/f30b9712-4688-4c31-8061-eabc4fd00b11/screenshots';

async function main() {
  if (!fs.existsSync(ARTIFACT_DIR)) {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Prevent offer popup from obstructing captures
  await page.evaluateOnNewDocument(() => {
    sessionStorage.setItem('offer-popup-dismissed', 'true');
  });

  console.log('Navigating to http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));

  // 1. Desktop 1440px Header & Hero
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'overhaul-01-header-hero-1440px.png'),
    clip: { x: 0, y: 0, width: 1440, height: 900 },
  });
  console.log('Captured 01-header-hero');

  // Helper scroll function
  async function scrollAndCapture(selector, filename, clipHeight = 900) {
    const el = await page.$(selector);
    if (el) {
      await page.evaluate((element) => element.scrollIntoView(), el);
      await new Promise(r => setTimeout(r, 1200));
      const scrollY = await page.evaluate(() => window.scrollY);
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, filename),
        clip: { x: 0, y: Math.max(0, scrollY - 60), width: 1440, height: clipHeight },
      });
      console.log(`Captured ${filename}`);
    } else {
      console.log(`Element ${selector} not found`);
    }
  }

  // 2. Plant Biology Section
  await scrollAndCapture('text/Roots, Stems & Grains', 'overhaul-02-plant-biology-1440px.png', 950);

  // 3. Products & Services Slider
  await scrollAndCapture('text/Fertilizers, Crop Protection', 'overhaul-03-services-slider-1440px.png', 950);

  // 4. Secondary Banner
  await scrollAndCapture('text/Empowering Over 5,000+', 'overhaul-04-farm-banner-1440px.png', 600);

  // 5. About Ahammed Fertilizer
  await scrollAndCapture('text/About Ahammed Fertilizer', 'overhaul-05-about-1440px.png', 800);

  // 6. Featured Products
  await scrollAndCapture('text/Featured Products', 'overhaul-06-featured-products-1440px.png', 950);

  // 7. Product Categories
  await scrollAndCapture('text/Product Categories', 'overhaul-07-product-categories-1440px.png', 750);

  // 8. Crop Solutions & Crop Calculator
  await scrollAndCapture('text/Interactive Crop Fertilizer Calculator', 'overhaul-08-crop-calculator-1440px.png', 950);

  // 9. Soil Health Testing Lab
  await scrollAndCapture('text/Scientific On-Site Soil Health Testing', 'overhaul-09-soil-testing-1440px.png', 850);

  // 10. Why Choose Us
  await scrollAndCapture('text/Why Choose Us?', 'overhaul-10-why-choose-us-1440px.png', 950);

  // 11. Testimonials & FAQs
  await scrollAndCapture('text/What Farmers Say', 'overhaul-11-testimonials-1440px.png', 900);

  // 12. Contact Section
  await scrollAndCapture('#contact', 'overhaul-12-contact-1440px.png', 950);

  // 13. Footer
  await scrollAndCapture('footer', 'overhaul-13-footer-1440px.png', 600);

  // 14. Mobile 390px Header & Hero
  const mobilePage = await browser.newPage();
  await mobilePage.setViewport({ width: 390, height: 844 });
  await mobilePage.evaluateOnNewDocument(() => {
    sessionStorage.setItem('offer-popup-dismissed', 'true');
  });
  await mobilePage.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));
  await mobilePage.screenshot({
    path: path.join(ARTIFACT_DIR, 'overhaul-14-mobile-hero-390px.png'),
    clip: { x: 0, y: 0, width: 390, height: 844 },
  });
  console.log('Captured 14-mobile-hero');

  await browser.close();
  console.log('All screenshots completed successfully!');
}

main().catch(console.error);
