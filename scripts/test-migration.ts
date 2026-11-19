import { db } from '../src/lib/db';

async function main() {
  console.log('Loading products from db...');
  const products = await db.getProducts();
  console.log(`Successfully loaded ${products.length} products.`);
  for (const p of products) {
    console.log(`\nProduct: ${p.name}`);
    console.log(`  Package: ${p.packageType || p.unit}, Pack Size: ${p.packSizeValue || p.packSize} ${p.packSizeUnit || ''}`);
    console.log(`  Base Unit: ${p.baseUnit}, In Base: ${p.packSizeInBaseUnit}`);
    console.log(`  Buy/Base: ₹${p.buyPerBaseUnit}/${p.baseUnit}, Sell/Base: ₹${p.sellPerBaseUnit}/${p.baseUnit}`);
    console.log(`  Profit/Base: ₹${p.profitPerBaseUnit}/${p.baseUnit}, Profit/Pack: ₹${p.profitPerPack}`);
    console.log(`  Display Unit: ${p.displayUnit} -> ₹${p.buyPerDisplayUnit} buy, ₹${p.sellPerDisplayUnit} sell`);
    console.log(`  Total Base Stock: ${p.totalStockInBaseUnits}`);
  }
}

main().catch(console.error);
