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

const INITIAL_FARMERS: SoilFarmer[] = [];
const INITIAL_FIELDS: SoilField[] = [];
const INITIAL_SAMPLES: SoilSample[] = [];

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
