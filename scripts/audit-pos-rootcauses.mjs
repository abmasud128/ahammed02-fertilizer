import puppeteer from 'puppeteer-core';
import path from 'path';

const SCREENSHOT_DIR = 'C:/Users/Sk Najmul Hasan/.gemini/antigravity/brain/f30b9712-4688-4c31-8061-eabc4fd00b11/screenshots';
const EDGE_PATH = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

async function audit() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // 1. Log in as admin
  await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle0' });
  const ownerBtn = await page.evaluateHandle(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.find((b) => b.textContent && b.textContent.includes('Owner Account'));
  });
  if (ownerBtn) await ownerBtn.click();
  await page.click('button[type="submit"]');
  await new Promise((r) => setTimeout(r, 1200));

  // ── AUDIT 1: Laptop 1366px ──
  console.log('=== AUDITING LAPTOP (1366px) ===');
  await page.setViewport({ width: 1366, height: 768 });
  await page.goto('http://localhost:3000/admin/pos', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1000));

  // Capture before screenshot at 1366px
  const laptopBefore = path.join(SCREENSHOT_DIR, 'pos-laptop-1366px-before.png');
  await page.screenshot({ path: laptopBefore, fullPage: false });
  console.log(`Saved laptop before screenshot: ${laptopBefore}`);

  const laptopInfo = await page.evaluate(() => {
    const sidebar = document.querySelector('aside');
    const header = document.querySelector('header');
    const posTopBar = document.querySelector('div.h-12');
    const catalogPane = document.querySelector('div.flex-1.flex.flex-col.border-r');
    const cartPane = document.querySelector('div.w-full.lg\\:w-\\[420px\\]');
    const main = document.querySelector('main');

    const sRect = sidebar ? sidebar.getBoundingClientRect() : null;
    const hRect = header ? header.getBoundingClientRect() : null;
    const topBarRect = posTopBar ? posTopBar.getBoundingClientRect() : null;
    const catRect = catalogPane ? catalogPane.getBoundingClientRect() : null;
    const cartRect = cartPane ? cartPane.getBoundingClientRect() : null;
    const mainRect = main ? main.getBoundingClientRect() : null;

    const sStyle = sidebar ? window.getComputedStyle(sidebar) : null;

    return {
      windowWidth: window.innerWidth,
      docScrollWidth: document.documentElement.scrollWidth,
      sidebar: sRect ? { left: sRect.left, right: sRect.right, width: sRect.width, position: sStyle.position } : null,
      header: hRect ? { top: hRect.top, bottom: hRect.bottom, height: hRect.height } : null,
      posTopBar: topBarRect ? { top: topBarRect.top, bottom: topBarRect.bottom, left: topBarRect.left, right: topBarRect.right } : null,
      catalog: catRect ? { left: catRect.left, right: catRect.right, width: catRect.width } : null,
      cart: cartRect ? { left: cartRect.left, right: cartRect.right, width: cartRect.width } : null,
      main: mainRect ? { left: mainRect.left, right: mainRect.right, width: mainRect.width } : null,
    };
  });
  console.log('Laptop 1366px Layout Metrics:', JSON.stringify(laptopInfo, null, 2));

  // ── AUDIT 2: Mobile 390px & 464px ──
  console.log('\n=== AUDITING MOBILE (390px) ===');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000/admin/pos', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1000));

  // Add 4 items to cart
  const productButtons = await page.$$('button.rounded-xl.border');
  for (let i = 0; i < Math.min(4, productButtons.length); i++) {
    await productButtons[i].click();
    await new Promise((r) => setTimeout(r, 200));
  }

  // Switch to Cart tab
  const cartTabBtn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find((b) => b.textContent && b.textContent.includes('Cart'));
  });
  if (cartTabBtn) {
    await cartTabBtn.click();
    await new Promise((r) => setTimeout(r, 600));
  }

  // Capture before screenshot at 390px (Cart View)
  const mobileCartBefore = path.join(SCREENSHOT_DIR, 'pos-mobile-cart-390px-before.png');
  await page.screenshot({ path: mobileCartBefore, fullPage: false });
  console.log(`Saved mobile cart before screenshot: ${mobileCartBefore}`);

  // Inspect why cart items are missing and what elements overflow
  const mobileInfo = await page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const innerWidth = window.innerWidth;
    const scrollWidth = Math.max(doc.scrollWidth, body.scrollWidth);

    // Look for cart container & cart items
    const cartItemsList = document.querySelector('div.flex-1.overflow-y-auto.p-3.space-y-2');
    const cartItems = cartItemsList ? Array.from(cartItemsList.children) : [];

    const listRect = cartItemsList ? cartItemsList.getBoundingClientRect() : null;
    const listStyle = cartItemsList ? window.getComputedStyle(cartItemsList) : null;

    const cartItemsData = cartItems.map((el, i) => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        index: i,
        tag: el.tagName,
        text: el.textContent ? el.textContent.slice(0, 40) : '',
        rect: { top: rect.top, bottom: rect.bottom, height: rect.height, width: rect.width },
        style: { display: style.display, visibility: style.visibility, opacity: style.opacity, height: style.height }
      };
    });

    // Check all elements wider than viewport or overflowing
    const overflowing = [];
    document.querySelectorAll('*').forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.right > innerWidth + 1 || rect.left < -1) {
        overflowing.push({
          tag: el.tagName.toLowerCase(),
          className: (el.className || '').toString().slice(0, 60),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width)
        });
      }
    });

    return {
      innerWidth,
      scrollWidth,
      hasOverflow: scrollWidth > innerWidth,
      cartContainer: listRect ? {
        top: listRect.top,
        bottom: listRect.bottom,
        height: listRect.height,
        width: listRect.width,
        display: listStyle.display,
        overflow: listStyle.overflow,
        maxHeight: listStyle.maxHeight,
        flex: listStyle.flex
      } : 'NOT_FOUND',
      cartItemsCount: cartItems.length,
      cartItemsData,
      overflowingCount: overflowing.length,
      topOverflowing: overflowing.slice(0, 8)
    };
  });

  console.log('Mobile 390px Audit Info:', JSON.stringify(mobileInfo, null, 2));

  await browser.close();
}

audit().catch(console.error);
