import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function audit() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();

  const errors: { url: string; text: string }[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push({ url: page.url(), text: msg.text() });
  });
  page.on('pageerror', (err: any) => {
    errors.push({ url: page.url(), text: String(err) });
  });

  // Login
  console.log('Logging in...');
  await page.goto('http://localhost:3000/admin/login');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const ownerBtn = btns.find((b) => b.textContent && b.textContent.includes('Owner'));
    if (ownerBtn) ownerBtn.click();
  });
  await new Promise((r) => setTimeout(r, 400));
  await page.evaluate(() => {
    const s = document.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (s) s.click();
  });
  await new Promise((r) => setTimeout(r, 1500));

  const routes = [
    '/admin',
    '/admin/pos',
    '/admin/products',
    '/admin/stock',
    '/admin/customers',
    '/admin/crm',
    '/admin/crm/cases',
    '/admin/crm/cases/new',
    '/admin/crm/followups',
    '/admin/crm/tests',
    '/admin/crm/analytics',
    '/admin/crm/ai-insights',
    '/book-test',
    '/aquaculture',
    '/'
  ];

  for (const r of routes) {
    console.log('Auditing', r, '...');
    await page.goto('http://localhost:3000' + r, { waitUntil: 'networkidle2' });
    await new Promise((res) => setTimeout(res, 600));
  }

  await browser.close();
  console.log('=== CONSOLE AUDIT RESULTS ===');
  console.log('Total console/page errors found:', errors.length);
  errors.forEach((e) => console.log('ERROR on', e.url, ':', e.text));
}

audit().catch(console.error);
