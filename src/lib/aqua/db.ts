/**
 * Aquaculture Platform Database & Repository Engine
 * Provides unified data access for PostgreSQL / Supabase and persistent local JSON store
 */
import fs from 'fs/promises';
import path from 'path';
import { getCloudData, saveCloudData } from '@/lib/cloud-store';
import {
  AquaDistrict,
  AquaBlock,
  AquaVillage,
  AquaSpecies,
  AquaFeedBrand,
  AquaFarmer,
  AquaFarmerDuplicateAlert,
  AquaPond,
  AquaProductionCycle,
  AquaCycleStocking,
  AquaRecordRevision,
  AquaAuditLog,
  VerificationStatus,
  AquaFeedEvent,
  AquaWaterQualityReading,
  AquaProblemReport,
  AquaIntervention,
  AquaGrowthSample,
  AquaMortalityEvent,
  AquaHarvest,
  AquaExpense,
  AquaSale,
} from '@/types/aqua';
import {
  INITIAL_DISTRICTS,
  INITIAL_BLOCKS,
  INITIAL_VILLAGES,
  INITIAL_SPECIES,
  INITIAL_FEED_BRANDS,
  INITIAL_DEMO_FARMERS,
  INITIAL_DEMO_PONDS,
  INITIAL_DEMO_CYCLES,
  INITIAL_DEMO_STOCKING,
  INITIAL_DEMO_FEED_EVENTS,
  INITIAL_DEMO_WATER_QUALITY,
  INITIAL_DEMO_PROBLEMS,
  INITIAL_DEMO_INTERVENTIONS,
  INITIAL_DEMO_GROWTH_SAMPLES,
  INITIAL_DEMO_MORTALITIES,
  INITIAL_DEMO_HARVESTS,
  INITIAL_DEMO_EXPENSES,
  INITIAL_DEMO_SALES,
} from './seed';

interface AquaStore {
  districts: AquaDistrict[];
  blocks: AquaBlock[];
  villages: AquaVillage[];
  species: AquaSpecies[];
  feedBrands: AquaFeedBrand[];
  farmers: AquaFarmer[];
  duplicateAlerts: AquaFarmerDuplicateAlert[];
  ponds: AquaPond[];
  productionCycles: AquaProductionCycle[];
  stockingRecords: AquaCycleStocking[];
  feedEvents: AquaFeedEvent[];
  waterQualityReadings: AquaWaterQualityReading[];
  problemReports: AquaProblemReport[];
  interventions: AquaIntervention[];
  growthSamples: AquaGrowthSample[];
  mortalityEvents: AquaMortalityEvent[];
  harvests: AquaHarvest[];
  expenses: AquaExpense[];
  sales: AquaSale[];
  revisions: AquaRecordRevision[];
  auditLogs: AquaAuditLog[];
  nextFarmerSequence: number;
  nextPondSequence: number;
  nextCycleSequence: number;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const AQUA_STORE_FILE = path.join(DATA_DIR, 'aqua-store.json');

let inMemoryAquaStore: AquaStore | null = null;

async function ensureDataDir(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {}
}

async function getStore(): Promise<AquaStore> {
  const defaultInit = (): AquaStore => ({
    districts: INITIAL_DISTRICTS,
    blocks: INITIAL_BLOCKS,
    villages: INITIAL_VILLAGES,
    species: INITIAL_SPECIES,
    feedBrands: INITIAL_FEED_BRANDS,
    farmers: INITIAL_DEMO_FARMERS,
    duplicateAlerts: [],
    ponds: INITIAL_DEMO_PONDS,
    productionCycles: INITIAL_DEMO_CYCLES,
    stockingRecords: INITIAL_DEMO_STOCKING,
    feedEvents: INITIAL_DEMO_FEED_EVENTS,
    waterQualityReadings: INITIAL_DEMO_WATER_QUALITY,
    problemReports: INITIAL_DEMO_PROBLEMS,
    interventions: INITIAL_DEMO_INTERVENTIONS,
    growthSamples: INITIAL_DEMO_GROWTH_SAMPLES,
    mortalityEvents: INITIAL_DEMO_MORTALITIES,
    harvests: INITIAL_DEMO_HARVESTS,
    expenses: INITIAL_DEMO_EXPENSES,
    sales: INITIAL_DEMO_SALES,
    revisions: [],
    auditLogs: [],
    nextFarmerSequence: 1,
    nextPondSequence: 1,
    nextCycleSequence: 1,
  });

  const store = await getCloudData<AquaStore>('aqua-store', AQUA_STORE_FILE, defaultInit);
  inMemoryAquaStore = store;
  return store;
}

async function persistStore(): Promise<void> {
  if (!inMemoryAquaStore) return;
  await saveCloudData('aqua-store', AQUA_STORE_FILE, inMemoryAquaStore);
}

// Levenshtein distance for duplicate name detection
function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1].toLowerCase() === b[j - 1].toLowerCase()) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

function normalizeName(name: string): string {
  return name.replace(/\([^)]*\)/g, '').replace(/[^\w\s\u0980-\u09FF]/g, '').trim().toLowerCase();
}

function calculateNameSimilarity(nameA: string, nameB: string): number {
  const cleanA = normalizeName(nameA);
  const cleanB = normalizeName(nameB);
  if (cleanA === cleanB) return 1.0;
  const maxLen = Math.max(cleanA.length, cleanB.length);
  if (maxLen === 0) return 1.0;
  const dist = levenshteinDistance(cleanA, cleanB);
  return (maxLen - dist) / maxLen;
}

// ============================================================================
// EXPORTED AQUA REPOSITORY API
// ============================================================================

export const aquaDb = {
  // Master data
  async getDistricts(): Promise<AquaDistrict[]> {
    const store = await getStore();
    return store.districts;
  },

  async getBlocks(districtId?: string): Promise<AquaBlock[]> {
    const store = await getStore();
    if (!districtId) return store.blocks;
    return store.blocks.filter((b) => b.districtId === districtId);
  },

  async getVillages(blockId?: string): Promise<AquaVillage[]> {
    const store = await getStore();
    if (!blockId) return store.villages;
    return store.villages.filter((v) => v.blockId === blockId);
  },

  async getSpecies(): Promise<AquaSpecies[]> {
    const store = await getStore();
    return store.species.filter((s) => s.isActive);
  },

  async getSpeciesById(id: string): Promise<AquaSpecies | null> {
    const store = await getStore();
    return store.species.find((s) => s.id === id) || null;
  },

  // Farmers
  async getFarmerById(id: string): Promise<AquaFarmer | null> {
    const store = await getStore();
    return store.farmers.find((f) => f.id === id && !f.deletedAt) || null;
  },

  async getFarmerByMobile(mobileNumber: string): Promise<AquaFarmer | null> {
    const store = await getStore();
    const cleanMobile = mobileNumber.replace(/\D/g, '');
    return store.farmers.find((f) => f.mobileNumber === cleanMobile && !f.deletedAt) || null;
  },

  async listFarmers(filters?: {
    districtId?: string;
    blockId?: string;
    villageId?: string;
    status?: string;
    verificationStatus?: VerificationStatus;
    search?: string;
  }): Promise<AquaFarmer[]> {
    const store = await getStore();
    return store.farmers.filter((f) => {
      if (f.deletedAt) return false;
      if (filters?.districtId && f.districtId !== filters.districtId) return false;
      if (filters?.blockId && f.blockId !== filters.blockId) return false;
      if (filters?.villageId && f.villageId !== filters.villageId) return false;
      if (filters?.verificationStatus && f.verificationStatus !== filters.verificationStatus) return false;
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        const matchName = f.fullName.toLowerCase().includes(q);
        const matchMobile = f.mobileNumber.includes(q);
        const matchReg = f.registrationNumber.toLowerCase().includes(q);
        const matchVillage = (f.villageName || '').toLowerCase().includes(q);
        if (!matchName && !matchMobile && !matchReg && !matchVillage) return false;
      }
      return true;
    });
  },

  async registerFarmer(input: {
    fullName: string;
    fatherName?: string;
    mobileNumber: string;
    pin?: string;
    districtId: string;
    blockId: string;
    villageId: string;
    address?: string;
    pinCode?: string;
    experienceYears?: number;
    pondCount?: number;
    totalWaterAreaDecimal?: number;
    primarySpecies?: string[];
    consentDataCollection: boolean;
    consentDataSharing: boolean;
    consentPhotoUse: boolean;
    createdByRole: 'farmer' | 'shop_operator' | 'super_admin';
    createdById?: string;
  }): Promise<{ farmer: AquaFarmer; duplicateWarning?: boolean }> {
    const store = await getStore();
    const cleanMobile = input.mobileNumber.replace(/\D/g, '');

    // 1. Strict uniqueness on mobile number
    const existingByMobile = store.farmers.find(
      (f) => f.mobileNumber === cleanMobile && !f.deletedAt
    );
    if (existingByMobile) {
      throw new Error(`Mobile number ${cleanMobile} is already registered under Registration No: ${existingByMobile.registrationNumber}`);
    }

    // 2. Duplicate Detection: check similar name in same village / block
    let duplicateWarning = false;
    const matchAlerts: Array<{ matchId: string; score: number; reasons: string[] }> = [];

    for (const f of store.farmers) {
      if (f.deletedAt) continue;
      const sameVillage = f.villageId === input.villageId;
      const sameBlock = f.blockId === input.blockId;
      const nameSim = calculateNameSimilarity(f.fullName, input.fullName);

      if (sameVillage && nameSim >= 0.75) {
        duplicateWarning = true;
        matchAlerts.push({
          matchId: f.id,
          score: Math.round(nameSim * 100),
          reasons: [
            `High name similarity (${Math.round(nameSim * 100)}%) in the same village`,
            `Existing: ${f.fullName} (${f.registrationNumber})`,
          ],
        });
      } else if (sameBlock && nameSim >= 0.88) {
        duplicateWarning = true;
        matchAlerts.push({
          matchId: f.id,
          score: Math.round(nameSim * 90),
          reasons: [
            `Very high name similarity (${Math.round(nameSim * 100)}%) in the same block`,
            `Existing: ${f.fullName} (${f.registrationNumber})`,
          ],
        });
      }
    }

    // Generate unique ID and registration number
    const regSeq = String(store.nextFarmerSequence++).padStart(4, '0');
    const registrationNumber = `FARMER-2026-${regSeq}`;
    const id = `farmer-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    // Resolve village name
    const vil = store.villages.find((v) => v.id === input.villageId);
    const villageName = vil ? `${vil.nameBn} (${vil.name})` : '';

    const newFarmer: AquaFarmer = {
      id,
      registrationNumber,
      fullName: input.fullName.trim(),
      fatherName: input.fatherName?.trim() || '',
      mobileNumber: cleanMobile,
      pin: input.pin || '1234',
      districtId: input.districtId,
      blockId: input.blockId,
      villageId: input.villageId,
      villageName,
      address: input.address || '',
      pinCode: input.pinCode || '733124',
      experienceYears: input.experienceYears || 1,
      pondCount: input.pondCount || 1,
      totalWaterAreaDecimal: input.totalWaterAreaDecimal || 0,
      primarySpecies: input.primarySpecies || [],
      consentDataCollection: input.consentDataCollection,
      consentDataSharing: input.consentDataSharing,
      consentPhotoUse: input.consentPhotoUse,
      consentTimestamp: new Date().toISOString(),
      status: input.createdByRole === 'farmer' ? 'pending_verification' : 'active',
      verificationStatus: input.createdByRole === 'shop_operator' || input.createdByRole === 'super_admin' ? 'verified' : 'pending',
      hasDuplicateWarning: duplicateWarning,
      createdByRole: input.createdByRole,
      createdById: input.createdById,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.farmers.push(newFarmer);

    // Save duplicate alerts if any
    for (const alert of matchAlerts) {
      store.duplicateAlerts.push({
        id: `dup-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        farmerId: id,
        potentialMatchId: alert.matchId,
        matchScore: alert.score,
        matchReasons: alert.reasons,
        status: 'pending_review',
        createdAt: new Date().toISOString(),
      });
    }

    // Audit Log
    store.auditLogs.push({
      id: `audit-${Date.now()}`,
      userId: input.createdById,
      userRole: input.createdByRole,
      action: 'FARMER_REGISTERED',
      entityType: 'farmer',
      entityId: id,
      details: { registrationNumber, mobile: cleanMobile, duplicateWarning },
      createdAt: new Date().toISOString(),
    });

    await persistStore();
    return { farmer: newFarmer, duplicateWarning };
  },

  async updateFarmerVerification(
    farmerId: string,
    status: VerificationStatus,
    rejectionReason?: string,
    verifiedById?: string
  ): Promise<AquaFarmer> {
    const store = await getStore();
    const farmer = store.farmers.find((f) => f.id === farmerId && !f.deletedAt);
    if (!farmer) throw new Error('Farmer not found');

    const prevSnapshot = { ...farmer };
    farmer.verificationStatus = status;
    farmer.rejectionReason = rejectionReason || '';
    farmer.updatedAt = new Date().toISOString();

    // Record revision
    store.revisions.push({
      id: `rev-${Date.now()}`,
      tableName: 'aqua_farmers',
      recordId: farmerId,
      revisionNumber: store.revisions.filter((r) => r.recordId === farmerId).length + 1,
      previousData: prevSnapshot,
      newData: { verificationStatus: status, rejectionReason },
      changedById: verifiedById,
      changeReason: `Verification status changed to ${status}`,
      createdAt: new Date().toISOString(),
    });

    await persistStore();
    return farmer;
  },

  // Ponds
  async listPonds(filters?: { farmerId?: string; status?: string; verificationStatus?: VerificationStatus }): Promise<AquaPond[]> {
    const store = await getStore();
    return store.ponds.filter((p) => {
      if (p.deletedAt) return false;
      if (filters?.farmerId && p.farmerId !== filters.farmerId) return false;
      if (filters?.status && p.status !== filters.status) return false;
      if (filters?.verificationStatus && p.verificationStatus !== filters.verificationStatus) return false;
      return true;
    });
  },

  async getPondById(id: string): Promise<AquaPond | null> {
    const store = await getStore();
    return store.ponds.find((p) => p.id === id && !p.deletedAt) || null;
  },

  async createPond(input: {
    farmerId: string;
    name: string;
    areaDecimal: number;
    waterDepthFt: number;
    waterSource: any;
    soilType: any;
    hasDrainage?: boolean;
    hasAeration?: boolean;
    preparationDate?: string;
    photoUrls?: string[];
    notes?: string;
    createdById?: string;
  }): Promise<AquaPond> {
    const store = await getStore();
    const farmer = store.farmers.find((f) => f.id === input.farmerId && !f.deletedAt);
    if (!farmer) throw new Error('Farmer not found');

    const farmerPonds = store.ponds.filter((p) => p.farmerId === input.farmerId && !p.deletedAt);
    const pondSeq = String(farmerPonds.length + 1).padStart(3, '0');
    const pondCode = `POND-${pondSeq}`;

    const newPond: AquaPond = {
      id: `pond-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      pondCode,
      farmerId: input.farmerId,
      name: input.name.trim(),
      areaDecimal: input.areaDecimal,
      waterDepthFt: input.waterDepthFt,
      waterSource: input.waterSource || 'rainfed',
      soilType: input.soilType || 'alluvial',
      hasDrainage: !!input.hasDrainage,
      hasAeration: !!input.hasAeration,
      preparationDate: input.preparationDate,
      status: 'active',
      photoUrls: input.photoUrls || [],
      notes: input.notes || '',
      verificationStatus: 'pending',
      createdById: input.createdById,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.ponds.push(newPond);

    // Update farmer's total water area and pond count
    farmer.pondCount = farmerPonds.length + 1;
    farmer.totalWaterAreaDecimal = Math.round((farmer.totalWaterAreaDecimal + input.areaDecimal) * 100) / 100;
    farmer.updatedAt = new Date().toISOString();

    await persistStore();
    return newPond;
  },

  // Production Cycles (With Overlap Prevention)
  async listCycles(filters?: { farmerId?: string; pondId?: string; status?: string }): Promise<AquaProductionCycle[]> {
    const store = await getStore();
    return store.productionCycles.filter((c) => {
      if (c.deletedAt) return false;
      if (filters?.farmerId && c.farmerId !== filters.farmerId) return false;
      if (filters?.pondId && c.pondId !== filters.pondId) return false;
      if (filters?.status && c.status !== filters.status) return false;
      return true;
    });
  },

  async getCycleById(id: string): Promise<AquaProductionCycle | null> {
    const store = await getStore();
    return store.productionCycles.find((c) => c.id === id && !c.deletedAt) || null;
  },

  async createCycle(input: {
    farmerId: string;
    pondId: string;
    cycleName: string;
    startDate: string;
    targetHarvestDate?: string;
    isAuthorizedOverlap?: boolean;
    notes?: string;
    createdById?: string;
  }): Promise<AquaProductionCycle> {
    const store = await getStore();

    // 1. Verify pond ownership
    const pond = store.ponds.find((p) => p.id === input.pondId && p.farmerId === input.farmerId && !p.deletedAt);
    if (!pond) throw new Error('Pond not found or does not belong to this farmer');

    // 2. Strict Overlap Prevention: No two active cycles on the same pond unless authorized
    const existingActiveCycle = store.productionCycles.find(
      (c) => c.pondId === input.pondId && c.status === 'active' && !c.deletedAt
    );

    if (existingActiveCycle && !input.isAuthorizedOverlap) {
      throw new Error(
        `Active production cycle (${existingActiveCycle.cycleCode} - ${existingActiveCycle.cycleName}) is already running on this pond. Mark authorized overlap or complete the existing cycle first.`
      );
    }

    const year = new Date(input.startDate).getFullYear() || 2026;
    const cycleSeq = String(store.nextCycleSequence++).padStart(3, '0');
    const cycleCode = `CYCLE-${year}-${cycleSeq}`;

    const newCycle: AquaProductionCycle = {
      id: `cycle-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      cycleCode,
      farmerId: input.farmerId,
      pondId: input.pondId,
      cycleName: input.cycleName.trim(),
      startDate: input.startDate,
      targetHarvestDate: input.targetHarvestDate,
      status: 'active',
      isAuthorizedOverlap: !!input.isAuthorizedOverlap,
      notes: input.notes || '',
      verificationStatus: 'pending',
      createdById: input.createdById,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.productionCycles.push(newCycle);
    await persistStore();
    return newCycle;
  },

  // Stocking Records
  async listStocking(filters?: { productionCycleId?: string; pondId?: string; farmerId?: string }): Promise<AquaCycleStocking[]> {
    const store = await getStore();
    return store.stockingRecords.filter((s) => {
      if (s.deletedAt) return false;
      if (filters?.productionCycleId && s.productionCycleId !== filters.productionCycleId) return false;
      if (filters?.pondId && s.pondId !== filters.pondId) return false;
      if (filters?.farmerId && s.farmerId !== filters.farmerId) return false;
      return true;
    });
  },

  async addStocking(input: {
    productionCycleId: string;
    speciesId: string;
    stockingDate: string;
    fryCount: number;
    avgWeightGrams: number;
    seedStage?: any;
    supplierName?: string;
    totalCost?: number;
    isEstimated?: boolean;
    notes?: string;
    createdById?: string;
    farmerId: string;
  }): Promise<AquaCycleStocking> {
    const store = await getStore();
    const cycle = store.productionCycles.find((c) => c.id === input.productionCycleId && !c.deletedAt);
    if (!cycle) throw new Error('Production cycle not found');

    // Security check: farmer ownership
    if (cycle.farmerId !== input.farmerId) {
      throw new Error('Unauthorized: Production cycle belongs to another farmer');
    }

    const species = store.species.find((s) => s.id === input.speciesId);
    const speciesName = species ? `${species.nameEn} (${species.nameBn})` : input.speciesId;

    const newStocking: AquaCycleStocking = {
      id: `stock-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      productionCycleId: input.productionCycleId,
      pondId: cycle.pondId,
      farmerId: input.farmerId,
      speciesId: input.speciesId,
      speciesName,
      stockingDate: input.stockingDate,
      fryCount: input.fryCount,
      avgWeightGrams: input.avgWeightGrams,
      seedStage: input.seedStage || 'fingerling',
      supplierName: input.supplierName || '',
      totalCost: input.totalCost || 0,
      isEstimated: !!input.isEstimated,
      dataQuality: input.isEstimated ? 'estimated' : 'verified_count',
      verificationStatus: 'pending',
      notes: input.notes || '',
      createdById: input.createdById,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.stockingRecords.push(newStocking);
    await persistStore();
    return newStocking;
  },

  async updateStockingRecord(
    stockingId: string,
    updates: Partial<AquaCycleStocking>,
    changedById?: string,
    reason?: string
  ): Promise<AquaCycleStocking> {
    const store = await getStore();
    const record = store.stockingRecords.find((s) => s.id === stockingId && !s.deletedAt);
    if (!record) throw new Error('Stocking record not found');

    // Snapshot previous data (Never silently overwrite)
    const previousData = { ...record };
    Object.assign(record, updates);
    record.updatedAt = new Date().toISOString();

    store.revisions.push({
      id: `rev-${Date.now()}`,
      tableName: 'aqua_cycle_stocking',
      recordId: stockingId,
      revisionNumber: store.revisions.filter((r) => r.recordId === stockingId).length + 1,
      previousData,
      newData: updates,
      changedById,
      changeReason: reason || 'Correction made to stocking event',
      createdAt: new Date().toISOString(),
    });

    await persistStore();
    return record;
  },

  // Verification Queue
  async verifyItem(
    type: 'farmer' | 'pond' | 'stocking',
    id: string,
    status: VerificationStatus,
    rejectionReason?: string,
    verifiedById?: string
  ): Promise<any> {
    const store = await getStore();
    let entity: any = null;
    let tableName = '';

    if (type === 'farmer') {
      entity = store.farmers.find((f) => f.id === id && !f.deletedAt);
      tableName = 'aqua_farmers';
    } else if (type === 'pond') {
      entity = store.ponds.find((p) => p.id === id && !p.deletedAt);
      tableName = 'aqua_ponds';
    } else if (type === 'stocking') {
      entity = store.stockingRecords.find((s) => s.id === id && !s.deletedAt);
      tableName = 'aqua_cycle_stocking';
    }

    if (!entity) throw new Error(`${type} record not found`);

    const prevSnapshot = { ...entity };
    entity.verificationStatus = status;
    if (type === 'farmer') {
      entity.status = status === 'verified' ? 'active' : 'suspended';
    }
    entity.rejectionReason = rejectionReason || '';
    entity.updatedAt = new Date().toISOString();

    store.revisions.push({
      id: `rev-${Date.now()}`,
      tableName,
      recordId: id,
      revisionNumber: store.revisions.filter((r) => r.recordId === id).length + 1,
      previousData: prevSnapshot,
      newData: { verificationStatus: status, rejectionReason },
      changedById: verifiedById,
      changeReason: `Reviewer set status to ${status}`,
      createdAt: new Date().toISOString(),
    });

    await persistStore();
    return entity;
  },

  // Revisions & Audit
  async getRevisions(recordId: string): Promise<AquaRecordRevision[]> {
    const store = await getStore();
    return store.revisions.filter((r) => r.recordId === recordId).sort((a, b) => b.revisionNumber - a.revisionNumber);
  },

  async getDuplicateAlerts(): Promise<AquaFarmerDuplicateAlert[]> {
    const store = await getStore();
    return store.duplicateAlerts;
  },

  // Dashboard Aggregates
  async getDashboardMetrics(): Promise<{
    totalFarmers: number;
    verifiedFarmers: number;
    pendingFarmers: number;
    totalPonds: number;
    totalWaterAreaDecimal: number;
    activeCycles: number;
    totalSpeciesStocked: number;
  }> {
    const store = await getStore();
    const activeFarmers = store.farmers.filter((f) => !f.deletedAt);
    const verifiedFarmers = activeFarmers.filter((f) => f.verificationStatus === 'verified').length;
    const pendingFarmers = activeFarmers.filter((f) => f.verificationStatus === 'pending').length;
    const activePonds = store.ponds.filter((p) => !p.deletedAt);
    const totalWaterAreaDecimal = activePonds.reduce((acc, p) => acc + (p.areaDecimal || 0), 0);
    const activeCycles = store.productionCycles.filter((c) => c.status === 'active' && !c.deletedAt).length;

    const stockedSpeciesSet = new Set(store.stockingRecords.filter((s) => !s.deletedAt).map((s) => s.speciesId));

    return {
      totalFarmers: activeFarmers.length,
      verifiedFarmers,
      pendingFarmers,
      totalPonds: activePonds.length,
      totalWaterAreaDecimal: Math.round(totalWaterAreaDecimal * 100) / 100,
      activeCycles,
      totalSpeciesStocked: stockedSpeciesSet.size,
    };
  },

  // ============================================================================
  // PHASE 2 OPERATIONAL MODULES (Feed, Water, Disease, Care, Growth, Mortality, Harvest, Accounts)
  // ============================================================================

  // 1. Feed Brands & Events
  async getFeedBrands(): Promise<AquaFeedBrand[]> {
    const store = await getStore();
    return store.feedBrands.filter((b) => b.isActive);
  },

  async listFeedEvents(filter: { farmerId?: string; productionCycleId?: string; pondId?: string }): Promise<AquaFeedEvent[]> {
    const store = await getStore();
    let records = store.feedEvents;
    if (filter.farmerId) records = records.filter((r) => r.farmerId === filter.farmerId);
    if (filter.productionCycleId) records = records.filter((r) => r.productionCycleId === filter.productionCycleId);
    if (filter.pondId) records = records.filter((r) => r.pondId === filter.pondId);
    return records.sort((a, b) => new Date(b.feedDate).getTime() - new Date(a.feedDate).getTime());
  },

  async addFeedEvent(input: Omit<AquaFeedEvent, 'id' | 'createdAt' | 'updatedAt' | 'verificationStatus'> & { verificationStatus?: VerificationStatus }): Promise<AquaFeedEvent> {
    const store = await getStore();
    const cycle = store.productionCycles.find((c) => c.id === input.productionCycleId);
    const pondId = input.pondId || cycle?.pondId || '';
    const farmerId = input.farmerId || cycle?.farmerId || '';

    const newRecord: AquaFeedEvent = {
      id: `feed-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      farmerId,
      pondId,
      productionCycleId: input.productionCycleId,
      feedBrandId: input.feedBrandId,
      feedDate: input.feedDate,
      feedingTime: input.feedingTime || '',
      quantityKg: Number(input.quantityKg) || 0,
      feedingMethod: input.feedingMethod || 'হাতে ছিটানো (Broadcast)',
      weatherCondition: input.weatherCondition || 'রৌদ্রোজ্জ্বল (Sunny)',
      isEstimated: !!input.isEstimated,
      verificationStatus: input.verificationStatus || 'pending',
      createdById: input.createdById,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.feedEvents.push(newRecord);
    await persistStore();
    return newRecord;
  },

  // 2. Water Quality
  async listWaterQuality(filter: { farmerId?: string; productionCycleId?: string; pondId?: string }): Promise<AquaWaterQualityReading[]> {
    const store = await getStore();
    let records = store.waterQualityReadings;
    if (filter.farmerId) records = records.filter((r) => r.farmerId === filter.farmerId);
    if (filter.productionCycleId) records = records.filter((r) => r.productionCycleId === filter.productionCycleId);
    if (filter.pondId) records = records.filter((r) => r.pondId === filter.pondId);
    return records.sort((a, b) => new Date(b.readingDate).getTime() - new Date(a.readingDate).getTime());
  },

  async addWaterQuality(input: Omit<AquaWaterQualityReading, 'id' | 'createdAt' | 'updatedAt' | 'verificationStatus'> & { verificationStatus?: VerificationStatus }): Promise<AquaWaterQualityReading> {
    const store = await getStore();
    const cycle = store.productionCycles.find((c) => c.id === input.productionCycleId);
    const pondId = input.pondId || cycle?.pondId || '';
    const farmerId = input.farmerId || cycle?.farmerId || '';

    const newRecord: AquaWaterQualityReading = {
      id: `wq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      farmerId,
      pondId,
      productionCycleId: input.productionCycleId,
      readingDate: input.readingDate,
      readingTime: input.readingTime || '',
      dissolvedOxygenPpm: input.dissolvedOxygenPpm ? Number(input.dissolvedOxygenPpm) : undefined,
      waterTempC: input.waterTempC ? Number(input.waterTempC) : undefined,
      phLevel: input.phLevel ? Number(input.phLevel) : undefined,
      waterTransparencyCm: input.waterTransparencyCm ? Number(input.waterTransparencyCm) : undefined,
      ammoniaPpm: input.ammoniaPpm ? Number(input.ammoniaPpm) : undefined,
      nitritePpm: input.nitritePpm ? Number(input.nitritePpm) : undefined,
      alkalinityPpm: input.alkalinityPpm ? Number(input.alkalinityPpm) : undefined,
      observationNotes: input.observationNotes || '',
      isEstimated: !!input.isEstimated,
      verificationStatus: input.verificationStatus || 'pending',
      createdById: input.createdById,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.waterQualityReadings.push(newRecord);
    await persistStore();
    return newRecord;
  },

  // 3. Problem & Disease Reports
  async listProblems(filter: { farmerId?: string; productionCycleId?: string; pondId?: string }): Promise<AquaProblemReport[]> {
    const store = await getStore();
    let records = store.problemReports;
    if (filter.farmerId) records = records.filter((r) => r.farmerId === filter.farmerId);
    if (filter.productionCycleId) records = records.filter((r) => r.productionCycleId === filter.productionCycleId);
    if (filter.pondId) records = records.filter((r) => r.pondId === filter.pondId);
    return records.sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime());
  },

  async addProblem(input: Omit<AquaProblemReport, 'id' | 'createdAt' | 'updatedAt' | 'verificationStatus'> & { verificationStatus?: VerificationStatus }): Promise<AquaProblemReport> {
    const store = await getStore();
    const cycle = store.productionCycles.find((c) => c.id === input.productionCycleId);
    const pondId = input.pondId || cycle?.pondId || '';
    const farmerId = input.farmerId || cycle?.farmerId || '';

    const newRecord: AquaProblemReport = {
      id: `prob-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      farmerId,
      pondId,
      productionCycleId: input.productionCycleId,
      reportDate: input.reportDate,
      problemCategory: input.problemCategory || 'other',
      symptomDescription: input.symptomDescription,
      affectedSpeciesId: input.affectedSpeciesId,
      severity: input.severity || 'moderate',
      photoUrls: input.photoUrls || [],
      verificationStatus: input.verificationStatus || 'pending',
      createdById: input.createdById,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.problemReports.push(newRecord);
    await persistStore();
    return newRecord;
  },

  // 4. Interventions & Treatments
  async listInterventions(filter: { farmerId?: string; productionCycleId?: string; pondId?: string }): Promise<AquaIntervention[]> {
    const store = await getStore();
    let records = store.interventions;
    if (filter.farmerId) records = records.filter((r) => r.farmerId === filter.farmerId);
    if (filter.productionCycleId) records = records.filter((r) => r.productionCycleId === filter.productionCycleId);
    if (filter.pondId) records = records.filter((r) => r.pondId === filter.pondId);
    return records.sort((a, b) => new Date(b.treatmentDate).getTime() - new Date(a.treatmentDate).getTime());
  },

  async addIntervention(input: Omit<AquaIntervention, 'id' | 'createdAt' | 'updatedAt' | 'verificationStatus'> & { verificationStatus?: VerificationStatus }): Promise<AquaIntervention> {
    const store = await getStore();
    const cycle = store.productionCycles.find((c) => c.id === input.productionCycleId);
    const pondId = input.pondId || cycle?.pondId || '';
    const farmerId = input.farmerId || cycle?.farmerId || '';

    const newRecord: AquaIntervention = {
      id: `int-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      farmerId,
      pondId,
      productionCycleId: input.productionCycleId,
      problemReportId: input.problemReportId,
      prescribedBy: input.prescribedBy || 'আহাম্মেদ ফার্টিলাইজার মৎস্য বিশেষজ্ঞ',
      treatmentDate: input.treatmentDate,
      medicineOrChemicalName: input.medicineOrChemicalName,
      dosage: input.dosage,
      applicationMethod: input.applicationMethod || 'জলে গুলে ছিটানো',
      targetCondition: input.targetCondition,
      notes: input.notes || '',
      verificationStatus: input.verificationStatus || 'pending',
      createdById: input.createdById,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.interventions.push(newRecord);
    await persistStore();
    return newRecord;
  },

  // 5. Growth Samples
  async listGrowthSamples(filter: { farmerId?: string; productionCycleId?: string; pondId?: string }): Promise<AquaGrowthSample[]> {
    const store = await getStore();
    let records = store.growthSamples;
    if (filter.farmerId) records = records.filter((r) => r.farmerId === filter.farmerId);
    if (filter.productionCycleId) records = records.filter((r) => r.productionCycleId === filter.productionCycleId);
    if (filter.pondId) records = records.filter((r) => r.pondId === filter.pondId);
    return records.sort((a, b) => new Date(b.sampleDate).getTime() - new Date(a.sampleDate).getTime());
  },

  async addGrowthSample(input: Omit<AquaGrowthSample, 'id' | 'createdAt' | 'updatedAt' | 'verificationStatus'> & { verificationStatus?: VerificationStatus }): Promise<AquaGrowthSample> {
    const store = await getStore();
    const cycle = store.productionCycles.find((c) => c.id === input.productionCycleId);
    const pondId = input.pondId || cycle?.pondId || '';
    const farmerId = input.farmerId || cycle?.farmerId || '';

    // Auto-calculate ADG if previous sample exists for same cycle and species
    let calculatedAdg = input.calculatedAdgGrams;
    if (!calculatedAdg) {
      const prevSamples = store.growthSamples
        .filter((s) => s.productionCycleId === input.productionCycleId && s.speciesId === input.speciesId)
        .sort((a, b) => new Date(b.sampleDate).getTime() - new Date(a.sampleDate).getTime());

      if (prevSamples.length > 0) {
        const prev = prevSamples[0];
        const daysDiff = (new Date(input.sampleDate).getTime() - new Date(prev.sampleDate).getTime()) / (1000 * 3600 * 24);
        if (daysDiff > 0) {
          const weightGain = Number(input.avgWeightGrams) - prev.avgWeightGrams;
          calculatedAdg = Math.round((weightGain / daysDiff) * 100) / 100;
        }
      }
    }

    const newRecord: AquaGrowthSample = {
      id: `growth-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      farmerId,
      pondId,
      productionCycleId: input.productionCycleId,
      speciesId: input.speciesId,
      sampleDate: input.sampleDate,
      sampleCount: Number(input.sampleCount) || 1,
      avgWeightGrams: Number(input.avgWeightGrams) || 0,
      avgLengthCm: input.avgLengthCm ? Number(input.avgLengthCm) : undefined,
      calculatedAdgGrams: calculatedAdg,
      isEstimated: !!input.isEstimated,
      verificationStatus: input.verificationStatus || 'pending',
      createdById: input.createdById,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.growthSamples.push(newRecord);
    await persistStore();
    return newRecord;
  },

  // 6. Mortality Events
  async listMortality(filter: { farmerId?: string; productionCycleId?: string; pondId?: string }): Promise<AquaMortalityEvent[]> {
    const store = await getStore();
    let records = store.mortalityEvents;
    if (filter.farmerId) records = records.filter((r) => r.farmerId === filter.farmerId);
    if (filter.productionCycleId) records = records.filter((r) => r.productionCycleId === filter.productionCycleId);
    if (filter.pondId) records = records.filter((r) => r.pondId === filter.pondId);
    return records.sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
  },

  async addMortality(input: Omit<AquaMortalityEvent, 'id' | 'createdAt' | 'updatedAt' | 'verificationStatus'> & { verificationStatus?: VerificationStatus }): Promise<AquaMortalityEvent> {
    const store = await getStore();
    const cycle = store.productionCycles.find((c) => c.id === input.productionCycleId);
    const pondId = input.pondId || cycle?.pondId || '';
    const farmerId = input.farmerId || cycle?.farmerId || '';

    const newRecord: AquaMortalityEvent = {
      id: `mort-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      farmerId,
      pondId,
      productionCycleId: input.productionCycleId,
      speciesId: input.speciesId,
      eventDate: input.eventDate,
      deadCount: Number(input.deadCount) || 0,
      suspectedCause: input.suspectedCause || '',
      isEstimated: !!input.isEstimated,
      verificationStatus: input.verificationStatus || 'pending',
      createdById: input.createdById,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.mortalityEvents.push(newRecord);
    await persistStore();
    return newRecord;
  },

  // 7. Fish Harvest
  async listHarvests(filter: { farmerId?: string; productionCycleId?: string; pondId?: string }): Promise<AquaHarvest[]> {
    const store = await getStore();
    let records = store.harvests;
    if (filter.farmerId) records = records.filter((r) => r.farmerId === filter.farmerId);
    if (filter.productionCycleId) records = records.filter((r) => r.productionCycleId === filter.productionCycleId);
    if (filter.pondId) records = records.filter((r) => r.pondId === filter.pondId);
    return records.sort((a, b) => new Date(b.harvestDate).getTime() - new Date(a.harvestDate).getTime());
  },

  async addHarvest(input: Omit<AquaHarvest, 'id' | 'createdAt' | 'updatedAt' | 'verificationStatus'> & { verificationStatus?: VerificationStatus }): Promise<AquaHarvest> {
    const store = await getStore();
    const cycle = store.productionCycles.find((c) => c.id === input.productionCycleId);
    const pondId = input.pondId || cycle?.pondId || '';
    const farmerId = input.farmerId || cycle?.farmerId || '';

    const totalWeightKg = Number(input.totalWeightKg) || 0;
    const pieceCount = input.pieceCount ? Number(input.pieceCount) : undefined;
    const pricePerKg = input.pricePerKg ? Number(input.pricePerKg) : undefined;
    const totalRevenue = input.totalRevenue ? Number(input.totalRevenue) : (pricePerKg && totalWeightKg ? pricePerKg * totalWeightKg : undefined);
    const avgWeightGrams = input.avgWeightGrams || (pieceCount && pieceCount > 0 ? Math.round((totalWeightKg * 1000) / pieceCount) : undefined);

    const newRecord: AquaHarvest = {
      id: `harv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      farmerId,
      pondId,
      productionCycleId: input.productionCycleId,
      speciesId: input.speciesId,
      harvestDate: input.harvestDate,
      harvestType: input.harvestType || 'partial',
      totalWeightKg,
      pieceCount,
      avgWeightGrams,
      buyerName: input.buyerName || '',
      pricePerKg,
      totalRevenue,
      isEstimated: !!input.isEstimated,
      verificationStatus: input.verificationStatus || 'pending',
      createdById: input.createdById,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.harvests.push(newRecord);
    await persistStore();
    return newRecord;
  },

  // 8. Accounts & Financials (Expenses & Sales)
  async listExpenses(filter: { farmerId?: string; productionCycleId?: string; pondId?: string }): Promise<AquaExpense[]> {
    const store = await getStore();
    let records = store.expenses;
    if (filter.farmerId) records = records.filter((r) => r.farmerId === filter.farmerId);
    if (filter.productionCycleId) records = records.filter((r) => r.productionCycleId === filter.productionCycleId);
    if (filter.pondId) records = records.filter((r) => r.pondId === filter.pondId);
    return records.sort((a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime());
  },

  async addExpense(input: Omit<AquaExpense, 'id' | 'createdAt' | 'updatedAt' | 'verificationStatus'> & { verificationStatus?: VerificationStatus }): Promise<AquaExpense> {
    const store = await getStore();
    const cycle = store.productionCycles.find((c) => c.id === input.productionCycleId);
    const pondId = input.pondId || cycle?.pondId || '';
    const farmerId = input.farmerId || cycle?.farmerId || '';

    const newRecord: AquaExpense = {
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      farmerId,
      pondId,
      productionCycleId: input.productionCycleId,
      expenseDate: input.expenseDate,
      category: input.category || 'other',
      amount: Number(input.amount) || 0,
      paymentMode: input.paymentMode || 'cash',
      vendorOrRecipient: input.vendorOrRecipient || '',
      notes: input.notes || '',
      verificationStatus: input.verificationStatus || 'pending',
      createdById: input.createdById,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.expenses.push(newRecord);
    await persistStore();
    return newRecord;
  },

  async listSales(filter: { farmerId?: string; productionCycleId?: string; pondId?: string }): Promise<AquaSale[]> {
    const store = await getStore();
    let records = store.sales;
    if (filter.farmerId) records = records.filter((r) => r.farmerId === filter.farmerId);
    if (filter.productionCycleId) records = records.filter((r) => r.productionCycleId === filter.productionCycleId);
    if (filter.pondId) records = records.filter((r) => r.pondId === filter.pondId);
    return records.sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
  },

  async addSale(input: Omit<AquaSale, 'id' | 'createdAt' | 'updatedAt' | 'verificationStatus'> & { verificationStatus?: VerificationStatus }): Promise<AquaSale> {
    const store = await getStore();
    const cycle = store.productionCycles.find((c) => c.id === input.productionCycleId);
    const pondId = input.pondId || cycle?.pondId || '';
    const farmerId = input.farmerId || cycle?.farmerId || '';

    const totalKg = Number(input.totalKg) || 0;
    const ratePerKg = Number(input.ratePerKg) || 0;
    const grossAmount = input.grossAmount ? Number(input.grossAmount) : totalKg * ratePerKg;
    const deductions = Number(input.deductions) || 0;
    const netAmount = input.netAmount ? Number(input.netAmount) : grossAmount - deductions;

    const newRecord: AquaSale = {
      id: `sale-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      farmerId,
      pondId,
      productionCycleId: input.productionCycleId,
      harvestId: input.harvestId,
      saleDate: input.saleDate,
      buyerType: input.buyerType || 'local_wholesaler',
      totalKg,
      ratePerKg,
      grossAmount,
      deductions,
      netAmount,
      paymentStatus: input.paymentStatus || 'paid',
      notes: input.notes || '',
      verificationStatus: input.verificationStatus || 'pending',
      createdById: input.createdById,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.sales.push(newRecord);
    await persistStore();
    return newRecord;
  },

  async getAccountsSummary(farmerId: string, productionCycleId?: string): Promise<{
    totalExpenses: number;
    totalSales: number;
    netBalance: number;
    expenseCount: number;
    salesCount: number;
  }> {
    const store = await getStore();
    let expenses = store.expenses.filter((e) => e.farmerId === farmerId);
    let sales = store.sales.filter((s) => s.farmerId === farmerId);

    if (productionCycleId) {
      expenses = expenses.filter((e) => e.productionCycleId === productionCycleId);
      sales = sales.filter((s) => s.productionCycleId === productionCycleId);
    }

    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalSales = sales.reduce((sum, s) => sum + (s.netAmount || 0), 0);
    const netBalance = totalSales - totalExpenses;

    return {
      totalExpenses,
      totalSales,
      netBalance,
      expenseCount: expenses.length,
      salesCount: sales.length,
    };
  },
};
