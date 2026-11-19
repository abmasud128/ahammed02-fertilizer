import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { getSession } from '@/lib/auth/session';
import { getCloudData, saveCloudData } from '@/lib/cloud-store';

export interface EnquiryRecord {
  id: string;
  name: string;
  phone: string;
  village?: string;
  crop?: string;
  message: string;
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'enquiries.json');

async function getEnquiries(): Promise<EnquiryRecord[]> {
  return getCloudData<EnquiryRecord[]>('enquiries', DATA_FILE, () => []);
}

async function saveEnquiries(enquiries: EnquiryRecord[]): Promise<void> {
  await saveCloudData('enquiries', DATA_FILE, enquiries);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, village, crop, message } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    const newEnquiry: EnquiryRecord = {
      id: uuidv4(),
      name: name.trim(),
      phone: phone.trim(),
      village: village ? String(village).trim() : '',
      crop: crop ? String(crop).trim() : '',
      message: message.trim(),
      createdAt: new Date().toISOString(),
    };

    const existingEnquiries = await getEnquiries();
    existingEnquiries.unshift(newEnquiry);
    await saveEnquiries(existingEnquiries);

    return NextResponse.json(
      {
        success: true,
        id: newEnquiry.id,
        message: 'Enquiry submitted successfully',
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Enquiry submission error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error processing enquiry' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    if (session.role !== 'owner') {
      return NextResponse.json(
        { success: false, error: 'Owner access required' },
        { status: 403 }
      );
    }

    const enquiries = await getEnquiries();
    return NextResponse.json({ success: true, enquiries }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching enquiries:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve enquiries' },
      { status: 500 }
    );
  }
}
