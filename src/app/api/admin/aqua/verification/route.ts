import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { aquaDb } from '@/lib/aqua/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const userId = session?.userId || 'user-owner-1';

    const body = await req.json();
    const { type, id, status, rejectionReason } = body;

    if (!type || !id || !status) {
      return NextResponse.json({ success: false, error: 'Type, ID, and Status are required' }, { status: 400 });
    }

    const updated = await aquaDb.verifyItem(
      type,
      id,
      status,
      rejectionReason,
      userId
    );

    return NextResponse.json({
      success: true,
      message: `Record ${status} successfully`,
      updated,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
