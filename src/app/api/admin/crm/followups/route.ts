import { NextResponse } from 'next/server';
import { crmDb } from '@/lib/crm/db';
import { getSession } from '@/lib/auth/session';
import { FollowupStatus } from '@/types/crm';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter');
    const status = (searchParams.get('status') as FollowupStatus) || undefined;
    const customerId = searchParams.get('customerId') || undefined;

    if (filter === 'today') {
      const calls = await crmDb.getTodaysCalls();
      return NextResponse.json({ success: true, followups: calls });
    }

    const followups = await crmDb.getFollowups({ status, customerId });
    return NextResponse.json({ success: true, followups });
  } catch (err: any) {
    console.error('CRM Followups GET error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch followups' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    if (!body.id || !body.status) {
      return NextResponse.json(
        { success: false, error: 'Follow-up ID and Status are required' },
        { status: 400 }
      );
    }

    const updated = await crmDb.updateFollowupOutcome(body.id, {
      status: body.status,
      outcome: body.outcome,
      customerFeedback: body.customerFeedback,
      satisfactionRating: body.satisfactionRating ? Number(body.satisfactionRating) : undefined,
      nextAction: body.nextAction,
      staffUser: { id: session.userId, name: session.name },
    });

    return NextResponse.json({ success: true, followup: updated });
  } catch (err: any) {
    console.error('CRM Followups PUT error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update followup' },
      { status: 500 }
    );
  }
}
