import { NextResponse } from 'next/server';
import { crmDb } from '@/lib/crm/db';
import { getSession } from '@/lib/auth/session';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const dossier = await crmDb.getCustomerDossier(id);

    if (!dossier) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, dossier });
  } catch (err: any) {
    console.error('CRM Customer Dossier GET error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customer dossier' },
      { status: 500 }
    );
  }
}
