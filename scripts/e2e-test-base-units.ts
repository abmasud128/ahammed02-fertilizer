import { db } from '../src/lib/db';
import { calculateBaseUnitPricing, calculateLooseSale, formatBaseStockDisplay } from '../src/lib/inventory/unit-calculator';

async function runE2ETests() {
  console.log('================================================================');
  console.log('AHAMMED FERTILIZER - SMALLEST BASE UNIT & LOOSE BILLING E2E TEST');
  console.log('================================================================\n');

  // -------------------------------------------------------------
  // TEST 1: Tata Ergon, Bottle, 100 ml, buy 60, sell 100
  // -------------------------------------------------------------
  console.log('--- TEST 1: Tata Ergon (100 ml Bottle, Buy 60, Sell 100) ---');
  const p1 = await db.createProduct({
    name: 'Tata Ergon Test',
    brand: 'TATA',
    categoryId: 'bio_nutrients',
    packageType: 'Bottle',
    unit: 'bottle',
    packSizeValue: 100,
    packSizeUnit: 'ml',
    packSize: '100 ml',
    hsnCode: '3102',
    gstRate: 0,
    purchasePrice: 60,
    sellingPrice: 100,
    mrp: 120,
    lowStockThreshold: 5,
    isPesticide: false,
    isActive: true,
    initialBatch: {
      batchNumber: 'BAT-ERGON-01',
      expiryDate: '2027-12-31',
      quantity: 1, // 1 bottle = 100 ml
    },
  });

  console.log('Created product:', p1.name);
  console.log(`  Base Unit: ${p1.baseUnit}`);
  console.log(`  Pack Size in Base: ${p1.packSizeInBaseUnit} ${p1.baseUnit}`);
  console.log(`  Buy / Base Unit: ₹${p1.buyPerBaseUnit}/${p1.baseUnit} (Expected: ₹0.6/ml)`);
  console.log(`  Sell / Base Unit: ₹${p1.sellPerBaseUnit}/${p1.baseUnit} (Expected: ₹1.0/ml)`);
  console.log(`  Profit / Base Unit: ₹${p1.profitPerBaseUnit}/${p1.baseUnit}`);
  console.log(`  Profit / Pack: ₹${p1.profitPerPack}`);
  console.log(`  Initial Base Stock: ${p1.totalStockInBaseUnits} ml`);

  if (p1.buyPerBaseUnit !== 0.6 || p1.sellPerBaseUnit !== 1.0) {
    throw new Error('Test 1 failed rate calculation!');
  }

  // Sell 30 ml loose
  console.log('\nBilling 30 ml loose...');
  const sale1 = await db.createSale({
    customerName: 'Rahim Mondal',
    subtotal: 30,
    discountAmount: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    totalTax: 0,
    roundOff: 0,
    grandTotal: 30,
    paymentMode: 'cash',
    cashAmount: 30,
    upiAmount: 0,
    cardAmount: 0,
    creditAmount: 0,
    items: [
      {
        productId: p1.id,
        quantity: 1,
        unitPrice: 1,
        discount: 0,
        gstRate: 0,
        saleMode: 'loose',
        looseQuantity: 30,
        looseUnit: 'ml',
        looseQuantityInBaseUnit: 30,
        buyPerBaseUnit: p1.buyPerBaseUnit,
        sellPerBaseUnit: p1.sellPerBaseUnit,
      },
    ],
  });

  console.log(`Sale Created #${sale1.invoiceNumber}, Item total: ₹${sale1.items[0].totalAmount} (Expected: ₹30)`);
  console.log(`Sale Item profit: ₹${sale1.items[0].profit} (Expected: ₹12)`);

  const updatedP1 = await db.getProductById(p1.id);
  console.log(`Remaining stock: ${updatedP1?.totalStockInBaseUnits} ml (Expected: 70 ml)`);
  const stockDisp1 = formatBaseStockDisplay(updatedP1?.totalStockInBaseUnits || 0, updatedP1?.packSizeInBaseUnit || 100, updatedP1?.packageType || 'Bottle', updatedP1?.baseUnit || 'ml');
  console.log(`Stock Display: "${stockDisp1.primary}"\n`);

  if (sale1.items[0].totalAmount !== 30 || updatedP1?.totalStockInBaseUnits !== 70) {
    throw new Error('Test 1 loose sale deduction failed!');
  }

  // -------------------------------------------------------------
  // TEST 2: Bag, 50 kg, buy 500, sell 700
  // -------------------------------------------------------------
  console.log('--- TEST 2: Bag (50 kg Bag, Buy 500, Sell 700) ---');
  const p2 = await db.createProduct({
    name: 'Special Fertilizer 50kg Bag',
    brand: 'KRIBHCO',
    categoryId: 'fertilizers',
    packageType: 'Bag',
    unit: 'bag',
    packSizeValue: 50,
    packSizeUnit: 'kg',
    packSize: '50 kg',
    hsnCode: '3102',
    gstRate: 0,
    purchasePrice: 500,
    sellingPrice: 700,
    mrp: 750,
    lowStockThreshold: 5,
    isPesticide: false,
    isActive: true,
    initialBatch: {
      batchNumber: 'BAT-BAG-02',
      expiryDate: '2028-06-30',
      quantity: 2, // 2 bags = 100 kg = 100,000 g
    },
  });

  console.log('Created product:', p2.name);
  console.log(`  Base Unit: ${p2.baseUnit}`);
  console.log(`  Pack Size in Base: ${p2.packSizeInBaseUnit} ${p2.baseUnit} (50,000 g)`);
  console.log(`  Buy / Display Unit: ₹${p2.buyPerDisplayUnit}/kg (Expected: ₹10/kg)`);
  console.log(`  Sell / Display Unit: ₹${p2.sellPerDisplayUnit}/kg (Expected: ₹14/kg)`);
  console.log(`  Buy / Base Unit: ₹${p2.buyPerBaseUnit}/g (Expected: ₹0.0100/g)`);
  console.log(`  Sell / Base Unit: ₹${p2.sellPerBaseUnit}/g (Expected: ₹0.0140/g)`);
  console.log(`  Initial Base Stock: ${p2.totalStockInBaseUnits} g (100 kg)`);

  if (p2.buyPerDisplayUnit !== 10 || p2.sellPerDisplayUnit !== 14) {
    throw new Error('Test 2 failed display rate calculation!');
  }

  // Sell 5 kg loose
  console.log('\nBilling 5 kg loose (5,000 g)...');
  const sale2 = await db.createSale({
    customerName: 'Samir Sarkar',
    subtotal: 70,
    discountAmount: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    totalTax: 0,
    roundOff: 0,
    grandTotal: 70,
    paymentMode: 'cash',
    cashAmount: 70,
    upiAmount: 0,
    cardAmount: 0,
    creditAmount: 0,
    items: [
      {
        productId: p2.id,
        quantity: 1,
        unitPrice: p2.sellPerBaseUnit || 0.014,
        discount: 0,
        gstRate: 0,
        saleMode: 'loose',
        looseQuantity: 5,
        looseUnit: 'kg',
        looseQuantityInBaseUnit: 5000,
        buyPerBaseUnit: p2.buyPerBaseUnit,
        sellPerBaseUnit: p2.sellPerBaseUnit,
      },
    ],
  });

  console.log(`Sale Created #${sale2.invoiceNumber}, Item total: ₹${sale2.items[0].totalAmount} (Expected: ₹70)`);
  console.log(`Sale Item profit: ₹${sale2.items[0].profit} (Expected: ₹20)`);

  const updatedP2 = await db.getProductById(p2.id);
  console.log(`Remaining stock: ${updatedP2?.totalStockInBaseUnits} g (Expected: 95,000 g)`);
  const stockDisp2 = formatBaseStockDisplay(updatedP2?.totalStockInBaseUnits || 0, updatedP2?.packSizeInBaseUnit || 50000, updatedP2?.packageType || 'Bag', updatedP2?.baseUnit || 'g', updatedP2?.packSizeUnit);
  console.log(`Stock Display: "${stockDisp2.primary}" (Expected: "1 Bag + 45 kg")\n`);

  if (sale2.items[0].totalAmount !== 70 || updatedP2?.totalStockInBaseUnits !== 95000) {
    throw new Error('Test 2 loose sale deduction failed!');
  }

  // -------------------------------------------------------------
  // TEST 3: Bottle, 1 L, buy 450, sell 600
  // -------------------------------------------------------------
  console.log('--- TEST 3: Bottle 1L (Buy 450, Sell 600) ---');
  const p3 = await db.createProduct({
    name: 'Growth Booster 1L Bottle',
    brand: 'BIO-AGRO',
    categoryId: 'bio_nutrients',
    packageType: 'Bottle',
    unit: 'bottle',
    packSizeValue: 1,
    packSizeUnit: 'L',
    packSize: '1 L',
    hsnCode: '3102',
    gstRate: 0,
    purchasePrice: 450,
    sellingPrice: 600,
    mrp: 650,
    lowStockThreshold: 5,
    isPesticide: false,
    isActive: true,
    initialBatch: {
      batchNumber: 'BAT-1L-03',
      expiryDate: '2028-12-31',
      quantity: 1, // 1 bottle = 1,000 ml
    },
  });

  console.log('Created product:', p3.name);
  console.log(`  Base Unit: ${p3.baseUnit}`);
  console.log(`  Buy / Base Unit: ₹${p3.buyPerBaseUnit}/ml (Expected: ₹0.45/ml)`);
  console.log(`  Sell / Base Unit: ₹${p3.sellPerBaseUnit}/ml (Expected: ₹0.60/ml)`);
  console.log(`  Buy / Display Unit: ₹${p3.buyPerDisplayUnit}/L (Expected: ₹450/L)`);
  console.log(`  Sell / Display Unit: ₹${p3.sellPerDisplayUnit}/L (Expected: ₹600/L)`);

  if (p3.buyPerBaseUnit !== 0.45 || p3.sellPerBaseUnit !== 0.6) {
    throw new Error('Test 3 failed rate calculation!');
  }

  // Sell 250 ml loose
  console.log('\nBilling 250 ml loose...');
  const sale3 = await db.createSale({
    customerName: 'Anwar Hossain',
    subtotal: 150,
    discountAmount: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    totalTax: 0,
    roundOff: 0,
    grandTotal: 150,
    paymentMode: 'cash',
    cashAmount: 150,
    upiAmount: 0,
    cardAmount: 0,
    creditAmount: 0,
    items: [
      {
        productId: p3.id,
        quantity: 1,
        unitPrice: p3.sellPerBaseUnit || 0.6,
        discount: 0,
        gstRate: 0,
        saleMode: 'loose',
        looseQuantity: 250,
        looseUnit: 'ml',
        looseQuantityInBaseUnit: 250,
        buyPerBaseUnit: p3.buyPerBaseUnit,
        sellPerBaseUnit: p3.sellPerBaseUnit,
      },
    ],
  });

  console.log(`Sale Created #${sale3.invoiceNumber}, Item total: ₹${sale3.items[0].totalAmount} (Expected: ₹150)`);
  console.log(`Sale Item profit: ₹${sale3.items[0].profit} (Expected: ₹37.5)`);

  const updatedP3 = await db.getProductById(p3.id);
  console.log(`Remaining stock: ${updatedP3?.totalStockInBaseUnits} ml (Expected: 750 ml)`);
  const stockDisp3 = formatBaseStockDisplay(updatedP3?.totalStockInBaseUnits || 0, updatedP3?.packSizeInBaseUnit || 1000, updatedP3?.packageType || 'Bottle', updatedP3?.baseUnit || 'ml');
  console.log(`Stock Display: "${stockDisp3.primary}" (Expected: "750 ml loose")\n`);

  if (sale3.items[0].totalAmount !== 150 || updatedP3?.totalStockInBaseUnits !== 750) {
    throw new Error('Test 3 loose sale deduction failed!');
  }

  // -------------------------------------------------------------
  // TEST 4: Packet, 250 g, buy 40, sell 55
  // -------------------------------------------------------------
  console.log('--- TEST 4: Packet 250g (Buy 40, Sell 55) ---');
  const p4 = await db.createProduct({
    name: 'Zinc Sulfate 250g Packet',
    brand: 'AGRI-CHEM',
    categoryId: 'micronutrients',
    packageType: 'Packet',
    unit: 'packet',
    packSizeValue: 250,
    packSizeUnit: 'g',
    packSize: '250 g',
    hsnCode: '3102',
    gstRate: 0,
    purchasePrice: 40,
    sellingPrice: 55,
    mrp: 60,
    lowStockThreshold: 5,
    isPesticide: false,
    isActive: true,
    initialBatch: {
      batchNumber: 'BAT-250G-04',
      expiryDate: '2028-12-31',
      quantity: 1, // 1 packet = 250 g
    },
  });

  console.log('Created product:', p4.name);
  console.log(`  Base Unit: ${p4.baseUnit}`);
  console.log(`  Buy / Base Unit: ₹${p4.buyPerBaseUnit}/g (Expected: ₹0.16/g)`);
  console.log(`  Sell / Base Unit: ₹${p4.sellPerBaseUnit}/g (Expected: ₹0.22/g)`);

  if (p4.buyPerBaseUnit !== 0.16 || p4.sellPerBaseUnit !== 0.22) {
    throw new Error('Test 4 failed rate calculation!');
  }

  // Sell 100 g loose
  console.log('\nBilling 100 g loose...');
  const sale4 = await db.createSale({
    customerName: 'Babul Roy',
    subtotal: 22,
    discountAmount: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    totalTax: 0,
    roundOff: 0,
    grandTotal: 22,
    paymentMode: 'cash',
    cashAmount: 22,
    upiAmount: 0,
    cardAmount: 0,
    creditAmount: 0,
    items: [
      {
        productId: p4.id,
        quantity: 1,
        unitPrice: p4.sellPerBaseUnit || 0.22,
        discount: 0,
        gstRate: 0,
        saleMode: 'loose',
        looseQuantity: 100,
        looseUnit: 'g',
        looseQuantityInBaseUnit: 100,
        buyPerBaseUnit: p4.buyPerBaseUnit,
        sellPerBaseUnit: p4.sellPerBaseUnit,
      },
    ],
  });

  console.log(`Sale Created #${sale4.invoiceNumber}, Item total: ₹${sale4.items[0].totalAmount} (Expected: ₹22)`);
  console.log(`Sale Item profit: ₹${sale4.items[0].profit} (Expected: ₹6)`);

  const updatedP4 = await db.getProductById(p4.id);
  console.log(`Remaining stock: ${updatedP4?.totalStockInBaseUnits} g (Expected: 150 g)`);
  const stockDisp4 = formatBaseStockDisplay(updatedP4?.totalStockInBaseUnits || 0, updatedP4?.packSizeInBaseUnit || 250, updatedP4?.packageType || 'Packet', updatedP4?.baseUnit || 'g');
  console.log(`Stock Display: "${stockDisp4.primary}" (Expected: "150 g loose")\n`);

  if (sale4.items[0].totalAmount !== 22 || updatedP4?.totalStockInBaseUnits !== 150) {
    throw new Error('Test 4 loose sale deduction failed!');
  }

  // Clean up test products
  await db.deleteProduct(p1.id);
  await db.deleteProduct(p2.id);
  await db.deleteProduct(p3.id);
  await db.deleteProduct(p4.id);

  console.log('================================================================');
  console.log('✅ ALL 4 USER EXAMPLES PASSED END-TO-END WITH 100% ACCURACY!');
  console.log('================================================================');
}

runE2ETests().catch((err) => {
  console.error('E2E Test Failed:', err);
  process.exit(1);
});
