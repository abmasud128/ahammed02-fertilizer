import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.toLowerCase().trim();

    const allCustomers = await db.getCustomers();

    let farmers = allCustomers;
    if (query) {
      farmers = allCustomers.filter((c) => {
        const nameMatch = c.name?.toLowerCase().includes(query);
        const phoneMatch = c.phone?.includes(query);
        const villageMatch = c.village?.toLowerCase().includes(query);
        const fatherMatch = c.fatherName?.toLowerCase().includes(query);
        return nameMatch || phoneMatch || villageMatch || fatherMatch;
      });
    }

    return NextResponse.json({
      success: true,
      total: farmers.length,
      farmers,
    });
  } catch (err: any) {
    console.error('Farmers API GET error:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch farmers' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      fatherName,
      phone,
      village,
      para,
      aadhaar,
      landArea,
      primaryCrops,
      notes,
    } = body;

    // Validate Required Fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Farmer Name is required' },
        { status: 400 }
      );
    }
    if (!fatherName || !fatherName.trim()) {
      return NextResponse.json(
        { success: false, error: "Father's Name is required" },
        { status: 400 }
      );
    }
    if (!phone || !phone.trim()) {
      return NextResponse.json(
        { success: false, error: 'Mobile Number is required' },
        { status: 400 }
      );
    }
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 10-digit mobile number' },
        { status: 400 }
      );
    }
    if (!village || !village.trim()) {
      return NextResponse.json(
        { success: false, error: 'Village is required' },
        { status: 400 }
      );
    }
    if (!para || !para.trim()) {
      return NextResponse.json(
        { success: false, error: 'Para / Locality is required' },
        { status: 400 }
      );
    }

    // Validate Aadhaar (Optional)
    let cleanAadhaar = '';
    if (aadhaar && aadhaar.trim()) {
      cleanAadhaar = aadhaar.replace(/\D/g, '');
      if (cleanAadhaar.length !== 12) {
        return NextResponse.json(
          { success: false, error: 'Aadhaar Number must be exactly 12 digits' },
          { status: 400 }
        );
      }
    }

    // Check duplicate phone in db.getCustomers()
    const allCustomers = await db.getCustomers();
    const existing = allCustomers.find(
      (c) => c.phone.replace(/\D/g, '').slice(-10) === cleanPhone
    );
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: `A farmer is already registered with mobile ${cleanPhone}: ${existing.name} (${existing.village || 'Dakshin Dinajpur'})`,
          existingCustomer: existing,
        },
        { status: 409 }
      );
    }

    // Build structured notes
    const formattedNotes = [
      notes?.trim(),
      `Father: ${fatherName.trim()}`,
      `Para: ${para.trim()}`,
      cleanAadhaar ? `Aadhaar: ${cleanAadhaar}` : null,
      landArea ? `Land: ${landArea.trim()}` : null,
      Array.isArray(primaryCrops) && primaryCrops.length > 0 ? `Crops: ${primaryCrops.join(', ')}` : null,
    ]
      .filter(Boolean)
      .join(' | ');

    // Save directly to the same database/collection as POS Billing Quick Add
    const newCustomer = await db.createCustomer({
      name: name.trim(),
      phone: cleanPhone,
      fatherName: fatherName.trim(),
      village: village.trim(),
      para: para.trim(),
      aadhaar: cleanAadhaar || undefined,
      landArea: landArea ? landArea.trim() : undefined,
      primaryCrops: Array.isArray(primaryCrops) ? primaryCrops : undefined,
      creditLimit: 25000,
      notes: formattedNotes,
    });

    await db.recordAudit({
      userEmail: session.email,
      action: 'customer_created',
      entityType: 'customer',
      entityId: newCustomer.id,
      details: {
        name: newCustomer.name,
        phone: newCustomer.phone,
        village: newCustomer.village,
        fatherName: fatherName.trim(),
        para: para.trim(),
        aadhaar: cleanAadhaar || undefined,
        landArea: landArea || undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Farmer registered successfully',
      farmer: newCustomer,
    });
  } catch (err: any) {
    console.error('Farmers API POST error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to save farmer' },
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
    if (!body.id) {
      return NextResponse.json({ success: false, error: 'Customer ID is required' }, { status: 400 });
    }
    if (!body.name || !body.phone) {
      return NextResponse.json(
        { success: false, error: 'Farmer name and phone number are required' },
        { status: 400 }
      );
    }

    const cleanPhone = String(body.phone).replace(/\D/g, '').slice(-10);

    const updated = await db.updateCustomer(body.id, {
      name: body.name.trim(),
      phone: cleanPhone,
      fatherName: body.fatherName !== undefined ? body.fatherName.trim() : undefined,
      village: body.village !== undefined ? body.village.trim() : undefined,
      para: body.para !== undefined ? body.para.trim() : undefined,
      aadhaar: body.aadhaar !== undefined ? body.aadhaar.trim() : undefined,
      landArea: body.landArea !== undefined ? body.landArea.trim() : undefined,
      primaryCrops: Array.isArray(body.primaryCrops) ? body.primaryCrops : undefined,
      creditLimit: body.creditLimit !== undefined ? Math.max(0, Number(body.creditLimit) || 0) : undefined,
      notes: body.notes !== undefined ? body.notes.trim() : undefined,
    });

    await db.recordAudit({
      userEmail: session.email,
      action: 'customer_updated',
      entityType: 'customer',
      entityId: updated.id,
      details: {
        name: updated.name,
        phone: updated.phone,
        village: updated.village,
        fatherName: updated.fatherName,
      },
    });

    return NextResponse.json({ success: true, farmer: updated });
  } catch (err: any) {
    console.error('Farmers API PUT error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update farmer' },
      { status: 500 }
    );
  }
}
