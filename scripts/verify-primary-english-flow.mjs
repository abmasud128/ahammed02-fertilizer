import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = 'C:/Users/Sk Najmul Hasan/.gemini/antigravity/brain/f30b9712-4688-4c31-8061-eabc4fd00b11/screenshots';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function verify() {
  console.log('Launching browser for English Primary verification...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });

  // Clear any existing localStorage so we verify true fresh primary defaults
  await page.goto('http://localhost:3000/farmer/login', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    localStorage.clear();
  });
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 600));

  // 1. Farmer Login - Primary English
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'lang-01-farmer-login-english-default.png'),
  });
  console.log('1. Captured lang-01-farmer-login-english-default.png (English Default)');

  // 2. Click Translation Button ("বাংলা")
  console.log('Clicking translation button to switch to Bengali...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const transBtn = buttons.find((b) => b.textContent?.trim() === 'বাংলা');
    if (transBtn) transBtn.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'lang-02-farmer-login-bengali-translated.png'),
  });
  console.log('2. Captured lang-02-farmer-login-bengali-translated.png (Translated to Bengali)');

  // 3. Click Translation Button back to English
  console.log('Clicking translation button back to English...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const transBtn = buttons.find((b) => b.textContent?.trim() === 'English');
    if (transBtn) transBtn.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  // 4. Aquaculture Farmer Login & Registration in English
  console.log('Selecting Aquaculture Portal in English...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const aquaBtn = buttons.find((b) => b.textContent?.includes('Login') || b.textContent?.includes('Aquaculture'));
    if (aquaBtn) aquaBtn.click();
  });
  await new Promise((r) => setTimeout(r, 500));

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'lang-03-aqua-login-english.png'),
  });
  console.log('3. Captured lang-03-aqua-login-english.png (Aqua Login in English)');

  // Click Register New Farmer
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const regTab = buttons.find((b) => b.textContent?.includes('Register New Farmer') || b.textContent?.includes('Register'));
    if (regTab) regTab.click();
  });
  await new Promise((r) => setTimeout(r, 500));

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'lang-04-aqua-register-english.png'),
  });
  console.log('4. Captured lang-04-aqua-register-english.png (Aqua Register in English)');

  // 5. Test Aqua Dashboard in English
  console.log('Logging in to Aqua Dashboard with demo farmer (Prabir Sarkar)...');
  await page.goto('http://localhost:3000/farmer/login', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 500));

  // Quick demo fill
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const demoBtn = buttons.find((b) => b.textContent?.includes('Prabir (Aqua)'));
    if (demoBtn) demoBtn.click();
  });
  await new Promise((r) => setTimeout(r, 400));

  // Submit login
  await page.evaluate(() => {
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.click();
  });
  await new Promise((r) => setTimeout(r, 2000));

  // Aqua Dashboard in English Default
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'lang-05-aqua-dashboard-english-default.png'),
  });
  console.log('5. Captured lang-05-aqua-dashboard-english-default.png (Aqua Dashboard in English)');

  // Click translation button in Aqua Dashboard to translate to Bengali
  console.log('Toggling Aqua Dashboard translation to Bengali...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const transBtn = buttons.find((b) => b.textContent?.includes('বাংলা'));
    if (transBtn) transBtn.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'lang-06-aqua-dashboard-bengali-translated.png'),
  });
  console.log('6. Captured lang-06-aqua-dashboard-bengali-translated.png (Aqua Dashboard in Bengali)');

  // 6. Test Fertilizer Farmer Passbook in English Default
  console.log('Logging into Fertilizer Portal with Subrata Roy...');
  await page.goto('http://localhost:3000/farmer/login', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 500));

  // Set English
  await page.evaluate(() => {
    localStorage.setItem('ahammed_language', 'en');
    localStorage.setItem('ahammed_lang', 'en');
  });
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 500));

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const demoBtn = buttons.find((b) => b.textContent?.includes('Subrata (Fertilizer)'));
    if (demoBtn) demoBtn.click();
  });
  await new Promise((r) => setTimeout(r, 400));

  await page.evaluate(() => {
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.click();
  });
  await new Promise((r) => setTimeout(r, 2000));

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'lang-07-fertilizer-portal-english-default.png'),
  });
  console.log('7. Captured lang-07-fertilizer-portal-english-default.png (Fertilizer Passbook in English)');

  await browser.close();
  console.log('Language verification completed successfully!');
}

verify().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
