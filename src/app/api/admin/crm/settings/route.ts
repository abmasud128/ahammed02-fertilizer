import { NextResponse } from 'next/server';
import { crmDb } from '@/lib/crm/db';
import { getSession } from '@/lib/auth/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await crmDb.getSettings();
    return NextResponse.json({ success: true, settings });
  } catch (err: any) {
    console.error('CRM Settings GET error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
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
    const updated = await crmDb.updateSettings(body);
    return NextResponse.json({ success: true, settings: updated });
  } catch (err: any) {
    console.error('CRM Settings POST error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
