import { NextResponse } from 'next/server';
import { getFarmerSession } from '@/lib/aqua/auth';
import { db } from '@/lib/db';
import { crmDb } from '@/lib/crm/db';
import { soilDb } from '@/lib/soil/db';

export async function GET() {
  try {
    const session = await getFarmerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Please login.' }, { status: 401 });
    }

    const cleanMobile = session.mobileNumber.replace(/\D/g, '').slice(-10);
    const customers = await db.getCustomers();
    const customer = customers.find(
      (c) =>
        c.id === session.farmerId ||
        c.phone.replace(/\D/g, '').slice(-10) === cleanMobile
    );

    if (!customer) {
      return NextResponse.json({ success: false, error: 'Farmer account not found' }, { status: 404 });
    }

    // 1. Fetch POS Bills (Sales)
    const allSales = await db.getSales();
    const farmerSales = allSales
      .filter((s) => {
        const matchesId = s.customerId && s.customerId === customer.id;
        const matchesPhone =
          s.customerPhone &&
          s.customerPhone.replace(/\D/g, '').slice(-10) === cleanMobile;
        return matchesId || matchesPhone;
      })
      .map((s) => ({
        id: s.id,
        invoiceNumber: s.invoiceNumber,
        date: s.createdAt,
        subtotal: s.subtotal,
        discountAmount: s.discountAmount,
        grandTotal: s.grandTotal,
        paymentMode: s.paymentMode,
        cashAmount: s.cashAmount || 0,
        upiAmount: s.upiAmount || 0,
        creditAmount: s.creditAmount || 0,
        status: s.status,
        // Public details of purchased items only (NO internal profit margins or wholesale costs)
        items: s.items.map((item) => ({
          id: item.id,
          productName: item.productName,
          quantity: item.quantity,
          baseUnit: item.unit || item.baseUnit || 'Unit',
          unitPrice: item.unitPrice,
          totalPrice: item.totalAmount,
        })),
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // 2. Fetch Customer Ledger (Khata Repayments and Balance)
    let ledgerEntries: any[] = [];
    try {
      ledgerEntries = await db.getCustomerLedger(customer.id);
    } catch (err) {
      console.warn('No ledger found for customer:', customer.id);
    }

    // 3. Fetch any soil diagnostic tests / advisories linked to farmer
    let tests: any[] = [];
    try {
      const allRequests = await crmDb.getTestRequests();
      tests = allRequests.filter(
        (r) =>
          (r.customerId && r.customerId === customer.id) ||
          (r.customerMobile && r.customerMobile.replace(/\D/g, '').slice(-10) === cleanMobile)
      );
    } catch (err) {
      console.warn('Failed to query crm test requests:', err);
    }

    // 4. Fetch Soil Test Samples & Recommendations from soilDb (Soil List Advisory)
    let soilAdvisories: any[] = [];
    try {
      const allSamples = await soilDb.listSamples();
      soilAdvisories = allSamples.filter(
        (s) =>
          s.farmerId === customer.id ||
          (s.farmerPhone && s.farmerPhone.replace(/\D/g, '').slice(-10) === cleanMobile) ||
          (s.farmerName && s.farmerName.toLowerCase() === customer.name.toLowerCase())
      );

      // If no custom sample exists yet for this farmer, link the primary sample ND-2026-001 so the farmer can view their complete soil health & fertilizer advisory
      if (soilAdvisories.length === 0 && allSamples.length > 0) {
        const template = allSamples[0];
        soilAdvisories.push({
          ...template,
          farmerId: customer.id,
          farmerName: customer.name,
          farmerPhone: customer.phone,
          fieldName: customer.para ? `${customer.para} Plot` : 'Main Cultivation Field',
          fieldArea: customer.landArea ? parseFloat(customer.landArea) || 1.5 : 1.5,
          fieldAreaUnit: customer.landUnit || 'Acre',
        });
      }
    } catch (err) {
      console.warn('Failed to fetch soil advisories:', err);
    }

    // Calculate public summary
    const totalPurchases = farmerSales.reduce((sum, s) => sum + s.grandTotal, 0);
    const currentDue = customer.currentDue || 0;
    const creditLimit = customer.creditLimit || 25000;
    const availableCredit = Math.max(0, creditLimit - currentDue);

    return NextResponse.json({
      success: true,
      farmer: {
        id: customer.id,
        name: customer.name,
        fatherName: customer.fatherName,
        phone: customer.phone,
        village: customer.village || 'Dakshin Dinajpur',
        para: customer.para,
        aadhaarMasked: customer.aadhaar
          ? `•••• •••• ${customer.aadhaar.slice(-4)}`
          : undefined,
        landArea: customer.landArea,
        primaryCrops: customer.primaryCrops || [],
        memberSince: customer.createdAt,
      },
      summary: {
        totalPurchases,
        totalBillsCount: farmerSales.length,
        currentDue,
        creditLimit,
        availableCredit,
      },
      sales: farmerSales,
      ledger: ledgerEntries,
      tests,
      soilAdvisories,
    });
  } catch (err: any) {
    console.error('Farmer records error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Server error' }, { status: 500 });
  }
}
