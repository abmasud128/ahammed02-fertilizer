import { calculateBaseUnitPricing, calculateLooseSale } from '../src/lib/inventory/unit-calculator';

console.log('--- Test 1: Tata Ergon, Bottle, 100 ml, buy 60, sell 100 ---');
const t1 = calculateBaseUnitPricing({ name: 'Tata Ergon', packageType: 'Bottle', packSize: 100, packSizeUnit: 'ml', buyingPrice: 60, sellingPrice: 100 });
console.log('buyPerBaseUnit:', t1.buyPerBaseUnit, 'sellPerBaseUnit:', t1.sellPerBaseUnit);
const s1 = calculateLooseSale(30, 'ml', t1.sellPerBaseUnit, t1.buyPerBaseUnit);
console.log('selling 30 ml -> lineTotal: ₹' + s1.lineTotal, 'profit: ₹' + s1.lineProfit);

console.log('\n--- Test 2: Bag, 50 kg, buy 500, sell 700 ---');
const t2 = calculateBaseUnitPricing({ name: 'Bag Test', packageType: 'Bag', packSize: 50, packSizeUnit: 'kg', buyingPrice: 500, sellingPrice: 700 });
console.log('buyPerDisplayUnit (kg): ₹' + t2.buyPerDisplayUnit, 'sellPerDisplayUnit (kg): ₹' + t2.sellPerDisplayUnit);
console.log('buyPerBaseUnit (g): ₹' + t2.buyPerBaseUnit, 'sellPerBaseUnit (g): ₹' + t2.sellPerBaseUnit);
const s2 = calculateLooseSale(5, 'kg', t2.sellPerBaseUnit, t2.buyPerBaseUnit);
console.log('selling 5 kg -> lineTotal: ₹' + s2.lineTotal, 'profit: ₹' + s2.lineProfit);

console.log('\n--- Test 3: Bottle, 1 L, buy 450, sell 600 ---');
const t3 = calculateBaseUnitPricing({ name: '1L Bottle', packageType: 'Bottle', packSize: 1, packSizeUnit: 'L', buyingPrice: 450, sellingPrice: 600 });
console.log('buyPerDisplayUnit (L): ₹' + t3.buyPerDisplayUnit, 'sellPerDisplayUnit (L): ₹' + t3.sellPerDisplayUnit);
console.log('buyPerBaseUnit (ml): ₹' + t3.buyPerBaseUnit, 'sellPerBaseUnit (ml): ₹' + t3.sellPerBaseUnit);
const s3 = calculateLooseSale(250, 'ml', t3.sellPerBaseUnit, t3.buyPerBaseUnit);
console.log('selling 250 ml -> lineTotal: ₹' + s3.lineTotal, 'profit: ₹' + s3.lineProfit);

console.log('\n--- Test 4: Packet, 250 g, buy 40, sell 55 ---');
const t4 = calculateBaseUnitPricing({ name: '250g Packet', packageType: 'Packet', packSize: 250, packSizeUnit: 'g', buyingPrice: 40, sellingPrice: 55 });
console.log('buyPerBaseUnit (g): ₹' + t4.buyPerBaseUnit, 'sellPerBaseUnit (g): ₹' + t4.sellPerBaseUnit);
const s4 = calculateLooseSale(100, 'g', t4.sellPerBaseUnit, t4.buyPerBaseUnit);
console.log('selling 100 g -> lineTotal: ₹' + s4.lineTotal, 'profit: ₹' + s4.lineProfit);
