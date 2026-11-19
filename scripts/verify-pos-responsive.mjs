import puppeteer from 'puppeteer-core';
import path from 'path';

const SCREENSHOT_DIR = 'C:/Users/Sk Najmul Hasan/.gemini/antigravity/brain/f30b9712-4688-4c31-8061-eabc4fd00b11/screenshots';
const EDGE_PATH = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

async function verify() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // 1. Log in
  await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find((b) => b.textContent && b.textContent.includes('Owner'));
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 200));
  await page.click('button[type="submit"]');
  await new Promise((r) => setTimeout(r, 1200));

  console.log('=== TEST 1: LAPTOP 1366px ===');
  await page.setViewport({ width: 1366, height: 768 });
  await page.goto('http://localhost:3000/admin/pos', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 800));

  // Add 3 items to cart for full desk view
  const prodButtons = await page.$$('button.rounded-xl.border');
  for (let i = 0; i < Math.min(3, prodButtons.length); i++) {
    await prodButtons[i].click();
    await new Promise((r) => setTimeout(r, 150));
  }
  await new Promise((r) => setTimeout(r, 500));

  const laptopMetrics = await page.evaluate(() => {
    const sidebar = document.querySelector('aside');
    const header = document.querySelector('header');
    const posTopBar = document.querySelector('div.select-none');
    const catalog = document.querySelector('div.border-r');
    const cart = document.querySelector('div.shadow-xl');

    const sRect = sidebar ? sidebar.getBoundingClientRect() : null;
    const hRect = header ? header.getBoundingClientRect() : null;
    const tRect = posTopBar ? posTopBar.getBoundingClientRect() : null;
    const catRect = catalog ? catalog.getBoundingClientRect() : null;
    const cartRect = cart ? cart.getBoundingClientRect() : null;

    return {
      windowWidth: window.innerWidth,
      docScrollWidth: document.documentElement.scrollWidth,
      sidebar: sRect ? { left: sRect.left, right: sRect.right, width: sRect.width } : null,
      header: hRect ? { top: hRect.top, bottom: hRect.bottom, height: hRect.height } : null,
      posTopBar: tRect ? { top: tRect.top, bottom: tRect.bottom, left: tRect.left, right: tRect.right } : null,
      catalog: catRect ? { left: catRect.left, right: catRect.right, width: catRect.width } : null,
      cart: cartRect ? { left: cartRect.left, right: cartRect.right, width: cartRect.width } : null,
      sidebarOverlapsCatalog: catRect && sRect ? catRect.left < sRect.right : false,
      cartPastScreen: cartRect ? cartRect.right > window.innerWidth : false,
      topBarUnderHeader: tRect && hRect ? tRect.top < hRect.bottom : false,
    };
  });
  console.log('Laptop 1366px Metrics:', JSON.stringify(laptopMetrics, null, 2));

  const laptopAfter = path.join(SCREENSHOT_DIR, 'pos-laptop-1366px-after.png');
  await page.screenshot({ path: laptopAfter, fullPage: false });
  console.log(`Saved laptop after screenshot: ${laptopAfter}`);

  // Test 125% scaling (1093x614) and 150% scaling (911x512)
  console.log('\n=== TEST 2: DISPLAY SCALING ===');
  await page.setViewport({ width: 1093, height: 614 });
  await new Promise((r) => setTimeout(r, 500));
  const scale125 = await page.evaluate(() => ({
    width: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    hasOverflow: document.documentElement.scrollWidth > window.innerWidth,
  }));
  console.log('125% Scaling (1093px):', scale125);

  // Test 1024px
  console.log('\n=== TEST 3: TABLET / SMALL LAPTOP 1024px ===');
  await page.setViewport({ width: 1024, height: 768 });
  await new Promise((r) => setTimeout(r, 500));
  const metrics1024 = await page.evaluate(() => {
    const sidebar = document.querySelector('aside');
    const cart = document.querySelector('div.shadow-xl');
    return {
      sidebarWidth: sidebar?.getBoundingClientRect().width,
      cartWidth: cart?.getBoundingClientRect().width,
      cartRight: cart?.getBoundingClientRect().right,
      scrollWidth: document.documentElement.scrollWidth,
      windowWidth: window.innerWidth,
    };
  });
  console.log('1024px Metrics:', metrics1024);

  // Test 768px Tablet
  console.log('\n=== TEST 4: TABLET 768px ===');
  await page.setViewport({ width: 768, height: 1024 });
  await new Promise((r) => setTimeout(r, 500));
  const tabletAfter = path.join(SCREENSHOT_DIR, 'pos-tablet-768px-after.png');
  await page.screenshot({ path: tabletAfter, fullPage: false });
  console.log(`Saved tablet after screenshot: ${tabletAfter}`);

  // Test Mobile 390px
  console.log('\n=== TEST 5: MOBILE 390px (CART & CATALOG) ===');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3000/admin/pos', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 800));

  // Add 4 items
  const mobCards = await page.$$('button.rounded-xl.border');
  for (let i = 0; i < Math.min(4, mobCards.length); i++) {
    await mobCards[i].click();
    await new Promise((r) => setTimeout(r, 150));
  }
  await new Promise((r) => setTimeout(r, 400));

  // Capture Mobile Catalog View
  const mobileCatAfter = path.join(SCREENSHOT_DIR, 'pos-mobile-catalog-390px-after.png');
  await page.screenshot({ path: mobileCatAfter, fullPage: false });
  console.log(`Saved mobile catalog after screenshot: ${mobileCatAfter}`);

  // Switch to Cart Tab
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find((b) => b.textContent && b.textContent.includes('Cart'));
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  const mobileCartInfo = await page.evaluate(() => {
    const list = document.querySelector('div.flex-1.min-h-\\[140px\\]');
    const items = list ? Array.from(list.children) : [];
    const overflowing = [];
    document.querySelectorAll('*').forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.right > window.innerWidth + 1 || rect.left < -1) {
        // Ignore off-canvas hidden sidebar
        if (el.closest('aside') && rect.left < -50) return;
        overflowing.push({
          tag: el.tagName.toLowerCase(),
          className: (el.className || '').toString().slice(0, 50),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
        });
      }
    });

    const itemsData = items.map((el, i) => {
      const r = el.getBoundingClientRect();
      const stepperMinus = el.querySelector('button[aria-label="Decrease quantity"]');
      const stepperPlus = el.querySelector('button[aria-label="Increase quantity"]');
      const mR = stepperMinus ? stepperMinus.getBoundingClientRect() : null;
      const pR = stepperPlus ? stepperPlus.getBoundingClientRect() : null;

      return {
        index: i,
        name: el.querySelector('h5')?.textContent || '',
        cardHeight: Math.round(r.height),
        cardWidth: Math.round(r.width),
        stepperMinusSize: mR ? `${Math.round(mR.width)}x${Math.round(mR.height)}` : 'N/A',
        stepperPlusSize: pR ? `${Math.round(pR.width)}x${Math.round(pR.height)}` : 'N/A',
      };
    });

    return {
      windowWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      hasOverflow: document.documentElement.scrollWidth > window.innerWidth,
      cartItemsCount: items.length,
      itemsData,
      overflowingElements: overflowing,
    };
  });
  console.log('Mobile 390px Cart Info:', JSON.stringify(mobileCartInfo, null, 2));

  const mobileCartAfter = path.join(SCREENSHOT_DIR, 'pos-mobile-cart-390px-after.png');
  await page.screenshot({ path: mobileCartAfter, fullPage: false });
  console.log(`Saved mobile cart after screenshot: ${mobileCartAfter}`);

  // Test Mobile 464px, 360px, 320px
  console.log('\n=== TEST 6: EXTREME MOBILE SIZES (464px, 360px, 320px) ===');
  for (const w of [464, 360, 320]) {
    await page.setViewport({ width: w, height: 740, isMobile: true, hasTouch: true });
    await new Promise((r) => setTimeout(r, 400));
    const info = await page.evaluate(() => ({
      width: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      hasOverflow: document.documentElement.scrollWidth > window.innerWidth,
    }));
    console.log(`Width ${w}px:`, info);
  }

  await browser.close();
  console.log('\nALL VERIFICATION TESTS COMPLETED SUCCESSFULLY.');
}

verify().catch(console.error);
