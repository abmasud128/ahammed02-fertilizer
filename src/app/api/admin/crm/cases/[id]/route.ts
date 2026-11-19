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
    const c = await crmDb.getCaseById(id);
    if (!c) {
      return NextResponse.json({ success: false, error: 'Case not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, case: c });
  } catch (err: any) {
    console.error('CRM Case GET error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch case' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    if (body.action === 'add_prescription') {
      const presc = await crmDb.addPrescription(id, {
        prescribedBy: session.userId,
        prescribedByName: session.name,
        notes: body.notes,
        items: body.items || [],
      });
      const updatedCase = await crmDb.getCaseById(id);
      return NextResponse.json({ success: true, prescription: presc, case: updatedCase });
    }

    if (body.action === 'add_media') {
      const media = await crmDb.addCaseMedia(id, {
        storagePath: body.storagePath,
        fileName: body.fileName,
        fileType: body.fileType,
        sizeBytes: body.sizeBytes,
        caption: body.caption,
      });
      const updatedCase = await crmDb.getCaseById(id);
      return NextResponse.json({ success: true, media, case: updatedCase });
    }

    if (body.action === 'update_status') {
      const updated = await crmDb.updateCaseStatus(
        id,
        body.status,
        session.name,
        body.reason
      );
      return NextResponse.json({ success: true, case: updated });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    console.error('CRM Case PUT error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update case' },
      { status: 500 }
    );
  }
}
