export interface SoilFarmer {
  id: string;
  farmerName: string;
  phoneNumber: string;
  fatherName?: string;
  village: string;
  para?: string;
  block: string;
  district: string;
  address?: string;
  landArea?: string;
  landUnit?: string;
  primaryCrops?: string[];
  aadhaar?: string;
  createdAt?: string;
}

export interface SoilField {
  id: string;
  farmerId: string;
  fieldName: string; // e.g. "Field-01"
  totalArea: number; // e.g. 1.50
  areaUnit: 'Acre' | 'Bigha' | 'Hectare';
  latitude?: number; // e.g. 25.6234
  longitude?: number; // e.g. 88.6742
  landType: 'Lowland' | 'Medium Land' | 'Upland';
  irrigationSource: 'Canal / Surface' | 'Borewell / Tube' | 'Rainfed' | 'River Lift';
  soilTexture: 'Loam' | 'Clay' | 'Sandy' | 'Silty' | 'Sandy Loam' | 'Clay Loam';
}

export interface SoilSample {
  id: string; // e.g. "ND-2026-001"
  farmerId: string;
  fieldId: string;
  farmerName: string;
  farmerPhone: string;
  fieldName: string;
  fieldArea: number;
  fieldAreaUnit: string;
  sampleCollectionDate: string; // e.g. "2026-11-16"
  samplingDepth: string; // e.g. "0 - 15 cm"
  purpose: string; // e.g. "Fertilizer Recommendation"
  fieldPhotoUrl?: string;
  status: 'draft' | 'tested' | 'recommended' | 'completed';
  createdAt: string;

  // Lab Results (Step 4)
  labResults?: SoilLabResults;

  // Crop & Cultivation (Step 5)
  cropDetails?: CropCultivationDetails;

  // Recommendation & Schedule (Step 7)
  recommendation?: SoilRecommendation;

  // Report config (Step 8)
  reportLanguage?: 'bn' | 'en';
  reportFormat?: 'detailed' | 'short';
}

export interface SoilLabResults {
  // Basic Parameters
  ph: number; // e.g. 6.2
  ec: number; // e.g. 0.31 dS/m
  organicCarbon: number; // e.g. 0.72 %

  // Available Macronutrients (kg/ha)
  availableN: number; // e.g. 210 kg/ha
  availableP: number; // e.g. 14 kg/ha
  availableK: number; // e.g. 210 kg/ha

  // Micronutrients (mg/kg / ppm)
  zinc: number; // e.g. 0.62 mg/kg
  copper?: number; // e.g. 0.36 mg/kg
  iron?: number; // e.g. 4.80 mg/kg
  boron?: number; // e.g. 0.28 mg/kg
  manganese?: number; // e.g. 1.20 mg/kg
  testedAt?: string;
}

export interface CropCultivationDetails {
  cropName: string; // e.g. "Paddy (Rice)"
  cultivationMethod: 'Transplanting (TPR)' | 'Direct Seeded (DSR)';
  variety?: string; // e.g. "Swarna Gouri"
  waterManagement: string; // e.g. "Flooded / Puddled"
  season: 'Kharif (Monsoon)' | 'Rabi (Winter)' | 'Boro (Summer)';
  previousCrop?: string; // e.g. "Mustard"
  expectedSowingDate?: string; // e.g. "2026-06-25"
  expectedYield?: number; // e.g. 45
  yieldUnit?: string; // e.g. "quintal/acre"
}

export interface SoilStatusItem {
  param: string;
  value: string;
  status: 'Low' | 'Medium' | 'Good' | 'Adequate' | 'High' | 'Acidic' | 'Alkaline';
  color: 'green' | 'amber' | 'red' | 'orange';
  interpretation: string;
}

export interface SoilRecommendation {
  cropName: string;
  nutrientPerAcre: {
    nitrogenKg: number; // e.g. 46
    phosphorusKg: number; // e.g. 20 (P2O5)
    potassiumKg: number; // e.g. 16 (K2O)
  };
  fertilizerPerAcre: {
    ureaKg: number; // e.g. 100
    sspKg: number; // e.g. 125
    mopKg: number; // e.g. 27
    zincSulphateKg?: number; // e.g. 5
  };
  applicationSchedule: {
    stage: string;
    description: string;
    products: string;
  }[];
  additionalAdvisoryBn: string[];
  additionalAdvisoryEn: string[];
}
