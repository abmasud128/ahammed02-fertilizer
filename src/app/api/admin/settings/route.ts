import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await db.getSettings();
    return NextResponse.json({ success: true, settings });
  } catch (err: any) {
    console.error('Settings GET error:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'owner') {
      return NextResponse.json(
        { success: false, error: 'Permission denied: Only store owners can update configuration' },
        { status: 403 }
      );
    }

    const updates = await req.json();
    const updatedSettings = await db.updateSettings(updates);

    await db.recordAudit({
      userEmail: session.email,
      action: 'settings_updated',
      entityType: 'settings',
      details: updates,
    });

    return NextResponse.json({ success: true, settings: updatedSettings });
  } catch (err: any) {
    console.error('Settings PUT error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update settings' },
      { status: 500 }
    );
  }
}
