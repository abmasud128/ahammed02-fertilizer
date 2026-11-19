/**
 * Ahammed Fertilizer - Aquaculture Farmer Intelligence Platform
 * Types and Data Contracts
 */

export type AquaUserRole =
  | 'super_admin'
  | 'business_admin'
  | 'shop_operator'
  | 'technical_staff'
  | 'farmer';

export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'corrected';

export type DataQualityFlag = 'verified_count' | 'estimated' | 'unknown';

export type WaterSourceType = 'rainfed' | 'borewell' | 'canal' | 'river' | 'mixed';

export type SoilType = 'clay' | 'loam' | 'sandy_clay' | 'alluvial' | 'other';

export type PondStatus = 'active' | 'drying' | 'prepared' | 'fallow' | 'under_treatment';

export type CycleStatus = 'planned' | 'active' | 'completed' | 'terminated';

export type SeedStage = 'spawn' | 'fry' | 'fingerling' | 'yearling';

export type ProblemCategory =
  | 'disease'
  | 'water_quality'
  | 'mortality'
  | 'feed_refusal'
  | 'predator'
  | 'flooding'
  | 'other';

export type ProblemSeverity = 'mild' | 'moderate' | 'severe' | 'critical';

export type FollowupInterval = '24h' | '48h' | '7_day';

export type ConditionStatus = 'improved' | 'no_change' | 'worsened' | 'resolved';

export type HarvestType = 'partial' | 'final';

export type AquaExpenseCategory =
  | 'feed'
  | 'seed'
  | 'labor'
  | 'medicine_chemical'
  | 'electricity_fuel'
  | 'pond_prep'
  | 'netting'
  | 'equipment'
  | 'other';

export type BuyerType = 'local_wholesaler' | 'retail_market' | 'trader' | 'direct_consumer';

// Geo Master
export interface AquaDistrict {
  id: string;
  name: string;
  nameBn: string;
  state: string;
}

export interface AquaBlock {
  id: string;
  districtId: string;
  name: string;
  nameBn: string;
}

export interface AquaVillage {
  id: string;
  blockId: string;
  name: string;
  nameBn: string;
  pinCode?: string;
}

// Species Master
export interface AquaSpecies {
  id: string;
  scientificName: string;
  nameEn: string;
  nameBn: string;
  commonName: string;
  category: 'carp' | 'catfish' | 'perch' | 'other';
  idealPhMin: number;
  idealPhMax: number;
  idealTempMinC: number;
  idealTempMaxC: number;
  idealDoMinPpm: number;
  isActive: boolean;
}

// Farmer Master
export interface AquaFarmer {
  id: string;
  registrationNumber: string; // e.g. FARMER-2026-0001
  fullName: string;
  fatherName?: string;
  mobileNumber: string;
  pin?: string; // Hashed PIN for shop-operator registered accounts
  districtId: string;
  blockId: string;
  villageId: string;
  villageName?: string;
  address: string;
  pinCode: string;
  experienceYears: number;
  pondCount: number;
  totalWaterAreaDecimal: number; // 100 decimal = 1 acre
  primarySpecies?: string[];
  // Consent
  consentDataCollection: boolean;
  consentDataSharing: boolean;
  consentPhotoUse: boolean;
  consentTimestamp: string;
  // Status
  status: 'active' | 'pending_verification' | 'suspended';
  verificationStatus: VerificationStatus;
  rejectionReason?: string;
  hasDuplicateWarning?: boolean;
  createdByRole: AquaUserRole;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

// Duplicate Detection Record
export interface AquaFarmerDuplicateAlert {
  id: string;
  farmerId: string;
  potentialMatchId: string;
  matchScore: number;
  matchReasons: string[];
  status: 'pending_review' | 'resolved_merged' | 'resolved_distinct';
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

// Pond Master
export interface AquaPond {
  id: string;
  pondCode: string; // e.g. POND-001
  farmerId: string;
  name: string;
  areaDecimal: number; // 100 decimal = 1 acre
  waterDepthFt: number;
  waterSource: WaterSourceType;
  soilType: SoilType;
  hasDrainage: boolean;
  hasAeration: boolean;
  preparationDate?: string;
  status: PondStatus;
  photoUrls: string[];
  notes?: string;
  verificationStatus: VerificationStatus;
  rejectionReason?: string;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

// Production Cycle
export interface AquaProductionCycle {
  id: string;
  cycleCode: string; // e.g. CYCLE-2026-001
  farmerId: string;
  pondId: string;
  cycleName: string;
  startDate: string;
  targetHarvestDate?: string;
  actualHarvestDate?: string;
  status: CycleStatus;
  isAuthorizedOverlap: boolean;
  notes?: string;
  verificationStatus: VerificationStatus;
  rejectionReason?: string;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

// Stocking Event
export interface AquaCycleStocking {
  id: string;
  farmerId: string;
  pondId: string;
  productionCycleId: string;
  speciesId: string;
  speciesName?: string;
  stockingDate: string;
  fryCount: number;
  avgWeightGrams: number;
  seedStage: SeedStage;
  supplierName: string;
  totalCost: number;
  isEstimated: boolean;
  dataQuality: DataQualityFlag;
  verificationStatus: VerificationStatus;
  rejectionReason?: string;
  notes?: string;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

// Record Revision (Never silently overwrite)
export interface AquaRecordRevision {
  id: string;
  tableName: string;
  recordId: string;
  revisionNumber: number;
  previousData: any;
  newData: any;
  changedById?: string;
  changeReason?: string;
  ipAddress?: string;
  createdAt: string;
}

// Full Schema Master & Operational Records (Phase 1 schema ready)
export interface AquaFeedBrand {
  id: string;
  brandName: string;
  manufacturer: string;
  proteinPercentage: number;
  fatPercentage: number;
  feedType: 'floating_pellet' | 'sinking_pellet' | 'mash' | 'farm_made';
  isActive: boolean;
}

export interface AquaFeedEvent {
  id: string;
  farmerId: string;
  pondId: string;
  productionCycleId: string;
  feedBrandId?: string;
  feedDate: string;
  feedingTime?: string;
  quantityKg: number;
  feedingMethod: string;
  weatherCondition?: string;
  isEstimated: boolean;
  verificationStatus: VerificationStatus;
  rejectionReason?: string;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AquaWaterQualityReading {
  id: string;
  farmerId: string;
  pondId: string;
  productionCycleId: string;
  readingDate: string;
  readingTime?: string;
  dissolvedOxygenPpm?: number;
  waterTempC?: number;
  phLevel?: number;
  waterTransparencyCm?: number;
  ammoniaPpm?: number;
  nitritePpm?: number;
  alkalinityPpm?: number;
  observationNotes?: string;
  isEstimated: boolean;
  verificationStatus: VerificationStatus;
  rejectionReason?: string;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AquaProblemReport {
  id: string;
  farmerId: string;
  pondId: string;
  productionCycleId: string;
  reportDate: string;
  problemCategory: ProblemCategory;
  symptomDescription: string;
  affectedSpeciesId?: string;
  severity: ProblemSeverity;
  photoUrls: string[];
  verificationStatus: VerificationStatus;
  rejectionReason?: string;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AquaIntervention {
  id: string;
  farmerId: string;
  pondId: string;
  productionCycleId: string;
  problemReportId?: string;
  prescribedBy?: string;
  treatmentDate: string;
  medicineOrChemicalName: string;
  dosage: string;
  applicationMethod: string;
  targetCondition: string;
  notes?: string;
  verificationStatus: VerificationStatus;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AquaInterventionFollowup {
  id: string;
  interventionId: string;
  followupType: FollowupInterval;
  scheduledDate: string;
  actualDate?: string;
  conditionStatus: ConditionStatus;
  mortalityObserved?: number;
  farmerFeedback?: string;
  technicianAssessment?: string;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AquaGrowthSample {
  id: string;
  farmerId: string;
  pondId: string;
  productionCycleId: string;
  speciesId: string;
  sampleDate: string;
  sampleCount: number;
  avgWeightGrams: number;
  avgLengthCm?: number;
  calculatedAdgGrams?: number;
  isEstimated: boolean;
  verificationStatus: VerificationStatus;
  rejectionReason?: string;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AquaMortalityEvent {
  id: string;
  farmerId: string;
  pondId: string;
  productionCycleId: string;
  speciesId?: string;
  eventDate: string;
  deadCount: number;
  suspectedCause?: string;
  isEstimated: boolean;
  verificationStatus: VerificationStatus;
  rejectionReason?: string;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AquaHarvest {
  id: string;
  farmerId: string;
  pondId: string;
  productionCycleId: string;
  speciesId: string;
  harvestDate: string;
  harvestType: HarvestType;
  totalWeightKg: number;
  pieceCount?: number;
  avgWeightGrams?: number;
  buyerName?: string;
  pricePerKg?: number;
  totalRevenue?: number;
  isEstimated: boolean;
  verificationStatus: VerificationStatus;
  rejectionReason?: string;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AquaExpense {
  id: string;
  farmerId: string;
  pondId: string;
  productionCycleId: string;
  expenseDate: string;
  category: AquaExpenseCategory;
  amount: number;
  paymentMode: string;
  vendorOrRecipient?: string;
  notes?: string;
  receiptUrl?: string;
  verificationStatus: VerificationStatus;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AquaSale {
  id: string;
  farmerId: string;
  pondId: string;
  productionCycleId: string;
  harvestId?: string;
  saleDate: string;
  buyerType: BuyerType;
  totalKg: number;
  ratePerKg: number;
  grossAmount: number;
  deductions: number;
  netAmount: number;
  paymentStatus: 'paid' | 'partial' | 'due';
  notes?: string;
  verificationStatus: VerificationStatus;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AquaAuditLog {
  id: string;
  userId?: string;
  userRole: AquaUserRole;
  action: string;
  entityType: string;
  entityId?: string;
  details?: any;
  ipAddress?: string;
  createdAt: string;
}
