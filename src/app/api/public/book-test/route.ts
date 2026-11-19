import { NextResponse } from 'next/server';
import { crmDb } from '@/lib/crm/db';
import { TestType } from '@/types/crm';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Honeypot spam protection: bots fill hidden fields
    if (body.website_url || body.fax_number || body.honeypot) {
      // Reject silently to spam bots
      return NextResponse.json({ success: true, message: 'Request received' });
    }

    // Consent validation
    if (!body.consentAgreed) {
      return NextResponse.json(
        { success: false, error: 'You must agree to the data consent policy to request a test.' },
        { status: 400 }
      );
    }

    if (!body.customerName || !body.customerMobile || !body.customerVillage || !body.testType) {
      return NextResponse.json(
        { success: false, error: 'Name, phone number, village, and test type are required.' },
        { status: 400 }
      );
    }

    // Phone validation (Indian 10-digit mobile)
    const cleanPhone = String(body.customerMobile).replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 10-digit mobile number.' },
        { status: 400 }
      );
    }

    const validTestTypes: TestType[] = ['soil', 'pond', 'water'];
    if (!validTestTypes.includes(body.testType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid test type selected.' },
        { status: 400 }
      );
    }

    const testRequest = await crmDb.createTestRequest({
      customerName: String(body.customerName).trim(),
      customerMobile: cleanPhone,
      customerVillage: String(body.customerVillage).trim(),
      testType: body.testType,
      plotDetails: body.plotDetails ? String(body.plotDetails).trim() : undefined,
      preferredDate: body.preferredDate ? String(body.preferredDate).trim() : undefined,
      address: body.address ? String(body.address).trim() : undefined,
      notes: body.notes ? String(body.notes).trim() : undefined,
    });

    // PRIVACY ENFORCEMENT: Never return other customer data or internal IDs
    return NextResponse.json({
      success: true,
      message: 'Your test request has been received. Our team will contact you shortly.',
      referenceNumber: testRequest.requestNumber,
      testType: testRequest.testType,
      estimatedFee: testRequest.price,
    });
  } catch (err: any) {
    console.error('Public Book-Test POST error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to submit test request. Please try again or call our store.' },
      { status: 500 }
    );
  }
}
