import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\Sk Najmul Hasan\\.gemini\\antigravity\\brain\\f30b9712-4688-4c31-8061-eabc4fd00b11\\screenshots';

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    defaultViewport: { width: 1366, height: 768 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Login
  console.log('Logging in...');
  await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const ownerBtn = buttons.find((b) => b.textContent && b.textContent.includes('Owner'));
    if (ownerBtn) ownerBtn.click();
  });
  await new Promise((r) => setTimeout(r, 400));

  // Submit the form
  await page.evaluate(() => {
    const submitBtn = document.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (submitBtn) submitBtn.click();
  });
  await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
  await new Promise((r) => setTimeout(r, 1500));

  // 1. Products Page Desktop with Add Modal Open
  console.log('Navigating to Products page...');
  await page.goto('http://localhost:3000/admin/products', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1200));

  // Click "+ Add Product" button
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const addBtn = buttons.find((b) => b.textContent && b.textContent.includes('Add Product'));
    if (addBtn) addBtn.click();
  });
  await new Promise((r) => setTimeout(r, 800));

  // Fill in test data into the modal: Tata Ergon, Bottle, 100 ml, buy 60, sell 100
  await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input'));
    const nameInput = inputs.find((i) => i.placeholder && i.placeholder.includes('IFFCO Urea'));
    if (nameInput) {
      nameInput.value = 'Tata Ergon';
      nameInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    const brandInput = inputs.find((i) => i.placeholder && i.placeholder.includes('IFFCO, FMC'));
    if (brandInput) {
      brandInput.value = 'RALLIS TATA';
      brandInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // Set package type to Bottle
    const selects = Array.from(document.querySelectorAll('select'));
    const pkgSelect = selects.find((s) => s.innerHTML.includes('Bottle'));
    if (pkgSelect) {
      pkgSelect.value = 'Bottle';
      pkgSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // Set pack size 100 ml
    const packInput = inputs.find((i) => i.placeholder && i.placeholder.includes('100, 50'));
    if (packInput) {
      packInput.value = '100';
      packInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    const unitSelect = selects.find((s) => s.innerHTML.includes('ml (মিলিলিটার)'));
    if (unitSelect) {
      unitSelect.value = 'ml';
      unitSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // Set purchase cost 60, selling price 100
    const numberInputs = inputs.filter((i) => i.type === 'number');
    // find purchase input
    for (const inp of numberInputs) {
      const parentText = inp.parentElement?.textContent || '';
      if (parentText.includes('Purchase Cost')) {
        inp.value = '60';
        inp.dispatchEvent(new Event('input', { bubbles: true }));
      } else if (parentText.includes('Selling Price')) {
        inp.value = '100';
        inp.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  });
  await new Promise((r) => setTimeout(r, 600));

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'add-product-modal-smallest-units.png'),
    fullPage: false,
  });
  console.log('Saved add-product-modal-smallest-units.png');

  // 2. POS Desk Desktop with full pack + loose sale items
  console.log('Navigating to POS Desk...');
  await page.goto('http://localhost:3000/admin/pos', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1200));

  // Add first product to cart as full pack
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('button')).filter((b) => b.querySelector('h4'));
    if (cards.length > 0) cards[0].click();
  });
  await new Promise((r) => setTimeout(r, 600));

  // Add second product as loose sale
  await page.evaluate(() => {
    const looseBtns = Array.from(document.querySelectorAll('button')).filter((b) => b.textContent && b.textContent.includes('Loose'));
    if (looseBtns.length > 1) {
      looseBtns[1].click();
    } else if (looseBtns.length > 0) {
      looseBtns[0].click();
    }
  });
  await new Promise((r) => setTimeout(r, 600));

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'pos-desk-loose-billing-desktop.png'),
    fullPage: false,
  });
  console.log('Saved pos-desk-loose-billing-desktop.png');

  // 3. Mobile View of POS Cart (390px)
  await page.setViewport({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1000));

  // Add product
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('button')).filter((b) => b.querySelector('h4'));
    if (cards.length > 0) cards[0].click();
  });
  await new Promise((r) => setTimeout(r, 600));

  // Switch to Cart tab
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const cartBtn = buttons.find((b) => b.textContent && b.textContent.includes('Cart'));
    if (cartBtn) cartBtn.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'pos-cart-loose-billing-mobile-390px.png'),
    fullPage: false,
  });
  console.log('Saved pos-cart-loose-billing-mobile-390px.png');

  await browser.close();
}

capture().catch(console.error);
