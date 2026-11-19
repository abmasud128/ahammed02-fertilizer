/**
 * Ahammed Fertilizer - CRM & Farm Intelligence Repository Engine
 * Provides persistent data access for Land Plots, Cultivations, Cases,
 * Prescriptions, Follow-ups, Lab Test Requests, and Product Efficacy.
 * Seamlessly integrates with POS Customers and Products without data duplication.
 */
import fs from 'fs/promises';
import path from 'path';
import {
  CrmSettings,
  CrmLandPlot,
  CrmCultivation,
  CrmCase,
  CrmCaseMedia,
  CrmPrescription,
  CrmPrescriptionItem,
  CrmFollowup,
  CrmCaseRevision,
  CrmTestRequest,
  CrmTestResult,
  ProductEfficacyMetric,
  CaseCategory,
  CaseStatus,
  FollowupStatus,
  FollowupOutcome,
  TestRequestStatus,
  TestType,
} from '@/types/crm';
import {
  INITIAL_CRM_SETTINGS,
  INITIAL_CRM_PLOTS,
  INITIAL_CRM_CULTIVATIONS,
  INITIAL_CRM_CASES,
  INITIAL_CRM_TEST_REQUESTS,
  INITIAL_CRM_TEST_RESULTS,
} from './seed';
import { convertAreaToDecimal } from './area';
import { db as adminDb } from '@/lib/db';

interface CrmStore {
  settings: CrmSettings;
  plots: CrmLandPlot[];
  cultivations: CrmCultivation[];
  cases: CrmCase[];
  followups: CrmFollowup[];
  testRequests: CrmTestRequest[];
  testResults: CrmTestResult[];
  nextCaseSequence: number;
  nextTestSequence: number;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const CRM_STORE_FILE = path.join(DATA_DIR, 'crm-store.json');

let inMemoryCrmStore: CrmStore | null = null;

async function ensureDataDir(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {}
}

async function getStore(): Promise<CrmStore> {
  if (inMemoryCrmStore) {
    return inMemoryCrmStore;
  }

  await ensureDataDir();

  try {
    const raw = await fs.readFile(CRM_STORE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    inMemoryCrmStore = {
      settings: parsed.settings || INITIAL_CRM_SETTINGS,
      plots: Array.isArray(parsed.plots) ? parsed.plots : INITIAL_CRM_PLOTS,
      cultivations: Array.isArray(parsed.cultivations) ? parsed.cultivations : INITIAL_CRM_CULTIVATIONS,
      cases: Array.isArray(parsed.cases) ? parsed.cases : INITIAL_CRM_CASES,
      followups: Array.isArray(parsed.followups) ? parsed.followups : [],
      testRequests: Array.isArray(parsed.testRequests) ? parsed.testRequests : INITIAL_CRM_TEST_REQUESTS,
      testResults: Array.isArray(parsed.testResults) ? parsed.testResults : INITIAL_CRM_TEST_RESULTS,
      nextCaseSequence: typeof parsed.nextCaseSequence === 'number' ? parsed.nextCaseSequence : 1,
      nextTestSequence: typeof parsed.nextTestSequence === 'number' ? parsed.nextTestSequence : 1,
    };
  } catch {
    // Seed initial store
    const seedFollowups = extractSeedFollowups(INITIAL_CRM_CASES);
    inMemoryCrmStore = {
      settings: INITIAL_CRM_SETTINGS,
      plots: INITIAL_CRM_PLOTS,
      cultivations: INITIAL_CRM_CULTIVATIONS,
      cases: INITIAL_CRM_CASES,
      followups: seedFollowups,
      testRequests: INITIAL_CRM_TEST_REQUESTS,
      testResults: INITIAL_CRM_TEST_RESULTS,
      nextCaseSequence: 3,
      nextTestSequence: 3,
    };
    await persistStore();
  }

  return inMemoryCrmStore!;
}

function extractSeedFollowups(cases: CrmCase[]): CrmFollowup[] {
  const followups: CrmFollowup[] = [];
  for (const c of cases) {
    if (c.followups && c.followups.length > 0) {
      followups.push(...c.followups);
    }
  }
  return followups;
}

async function persistStore(): Promise<void> {
  if (!inMemoryCrmStore) return;
  await ensureDataDir();
  const tempFile = `${CRM_STORE_FILE}.tmp.${Date.now()}`;
  await fs.writeFile(tempFile, JSON.stringify(inMemoryCrmStore, null, 2), 'utf-8');
  await fs.rename(tempFile, CRM_STORE_FILE);
}

export const crmDb = {
  // ==========================================
  // SETTINGS
  // ==========================================
  async getSettings(): Promise<CrmSettings> {
    const store = await getStore();
    return store.settings;
  },

  async updateSettings(updates: Partial<CrmSettings>): Promise<CrmSettings> {
    const store = await getStore();
    store.settings = {
      ...store.settings,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await persistStore();
    return store.settings;
  },

  // ==========================================
  // LAND PLOTS & PONDS
  // ==========================================
  async getPlots(customerId?: string): Promise<CrmLandPlot[]> {
    const store = await getStore();
    const activePlots = store.plots.filter((p) => !p.deletedAt);
    if (!customerId) return activePlots;
    return activePlots.filter((p) => p.customerId === customerId);
  },

  async getPlotById(id: string): Promise<CrmLandPlot | undefined> {
    const store = await getStore();
    return store.plots.find((p) => p.id === id && !p.deletedAt);
  },

  async createPlot(data: {
    customerId: string;
    customerName?: string;
    name: string;
    type: 'crop_field' | 'pond';
    locationText: string;
    village: string;
    block: string;
    district: string;
    gpsCoordinates?: string;
    areaValue: number;
    areaUnit: 'bigha' | 'acre' | 'decimal';
    waterSource?: string;
    notes?: string;
  }): Promise<CrmLandPlot> {
    const store = await getStore();
    const settings = store.settings;

    // Canonical decimal computation using current bigha ratio
    const areaInDecimal = convertAreaToDecimal(
      data.areaValue,
      data.areaUnit,
      settings.bighaToDecimal
    );

    // If customerName not provided, resolve from POS customer DB
    let customerName = data.customerName;
    if (!customerName) {
      const posCust = await adminDb.getCustomerById(data.customerId);
      customerName = posCust?.name || 'Customer';
    }

    const now = new Date().toISOString();
    const newPlot: CrmLandPlot = {
      id: `plot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      customerId: data.customerId,
      customerName,
      name: data.name,
      type: data.type,
      locationText: data.locationText,
      village: data.village,
      block: data.block,
      district: data.district,
      gpsCoordinates: data.gpsCoordinates,
      areaValue: data.areaValue,
      areaUnit: data.areaUnit,
      areaInDecimal,
      waterSource: data.waterSource,
      notes: data.notes,
      createdAt: now,
      updatedAt: now,
    };

    store.plots.push(newPlot);
    await persistStore();
    return newPlot;
  },

  async updatePlot(id: string, updates: Partial<CrmLandPlot>): Promise<CrmLandPlot> {
    const store = await getStore();
    const idx = store.plots.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Plot not found');

    const plot = store.plots[idx];
    const settings = store.settings;

    const areaValue = updates.areaValue ?? plot.areaValue;
    const areaUnit = updates.areaUnit ?? plot.areaUnit;
    const areaInDecimal = convertAreaToDecimal(
      areaValue,
      areaUnit,
      settings.bighaToDecimal
    );

    const updated: CrmLandPlot = {
      ...plot,
      ...updates,
      areaValue,
      areaUnit,
      areaInDecimal,
      updatedAt: new Date().toISOString(),
    };

    store.plots[idx] = updated;
    await persistStore();
    return updated;
  },

  async deletePlot(id: string): Promise<boolean> {
    const store = await getStore();
    const plot = store.plots.find((p) => p.id === id);
    if (!plot) return false;
    plot.deletedAt = new Date().toISOString();
    await persistStore();
    return true;
  },

  // ==========================================
  // CULTIVATIONS (CROPS & FISH)
  // ==========================================
  async getCultivations(plotId?: string, customerId?: string): Promise<CrmCultivation[]> {
    const store = await getStore();
    let list = store.cultivations.filter((c) => !c.deletedAt);
    if (plotId) list = list.filter((c) => c.plotId === plotId);
    if (customerId) list = list.filter((c) => c.customerId === customerId);
    return list;
  },

  async getCultivationById(id: string): Promise<CrmCultivation | undefined> {
    const store = await getStore();
    return store.cultivations.find((c) => c.id === id && !c.deletedAt);
  },

  async createCultivation(data: {
    plotId: string;
    customerId: string;
    kind: 'crop' | 'fish';
    cropOrSpeciesName: string;
    variety?: string;
    startDate: string;
    expectedEndDate?: string;
    season: any;
    notes?: string;
  }): Promise<CrmCultivation> {
    const store = await getStore();
    const now = new Date().toISOString();

    const newCult: CrmCultivation = {
      id: `cult-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      plotId: data.plotId,
      customerId: data.customerId,
      kind: data.kind,
      cropOrSpeciesName: data.cropOrSpeciesName,
      variety: data.variety,
      startDate: data.startDate,
      expectedEndDate: data.expectedEndDate,
      status: 'active',
      season: data.season,
      notes: data.notes,
      createdAt: now,
      updatedAt: now,
    };

    store.cultivations.push(newCult);
    await persistStore();
    return newCult;
  },

  async updateCultivation(id: string, updates: Partial<CrmCultivation>): Promise<CrmCultivation> {
    const store = await getStore();
    const idx = store.cultivations.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Cultivation not found');

    store.cultivations[idx] = {
      ...store.cultivations[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await persistStore();
    return store.cultivations[idx];
  },

  // ==========================================
  // FARM DIAGNOSTIC CASES & REVISIONS
  // ==========================================
  async getCases(filters?: {
    customerId?: string;
    plotId?: string;
    category?: CaseCategory;
    status?: CaseStatus;
    search?: string;
  }): Promise<CrmCase[]> {
    const store = await getStore();
    let list = store.cases.filter((c) => !c.deletedAt);

    if (filters?.customerId) {
      list = list.filter((c) => c.customerId === filters.customerId);
    }
    if (filters?.plotId) {
      list = list.filter((c) => c.plotId === filters.plotId);
    }
    if (filters?.category) {
      list = list.filter((c) => c.category === filters.category);
    }
    if (filters?.status) {
      list = list.filter((c) => c.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (c) =>
          c.caseNumber.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.customerName?.toLowerCase().includes(q) ||
          c.customerMobile?.includes(q) ||
          c.customerVillage?.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getCaseById(id: string): Promise<CrmCase | undefined> {
    const store = await getStore();
    return store.cases.find((c) => c.id === id && !c.deletedAt);
  },

  async createCase(data: {
    customerId: string;
    plotId: string;
    cultivationId?: string;
    category: CaseCategory;
    title: string;
    description: string;
    observedOn: string;
    severity: 'mild' | 'moderate' | 'severe' | 'critical';
    createdBy: string;
    createdByName?: string;
    initialPrescription?: {
      notes?: string;
      items: Array<{
        productId?: string;
        productName: string;
        isCustomItem: boolean;
        quantity: number;
        unit: string;
        doseInstructions: string;
        applicationMethod: string;
        intervalDays?: number;
        numberOfApplications?: number;
      }>;
    };
  }): Promise<CrmCase> {
    const store = await getStore();
    const now = new Date().toISOString();

    // Sequence for human-readable case number: CASE-2026-000X
    const year = new Date().getFullYear();
    const seq = store.nextCaseSequence++;
    const caseNumber = `CASE-${year}-${String(seq).padStart(4, '0')}`;

    // Look up customer and plot details
    const posCustomer = await adminDb.getCustomerById(data.customerId);
    const plot = store.plots.find((p) => p.id === data.plotId);
    const cult = data.cultivationId
      ? store.cultivations.find((c) => c.id === data.cultivationId)
      : undefined;

    const newCaseId = `case-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const newCase: CrmCase = {
      id: newCaseId,
      caseNumber,
      customerId: data.customerId,
      customerName: posCustomer?.name || 'Customer',
      customerMobile: posCustomer?.phone || '',
      customerVillage: posCustomer?.village || plot?.village || '',
      plotId: data.plotId,
      plotName: plot?.name || '',
      plotType: plot?.type || 'crop_field',
      cultivationId: data.cultivationId,
      cultivationName: cult?.cropOrSpeciesName || '',
      category: data.category,
      title: data.title,
      description: data.description,
      observedOn: data.observedOn,
      severity: data.severity,
      status: 'open',
      media: [],
      prescriptions: [],
      followups: [],
      revisions: [],
      createdBy: data.createdBy,
      createdByName: data.createdByName || 'Staff',
      createdAt: now,
      updatedAt: now,
    };

    store.cases.push(newCase);

    // If an initial prescription was provided, add it and auto-schedule follow-up
    if (data.initialPrescription && data.initialPrescription.items.length > 0) {
      await this.addPrescription(newCase.id, {
        prescribedBy: data.createdBy,
        prescribedByName: data.createdByName || 'Staff',
        notes: data.initialPrescription.notes,
        items: data.initialPrescription.items,
      });
    }

    await persistStore();
    return newCase;
  },

  async updateCaseStatus(
    caseId: string,
    newStatus: CaseStatus,
    changedBy: string,
    reason?: string
  ): Promise<CrmCase> {
    const store = await getStore();
    const targetCase = store.cases.find((c) => c.id === caseId);
    if (!targetCase) throw new Error('Case not found');

    const previousStatus = targetCase.status;
    if (previousStatus === newStatus) return targetCase;

    // Never silently overwrite: Record revision
    const revision: CrmCaseRevision = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      caseId,
      revisionNumber: (targetCase.revisions?.length || 0) + 1,
      previousStatus,
      newStatus,
      changedBy,
      reason: reason || `Status changed from ${previousStatus} to ${newStatus}`,
      snapshot: {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
    };

    if (!targetCase.revisions) targetCase.revisions = [];
    targetCase.revisions.push(revision);

    targetCase.status = newStatus;
    targetCase.updatedAt = new Date().toISOString();

    await persistStore();
    return targetCase;
  },

  // ==========================================
  // PRESCRIPTIONS & AUTOMATIC FOLLOW-UPS
  // ==========================================
  async addPrescription(
    caseId: string,
    data: {
      prescribedBy: string;
      prescribedByName?: string;
      notes?: string;
      items: Array<{
        productId?: string;
        productName: string;
        isCustomItem: boolean;
        quantity: number;
        unit: string;
        doseInstructions: string;
        applicationMethod: string;
        intervalDays?: number;
        numberOfApplications?: number;
      }>;
    }
  ): Promise<CrmPrescription> {
    const store = await getStore();
    const targetCase = store.cases.find((c) => c.id === caseId);
    if (!targetCase) throw new Error('Case not found');

    const prescId = `presc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const items: CrmPrescriptionItem[] = data.items.map((item, idx) => ({
      id: `item-${Date.now()}-${idx}`,
      prescriptionId: prescId,
      productId: item.productId,
      productName: item.productName,
      isCustomItem: item.isCustomItem,
      quantity: item.quantity,
      unit: item.unit,
      doseInstructions: item.doseInstructions,
      applicationMethod: item.applicationMethod,
      intervalDays: item.intervalDays,
      numberOfApplications: item.numberOfApplications,
    }));

    const prescription: CrmPrescription = {
      id: prescId,
      caseId,
      prescribedOn: now.split('T')[0],
      prescribedBy: data.prescribedBy,
      prescribedByName: data.prescribedByName || 'Staff',
      notes: data.notes,
      items,
      createdAt: now,
      updatedAt: now,
    };

    if (!targetCase.prescriptions) targetCase.prescriptions = [];
    targetCase.prescriptions.push(prescription);
    targetCase.status = 'follow_up_due';
    targetCase.updatedAt = now;

    // AUTO-CREATE FOLLOW-UP RECORD!
    // Category-specific follow-up days (or default 7 days)
    const settings = store.settings;
    const daysToAdd =
      settings.categoryFollowupDays[targetCase.category] ?? settings.defaultFollowupDays ?? 7;

    const dueDateObj = new Date();
    dueDateObj.setDate(dueDateObj.getDate() + daysToAdd);
    const dueDateStr = dueDateObj.toISOString().split('T')[0];

    const followupId = `foll-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newFollowup: CrmFollowup = {
      id: followupId,
      caseId: targetCase.id,
      customerId: targetCase.customerId,
      caseNumber: targetCase.caseNumber,
      customerName: targetCase.customerName,
      customerMobile: targetCase.customerMobile,
      customerVillage: targetCase.customerVillage,
      dueDate: dueDateStr,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    if (!targetCase.followups) targetCase.followups = [];
    targetCase.followups.push(newFollowup);
    store.followups.push(newFollowup);

    await persistStore();
    return prescription;
  },

  async addCaseMedia(
    caseId: string,
    data: {
      storagePath: string;
      fileName: string;
      fileType: string;
      sizeBytes: number;
      caption?: string;
    }
  ): Promise<CrmCaseMedia> {
    const store = await getStore();
    const targetCase = store.cases.find((c) => c.id === caseId);
    if (!targetCase) throw new Error('Case not found');

    const media: CrmCaseMedia = {
      id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      caseId,
      storagePath: data.storagePath,
      fileName: data.fileName,
      fileType: data.fileType,
      sizeBytes: data.sizeBytes,
      caption: data.caption,
      uploadedAt: new Date().toISOString(),
    };

    if (!targetCase.media) targetCase.media = [];
    targetCase.media.push(media);
    targetCase.updatedAt = new Date().toISOString();

    await persistStore();
    return media;
  },

  // ==========================================
  // FOLLOW-UPS & "TODAY'S CALLS"
  // ==========================================
  async getFollowups(filters?: {
    status?: FollowupStatus;
    customerId?: string;
    dueDate?: string;
  }): Promise<CrmFollowup[]> {
    const store = await getStore();
    let list = store.followups.filter((f) => !f.deletedAt);

    if (filters?.status) {
      list = list.filter((f) => f.status === filters.status);
    }
    if (filters?.customerId) {
      list = list.filter((f) => f.customerId === filters.customerId);
    }
    if (filters?.dueDate) {
      list = list.filter((f) => f.dueDate <= filters.dueDate!);
    }

    return list.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  },

  async getTodaysCalls(): Promise<CrmFollowup[]> {
    const store = await getStore();
    const today = new Date().toISOString().split('T')[0];

    // Due today or overdue, and pending/rescheduled
    return store.followups
      .filter((f) => !f.deletedAt && (f.status === 'pending' || f.status === 'rescheduled') && f.dueDate <= today)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  },

  async updateFollowupOutcome(
    followupId: string,
    data: {
      status: FollowupStatus;
      outcome?: FollowupOutcome;
      customerFeedback?: string;
      satisfactionRating?: number;
      nextAction?: string;
      staffUser: { id: string; name: string };
    }
  ): Promise<CrmFollowup> {
    const store = await getStore();
    const followupIdx = store.followups.findIndex((f) => f.id === followupId);
    if (followupIdx === -1) throw new Error('Followup not found');

    const f = store.followups[followupIdx];
    const now = new Date().toISOString();

    f.status = data.status;
    f.outcome = data.outcome;
    f.customerFeedback = data.customerFeedback;
    f.satisfactionRating = data.satisfactionRating;
    f.nextAction = data.nextAction;
    f.calledBy = data.staffUser.id;
    f.calledByName = data.staffUser.name;
    f.calledOn = now;
    f.updatedAt = now;

    // Synchronize with parent case
    const targetCase = store.cases.find((c) => c.id === f.caseId);
    if (targetCase) {
      // Update the embedded followup in the case
      const cfIdx = targetCase.followups?.findIndex((cf) => cf.id === f.id);
      if (cfIdx !== undefined && cfIdx !== -1 && targetCase.followups) {
        targetCase.followups[cfIdx] = { ...f };
      }

      // Automatically update Case Status based on call outcome!
      let newCaseStatus: CaseStatus | null = null;
      let reason = `Call outcome logged: ${data.outcome || data.status}`;

      if (data.outcome === 'resolved') {
        newCaseStatus = 'resolved';
      } else if (data.outcome === 'worse') {
        newCaseStatus = 'failed';
      } else if (data.outcome === 'improved') {
        newCaseStatus = 'treated';
      } else if (data.status === 'rescheduled') {
        newCaseStatus = 'follow_up_due';
      }

      if (newCaseStatus && newCaseStatus !== targetCase.status) {
        const prevStatus = targetCase.status;
        targetCase.status = newCaseStatus;

        // Never overwrite: Record revision
        if (!targetCase.revisions) targetCase.revisions = [];
        targetCase.revisions.push({
          id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          caseId: targetCase.id,
          revisionNumber: targetCase.revisions.length + 1,
          previousStatus: prevStatus,
          newStatus: newCaseStatus,
          changedBy: data.staffUser.name,
          reason,
          snapshot: { outcome: data.outcome, feedback: data.customerFeedback },
          createdAt: now,
        });
      }

      targetCase.updatedAt = now;
    }

    await persistStore();
    return f;
  },

  // ==========================================
  // LAB TEST REQUESTS & RESULTS
  // ==========================================
  async getTestRequests(filters?: {
    status?: TestRequestStatus;
    testType?: TestType;
    search?: string;
  }): Promise<CrmTestRequest[]> {
    const store = await getStore();
    let list = store.testRequests.filter((r) => !r.deletedAt);

    if (filters?.status) {
      list = list.filter((r) => r.status === filters.status);
    }
    if (filters?.testType) {
      list = list.filter((r) => r.testType === filters.testType);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (r) =>
          r.requestNumber.toLowerCase().includes(q) ||
          r.customerName.toLowerCase().includes(q) ||
          r.customerMobile.includes(q) ||
          r.customerVillage.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getTestRequestById(id: string): Promise<CrmTestRequest | undefined> {
    const store = await getStore();
    return store.testRequests.find((r) => r.id === id && !r.deletedAt);
  },

  async createTestRequest(data: {
    customerId?: string;
    customerName: string;
    customerMobile: string;
    customerVillage: string;
    testType: TestType;
    plotDetails?: string;
    preferredDate?: string;
    address?: string;
    notes?: string;
    photoUrl?: string;
    price?: number;
  }): Promise<CrmTestRequest> {
    const store = await getStore();
    const year = new Date().getFullYear();
    const seq = store.nextTestSequence++;
    const requestNumber = `TEST-${year}-${String(seq).padStart(4, '0')}`;
    const now = new Date().toISOString();

    const newReq: CrmTestRequest = {
      id: `test-req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      requestNumber,
      customerId: data.customerId,
      customerName: data.customerName,
      customerMobile: data.customerMobile,
      customerVillage: data.customerVillage,
      testType: data.testType,
      plotDetails: data.plotDetails,
      preferredDate: data.preferredDate,
      address: data.address,
      notes: data.notes,
      photoUrl: data.photoUrl,
      status: 'new',
      price: data.price ?? (data.testType === 'soil' ? 250 : data.testType === 'pond' ? 300 : 200),
      paymentStatus: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    store.testRequests.push(newReq);
    await persistStore();
    return newReq;
  },

  async updateTestRequest(id: string, updates: Partial<CrmTestRequest>): Promise<CrmTestRequest> {
    const store = await getStore();
    const idx = store.testRequests.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Test request not found');

    store.testRequests[idx] = {
      ...store.testRequests[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await persistStore();
    return store.testRequests[idx];
  },

  async getTestResultByRequestId(requestId: string): Promise<CrmTestResult | undefined> {
    const store = await getStore();
    return store.testResults.find((r) => r.requestId === requestId);
  },

  async saveTestResult(data: {
    requestId: string;
    testedBy: string;
    methodOrInstrument: string;
    parameters: Array<{
      key: string;
      label: string;
      value: string | number;
      unit?: string;
      idealRange?: string;
      status?: 'optimal' | 'low' | 'high' | 'critical';
    }>;
    recommendationText: string;
    attachmentPath?: string;
  }): Promise<CrmTestResult> {
    const store = await getStore();
    const req = store.testRequests.find((r) => r.id === data.requestId);
    if (!req) throw new Error('Test request not found');

    const now = new Date().toISOString();
    let result = store.testResults.find((r) => r.requestId === data.requestId);

    if (result) {
      result.testedBy = data.testedBy;
      result.methodOrInstrument = data.methodOrInstrument;
      result.parameters = data.parameters;
      result.recommendationText = data.recommendationText;
      result.attachmentPath = data.attachmentPath;
      result.updatedAt = now;
    } else {
      result = {
        id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        requestId: data.requestId,
        testedOn: now.split('T')[0],
        testedBy: data.testedBy,
        methodOrInstrument: data.methodOrInstrument,
        parameters: data.parameters,
        recommendationText: data.recommendationText,
        attachmentPath: data.attachmentPath,
        createdAt: now,
        updatedAt: now,
      };
      store.testResults.push(result);
    }

    // Update request status to result_ready
    req.status = 'result_ready';
    req.updatedAt = now;

    await persistStore();
    return result;
  },

  // ==========================================
  // CUSTOMER DOSSIER & PROFILE (DEEP DIVE)
  // Dynamically queries POS Sales & Products!
  // ==========================================
  async getCustomerDossier(customerId: string) {
    const store = await getStore();

    // 1. Existing POS Customer Record
    const posCustomer = await adminDb.getCustomerById(customerId);
    if (!posCustomer) return null;

    // 2. Real POS Sales dynamically queried
    const allSales = await adminDb.getSales();
    const customerSales = allSales
      .filter((s) => s.customerId === customerId && s.status !== 'cancelled')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const totalSpend = customerSales.reduce((acc, s) => acc + s.grandTotal, 0);

    // 3. CRM Land Plots & Ponds
    const plots = store.plots.filter((p) => p.customerId === customerId && !p.deletedAt);

    // 4. CRM Cultivations
    const cultivations = store.cultivations.filter(
      (c) => c.customerId === customerId && !c.deletedAt
    );

    // 5. CRM Cases & Prescriptions
    const cases = store.cases.filter((c) => c.customerId === customerId && !c.deletedAt);

    // 6. CRM Follow-ups
    const followups = store.followups.filter((f) => f.customerId === customerId && !f.deletedAt);

    // 7. CRM Test Requests & Results
    const testRequests = store.testRequests.filter(
      (r) => (r.customerId === customerId || r.customerMobile === posCustomer.phone) && !r.deletedAt
    );
    const testResults: Record<string, CrmTestResult> = {};
    for (const tr of testRequests) {
      const res = store.testResults.find((r) => r.requestId === tr.id);
      if (res) testResults[tr.id] = res;
    }

    return {
      customer: posCustomer,
      plots,
      cultivations,
      sales: customerSales,
      totalSpend,
      cases,
      followups,
      testRequests,
      testResults,
    };
  },

  // ==========================================
  // PRODUCT EFFICACY & SCIENTIFIC ANALYTICS
  // Strict Rule: Enforce N >= 5 cases threshold!
  // Language Rule: "associated with", never "caused by"
  // ==========================================
  async getProductEfficacy(): Promise<ProductEfficacyMetric[]> {
    const store = await getStore();

    // Map: productName -> { timesPrescribed, caseIds: Set<string> }
    const productMap: Record<
      string,
      {
        productId?: string;
        productName: string;
        category: string;
        timesPrescribed: number;
        cases: Set<string>;
        outcomes: {
          resolved: number;
          improved: number;
          noChange: number;
          worse: number;
          notUsed: number;
        };
      }
    > = {};

    // Build outcome map for every case based on latest followup outcome
    const caseOutcomeMap: Record<string, FollowupOutcome | null> = {};
    for (const c of store.cases) {
      if (c.followups && c.followups.length > 0) {
        // Pick latest done followup with an outcome
        const completedFollowups = c.followups.filter((f) => f.status === 'done' && f.outcome);
        if (completedFollowups.length > 0) {
          caseOutcomeMap[c.id] = completedFollowups[completedFollowups.length - 1].outcome || null;
        } else if (c.status === 'resolved') {
          caseOutcomeMap[c.id] = 'resolved';
        } else if (c.status === 'failed') {
          caseOutcomeMap[c.id] = 'worse';
        } else {
          caseOutcomeMap[c.id] = null;
        }
      } else if (c.status === 'resolved') {
        caseOutcomeMap[c.id] = 'resolved';
      } else if (c.status === 'failed') {
        caseOutcomeMap[c.id] = 'worse';
      } else {
        caseOutcomeMap[c.id] = null;
      }
    }

    for (const c of store.cases) {
      if (c.deletedAt) continue;
      const outcome = caseOutcomeMap[c.id];

      for (const presc of c.prescriptions || []) {
        for (const item of presc.items) {
          const key = item.productName.trim();
          if (!productMap[key]) {
            productMap[key] = {
              productId: item.productId,
              productName: key,
              category: c.category,
              timesPrescribed: 0,
              cases: new Set(),
              outcomes: {
                resolved: 0,
                improved: 0,
                noChange: 0,
                worse: 0,
                notUsed: 0,
              },
            };
          }

          productMap[key].timesPrescribed += 1;
          if (!productMap[key].cases.has(c.id)) {
            productMap[key].cases.add(c.id);

            if (outcome === 'resolved') productMap[key].outcomes.resolved += 1;
            else if (outcome === 'improved') productMap[key].outcomes.improved += 1;
            else if (outcome === 'no_change') productMap[key].outcomes.noChange += 1;
            else if (outcome === 'worse') productMap[key].outcomes.worse += 1;
            else if (outcome === 'product_not_used') productMap[key].outcomes.notUsed += 1;
          }
        }
      }
    }

    return Object.values(productMap).map((p) => {
      const casesCount = p.cases.size;
      const positiveOutcomes = p.outcomes.resolved + p.outcomes.improved;
      const evaluatedCases =
        p.outcomes.resolved +
        p.outcomes.improved +
        p.outcomes.noChange +
        p.outcomes.worse;

      // STRICT STATISTICAL HONESTY: Only calculate success rate if N >= 5
      let successRate: number | null = null;
      let sampleSizeLabel: string;

      if (casesCount >= 5 && evaluatedCases >= 3) {
        successRate = Math.round((positiveOutcomes / evaluatedCases) * 100);
        sampleSizeLabel = `${casesCount} cases (statistically valid)`;
      } else {
        sampleSizeLabel = `Sample size too small (${casesCount}/5 cases)`;
      }

      return {
        productId: p.productId,
        productName: p.productName,
        category: p.category,
        timesPrescribed: p.timesPrescribed,
        casesCount,
        outcomes: p.outcomes,
        successRate,
        sampleSizeLabel,
      };
    });
  },

  // ==========================================
  // DASHBOARD AGGREGATE METRICS
  // ==========================================
  async getDashboardMetrics() {
    const store = await getStore();
    const today = new Date().toISOString().split('T')[0];

    const activePlots = store.plots.filter((p) => !p.deletedAt);
    const activeCultivations = store.cultivations.filter(
      (c) => !c.deletedAt && c.status === 'active'
    );
    const activeCases = store.cases.filter(
      (c) => !c.deletedAt && c.status !== 'resolved' && c.status !== 'closed'
    );
    const resolvedCases = store.cases.filter((c) => !c.deletedAt && c.status === 'resolved');

    const dueCalls = store.followups.filter(
      (f) => !f.deletedAt && (f.status === 'pending' || f.status === 'rescheduled') && f.dueDate <= today
    );

    const pendingTests = store.testRequests.filter(
      (r) => !r.deletedAt && r.status !== 'delivered' && r.status !== 'cancelled'
    );

    // Breakdown of active cases by category
    const categoryCount: Record<string, number> = {};
    for (const c of activeCases) {
      categoryCount[c.category] = (categoryCount[c.category] || 0) + 1;
    }

    return {
      totalPlots: activePlots.length,
      totalCultivations: activeCultivations.length,
      activeCasesCount: activeCases.length,
      resolvedCasesCount: resolvedCases.length,
      dueCallsCount: dueCalls.length,
      pendingTestsCount: pendingTests.length,
      casesByCategory: categoryCount,
      recentCases: store.cases
        .filter((c) => !c.deletedAt)
        .slice(-5)
        .reverse(),
      todayFollowups: dueCalls.slice(0, 5),
    };
  },
};
