import { NextRequest, NextResponse } from 'next/server';
import { generateAndSendOtp } from '@/lib/aqua/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mobileNumber } = body;

    if (!mobileNumber) {
      return NextResponse.json({ success: false, error: 'Mobile number is required' }, { status: 400 });
    }

    const res = await generateAndSendOtp(mobileNumber);
    if (!res.success) {
      return NextResponse.json({ success: false, error: res.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully to your mobile number',
      devOtp: res.devOtp, // Returned only in dev mode for ease of manual testing
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Server error' }, { status: 500 });
  }
}
