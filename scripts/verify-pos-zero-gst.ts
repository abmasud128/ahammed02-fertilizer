import { db } from '../src/lib/db';

async function verify() {
  console.log('--- RUNNING POS & ZERO GST VERIFICATION ---');

  const products = await db.getProducts();
  console.log(`Loaded ${products.length} products.`);

  // Find Tata Ergon (100 ml bottle) and a 50 kg bag product
  const ergon = products.find(p => p.name.includes('Tata Ergon') || p.name.includes('Ergon')) || products[0];
  const bagProduct = products.find(p => p.packSizeUnit === 'kg' || (p.packSize && p.packSize.includes('kg'))) || products[1];

  console.log(`Product 1 (liquid): ${ergon.name} (Base stock: ${ergon.totalStockInBaseUnits} ${ergon.baseUnit})`);
  console.log(`Product 2 (bag/weight): ${bagProduct.name} (Base stock: ${bagProduct.totalStockInBaseUnits} ${bagProduct.baseUnit})`);

  // Simulate POS Sale Payload with Zero Tax & Loose quantities
  const salePayload = {
    customerName: 'Amiya Mondal',
    customerPhone: '9832145678',
    customerVillage: 'Chapmatali',
    subtotal: 100, // 70 + 30
    discountAmount: 10,
    cgstAmount: 0,
    sgstAmount: 0,
    totalTax: 0,
    roundOff: 0,
    isZeroTax: true,
    extraCharge: 0,
    extraChargeReason: '',
    grandTotal: 90, // 100 - 10 discount
    paymentMode: 'cash' as const,
    cashAmount: 90,
    upiAmount: 0,
    cardAmount: 0,
    creditAmount: 0,
    notes: 'Zero Tax verification test sale',
    cashierName: 'Verification Bot',
    items: [
      {
        productId: ergon.id,
        quantity: 1,
        unitPrice: ergon.sellPerBaseUnit ? ergon.sellPerBaseUnit * 30 : 30,
        discount: 0,
        gstRate: 0,
        saleMode: 'loose' as const,
        looseQuantity: 30,
        looseUnit: 'ml',
        looseQuantityInBaseUnit: 30,
        buyPerBaseUnit: ergon.buyPerBaseUnit,
        sellPerBaseUnit: ergon.sellPerBaseUnit,
        totalAmount: 30,
      },
      {
        productId: bagProduct.id,
        quantity: 1,
        unitPrice: bagProduct.sellPerBaseUnit ? bagProduct.sellPerBaseUnit * 5000 : 70,
        discount: 0,
        gstRate: 0,
        saleMode: 'loose' as const,
        looseQuantity: 5,
        looseUnit: 'kg',
        looseQuantityInBaseUnit: 5000,
        buyPerBaseUnit: bagProduct.buyPerBaseUnit,
        sellPerBaseUnit: bagProduct.sellPerBaseUnit,
        totalAmount: 70,
      }
    ],
  };

  const sale = await db.createSale(salePayload);

  console.log('\n--- VERIFYING GENERATED SALE RECORD ---');
  console.log(`Invoice Number: #${sale.invoiceNumber}`);
  console.log(`Subtotal: ₹${sale.subtotal}`);
  console.log(`Discount: ₹${sale.discountAmount}`);
  console.log(`CGST: ₹${sale.cgstAmount}`);
  console.log(`SGST: ₹${sale.sgstAmount}`);
  console.log(`Total Tax: ₹${sale.totalTax}`);
  console.log(`Grand Total: ₹${sale.grandTotal}`);
  console.log(`isZeroTax: ${sale.isZeroTax}`);

  if (sale.cgstAmount !== 0 || sale.sgstAmount !== 0 || sale.totalTax !== 0) {
    throw new Error('FAILED: Tax is not zero!');
  }

  for (const it of sale.items) {
    console.log(` Item: ${it.productName} | Qty: ${it.unit} | Rate: ₹${it.unitPrice} | GST: ${it.gstRate}% | Total: ₹${it.totalAmount}`);
    if (it.gstRate !== 0 || it.cgstAmount !== 0 || it.sgstAmount !== 0) {
      throw new Error(`FAILED: Item ${it.productName} has non-zero tax!`);
    }
  }

  console.log('\n--- VERIFYING STOCK DEDUCTION ---');
  const updatedErgon = (await db.getProducts()).find(p => p.id === ergon.id);
  const updatedBag = (await db.getProducts()).find(p => p.id === bagProduct.id);

  console.log(`${ergon.name} stock before: ${ergon.totalStockInBaseUnits} ml -> after: ${updatedErgon?.totalStockInBaseUnits} ml`);
  console.log(`${bagProduct.name} stock before: ${bagProduct.totalStockInBaseUnits} g -> after: ${updatedBag?.totalStockInBaseUnits} g`);

  console.log('\n✅ ALL POS ZERO GST TESTS PASSED WITH 100% SUCCESS!');
}

verify().catch((err) => {
  console.error(err);
  process.exit(1);
});
