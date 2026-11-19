/**
 * Master Reference & Seed Data for CRM & Farm Intelligence Module
 */
import {
  CrmSettings,
  CrmLandPlot,
  CrmCultivation,
  CrmCase,
  CrmFollowup,
  CrmTestRequest,
  CrmTestResult,
} from '@/types/crm';

export const INITIAL_CRM_SETTINGS: CrmSettings = {
  id: 'default',
  bighaToDecimal: 33.0, // 33 decimal per bigha (West Bengal standard)
  defaultFollowupDays: 7,
  categoryFollowupDays: {
    crop_disease: 5,
    pest: 3,
    nutrient_deficiency: 10,
    soil: 14,
    pond_water_toxicity: 2,
    fish_disease: 4,
    fish_growth: 15,
    other: 7,
  },
  updatedAt: new Date().toISOString(),
};

// Clean slate: all demo CRM collections initialized as empty
export const INITIAL_CRM_PLOTS: CrmLandPlot[] = [];
export const INITIAL_CRM_CULTIVATIONS: CrmCultivation[] = [];
export const INITIAL_CRM_CASES: CrmCase[] = [];
export const INITIAL_CRM_TEST_REQUESTS: CrmTestRequest[] = [];
export const INITIAL_CRM_TEST_RESULTS: CrmTestResult[] = [];
