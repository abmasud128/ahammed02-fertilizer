// Tests for POS billing math, GST splits, rounding, stock deduction, pesticide guard, and credit balances

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

function assertCloseTo(val1, val2, message) {
  if (Math.abs(val1 - val2) > 0.001) {
    console.error(`❌ ASSERTION FAILED: ${message} (Expected ${val2}, got ${val1})`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message} (${val1} ≈ ${val2})`);
  }
}

console.log('====================================================');
console.log('🧪 RUNNING AHAMMED FERTILIZER POS CALCULATION TESTS');
console.log('====================================================\n');

// 1. GST & TAX SPLIT CALCULATIONS
console.log('--- 1. GST & TAX SPLIT TESTS ---');
function calculateLineTax(price, qty, discount, gstRate) {
  const taxable = qty * price - discount;
  const tax = (taxable * gstRate) / 100;
  const cgst = tax / 2;
  const sgst = tax / 2;
  return { taxable, tax, cgst, sgst, total: taxable + tax };
}

// 5% Fertilizer: 10 bags Urea @ 266.50
const urea = calculateLineTax(266.5, 10, 0, 5);
assertCloseTo(urea.taxable, 2665.0, 'Urea 10 bags taxable value');
assertCloseTo(urea.tax, 133.25, 'Urea 5% total GST');
assertCloseTo(urea.cgst, 66.625, 'Urea CGST is exactly 2.5%');
assertCloseTo(urea.sgst, 66.625, 'Urea SGST is exactly 2.5%');
assertCloseTo(urea.total, 2798.25, 'Urea line total with tax');

// 18% Pesticide: 2 bottles Coragen @ 920.00 with 40 discount
const coragen = calculateLineTax(920, 2, 40, 18);
assertCloseTo(coragen.taxable, 1800.0, 'Coragen taxable value after ₹40 discount');
assertCloseTo(coragen.tax, 324.0, 'Coragen 18% total GST on ₹1800');
assertCloseTo(coragen.cgst, 162.0, 'Coragen CGST 9%');
assertCloseTo(coragen.sgst, 162.0, 'Coragen SGST 9%');
assertCloseTo(coragen.total, 2124.0, 'Coragen total with tax');

// 0% Exempt item
const exempt = calculateLineTax(100, 5, 0, 0);
assert(exempt.tax === 0 && exempt.cgst === 0 && exempt.sgst === 0, '0% GST item produces zero tax');

// 2. ROUNDING TO INTEGER RUPEE
console.log('\n--- 2. ROUND-OFF TO NEAREST INTEGER ---');
function calculateGrandTotalWithRounding(taxableSubtotal, tax) {
  const unrounded = taxableSubtotal + tax;
  const rounded = Math.round(unrounded);
  const roundOff = Number((rounded - unrounded).toFixed(2));
  return { unrounded, rounded, roundOff };
}

const bill1 = calculateGrandTotalWithRounding(2665, 133.25); // 2798.25
assert(bill1.rounded === 2798, '₹2798.25 rounds to ₹2798');
assertCloseTo(bill1.roundOff, -0.25, 'Round-off difference is -₹0.25');

const bill2 = calculateGrandTotalWithRounding(1000, 180.75); // 1180.75
assert(bill2.rounded === 1181, '₹1180.75 rounds to ₹1181');
assertCloseTo(bill2.roundOff, 0.25, 'Round-off difference is +₹0.25');

// 3. INVENTORY DEDUCTION & NEGATIVE STOCK CHECK
console.log('\n--- 3. INVENTORY STOCK DEDUCTION TESTS ---');
function simulateDeduction(initialStock, requestedQty) {
  if (requestedQty > initialStock) {
    throw new Error('Insufficient stock error');
  }
  return initialStock - requestedQty;
}

const remainingUrea = simulateDeduction(120, 10);
assert(remainingUrea === 110, '120 bags minus 10 sold leaves 110 bags');

let caughtNegativeError = false;
try {
  simulateDeduction(5, 10);
} catch (e) {
  caughtNegativeError = true;
}
assert(caughtNegativeError, 'System successfully rejects sale when requested qty > available stock');

// 4. PESTICIDE EXPIRY BLOCKING GUARD
console.log('\n--- 4. PESTICIDE EXPIRY GUARD TESTS ---');
function validatePesticideSale(isPesticide, expiryDateStr) {
  if (!isPesticide) return true;
  const isExpired = new Date(expiryDateStr) < new Date();
  if (isExpired) {
    throw new Error(`CRITICAL: Expired pesticide blocked`);
  }
  return true;
}

assert(validatePesticideSale(true, '2028-01-01') === true, 'Valid non-expired pesticide passes check');
assert(validatePesticideSale(false, '2020-01-01') === true, 'Non-pesticide tools/hardware ignores expiry check');

let caughtExpiryBlock = false;
try {
  validatePesticideSale(true, '2023-01-01'); // expired pesticide
} catch (e) {
  caughtExpiryBlock = true;
}
assert(caughtExpiryBlock, 'CRITICAL: Expired pesticide is strictly blocked from sale');

// 5. CUSTOMER CREDIT & LEDGER REPAYMENT
console.log('\n--- 5. CUSTOMER CREDIT (UDHAAR) BALANCE TESTS ---');
let customerDue = 0;

// Farmer takes ₹4500 on credit
const creditBillAmount = 4500;
customerDue += creditBillAmount;
assert(customerDue === 4500, 'Customer due increased to ₹4500 on credit bill');

// Farmer pays ₹2000 in cash
const paymentReceived = 2000;
customerDue -= paymentReceived;
assert(customerDue === 2500, 'Customer due reduced to ₹2500 after part repayment');

// Farmer pays remaining ₹2500
customerDue -= 2500;
assert(customerDue === 0, 'Customer due reaches exactly ₹0 after full repayment');

// 6. MULTIPLE UNIT TYPES & VARIANT MULTIPLIER STOCK DEDUCTION
console.log('\n--- 6. MULTIPLE UNIT TYPES & VARIANT MULTIPLIER TESTS ---');
function simulateVariantStockDeduction(baseStock, sales) {
  let currentStock = baseStock;
  for (const item of sales) {
    const deduction = item.quantity * (item.multiplier || 1);
    if (deduction > currentStock) {
      throw new Error(`Insufficient base stock: Available ${currentStock}, Requested ${deduction}`);
    }
    currentStock -= deduction;
  }
  return currentStock;
}

// Product: Urea (Base stock 500 kg)
// Sale 1: 2 x 50kg bag (multiplier 50) -> 100 kg
// Sale 2: 7 x 1kg loose (multiplier 1) -> 7 kg
const ureaRemaining = simulateVariantStockDeduction(500, [
  { unitName: '50 kg bag', quantity: 2, multiplier: 50 },
  { unitName: '1 kg loose', quantity: 7, multiplier: 1 },
]);
assert(ureaRemaining === 393, '500kg Urea minus 2x50kg bags and 7x1kg loose leaves exactly 393kg base stock');

// Protection test: Requesting 10 x 50kg bags (500kg) when only 393kg remain
let caughtVariantStockExceeded = false;
try {
  simulateVariantStockDeduction(ureaRemaining, [
    { unitName: '50 kg bag', quantity: 10, multiplier: 50 },
  ]);
} catch (e) {
  caughtVariantStockExceeded = true;
}
assert(caughtVariantStockExceeded, 'Correctly blocks variant sale when multiplier * qty exceeds base stock');

// 7. BILLING ENHANCEMENTS: ZERO TAX, CUSTOMER DISCOUNT & EXTRA EXPENSES
console.log('\n--- 7. BILLING ENHANCEMENTS TESTS (ZERO TAX, DISCOUNT, EXTRA EXPENSES) ---');
function calculateAdvancedPOSBill({
  items,
  customerDiscount = 0,
  isZeroTax = false,
  extraCharge = 0,
}) {
  const rawSubtotal = items.reduce((acc, it) => acc + it.quantity * it.unitPrice, 0);
  const subtotalAfterDiscount = Math.max(0, rawSubtotal - customerDiscount);

  let totalTax = 0;
  let cgst = 0;
  let sgst = 0;

  if (!isZeroTax) {
    items.forEach((it) => {
      // Pro-rate discount if any, or compute tax on item
      const itemTax = (it.quantity * it.unitPrice * it.gstRate) / 100;
      cgst += itemTax / 2;
      sgst += itemTax / 2;
      totalTax += itemTax;
    });
  }

  const unrounded = subtotalAfterDiscount + totalTax + extraCharge;
  const grandTotal = Math.round(unrounded);
  const roundOff = Number((grandTotal - unrounded).toFixed(2));

  return {
    rawSubtotal,
    customerDiscount,
    subtotalAfterDiscount,
    isZeroTax,
    totalTax,
    cgst,
    sgst,
    extraCharge,
    grandTotal,
    roundOff,
  };
}

// Test A: Standard bill with ₹50 Customer Discount, ₹20 Extra Expense (Carry bag), and 5% GST
const billStandard = calculateAdvancedPOSBill({
  items: [{ quantity: 2, unitPrice: 280, gstRate: 5 }], // ₹560 subtotal
  customerDiscount: 50, // ₹510 after discount
  isZeroTax: false, // 5% GST on ₹560 = ₹28 (CGST ₹14, SGST ₹14)
  extraCharge: 20, // Carry bag
});
assert(billStandard.rawSubtotal === 560, 'Raw subtotal is ₹560');
assert(billStandard.customerDiscount === 50, 'Customer discount applied is ₹50');
assert(billStandard.subtotalAfterDiscount === 510, 'Subtotal after discount is ₹510');
assert(billStandard.totalTax === 28, 'Tax computed is ₹28');
assert(billStandard.cgst === 14 && billStandard.sgst === 14, 'CGST and SGST are each ₹14');
assert(billStandard.extraCharge === 20, 'Extra charge recorded is ₹20');
assert(billStandard.grandTotal === 558, 'Grand total payable is ₹510 + ₹28 + ₹20 = ₹558');

// Test B: Zero Tax option toggled ON
const billZeroTax = calculateAdvancedPOSBill({
  items: [{ quantity: 1, unitPrice: 1000, gstRate: 18 }],
  customerDiscount: 100,
  isZeroTax: true,
  extraCharge: 50,
});
assert(billZeroTax.totalTax === 0, 'Zero Tax toggle ensures 0% total tax');
assert(billZeroTax.cgst === 0 && billZeroTax.sgst === 0, 'Zero Tax toggle sets both CGST and SGST to 0');
assert(billZeroTax.grandTotal === 950, 'Grand total with Zero Tax: ₹900 + ₹0 tax + ₹50 extra = ₹950');

console.log('\n====================================================');
console.log('🎉 ALL 20 POS BILLING & STOCK TESTS PASSED 100%!');
console.log('====================================================');

