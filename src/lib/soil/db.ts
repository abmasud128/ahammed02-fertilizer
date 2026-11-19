import fs from 'fs/promises';
import path from 'path';
import {
  SoilFarmer,
  SoilField,
  SoilSample,
  SoilLabResults,
  CropCultivationDetails,
  SoilRecommendation,
} from '@/types/soil';

interface SoilStore {
  farmers: SoilFarmer[];
  fields: SoilField[];
  samples: SoilSample[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const SOIL_STORE_FILE = path.join(DATA_DIR, 'soil-store.json');

const INITIAL_FARMERS: SoilFarmer[] = [
  {
    id: 'farmer-nd-01',
    farmerName: 'Biplab Mondal',
    phoneNumber: '9800012345',
    fatherName: 'Haradhan Mondal',
    village: 'Jahangirpur',
    block: 'Gangarampur',
    district: 'Dakshin Dinajpur',
    address: 'Nandair, P.O. Nandair',
    createdAt: '2026-11-16T10:00:00.000Z',
  },
  {
    id: 'farmer-nd-02',
    farmerName: 'Prabir Sarkar',
    phoneNumber: '9091017035',
    fatherName: 'Amal Sarkar',
    village: 'Nandair',
    block: 'Balurghat',
    district: 'Dakshin Dinajpur',
    address: 'Nandair Bazaar, Dakshin Dinajpur',
    createdAt: '2026-11-17T11:00:00.000Z',
  },
];

const INITIAL_FIELDS: SoilField[] = [
  {
    id: 'field-nd-01',
    farmerId: 'farmer-nd-01',
    fieldName: 'Field-01',
    totalArea: 1.5,
    areaUnit: 'Acre',
    latitude: 25.6234,
    longitude: 88.6742,
    landType: 'Lowland',
    irrigationSource: 'Canal / Surface',
    soilTexture: 'Loam',
  },
  {
    id: 'field-nd-02',
    farmerId: 'farmer-nd-02',
    fieldName: 'North Plot A',
    totalArea: 2.0,
    areaUnit: 'Acre',
    latitude: 25.612,
    longitude: 88.681,
    landType: 'Medium Land',
    irrigationSource: 'Borewell / Tube',
    soilTexture: 'Sandy Loam',
  },
];

const INITIAL_SAMPLES: SoilSample[] = [
  {
    id: 'ND-2026-001',
    farmerId: 'farmer-nd-01',
    fieldId: 'field-nd-01',
    farmerName: 'Biplab Mondal',
    farmerPhone: '9800012345',
    fieldName: 'Field-01',
    fieldArea: 1.5,
    fieldAreaUnit: 'Acre',
    sampleCollectionDate: '2026-11-16',
    samplingDepth: '0 - 15 cm',
    purpose: 'Fertilizer Recommendation',
    status: 'completed',
    createdAt: '2026-11-16T10:30:00.000Z',
    labResults: {
      ph: 6.2,
      ec: 0.31,
      organicCarbon: 0.72,
      availableN: 210,
      availableP: 14,
      availableK: 210,
      zinc: 0.62,
      copper: 0.36,
      iron: 4.8,
      boron: 0.28,
      manganese: 1.2,
      testedAt: '2026-11-16',
    },
    cropDetails: {
      cropName: 'Paddy (Rice)',
      cultivationMethod: 'Transplanting (TPR)',
      variety: 'Swarna Gouri',
      waterManagement: 'Flooded / Puddled',
      season: 'Kharif (Monsoon)',
      previousCrop: 'Mustard',
      expectedSowingDate: '2026-06-25',
      expectedYield: 45,
      yieldUnit: 'quintal/acre',
    },
    recommendation: {
      cropName: 'Paddy (Rice)',
      nutrientPerAcre: {
        nitrogenKg: 46,
        phosphorusKg: 20,
        potassiumKg: 16,
      },
      fertilizerPerAcre: {
        ureaKg: 100,
        sspKg: 125,
        mopKg: 27,
        zincSulphateKg: 5,
      },
      applicationSchedule: [
        {
          stage: 'Basal (at transplanting)',
          description: 'জমি তৈরির শেষ চাষে সমভাবে প্রয়োগ করুন',
          products: 'SSP 125 kg + MOP 27 kg + Urea 20 kg',
        },
        {
          stage: 'Top dressing 1 (at 20-25 DAT)',
          description: 'চারা রোপণের ২০-২৫ দিন পর ১ম বার উপরি প্রয়োগ',
          products: 'Urea 40 kg',
        },
        {
          stage: 'Top dressing 2 (at 40-45 DAT)',
          description: 'থোড় আসার সময় বা রোপণের ৪০-৪৫ দিন পর ২য় বার উপরি প্রয়োগ',
          products: 'Urea 40 kg',
        },
      ],
      additionalAdvisoryBn: [
        'জমিতে জৈব পদার্থের ঘাটতি মেটাতে একর প্রতি ২ টন পচা গোবর সার বা কম্পোস্ট শেষ চাষের সময় প্রয়োগ করুন।',
        'ইউরিয়া সার সমানভাবে জমিতে প্রয়োগ করে ২-৩ সেমি নিয়ন্ত্রিত জল রাখুন।',
        'জিঙ্কের ঘাটতি লক্ষণ দেখা দিলে জিংক সালফেট (০.৫%) ও চুন দ্রবণ স্প্রে করুন।',
      ],
      additionalAdvisoryEn: [
        'Apply 2 tonnes of farmyard manure or well-decomposed compost per acre during final land preparation to build organic carbon.',
        'Maintain a shallow water layer (2-3 cm) during top dressing of Urea fertilizer to minimize volatilization loss.',
        'If foliar zinc deficiency chlorosis occurs, spray 0.5% Zinc Sulphate neutralized with 0.25% slaked lime.',
      ],
    },
    reportLanguage: 'bn',
    reportFormat: 'detailed',
  },
];

let inMemorySoilStore: SoilStore | null = null;

async function ensureDataDir(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {}
}

async function loadStore(): Promise<SoilStore> {
  if (inMemorySoilStore) return inMemorySoilStore;

  await ensureDataDir();
  try {
    const raw = await fs.readFile(SOIL_STORE_FILE, 'utf-8');
    inMemorySoilStore = JSON.parse(raw);
    return inMemorySoilStore!;
  } catch {
    inMemorySoilStore = {
      farmers: INITIAL_FARMERS,
      fields: INITIAL_FIELDS,
      samples: INITIAL_SAMPLES,
    };
    await saveStore();
    return inMemorySoilStore;
  }
}

async function saveStore(): Promise<void> {
  if (!inMemorySoilStore) return;
  await ensureDataDir();
  await fs.writeFile(SOIL_STORE_FILE, JSON.stringify(inMemorySoilStore, null, 2), 'utf-8');
}

export const soilDb = {
  async listFarmers(): Promise<SoilFarmer[]> {
    const store = await loadStore();
    return store.farmers;
  },

  async addFarmer(farmer: Omit<SoilFarmer, 'id' | 'createdAt'>): Promise<SoilFarmer> {
    const store = await loadStore();
    const newFarmer: SoilFarmer = {
      ...farmer,
      id: `farmer-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    store.farmers.unshift(newFarmer);
    await saveStore();
    return newFarmer;
  },

  async listFields(farmerId?: string): Promise<SoilField[]> {
    const store = await loadStore();
    if (farmerId) {
      return store.fields.filter((f) => f.farmerId === farmerId);
    }
    return store.fields;
  },

  async addField(field: Omit<SoilField, 'id'>): Promise<SoilField> {
    const store = await loadStore();
    const newField: SoilField = {
      ...field,
      id: `field-${Date.now()}`,
    };
    store.fields.unshift(newField);
    await saveStore();
    return newField;
  },

  async listSamples(): Promise<SoilSample[]> {
    const store = await loadStore();
    return store.samples;
  },

  async getSample(id: string): Promise<SoilSample | null> {
    const store = await loadStore();
    return store.samples.find((s) => s.id === id) || null;
  },

  async addSample(sample: SoilSample): Promise<SoilSample> {
    const store = await loadStore();
    const existingIdx = store.samples.findIndex((s) => s.id === sample.id);
    if (existingIdx >= 0) {
      store.samples[existingIdx] = sample;
    } else {
      store.samples.unshift(sample);
    }
    await saveStore();
    return sample;
  },

  async updateSample(id: string, updates: Partial<SoilSample>): Promise<SoilSample | null> {
    const store = await loadStore();
    const idx = store.samples.findIndex((s) => s.id === id);
    if (idx < 0) return null;
    store.samples[idx] = { ...store.samples[idx], ...updates };
    await saveStore();
    return store.samples[idx];
  },
};
