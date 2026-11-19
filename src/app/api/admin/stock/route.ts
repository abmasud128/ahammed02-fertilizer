import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId') || undefined;

    const products = await db.getProducts();
    const batches = await db.getBatches(productId);
    const movements = await db.getStockMovements(productId);

    // Enrich batches with product details
    const enrichedBatches = batches.map((b) => {
      const prod = products.find((p) => p.id === b.productId);
      return {
        ...b,
        productName: prod ? prod.name : 'Unknown Product',
        productBrand: prod ? prod.brand : '',
        category: prod ? prod.categoryId : '',
        unit: prod ? prod.unit : 'unit',
        isPesticide: prod ? prod.isPesticide : false,
        packSize: prod?.packSize || '',
        packageType: prod?.packageType || prod?.unit || 'Pack',
        packSizeInBaseUnit: prod?.packSizeInBaseUnit || 1,
        baseUnit: prod?.baseUnit || 'g',
        packSizeUnit: prod?.packSizeUnit || 'kg',
        displayUnit: prod?.displayUnit || 'kg',
      };
    });

    return NextResponse.json({
      success: true,
      products,
      batches: enrichedBatches,
      movements: movements.slice(0, 100), // latest 100 movements
    });
  } catch (err: any) {
    console.error('Stock GET error:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch stock' }, { status: 500 });
  }
}
