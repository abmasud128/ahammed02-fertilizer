import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testPOSFlow() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();

  // Login
  console.log('1. Logging in as owner...');
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

  // Go to POS
  console.log('2. Navigating to /admin/pos...');
  await page.goto('http://localhost:3000/admin/pos', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1000));

  // Check GST references on POS page
  const gstTextCount = await page.evaluate(() => {
    const body = document.body.innerText;
    const matches = body.match(/GST/gi);
    return matches ? matches.length : 0;
  });
  console.log('GST mentions on POS page:', gstTextCount);

  // Check if products load on POS
  const productCount = await page.evaluate(() => {
    const cards = document.querySelectorAll('.product-card, [data-product-id], button');
    return cards.length;
  });
  console.log('Interactive elements on POS:', productCount);

  // Try adding a product to cart
  const addedToCart = await page.evaluate(() => {
    const addBtns = Array.from(document.querySelectorAll('button')).filter((b) =>
      b.textContent && (b.textContent.includes('Add') || b.textContent.includes('+') || b.textContent.includes('Pack'))
    );
    if (addBtns.length > 0) {
      addBtns[0].click();
      return true;
    }
    return false;
  });
  console.log('Clicked add to cart:', addedToCart);
  await new Promise((r) => setTimeout(r, 800));

  // Check cart contents
  const cartSummary = await page.evaluate(() => {
    return document.body.innerText.slice(0, 1000);
  });
  console.log('Cart text snippet:', cartSummary.slice(0, 200).replace(/\n+/g, ' '));

  // Go to Products page
  console.log('3. Navigating to /admin/products...');
  await page.goto('http://localhost:3000/admin/products', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1000));

  // Check if Add Product button exists
  const hasAddProductBtn = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const addBtn = btns.find((b) => b.textContent && b.textContent.includes('Add Product'));
    return !!addBtn;
  });
  console.log('Has Add Product button:', hasAddProductBtn);

  await browser.close();
  console.log('POS Flow test completed successfully.');
}

testPOSFlow().catch(console.error);
