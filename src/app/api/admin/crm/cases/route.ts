import { NextResponse } from 'next/server';
import { crmDb } from '@/lib/crm/db';
import { getSession } from '@/lib/auth/session';
import { CaseCategory, CaseStatus } from '@/types/crm';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId') || undefined;
    const plotId = searchParams.get('plotId') || undefined;
    const category = (searchParams.get('category') as CaseCategory) || undefined;
    const status = (searchParams.get('status') as CaseStatus) || undefined;
    const search = searchParams.get('search') || undefined;

    const cases = await crmDb.getCases({
      customerId,
      plotId,
      category,
      status,
      search,
    });

    return NextResponse.json({ success: true, cases });
  } catch (err: any) {
    console.error('CRM Cases GET error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cases' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    if (!body.customerId || !body.plotId || !body.category || !body.title || !body.description) {
      return NextResponse.json(
        { success: false, error: 'Customer, Plot, Category, Title and Description are required' },
        { status: 400 }
      );
    }

    const newCase = await crmDb.createCase({
      ...body,
      createdBy: session.userId,
      createdByName: session.name,
    });

    return NextResponse.json({ success: true, case: newCase });
  } catch (err: any) {
    console.error('CRM Cases POST error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create case' },
      { status: 500 }
    );
  }
}
