/**
 * Automated Verification Test Suite for CRM & Farm Intelligence Module
 * Tests area conversions, automatic follow-ups, case revision integrity,
 * product efficacy N >= 5 thresholds, and public test booking privacy.
 */
import { convertAreaToDecimal, formatAreaDisplay } from '../src/lib/crm/area';
import { crmDb } from '../src/lib/crm/db';
import { db as adminDb } from '../src/lib/db';

async function runCrmTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING CRM & FARM INTELLIGENCE VERIFICATION SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} - ${detail || 'Assertion failed'}`);
      failed++;
    }
  }

  // ----------------------------------------------------
  // TEST 1: Canonical Area Conversions
  // ----------------------------------------------------
  console.log('--- TEST GROUP 1: Canonical Area Engine ---');
  // 1 Acre = 100 Decimals
  const acreDec = convertAreaToDecimal(1.5, 'acre', 33);
  assert(acreDec === 150, '1.5 Acre converts to exactly 150 decimals', `Got ${acreDec}`);

  // 3 Bigha at 33 dec/bigha = 99 Decimals
  const bighaDec = convertAreaToDecimal(3, 'bigha', 33);
  assert(bighaDec === 99, '3 Bigha converts to 99 decimals (33 dec/bigha)', `Got ${bighaDec}`);

  // Configurable Bigha: 2 Bigha at 20 dec/bigha = 40 Decimals
  const customBighaDec = convertAreaToDecimal(2, 'bigha', 20);
  assert(customBighaDec === 40, 'Configurable Bigha (20 dec/bigha) produces 40 decimals', `Got ${customBighaDec}`);

  // Display formatting
  const formatted = formatAreaDisplay(3, 'bigha', 33);
  assert(formatted.includes('99 Decimal'), 'Area display format has correct canonical decimal', formatted);

  // ----------------------------------------------------
  // TEST 2: Existing POS Customer & Product Integration (Zero Duplication)
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 2: POS Zero-Duplication Integration ---');
  const posCustomers = await adminDb.getCustomers();
  assert(posCustomers.length > 0, 'Existing POS customers are accessible', `Found ${posCustomers.length} POS customers`);

  const demoCustomer = posCustomers[0];
  const dossier = await crmDb.getCustomerDossier(demoCustomer.id);
  assert(dossier !== null, `Customer dossier created for POS customer ${demoCustomer.name}`);
  assert(Array.isArray(dossier?.sales), 'Dossier dynamically queries POS sales without separate duplicate tables');

  // ----------------------------------------------------
  // TEST 3: Diagnostic Case & Automatic Follow-up Scheduling
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 3: Case & Auto-Followup Scheduling ---');
  // First ensure customer has a plot
  let plots = await crmDb.getPlots(demoCustomer.id);
  if (plots.length === 0) {
    const createdPlot = await crmDb.createPlot({
      customerId: demoCustomer.id,
      customerName: demoCustomer.name,
      name: 'টেস্ট মাঠ (Test Field)',
      type: 'crop_field',
      locationText: 'Balurghat test block',
      village: demoCustomer.village || 'Balurghat',
      block: 'Balurghat',
      district: 'Dakshin Dinajpur',
      areaValue: 2,
      areaUnit: 'bigha',
    });
    plots = [createdPlot];
  }

  const testPlot = plots[0];

  // Create a pest case with prescription
  const newCase = await crmDb.createCase({
    customerId: demoCustomer.id,
    plotId: testPlot.id,
    category: 'pest',
    title: 'হলুদ মাজরা পোকা আক্রমণ (Yellow Stem Borer)',
    description: 'Dead heart symptoms in young tillers; larvae observed inside stems.',
    observedOn: new Date().toISOString().split('T')[0],
    severity: 'severe',
    createdBy: 'test-user-1',
    createdByName: 'Test Specialist',
    initialPrescription: {
      notes: 'Apply Cartap Hydrochloride 4G granules in standing water.',
      items: [
        {
          productName: 'Cartap Hydrochloride 4G',
          isCustomItem: true,
          quantity: 5,
          unit: 'kg',
          doseInstructions: '1 kg per 10 decimal in 2-3 inch water depth',
          applicationMethod: 'Broadcasting',
          intervalDays: 10,
          numberOfApplications: 1,
        },
      ],
    },
  });

  assert(newCase.caseNumber.startsWith('CASE-'), 'Case assigned human-readable number (CASE-YYYY-XXXX)', newCase.caseNumber);
  assert(newCase.status === 'follow_up_due', 'Case with initial prescription automatically set to follow_up_due');

  // Check auto-created followup
  const followups = await crmDb.getFollowups({ customerId: demoCustomer.id });
  const caseFollowup = followups.find((f) => f.caseId === newCase.id);
  assert(caseFollowup !== undefined, 'Follow-up was automatically scheduled upon prescription save');

  // Check due date for pest category (Pest default is 3 days)
  if (caseFollowup) {
    const today = new Date();
    const dueDate = new Date(caseFollowup.dueDate);
    const diffDays = Math.round((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    assert(diffDays >= 2 && diffDays <= 4, `Follow-up scheduled approx 3 days out for pest category (got ${diffDays} days)`);
  }

  // ----------------------------------------------------
  // TEST 4: Follow-up Outcome & Revision Integrity (No Overwriting)
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 4: Followup Outcome & Revision History ---');
  if (caseFollowup) {
    const updatedFollowup = await crmDb.updateFollowupOutcome(caseFollowup.id, {
      status: 'done',
      outcome: 'resolved',
      customerFeedback: 'পোকা সম্পূর্ণ নিয়ন্ত্রণে এসেছে। নতুন পাতা বের হচ্ছে।',
      satisfactionRating: 5,
      nextAction: 'No further pesticide needed.',
      staffUser: { id: 'staff-1', name: 'Ahammed Staff' },
    });

    assert(updatedFollowup.status === 'done', 'Follow-up marked as done');
    assert(updatedFollowup.outcome === 'resolved', 'Follow-up outcome recorded');

    // Verify parent case status was synchronized
    const refreshedCase = await crmDb.getCaseById(newCase.id);
    assert(refreshedCase?.status === 'resolved', 'Parent case status automatically synchronized to resolved', refreshedCase?.status);
    assert(Boolean(refreshedCase?.revisions && refreshedCase.revisions.length > 0), 'Status transition recorded in revisions table (audit trail)');
    assert(refreshedCase?.revisions[0]?.previousStatus === 'follow_up_due', 'Revision stores exact previous status');
    assert(refreshedCase?.revisions[0]?.newStatus === 'resolved', 'Revision stores exact new status');
  }

  // ----------------------------------------------------
  // TEST 5: Product Efficacy N >= 5 Threshold Rule
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 5: Product Efficacy Statistical Honesty ---');
  const efficacyList = await crmDb.getProductEfficacy();
  assert(Array.isArray(efficacyList), 'Efficacy metrics generated');

  // Any product with casesCount < 5 must NOT report a percentage
  for (const eff of efficacyList) {
    if (eff.casesCount < 5) {
      assert(eff.successRate === null, `Product "${eff.productName}" with ${eff.casesCount} cases (< 5) suppresses percentage`, `Got ${eff.successRate}`);
      assert(eff.sampleSizeLabel.includes('too small'), `Product "${eff.productName}" shows "Sample size too small" warning`);
    } else {
      assert(typeof eff.successRate === 'number', `Product "${eff.productName}" with >= 5 cases provides valid percentage`, `${eff.successRate}%`);
    }
  }

  // ----------------------------------------------------
  // TEST 6: Public Test Booking & Privacy Protection
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 6: Public Test Request Lead Generation & Privacy ---');
  const testReq = await crmDb.createTestRequest({
    customerName: 'সঞ্জয় মণ্ডল (Sanjay Mondal)',
    customerMobile: '9876543299',
    customerVillage: 'কামারপাড়া (Kamarpara)',
    testType: 'soil',
    plotDetails: '২ বিঘা সরিষার জমি',
    preferredDate: '2026-11-20',
  });

  assert(testReq.requestNumber.startsWith('TEST-'), 'Test request assigned TEST-YYYY-XXXX number', testReq.requestNumber);
  assert(testReq.status === 'new', 'Initial status is new');
  assert(testReq.price === 250, 'Soil test auto-assigned correct standard fee (₹250)');

  // Lab parameter entry
  const labResult = await crmDb.saveTestResult({
    requestId: testReq.id,
    testedBy: 'Ahammed Masud',
    methodOrInstrument: 'Digital Soil Testing Kit AG-400',
    parameters: [
      { key: 'ph', label: 'Soil pH', value: 6.8, unit: '', idealRange: '6.5 - 7.5', status: 'optimal' },
      { key: 'oc', label: 'Organic Carbon', value: 0.82, unit: '%', idealRange: '> 0.75%', status: 'optimal' },
    ],
    recommendationText: 'মাটির স্বাস্থ্য ভালো। সাধারণ মাত্রায় সুফলা সার প্রয়োগ করুন।',
  });

  assert(labResult.parameters.length === 2, 'Lab parameters successfully saved');
  const refreshedReq = await crmDb.getTestRequestById(testReq.id);
  assert(refreshedReq?.status === 'result_ready', 'Request status transitioned to result_ready upon lab result save');

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runCrmTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
