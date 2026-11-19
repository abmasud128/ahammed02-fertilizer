import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function debugLogin() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();

  page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
  page.on('response', async (res) => {
    if (res.url().includes('/api/admin/auth/login')) {
      console.log('LOGIN API STATUS:', res.status());
      try {
        const text = await res.text();
        console.log('LOGIN API RESPONSE:', text);
        const headers = res.headers();
        console.log('SET-COOKIE HEADER:', headers['set-cookie']);
      } catch (e) {
        console.error('Error reading response:', e);
      }
    }
  });

  await page.goto('http://localhost:3000/admin/login');
  console.log('On login page...');

  // Type directly into input fields
  await page.type('input[type="text"]', 'abmasud128@gmail.com');
  await page.type('input[type="password"]', 'Masud123@...');

  const emailVal = await page.$eval('input[type="text"]', (el) => (el as HTMLInputElement).value);
  const passVal = await page.$eval('input[type="password"]', (el) => (el as HTMLInputElement).value);
  console.log('Filled email:', emailVal, 'password length:', passVal.length);

  // Click submit
  await page.click('button[type="submit"]');
  console.log('Clicked submit button, waiting for navigation or API response...');
  await new Promise((r) => setTimeout(r, 2000));

  console.log('Current page URL after login:', page.url());

  const cookies = await page.cookies();
  console.log('Cookies in browser:', cookies.map((c) => ({ name: c.name, value: c.value.slice(0, 15) + '...', httpOnly: c.httpOnly, secure: c.secure, domain: c.domain })));

  // Now try navigating to /admin/pos
  console.log('Navigating to http://localhost:3000/admin/pos ...');
  await page.goto('http://localhost:3000/admin/pos', { waitUntil: 'networkidle2' });
  console.log('Final URL when requesting /admin/pos:', page.url());

  // Check if POS elements loaded
  const posTitle = await page.evaluate(() => {
    const el = document.querySelector('h1, h2, .font-black');
    return el ? el.textContent : null;
  });
  console.log('Header text on POS page:', posTitle);

  await browser.close();
}

debugLogin().catch(console.error);
