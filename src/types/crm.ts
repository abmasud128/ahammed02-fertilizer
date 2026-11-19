/**
 * Ahammed Fertilizer - CRM & Farm Intelligence Module
 * Data Types & Contracts
 */

export type PlotType = 'crop_field' | 'pond';
export type AreaUnit = 'bigha' | 'acre' | 'decimal';

export type CultivationKind = 'crop' | 'fish';
export type CultivationStatus = 'active' | 'completed' | 'abandoned';
export type SeasonType = 'Aman' | 'Boro' | 'Aus' | 'Rabi' | 'Kharif' | 'Pre-Kharif' | 'Year-Round' | 'Other';

export type CaseCategory =
  | 'crop_disease'
  | 'pest'
  | 'nutrient_deficiency'
  | 'soil'
  | 'pond_water_toxicity'
  | 'fish_disease'
  | 'fish_growth'
  | 'other';

export type CaseSeverity = 'mild' | 'moderate' | 'severe' | 'critical';

export type CaseStatus =
  | 'open'
  | 'treated'
  | 'follow_up_due'
  | 'resolved'
  | 'failed'
  | 'closed';

export type FollowupStatus = 'pending' | 'done' | 'no_answer' | 'rescheduled';

export type FollowupOutcome =
  | 'resolved'
  | 'improved'
  | 'no_change'
  | 'worse'
  | 'product_not_used';

export type TestType = 'soil' | 'pond' | 'water';

export type TestRequestStatus =
  | 'new'
  | 'scheduled'
  | 'sample_collected'
  | 'result_ready'
  | 'delivered'
  | 'cancelled';

export interface CrmSettings {
  id: string;
  bighaToDecimal: number; // Default 33 decimal per bigha in West Bengal
  defaultFollowupDays: number; // Default 7 days
  categoryFollowupDays: Record<CaseCategory, number>;
  updatedAt: string;
}

export interface CrmLandPlot {
  id: string;
  customerId: string; // Foreign key to existing POS customer
  customerName?: string;
  name: string; // e.g. "North Field" or "Danga Pukur"
  type: PlotType;
  locationText: string;
  village: string;
  block: string;
  district: string;
  gpsCoordinates?: string;
  areaValue: number;
  areaUnit: AreaUnit;
  areaInDecimal: number; // Canonical computed value (1 acre = 100 decimal)
  waterSource?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CrmCultivation {
  id: string;
  plotId: string;
  customerId: string;
  kind: CultivationKind;
  cropOrSpeciesName: string; // e.g. "Swarna (Aman Paddy)" or "Rohu + Catla + Mrigal"
  variety?: string;
  startDate: string;
  expectedEndDate?: string;
  actualEndDate?: string;
  status: CultivationStatus;
  season: SeasonType;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CrmCaseMedia {
  id: string;
  caseId: string;
  storagePath: string;
  fileName: string;
  fileType: string;
  sizeBytes: number;
  caption?: string;
  uploadedAt: string;
}

export interface CrmPrescriptionItem {
  id: string;
  prescriptionId: string;
  productId?: string; // Foreign key to existing POS ProductRecord
  productName: string;
  isCustomItem: boolean; // True when free-text product not in inventory
  quantity: number;
  unit: string;
  doseInstructions: string; // e.g. "2 ml per litre of water"
  applicationMethod: string; // e.g. "Foliar Spray" or "Broadcasting"
  intervalDays?: number;
  numberOfApplications?: number;
}

export interface CrmPrescription {
  id: string;
  caseId: string;
  prescribedOn: string;
  prescribedBy: string; // Staff user id/name
  prescribedByName?: string;
  notes?: string;
  items: CrmPrescriptionItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CrmFollowup {
  id: string;
  caseId: string;
  customerId: string;
  caseNumber?: string;
  customerName?: string;
  customerMobile?: string;
  customerVillage?: string;
  dueDate: string;
  status: FollowupStatus;
  calledBy?: string;
  calledByName?: string;
  calledOn?: string;
  outcome?: FollowupOutcome;
  customerFeedback?: string; // Verbal feedback
  satisfactionRating?: number; // 1 to 5 optional
  nextAction?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CrmCaseRevision {
  id: string;
  caseId: string;
  revisionNumber: number;
  previousStatus: CaseStatus;
  newStatus: CaseStatus;
  changedBy: string;
  reason?: string;
  snapshot: any;
  createdAt: string;
}

export interface CrmCase {
  id: string;
  caseNumber: string; // Human-readable e.g. CASE-2026-0001
  customerId: string;
  customerName?: string;
  customerMobile?: string;
  customerVillage?: string;
  plotId: string;
  plotName?: string;
  plotType?: PlotType;
  cultivationId?: string;
  cultivationName?: string;
  category: CaseCategory;
  title: string; // e.g. "Aman Paddy Leaf Blight" or "Pond Ammonia Flare"
  description: string;
  observedOn: string;
  severity: CaseSeverity;
  status: CaseStatus;
  media: CrmCaseMedia[];
  prescriptions: CrmPrescription[];
  followups: CrmFollowup[];
  revisions: CrmCaseRevision[];
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CrmTestParameter {
  key: string;
  label: string;
  value: string | number;
  unit?: string;
  idealRange?: string;
  status?: 'optimal' | 'low' | 'high' | 'critical';
}

export interface CrmTestRequest {
  id: string;
  requestNumber: string; // e.g. TEST-2026-0001
  customerId?: string; // Linked if existing customer
  customerName: string;
  customerMobile: string;
  customerVillage: string;
  testType: TestType;
  plotDetails?: string;
  preferredDate?: string;
  address?: string;
  notes?: string;
  photoUrl?: string;
  status: TestRequestStatus;
  assignedTo?: string;
  assignedToName?: string;
  price: number;
  paymentStatus: 'pending' | 'paid';
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CrmTestResult {
  id: string;
  requestId: string;
  testedOn: string;
  testedBy: string;
  methodOrInstrument: string;
  parameters: CrmTestParameter[];
  recommendationText: string;
  attachmentPath?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CrmAuditLogEntry {
  id: string;
  userId: string;
  userEmail: string;
  userRole: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, any>;
  createdAt: string;
}

export interface ProductEfficacyMetric {
  productId?: string;
  productName: string;
  category: string;
  timesPrescribed: number;
  casesCount: number;
  outcomes: {
    resolved: number;
    improved: number;
    noChange: number;
    worse: number;
    notUsed: number;
  };
  successRate: number | null; // Null if < 5 cases
  sampleSizeLabel: string;
}
