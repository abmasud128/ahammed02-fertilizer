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
    const query = searchParams.get('q')?.toLowerCase();
    const category = searchParams.get('category');

    let products = await db.getProducts();

    if (query) {
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query) ||
          (p.barcode && p.barcode.toLowerCase().includes(query)) ||
          (p.hsnCode && p.hsnCode.includes(query))
      );
    }

    if (category && category !== 'all') {
      products = products.filter((p) => p.categoryId === category);
    }

    const categories = await db.getCategories();

    return NextResponse.json({ success: true, products, categories });
  } catch (err: any) {
    console.error('Products GET error:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    if (!body.name || !body.brand || !body.categoryId) {
      return NextResponse.json(
        { success: false, error: 'Product name, brand, and category are required' },
        { status: 400 }
      );
    }

    // Fertilizers are strictly single-unit packaged products without multiple unit variants
    if (body.categoryId === 'fertilizers' || body.categoryId?.toLowerCase().includes('fertilizer')) {
      body.variants = [];
    }

    const newProduct = await db.createProduct(body);

    await db.recordAudit({
      userEmail: session.email,
      action: 'product_created',
      entityType: 'product',
      entityId: newProduct.id,
      details: { name: newProduct.name, brand: newProduct.brand },
    });

    return NextResponse.json({ success: true, product: newProduct });
  } catch (err: any) {
    console.error('Products POST error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 } );
    }

    // Fertilizers are strictly single-unit packaged products without multiple unit variants
    if (body.categoryId === 'fertilizers' || body.categoryId?.toLowerCase().includes('fertilizer')) {
      body.variants = [];
    }

    const updated = await db.updateProduct(body.id, body);

    await db.recordAudit({
      userEmail: session.email,
      action: 'product_updated',
      entityType: 'product',
      entityId: updated.id,
      details: { name: updated.name },
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (err: any) {
    console.error('Products PUT error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Only owner can delete products
    if (session.role !== 'owner') {
      return NextResponse.json({ success: false, error: 'Only owners can delete products' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 });
    }

    await db.deleteProduct(id);

    await db.recordAudit({
      userEmail: session.email,
      action: 'product_deleted',
      entityType: 'product',
      entityId: id,
      details: { deletedAt: new Date().toISOString() },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Products DELETE error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Failed to delete product' }, { status: 500 });
  }
}
