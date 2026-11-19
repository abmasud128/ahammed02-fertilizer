import { NextResponse } from 'next/server';
import { crmDb } from '@/lib/crm/db';
import { getSession } from '@/lib/auth/session';
import { TestRequestStatus, TestType } from '@/types/crm';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get('id');

    if (requestId) {
      const request = await crmDb.getTestRequestById(requestId);
      if (!request) {
        return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
      }
      const result = await crmDb.getTestResultByRequestId(requestId);
      return NextResponse.json({ success: true, request, result });
    }

    const status = (searchParams.get('status') as TestRequestStatus) || undefined;
    const testType = (searchParams.get('testType') as TestType) || undefined;
    const search = searchParams.get('search') || undefined;

    const requests = await crmDb.getTestRequests({ status, testType, search });
    return NextResponse.json({ success: true, requests });
  } catch (err: any) {
    console.error('CRM Tests GET error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch test requests' },
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
    if (!body.customerName || !body.customerMobile || !body.testType) {
      return NextResponse.json(
        { success: false, error: 'Customer Name, Mobile, and Test Type are required' },
        { status: 400 }
      );
    }

    const newReq = await crmDb.createTestRequest(body);
    return NextResponse.json({ success: true, request: newReq });
  } catch (err: any) {
    console.error('CRM Tests POST error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create test request' },
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

    if (body.action === 'save_result') {
      if (!body.requestId || !body.parameters || !body.recommendationText) {
        return NextResponse.json(
          { success: false, error: 'Request ID, Parameters, and Recommendation Text are required' },
          { status: 400 }
        );
      }

      const result = await crmDb.saveTestResult({
        requestId: body.requestId,
        testedBy: session.name,
        methodOrInstrument: body.methodOrInstrument || 'Digital Laboratory Kit',
        parameters: body.parameters,
        recommendationText: body.recommendationText,
        attachmentPath: body.attachmentPath,
      });

      const updatedReq = await crmDb.getTestRequestById(body.requestId);
      return NextResponse.json({ success: true, result, request: updatedReq });
    }

    if (!body.id) {
      return NextResponse.json({ success: false, error: 'Test request ID is required' }, { status: 400 });
    }

    const updated = await crmDb.updateTestRequest(body.id, body);
    return NextResponse.json({ success: true, request: updated });
  } catch (err: any) {
    console.error('CRM Tests PUT error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update test' },
      { status: 500 }
    );
  }
}
