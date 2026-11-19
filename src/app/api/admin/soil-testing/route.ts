import { NextRequest, NextResponse } from 'next/server';
import { soilDb } from '@/lib/soil/db';
import { db } from '@/lib/db';
import { SoilSample, SoilFarmer, SoilField } from '@/types/soil';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      const sample = await soilDb.getSample(id);
      return NextResponse.json({ success: true, sample });
    }

    const samples = await soilDb.listSamples();
    const rawSoilFarmers = await soilDb.listFarmers();
    const fields = await soilDb.listFields();

    // Fetch farmers added via Add Farmer / POS Customers
    let customers: any[] = [];
    try {
      customers = await db.getCustomers();
    } catch (e) {
      console.warn('Failed to get customers for soil testing:', e);
    }

    // Merge customers into SoilFarmer list without duplication
    const mergedFarmers: SoilFarmer[] = [...rawSoilFarmers];

    for (const c of customers) {
      const cleanPhone = c.phone?.replace(/\D/g, '').slice(-10);
      const exists = mergedFarmers.some(
        (f) =>
          f.id === c.id ||
          f.phoneNumber.replace(/\D/g, '').slice(-10) === cleanPhone ||
          f.farmerName.toLowerCase() === c.name.toLowerCase()
      );

      if (!exists) {
        mergedFarmers.push({
          id: c.id,
          farmerName: c.name,
          phoneNumber: c.phone,
          fatherName: c.fatherName || '',
          village: c.village || 'Dakshin Dinajpur',
          para: c.para || '',
          block: c.village?.toLowerCase().includes('jahangirpur') ? 'Gangarampur' : 'Balurghat',
          district: 'Dakshin Dinajpur',
          address: c.para ? `${c.para}, ${c.village}` : c.village || 'Dakshin Dinajpur',
          landArea: c.landArea || '1.5',
          landUnit: c.landUnit || 'Acre',
          primaryCrops: c.primaryCrops || ['Paddy'],
          aadhaar: c.aadhaar,
          createdAt: c.createdAt,
        });
      }
    }

    return NextResponse.json({
      success: true,
      samples,
      farmers: mergedFarmers,
      fields,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'save_farmer') {
      const { farmerName, phoneNumber, fatherName, village, block, district, address } = body;
      if (!farmerName || !phoneNumber || !village || !block || !district) {
        return NextResponse.json(
          { success: false, error: 'Required fields missing for farmer registration' },
          { status: 400 }
        );
      }
      const farmer = await soilDb.addFarmer({
        farmerName,
        phoneNumber,
        fatherName,
        village,
        block,
        district,
        address,
      });
      return NextResponse.json({ success: true, farmer });
    }

    if (action === 'save_field') {
      const { farmerId, fieldName, totalArea, areaUnit, latitude, longitude, landType, irrigationSource, soilTexture } = body;
      if (!farmerId || !fieldName || !totalArea) {
        return NextResponse.json(
          { success: false, error: 'Required fields missing for field registration' },
          { status: 400 }
        );
      }
      const field = await soilDb.addField({
        farmerId,
        fieldName,
        totalArea: parseFloat(totalArea),
        areaUnit: areaUnit || 'Acre',
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        landType: landType || 'Lowland',
        irrigationSource: irrigationSource || 'Canal / Surface',
        soilTexture: soilTexture || 'Loam',
      });
      return NextResponse.json({ success: true, field });
    }

    if (action === 'save_sample') {
      const {
        id,
        farmerId,
        fieldId,
        farmerName,
        farmerPhone,
        fieldName,
        fieldArea,
        fieldAreaUnit,
        sampleCollectionDate,
        samplingDepth,
        purpose,
        fieldPhotoUrl,
      } = body;

      if (!id || !farmerId || !fieldId) {
        return NextResponse.json(
          { success: false, error: 'Sample ID, Farmer, and Field are required' },
          { status: 400 }
        );
      }

      const sample: SoilSample = {
        id,
        farmerId,
        fieldId,
        farmerName: farmerName || 'Unknown Farmer',
        farmerPhone: farmerPhone || '',
        fieldName: fieldName || 'Field-01',
        fieldArea: fieldArea || 1.5,
        fieldAreaUnit: fieldAreaUnit || 'Acre',
        sampleCollectionDate: sampleCollectionDate || new Date().toISOString().split('T')[0],
        samplingDepth: samplingDepth || '0 - 15 cm',
        purpose: purpose || 'Fertilizer Recommendation',
        fieldPhotoUrl,
        status: 'draft',
        createdAt: new Date().toISOString(),
      };

      await soilDb.addSample(sample);
      return NextResponse.json({ success: true, sample });
    }

    if (action === 'save_results') {
      const { sampleId, labResults } = body;
      if (!sampleId || !labResults) {
        return NextResponse.json(
          { success: false, error: 'Sample ID and lab results are required' },
          { status: 400 }
        );
      }
      const updated = await soilDb.updateSample(sampleId, {
        labResults,
        status: 'tested',
      });
      return NextResponse.json({ success: true, sample: updated });
    }

    if (action === 'save_crop') {
      const { sampleId, cropDetails } = body;
      if (!sampleId || !cropDetails) {
        return NextResponse.json(
          { success: false, error: 'Sample ID and crop details are required' },
          { status: 400 }
        );
      }
      const updated = await soilDb.updateSample(sampleId, {
        cropDetails,
      });
      return NextResponse.json({ success: true, sample: updated });
    }

    if (action === 'generate_recommendation') {
      const { sampleId, recommendation } = body;
      if (!sampleId || !recommendation) {
        return NextResponse.json(
          { success: false, error: 'Sample ID and recommendation are required' },
          { status: 400 }
        );
      }
      const updated = await soilDb.updateSample(sampleId, {
        recommendation,
        status: 'completed',
      });
      return NextResponse.json({ success: true, sample: updated });
    }

    if (action === 'save_report_config') {
      const { sampleId, reportLanguage, reportFormat } = body;
      const updated = await soilDb.updateSample(sampleId, {
        reportLanguage,
        reportFormat,
      });
      return NextResponse.json({ success: true, sample: updated });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
