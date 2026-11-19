'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FlaskConical,
  Sprout,
  User,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  Printer,
  Download,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Compass,
  Layers,
  Sparkles,
  Info,
  Clock,
  Search,
  Plus,
} from 'lucide-react';
import {
  SoilFarmer,
  SoilField,
  SoilSample,
  SoilLabResults,
  CropCultivationDetails,
  SoilRecommendation,
} from '@/types/soil';

export default function SoilTestingPlatformPage() {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [farmers, setFarmers] = useState<SoilFarmer[]>([]);
  const [fields, setFields] = useState<SoilField[]>([]);
  const [samples, setSamples] = useState<SoilSample[]>([]);
  const [selectedSampleId, setSelectedSampleId] = useState<string>('ND-2026-001');
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>('farmer-nd-01');
  const [farmerSearch, setFarmerSearch] = useState<string>('');

  // Step 1: Selected Farmer Profile State
  const [farmerForm, setFarmerForm] = useState({
    farmerName: 'Biplab Mondal',
    phoneNumber: '9800012345',
    fatherName: 'Haradhan Mondal',
    village: 'Jahangirpur',
    block: 'Gangarampur',
    district: 'Dakshin Dinajpur',
    address: 'Nandair, P.O. Nandair',
  });

  // Step 2: Register Field Form State
  const [fieldForm, setFieldForm] = useState({
    fieldName: 'Field-01',
    totalArea: 1.5,
    areaUnit: 'Acre' as const,
    latitude: 25.6234,
    longitude: 88.6742,
    landType: 'Lowland' as const,
    irrigationSource: 'Canal / Surface' as const,
    soilTexture: 'Loam' as const,
  });

  // Step 3: Create Sample Form State
  const [sampleForm, setSampleForm] = useState({
    sampleId: 'ND-2026-001',
    farmerId: 'farmer-nd-01',
    fieldId: 'field-nd-01',
    collectionDate: '2026-11-16',
    samplingDepth: '0 - 15 cm',
    purpose: 'Fertilizer Recommendation',
    photoUrl: '/images/hero-agriculture-field.jpg',
  });

  // Step 4: Laboratory Test Results Form State
  const [labResults, setLabResults] = useState<SoilLabResults>({
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
  });

  // Step 5: Crop Cultivation Details State
  const [cropDetails, setCropDetails] = useState<CropCultivationDetails>({
    cropName: 'Paddy (Rice)',
    cultivationMethod: 'Transplanting (TPR)',
    variety: 'Swarna Gouri',
    waterManagement: 'Flooded / Puddled',
    season: 'Kharif (Monsoon)',
    previousCrop: 'Mustard',
    expectedSowingDate: '2026-06-25',
    expectedYield: 45,
    yieldUnit: 'quintal/acre',
  });

  // Step 6: Verification Checkbox
  const [dataVerified, setDataVerified] = useState(true);

  // Step 7: Calculated Recommendation State
  const [recommendation, setRecommendation] = useState<SoilRecommendation>({
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
      'জমিতে জৈব পদার্থ বৃদ্ধি করতে কম্পোস্ট বা গোবর সার (২ টন/একর) প্রয়োগ করুন।',
      'জমি রোপণের আগে লেভেলিং নিশ্চিত করুন।',
      'ইউরিয়া সার সমানভাবে ছিটিয়ে জল নিষ্কাশনের ব্যবস্থা রাখুন।',
      'জিঙ্কের ঘাটতি দেখা দিলে জিংক সালফেট (০.৫%) স্প্রে করতে পারেন।',
    ],
    additionalAdvisoryEn: [
      'Apply 2 tonnes of farmyard manure or compost per acre to enhance soil organic carbon.',
      'Ensure proper leveling of the field prior to transplanting.',
      'Maintain controlled shallow water (2-3 cm) during top dressing of Urea.',
      'If foliar zinc chlorosis occurs, spray 0.5% Zinc Sulphate neutralized with slaked lime.',
    ],
  });

  // Step 8: Report Format Modal State
  const [showFormatModal, setShowFormatModal] = useState(false);
  const [reportLang, setReportLang] = useState<'bn' | 'en'>('bn');
  const [reportFormat, setReportFormat] = useState<'detailed' | 'short'>('detailed');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = () => {
    setLoading(true);
    fetch('/api/admin/soil-testing')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setFarmers(data.farmers || []);
          setFields(data.fields || []);
          setSamples(data.samples || []);
          if (data.samples && data.samples.length > 0) {
            const first = data.samples[0];
            setSelectedSampleId(first.id);
            if (first.labResults) setLabResults(first.labResults);
            if (first.cropDetails) setCropDetails(first.cropDetails);
            if (first.recommendation) setRecommendation(first.recommendation);
            if (first.farmerName) {
              setFarmerForm((prev) => ({
                ...prev,
                farmerName: first.farmerName,
                phoneNumber: first.farmerPhone,
              }));
            }
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectFarmer = (f: SoilFarmer) => {
    setSelectedFarmerId(f.id);
    setFarmerForm({
      farmerName: f.farmerName,
      phoneNumber: f.phoneNumber,
      fatherName: f.fatherName || '',
      village: f.village || 'Dakshin Dinajpur',
      block: f.block || 'Gangarampur',
      district: f.district || 'Dakshin Dinajpur',
      address: f.address || '',
    });
    setSampleForm((prev) => ({
      ...prev,
      farmerId: f.id,
      farmerName: f.farmerName,
      farmerPhone: f.phoneNumber,
    }));
    if (f.landArea) {
      const parsedArea = parseFloat(f.landArea);
      if (!isNaN(parsedArea)) {
        setFieldForm((prev) => ({
          ...prev,
          totalArea: parsedArea,
          areaUnit: (f.landUnit as any) || 'Acre',
          fieldName: f.para ? `${f.para} Plot` : prev.fieldName,
        }));
      }
    }
    showToast(`✓ Selected farmer: ${f.farmerName}`);
  };

  const filteredFarmers = farmers.filter((f) => {
    if (!farmerSearch.trim()) return true;
    const q = farmerSearch.toLowerCase();
    return (
      f.farmerName.toLowerCase().includes(q) ||
      f.phoneNumber.includes(q) ||
      (f.village && f.village.toLowerCase().includes(q))
    );
  });

  // Compute interpretation badges based on lab results
  const getInterpretation = () => {
    return [
      {
        param: 'pH',
        val: labResults.ph.toString(),
        label: labResults.ph < 6.5 ? 'Slightly acidic (Good)' : labResults.ph <= 7.5 ? 'Neutral (Optimal)' : 'Alkaline',
        color: 'text-emerald-700 bg-emerald-100 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300',
        dot: 'bg-emerald-500',
      },
      {
        param: 'Organic C',
        val: `${labResults.organicCarbon}%`,
        label: labResults.organicCarbon < 0.75 ? 'Low' : 'Adequate',
        color: labResults.organicCarbon < 0.75 ? 'text-emerald-800 bg-emerald-50 border-emerald-200' : 'text-emerald-700 bg-emerald-100',
        dot: 'bg-emerald-500',
      },
      {
        param: 'Nitrogen',
        val: `${labResults.availableN} kg/ha`,
        label: labResults.availableN < 280 ? 'Low' : 'Adequate',
        color: 'text-red-700 bg-red-100 border-red-300 dark:bg-red-950/60 dark:text-red-300',
        dot: 'bg-red-500',
      },
      {
        param: 'Phosphorus',
        val: `${labResults.availableP} kg/ha`,
        label: labResults.availableP < 20 ? 'Medium' : 'Optimal',
        color: 'text-orange-700 bg-orange-100 border-orange-300 dark:bg-orange-950/60 dark:text-orange-300',
        dot: 'bg-orange-500',
      },
      {
        param: 'Potassium',
        val: `${labResults.availableK} kg/ha`,
        label: labResults.availableK < 250 ? 'Medium' : 'Optimal',
        color: 'text-amber-700 bg-amber-100 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300',
        dot: 'bg-amber-500',
      },
      {
        param: 'Zinc',
        val: `${labResults.zinc} mg/kg`,
        label: labResults.zinc >= 0.6 ? 'Adequate' : 'Deficient',
        color: 'text-emerald-700 bg-emerald-100 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300',
        dot: 'bg-emerald-500',
      },
    ];
  };

  // Step 1: Save Farmer
  const handleSaveFarmer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/soil-testing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_farmer', ...farmerForm }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('✓ Farmer details saved successfully!');
        setStep(2);
      }
    } catch {
      setStep(2);
    }
  };

  // Step 2: Save Field
  const handleSaveField = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/soil-testing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_field',
          farmerId: sampleForm.farmerId,
          ...fieldForm,
        }),
      });
      showToast('✓ Field & GPS details registered!');
      setStep(3);
    } catch {
      setStep(3);
    }
  };

  // Step 3: Save Sample
  const handleSaveSample = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/soil-testing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_sample',
          id: sampleForm.sampleId,
          farmerId: sampleForm.farmerId,
          fieldId: sampleForm.fieldId,
          farmerName: farmerForm.farmerName,
          farmerPhone: farmerForm.phoneNumber,
          fieldName: fieldForm.fieldName,
          fieldArea: fieldForm.totalArea,
          fieldAreaUnit: fieldForm.areaUnit,
          sampleCollectionDate: sampleForm.collectionDate,
          samplingDepth: sampleForm.samplingDepth,
          purpose: sampleForm.purpose,
        }),
      });
      showToast('✓ Soil test sample created!');
      setStep(4);
    } catch {
      setStep(4);
    }
  };

  // Step 4: Save Lab Results
  const handleSaveLabResults = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/soil-testing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_results',
          sampleId: sampleForm.sampleId,
          labResults,
        }),
      });
      showToast('✓ Laboratory test results saved!');
      setStep(5);
    } catch {
      setStep(5);
    }
  };

  // Step 5: Save Crop Details
  const handleSaveCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/soil-testing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_crop',
          sampleId: sampleForm.sampleId,
          cropDetails,
        }),
      });
      showToast('✓ Crop cultivation details updated!');
      setStep(6);
    } catch {
      setStep(6);
    }
  };

  // Step 6: Generate Recommendation
  const handleGenerateRecommendation = async () => {
    if (!dataVerified) {
      alert('Please check the verification box before generating recommendation.');
      return;
    }
    setStep(7);
    showToast('✓ Scientific fertilizer dose calculated successfully!');
  };

  return (
    <div className="space-y-5 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header matching Layout Platform Design */}
      <div className="bg-emerald-800 text-white rounded-2xl p-4 sm:p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center border border-white/20">
            <Sprout className="w-7 h-7 text-emerald-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-wide">
                Nandair AgriTech / Ahammed Fertilizer
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-200 border border-emerald-600/40">
                Govt. Authorized Lab
              </span>
            </div>
            <p className="text-xs text-emerald-100 opacity-90 font-medium">
              Agricultural Intelligence Platform • Soil Testing & Crop Advisory
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-900/40 border border-emerald-700/50 text-xs">
            <div className="w-6 h-6 rounded-full bg-emerald-200 text-emerald-950 font-black flex items-center justify-center text-[10px]">
              DR
            </div>
            <div className="text-left">
              <div className="font-extrabold text-[11px] leading-tight">Dr. Roy / Admin</div>
              <div className="text-[9px] text-emerald-300">Soil Specialist</div>
            </div>
          </div>
        </div>
      </div>

      {/* 9-Step Progress Breadcrumb Bar */}
      <div className="bg-white dark:bg-[#0c241b] border border-gray-200 dark:border-white/10 rounded-2xl p-2.5 shadow-xs overflow-x-auto">
        <div className="flex items-center gap-1 min-w-[760px]">
          {[
            { num: 1, title: 'Farmer Details' },
            { num: 2, title: 'Register Field' },
            { num: 3, title: 'Create Sample' },
            { num: 4, title: 'Lab Results' },
            { num: 5, title: 'Crop Details' },
            { num: 6, title: 'Review & Verify' },
            { num: 7, title: 'Recommendation' },
            { num: 8, title: 'Select Format' },
            { num: 9, title: 'PDF Report' },
          ].map((st) => (
            <button
              key={st.num}
              onClick={() => {
                if (st.num === 8) {
                  setShowFormatModal(true);
                } else {
                  setStep(st.num);
                }
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                step === st.num
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : step > st.num
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                  : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 ${
                  step === st.num
                    ? 'bg-white text-emerald-800'
                    : step > st.num
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-200 dark:bg-white/10 text-gray-600'
                }`}
              >
                {step > st.num ? '✓' : st.num}
              </span>
              <span className="truncate">{st.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── SCREEN 1: FARMER DETAILS (FROM ADD FARMER DIRECTORY) ── */}
      {step === 1 && (
        <div className="bg-white dark:bg-[#0c241b] border border-gray-200 dark:border-white/10 rounded-2xl p-5 shadow-xs space-y-5">
          <div className="border-b border-gray-100 dark:border-white/10 pb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-bold text-gray-400">
                Soil Testing &gt; Farmer Details &amp; Directory
              </div>
              <h2 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2 mt-0.5">
                <User className="w-5 h-5 text-emerald-600" />
                <span>1. Farmer Details</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                All farmers registered in <strong>Add Farmer</strong> appear below. Click any farmer to view their complete details and initiate scientific soil testing.
              </p>
            </div>
          </div>

          {/* Search Bar & Clickable Farmer Directory Grid */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={farmerSearch}
                  onChange={(e) => setFarmerSearch(e.target.value)}
                  placeholder="Search farmers by name, phone (+91), or village..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-semibold text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <span className="text-xs text-gray-400 font-bold self-center">
                Total Farmers Available: {filteredFarmers.length}
              </span>
            </div>

            {/* Farmer Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto p-1">
              {filteredFarmers.length === 0 ? (
                <div className="col-span-full p-6 text-center text-xs text-gray-500 border border-dashed rounded-xl">
                  No farmers match your search query. All farmers added via the &quot;Add Farmer&quot; module will appear here automatically.
                </div>
              ) : (
                filteredFarmers.map((f) => {
                  const isSelected = f.id === selectedFarmerId || f.farmerName === farmerForm.farmerName;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => handleSelectFarmer(f)}
                      className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/60 ring-2 ring-emerald-500/30 shadow-xs'
                          : 'border-gray-200 dark:border-white/10 hover:border-emerald-300 hover:bg-gray-50 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-gray-900 dark:text-white">
                          {f.farmerName}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-1">
                            ✓ Active
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 space-y-0.5">
                        <div className="font-mono text-gray-700 dark:text-gray-300">📞 +91 {f.phoneNumber}</div>
                        <div>📍 {f.village || 'Dakshin Dinajpur'} • {f.block || 'Gangarampur'}</div>
                        {f.landArea && (
                          <div className="text-emerald-700 dark:text-emerald-300 font-bold">
                            🌱 Land: {f.landArea} {f.landUnit || 'Acre'}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Selected Farmer Full Profile View */}
          <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-br from-emerald-50/50 via-teal-50/30 to-transparent dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-transparent border-2 border-emerald-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-200/60 dark:border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                <h3 className="font-black text-sm text-emerald-950 dark:text-emerald-100">
                  Farmer Details ({farmerForm.farmerName})
                </h3>
              </div>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 border border-emerald-300">
                Synchronized with Add Farmer
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-gray-500 font-bold block uppercase">Farmer Name</span>
                <span className="font-black text-sm text-gray-900 dark:text-white">{farmerForm.farmerName}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-bold block uppercase">Mobile Number</span>
                <span className="font-bold text-gray-800 dark:text-gray-200 font-mono">+91 {farmerForm.phoneNumber}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-bold block uppercase">Father&apos;s Name</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{farmerForm.fatherName || 'Haradhan Mondal'}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-bold block uppercase">Village / Locality</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{farmerForm.village}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-bold block uppercase">Block &amp; District</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{farmerForm.block}, {farmerForm.district}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-bold block uppercase">Registered Land Area</span>
                <span className="font-black text-emerald-800 dark:text-emerald-300">
                  {fieldForm.totalArea} {fieldForm.areaUnit} ({fieldForm.fieldName})
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-bold block uppercase">Primary Crop</span>
                <span className="font-bold text-emerald-800 dark:text-emerald-300">{cropDetails.cropName}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-bold block uppercase">Active Sample Link</span>
                <span className="font-mono font-bold text-gray-700 dark:text-gray-300">{sampleForm.sampleId}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-gray-100 dark:border-white/10">
            <span className="text-xs text-gray-500">
              Ready to test soil and generate recommendations for <strong>{farmerForm.farmerName}</strong>.
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95"
              >
                <span>Proceed to Field &amp; Land Details (Step 2)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SCREEN 2: REGISTER FIELD / LAND DETAILS ── */}
      {step === 2 && (
        <div className="bg-white dark:bg-[#0c241b] border border-gray-200 dark:border-white/10 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="border-b border-gray-100 dark:border-white/10 pb-3 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-gray-400">
                Farmer Management &gt; {farmerForm.farmerName} &gt; Add Field
              </div>
              <h2 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2 mt-0.5">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <span>2. Register Field / Land Details</span>
              </h2>
            </div>
          </div>

          <form onSubmit={handleSaveField} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Field Name / Code *
                </label>
                <input
                  type="text"
                  required
                  value={fieldForm.fieldName}
                  onChange={(e) => setFieldForm({ ...fieldForm, fieldName: e.target.value })}
                  placeholder="e.g. Field-01"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-bold text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Total Area *
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={fieldForm.totalArea}
                    onChange={(e) => setFieldForm({ ...fieldForm, totalArea: parseFloat(e.target.value) })}
                    className="w-2/3 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-bold text-xs"
                  />
                  <select
                    value={fieldForm.areaUnit}
                    onChange={(e) => setFieldForm({ ...fieldForm, areaUnit: e.target.value as any })}
                    className="w-1/3 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-bold text-xs"
                  >
                    <option value="Acre">Acre</option>
                    <option value="Bigha">Bigha</option>
                    <option value="Hectare">Hectare</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Latitude (*)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={fieldForm.latitude}
                  onChange={(e) => setFieldForm({ ...fieldForm, latitude: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-mono font-bold text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Longitude (*)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.0001"
                    value={fieldForm.longitude}
                    onChange={(e) => setFieldForm({ ...fieldForm, longitude: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-mono font-bold text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFieldForm((prev) => ({ ...prev, latitude: 25.6234, longitude: 88.6742 }));
                      showToast('✓ GPS Coordinates fetched from map!');
                    }}
                    className="px-3 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shrink-0 flex items-center gap-1 shadow-xs"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Get from Map</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Land Type
                </label>
                <select
                  value={fieldForm.landType}
                  onChange={(e) => setFieldForm({ ...fieldForm, landType: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-semibold text-xs"
                >
                  <option value="Lowland">Lowland</option>
                  <option value="Medium Land">Medium Land</option>
                  <option value="Upland">Upland</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Irrigation Source
                </label>
                <select
                  value={fieldForm.irrigationSource}
                  onChange={(e) => setFieldForm({ ...fieldForm, irrigationSource: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-semibold text-xs"
                >
                  <option value="Canal / Surface">Canal / Surface</option>
                  <option value="Borewell / Tube">Borewell / Tube</option>
                  <option value="Rainfed">Rainfed</option>
                  <option value="River Lift">River Lift</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Soil Texture (if known)
                </label>
                <select
                  value={fieldForm.soilTexture}
                  onChange={(e) => setFieldForm({ ...fieldForm, soilTexture: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-semibold text-xs"
                >
                  <option value="Loam">Loam</option>
                  <option value="Clay">Clay</option>
                  <option value="Sandy">Sandy</option>
                  <option value="Silty">Silty</option>
                  <option value="Sandy Loam">Sandy Loam</option>
                  <option value="Clay Loam">Clay Loam</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-white/10">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold shadow-sm flex items-center gap-1.5"
              >
                <span>💾 Save Field</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── SCREEN 3: CREATE SOIL TEST SAMPLE ── */}
      {step === 3 && (
        <div className="bg-white dark:bg-[#0c241b] border border-gray-200 dark:border-white/10 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="border-b border-gray-100 dark:border-white/10 pb-3 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-gray-400">
                Soil Testing &gt; New Sample
              </div>
              <h2 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2 mt-0.5">
                <FlaskConical className="w-5 h-5 text-emerald-600" />
                <span>3. Create Soil Test Sample</span>
              </h2>
            </div>
          </div>

          <form onSubmit={handleSaveSample} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Farmer *
                </label>
                <div className="p-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-bold">
                  {farmerForm.farmerName} (Ph: {farmerForm.phoneNumber})
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Field *
                </label>
                <div className="p-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-bold">
                  {fieldForm.fieldName} ({fieldForm.totalArea} {fieldForm.areaUnit})
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Sample ID *
                </label>
                <input
                  type="text"
                  required
                  value={sampleForm.sampleId}
                  onChange={(e) => setSampleForm({ ...sampleForm, sampleId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-mono font-bold text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Sample Collection Date *
                </label>
                <input
                  type="date"
                  required
                  value={sampleForm.collectionDate}
                  onChange={(e) => setSampleForm({ ...sampleForm, collectionDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-bold text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Sampling Depth *
                </label>
                <select
                  value={sampleForm.samplingDepth}
                  onChange={(e) => setSampleForm({ ...sampleForm, samplingDepth: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-bold text-xs"
                >
                  <option value="0 - 15 cm">0 - 15 cm (Standard Topsoil)</option>
                  <option value="15 - 30 cm">15 - 30 cm (Subsoil)</option>
                  <option value="0 - 30 cm">0 - 30 cm (Composite)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Purpose
                </label>
                <select
                  value={sampleForm.purpose}
                  onChange={(e) => setSampleForm({ ...sampleForm, purpose: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-bold text-xs"
                >
                  <option value="Fertilizer Recommendation">Fertilizer Recommendation</option>
                  <option value="Soil Health Card">Soil Health Card</option>
                  <option value="Problem Soil Reclamation">Problem Soil Reclamation</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Field Photo (Optional)
                </label>
                <div className="flex items-center gap-4 p-3 rounded-2xl border border-dashed border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-white/5">
                  <div className="w-24 h-16 rounded-xl overflow-hidden bg-emerald-900 border border-emerald-700 flex items-center justify-center relative">
                    <img
                      src="/images/hero-agriculture-field.jpg"
                      alt="Field Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <span className="absolute bottom-1 right-1 text-[9px] bg-black/60 text-white px-1 rounded">
                      Field-01
                    </span>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => showToast('✓ Field photograph attached')}
                      className="px-3 py-1.5 rounded-xl bg-gray-200 hover:bg-gray-300 dark:bg-white/10 dark:hover:bg-white/20 text-gray-800 dark:text-gray-200 font-bold text-xs flex items-center gap-1"
                    >
                      <span>📷 Upload Photo</span>
                    </button>
                    <div className="text-[10px] text-gray-400 mt-1">
                      Geo-tagged image of Jahangirpur plot attached
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-white/10">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold shadow-sm flex items-center gap-1.5"
              >
                <span>💾 Save Sample</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── SCREEN 4: ENTER LABORATORY TEST RESULTS ── */}
      {step === 4 && (
        <div className="bg-white dark:bg-[#0c241b] border border-gray-200 dark:border-white/10 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="border-b border-gray-100 dark:border-white/10 pb-3 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-gray-400">
                Soil Testing &gt; {sampleForm.sampleId} &gt; Enter Results
              </div>
              <h2 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2 mt-0.5">
                <FlaskConical className="w-5 h-5 text-emerald-600" />
                <span>4. Enter Laboratory Test Results</span>
              </h2>
            </div>
          </div>

          <form onSubmit={handleSaveLabResults} className="space-y-5 text-xs">
            {/* Basic Parameters */}
            <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-white/5 border border-gray-200 dark:border-white/10 space-y-3">
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <span>Basic Parameters</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    pH *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={labResults.ph}
                    onChange={(e) => setLabResults({ ...labResults, ph: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 font-bold text-xs"
                  />
                  <span className="text-[10px] text-gray-400">1:2.5 Soil Water Ratio</span>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    EC (dS/m)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={labResults.ec}
                    onChange={(e) => setLabResults({ ...labResults, ec: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 font-bold text-xs"
                  />
                  <span className="text-[10px] text-gray-400">Electrical Conductivity</span>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Organic Carbon (%) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={labResults.organicCarbon}
                    onChange={(e) => setLabResults({ ...labResults, organicCarbon: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 font-bold text-xs"
                  />
                  <span className="text-[10px] text-gray-400">Walkley-Black Method</span>
                </div>
              </div>
            </div>

            {/* Available Macronutrients */}
            <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-white/5 border border-gray-200 dark:border-white/10 space-y-3">
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <span>Available Macronutrients</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Available N (kg/ha) *
                  </label>
                  <input
                    type="number"
                    required
                    value={labResults.availableN}
                    onChange={(e) => setLabResults({ ...labResults, availableN: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 font-bold text-xs"
                  />
                  <span className="text-[10px] text-red-500 font-bold">Low status (&lt; 280)</span>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Available P (kg/ha) *
                  </label>
                  <input
                    type="number"
                    required
                    value={labResults.availableP}
                    onChange={(e) => setLabResults({ ...labResults, availableP: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 font-bold text-xs"
                  />
                  <span className="text-[10px] text-orange-500 font-bold">Medium (10 - 25)</span>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Available K (kg/ha) *
                  </label>
                  <input
                    type="number"
                    required
                    value={labResults.availableK}
                    onChange={(e) => setLabResults({ ...labResults, availableK: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 font-bold text-xs"
                  />
                  <span className="text-[10px] text-amber-500 font-bold">Medium (108 - 280)</span>
                </div>
              </div>
            </div>

            {/* Micronutrients */}
            <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-white/5 border border-gray-200 dark:border-white/10 space-y-3">
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <span>Micronutrients (mg/kg)</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Zinc (Zn)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={labResults.zinc}
                    onChange={(e) => setLabResults({ ...labResults, zinc: parseFloat(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Copper (Cu)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={labResults.copper}
                    onChange={(e) => setLabResults({ ...labResults, copper: parseFloat(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Iron (Fe)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={labResults.iron}
                    onChange={(e) => setLabResults({ ...labResults, iron: parseFloat(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Boron (B)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={labResults.boron}
                    onChange={(e) => setLabResults({ ...labResults, boron: parseFloat(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Manganese (Mn)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={labResults.manganese}
                    onChange={(e) => setLabResults({ ...labResults, manganese: parseFloat(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 font-bold text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-white/10">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold shadow-sm flex items-center gap-1.5"
              >
                <span>💾 Save Results</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── SCREEN 5: SELECT CROP & CULTIVATION DETAILS ── */}
      {step === 5 && (
        <div className="bg-white dark:bg-[#0c241b] border border-gray-200 dark:border-white/10 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="border-b border-gray-100 dark:border-white/10 pb-3 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-gray-400">
                Soil Testing &gt; {sampleForm.sampleId} &gt; Crop Details
              </div>
              <h2 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2 mt-0.5">
                <Sprout className="w-5 h-5 text-emerald-600" />
                <span>5. Crop &amp; Cultivation Information</span>
              </h2>
            </div>
          </div>

          <form onSubmit={handleSaveCrop} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Crop to Cultivate *
                </label>
                <select
                  value={cropDetails.cropName}
                  onChange={(e) => setCropDetails({ ...cropDetails, cropName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-bold text-xs"
                >
                  <option value="Paddy (Rice)">Paddy (Rice)</option>
                  <option value="Wheat">Wheat</option>
                  <option value="Mustard">Mustard</option>
                  <option value="Potato">Potato</option>
                  <option value="Jute">Jute</option>
                  <option value="Maize">Maize</option>
                  <option value="Vegetables">Vegetables</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Cultivation Method *
                </label>
                <div className="flex items-center gap-4 py-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold">
                    <input
                      type="radio"
                      name="cultMethod"
                      checked={cropDetails.cultivationMethod === 'Transplanting (TPR)'}
                      onChange={() => setCropDetails({ ...cropDetails, cultivationMethod: 'Transplanting (TPR)' })}
                      className="accent-emerald-700"
                    />
                    <span>Transplanting (TPR)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-bold">
                    <input
                      type="radio"
                      name="cultMethod"
                      checked={cropDetails.cultivationMethod === 'Direct Seeded (DSR)'}
                      onChange={() => setCropDetails({ ...cropDetails, cultivationMethod: 'Direct Seeded (DSR)' })}
                      className="accent-emerald-700"
                    />
                    <span>Direct Seeded (DSR)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Variety (if known)
                </label>
                <input
                  type="text"
                  value={cropDetails.variety}
                  onChange={(e) => setCropDetails({ ...cropDetails, variety: e.target.value })}
                  placeholder="e.g. Swarna Gouri"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-bold text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Water Management
                </label>
                <select
                  value={cropDetails.waterManagement}
                  onChange={(e) => setCropDetails({ ...cropDetails, waterManagement: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-semibold text-xs"
                >
                  <option value="Flooded / Puddled">Flooded / Puddled</option>
                  <option value="Irrigated">Irrigated</option>
                  <option value="Alternate Wetting & Drying">Alternate Wetting &amp; Drying (AWD)</option>
                  <option value="Rainfed">Rainfed</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Season *
                </label>
                <select
                  value={cropDetails.season}
                  onChange={(e) => setCropDetails({ ...cropDetails, season: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-bold text-xs"
                >
                  <option value="Kharif (Monsoon)">Kharif (Monsoon)</option>
                  <option value="Rabi (Winter)">Rabi (Winter)</option>
                  <option value="Boro (Summer)">Boro (Summer)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Previous Crop
                </label>
                <input
                  type="text"
                  value={cropDetails.previousCrop}
                  onChange={(e) => setCropDetails({ ...cropDetails, previousCrop: e.target.value })}
                  placeholder="e.g. Mustard"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-semibold text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Expected Sowing / Transplanting Date
                </label>
                <input
                  type="date"
                  value={cropDetails.expectedSowingDate}
                  onChange={(e) => setCropDetails({ ...cropDetails, expectedSowingDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-bold text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Target / Expected Yield (optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={cropDetails.expectedYield}
                    onChange={(e) => setCropDetails({ ...cropDetails, expectedYield: parseFloat(e.target.value) })}
                    className="w-2/3 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-bold text-xs"
                  />
                  <div className="w-1/3 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/10 font-bold text-xs flex items-center justify-center text-gray-500">
                    quintal/acre
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-white/10">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold shadow-sm flex items-center gap-1.5"
              >
                <span>Save &amp; Continue →</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── SCREEN 6: REVIEW & GENERATE RECOMMENDATION ── */}
      {step === 6 && (
        <div className="bg-white dark:bg-[#0c241b] border border-gray-200 dark:border-white/10 rounded-2xl p-5 shadow-xs space-y-5">
          <div className="border-b border-gray-100 dark:border-white/10 pb-3 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-gray-400">
                Soil Testing &gt; {sampleForm.sampleId} &gt; Review
              </div>
              <h2 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2 mt-0.5">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span>6. Review &amp; Generate Report</span>
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left Card: Summary */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 space-y-3">
              <h3 className="font-black text-sm text-gray-900 dark:text-white border-b border-gray-200 dark:border-white/10 pb-2">
                Summary
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-200/50 dark:border-white/5">
                  <span className="text-gray-500 font-bold">Farmer:</span>
                  <span className="font-extrabold text-gray-900 dark:text-white">{farmerForm.farmerName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-200/50 dark:border-white/5">
                  <span className="text-gray-500 font-bold">Field:</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {fieldForm.fieldName} ({fieldForm.totalArea} {fieldForm.areaUnit})
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-200/50 dark:border-white/5">
                  <span className="text-gray-500 font-bold">Crop:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-300">
                    {cropDetails.cropName} ({cropDetails.variety})
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-200/50 dark:border-white/5">
                  <span className="text-gray-500 font-bold">Season:</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">{cropDetails.season}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-500 font-bold">Sample ID:</span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    {sampleForm.sampleId}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200 dark:border-white/10">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-800 dark:text-gray-200">
                  <input
                    type="checkbox"
                    checked={dataVerified}
                    onChange={(e) => setDataVerified(e.target.checked)}
                    className="w-4 h-4 accent-emerald-700 rounded"
                  />
                  <span>I have verified the entered laboratory data.</span>
                </label>
              </div>
            </div>

            {/* Right Card: Soil Status (Interpretation) */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 space-y-3">
              <h3 className="font-black text-sm text-gray-900 dark:text-white border-b border-gray-200 dark:border-white/10 pb-2">
                Soil Status (Interpretation)
              </h3>
              <div className="space-y-2.5 text-xs">
                {getInterpretation().map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-black/20 border border-gray-100 dark:border-white/5 shadow-2xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${item.dot}`} />
                      <span className="font-bold text-gray-800 dark:text-gray-200">
                        {item.param} ({item.val})
                      </span>
                    </div>
                    <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${item.color}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-white/10">
            <button
              type="button"
              onClick={() => setStep(5)}
              className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleGenerateRecommendation}
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black shadow-md flex items-center gap-2 transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>⚙️ Generate Recommendation &amp; Report</span>
            </button>
          </div>
        </div>
      )}

      {/* ── SCREEN 7: CALCULATED RECOMMENDATION (ON-SCREEN) ── */}
      {step === 7 && (
        <div className="bg-white dark:bg-[#0c241b] border border-gray-200 dark:border-white/10 rounded-2xl p-5 shadow-xs space-y-5">
          <div className="border-b border-gray-100 dark:border-white/10 pb-3 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-gray-400">
                Soil Testing &gt; {sampleForm.sampleId} &gt; Recommendations
              </div>
              <h2 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2 mt-0.5">
                <Sprout className="w-5 h-5 text-emerald-600" />
                <span>7. Fertilizer Recommendation — {cropDetails.cropName}</span>
              </h2>
            </div>
            <button
              onClick={() => setShowFormatModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black shadow-sm flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4" />
              <span>Generate PDF / Print</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nutrient Requirement Card */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 space-y-3">
              <h3 className="text-xs font-black text-emerald-950 dark:text-emerald-100 uppercase tracking-wider">
                Nutrient Requirement (per Acre)
              </h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 rounded-xl bg-white dark:bg-black/20 border border-emerald-100 dark:border-white/5">
                  <div className="text-[11px] font-bold text-gray-500">Nitrogen (N)</div>
                  <div className="text-xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
                    {recommendation.nutrientPerAcre.nitrogenKg}
                  </div>
                  <div className="text-[10px] text-gray-400">kg/acre</div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-black/20 border border-emerald-100 dark:border-white/5">
                  <div className="text-[11px] font-bold text-gray-500">Phosphorus (P₂O₅)</div>
                  <div className="text-xl font-black text-orange-600 dark:text-orange-300 mt-1">
                    {recommendation.nutrientPerAcre.phosphorusKg}
                  </div>
                  <div className="text-[10px] text-gray-400">kg/acre</div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-black/20 border border-emerald-100 dark:border-white/5">
                  <div className="text-[11px] font-bold text-gray-500">Potassium (K₂O)</div>
                  <div className="text-xl font-black text-amber-600 dark:text-amber-300 mt-1">
                    {recommendation.nutrientPerAcre.potassiumKg}
                  </div>
                  <div className="text-[10px] text-gray-400">kg/acre</div>
                </div>
              </div>
            </div>

            {/* Fertilizer Product Recommendation Card */}
            <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/40 space-y-3">
              <h3 className="text-xs font-black text-teal-950 dark:text-teal-100 uppercase tracking-wider">
                Fertilizer Product Recommendation (per Acre)
              </h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 rounded-xl bg-white dark:bg-black/20 border border-teal-100 dark:border-white/5">
                  <div className="text-[11px] font-bold text-gray-500">Urea (46% N)</div>
                  <div className="text-xl font-black text-emerald-800 dark:text-emerald-300 mt-1">
                    {recommendation.fertilizerPerAcre.ureaKg}
                  </div>
                  <div className="text-[10px] text-gray-400">kg</div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-black/20 border border-teal-100 dark:border-white/5">
                  <div className="text-[11px] font-bold text-gray-500">SSP (16% P₂O₅)</div>
                  <div className="text-xl font-black text-teal-800 dark:text-teal-300 mt-1">
                    {recommendation.fertilizerPerAcre.sspKg}
                  </div>
                  <div className="text-[10px] text-gray-400">kg</div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-black/20 border border-teal-100 dark:border-white/5">
                  <div className="text-[11px] font-bold text-gray-500">MOP (60% K₂O)</div>
                  <div className="text-xl font-black text-amber-700 dark:text-amber-300 mt-1">
                    {recommendation.fertilizerPerAcre.mopKg}
                  </div>
                  <div className="text-[10px] text-gray-400">kg</div>
                </div>
              </div>
            </div>
          </div>

          {/* Application Schedule */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 space-y-3">
            <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">
              Application Schedule
            </h3>
            <div className="space-y-2 text-xs">
              {recommendation.applicationSchedule.map((sched, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-white dark:bg-black/20 border border-gray-200/70 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-0.5">
                    <div className="font-black text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                      <span>{sched.stage}</span>
                    </div>
                    <div className="text-[11px] text-gray-500 pl-3.5">{sched.description}</div>
                  </div>
                  <div className="text-xs font-extrabold text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10 px-3 py-1.5 rounded-lg shrink-0 self-start sm:self-auto font-mono">
                    {sched.products}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setStep(6)}
              className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold flex items-center gap-1 text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Review</span>
            </button>
            <button
              type="button"
              onClick={() => setShowFormatModal(true)}
              className="px-6 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs shadow-md flex items-center gap-1.5"
            >
              <span>Select Format &amp; Print Report →</span>
            </button>
          </div>
        </div>
      )}

      {/* ── SCREEN 8: MODAL SELECT REPORT LANGUAGE & FORMAT ── */}
      {showFormatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0c241b] border border-gray-200 dark:border-white/10 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-base text-gray-900 dark:text-white">
                  Generate Report
                </h3>
              </div>
              <button
                onClick={() => setShowFormatModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-black text-gray-700 dark:text-gray-300 mb-1.5">
                  Report Language
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label
                    className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer font-bold transition-all ${
                      reportLang === 'bn'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                        : 'border-gray-200 dark:border-white/10 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="repLang"
                      checked={reportLang === 'bn'}
                      onChange={() => setReportLang('bn')}
                      className="accent-emerald-700"
                    />
                    <span>Bengali (বাংলা)</span>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer font-bold transition-all ${
                      reportLang === 'en'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                        : 'border-gray-200 dark:border-white/10 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="repLang"
                      checked={reportLang === 'en'}
                      onChange={() => setReportLang('en')}
                      className="accent-emerald-700"
                    />
                    <span>English</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-black text-gray-700 dark:text-gray-300 mb-1.5">
                  Report Format
                </label>
                <div className="space-y-2">
                  <label
                    className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer font-bold transition-all ${
                      reportFormat === 'detailed'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                        : 'border-gray-200 dark:border-white/10 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="repFormat"
                      checked={reportFormat === 'detailed'}
                      onChange={() => setReportFormat('detailed')}
                      className="accent-emerald-700"
                    />
                    <div>
                      <div>Detailed Report (2-3 pages)</div>
                      <div className="text-[10px] font-normal text-gray-500">
                        Includes full chemical breakdown, graphs &amp; application schedule
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer font-bold transition-all ${
                      reportFormat === 'short'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                        : 'border-gray-200 dark:border-white/10 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="repFormat"
                      checked={reportFormat === 'short'}
                      onChange={() => setReportFormat('short')}
                      className="accent-emerald-700"
                    />
                    <div>
                      <div>Short Advisory (1 page)</div>
                      <div className="text-[10px] font-normal text-gray-500">
                        Quick reference sheet for immediate shop counter distribution
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40">
                <div className="w-10 h-10 rounded-lg bg-red-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  PDF
                </div>
                <div className="text-[11px] text-gray-600 dark:text-gray-300">
                  Ready to compile high-resolution printable advisory card with QR code verification.
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFormatModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowFormatModal(false);
                    setStep(9);
                  }}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black shadow-md flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Generate PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SCREEN 9: FINAL FARMER REPORT (PDF PREVIEW) ── */}
      {step === 9 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white dark:bg-[#0c241b] rounded-2xl border border-gray-200 dark:border-white/10 shadow-xs print:hidden">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-gray-800 dark:text-gray-200">
                Final Farmer Report (PDF Preview &amp; Print Ready)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                {reportLang === 'bn' ? 'বাংলা' : 'English'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setReportLang(reportLang === 'bn' ? 'en' : 'bn')}
                className="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 dark:border-white/10 dark:hover:bg-white/10 text-xs font-bold"
              >
                🌐 Switch to {reportLang === 'bn' ? 'English' : 'বাংলা'}
              </button>
              <button
                type="button"
                onClick={() => setStep(7)}
                className="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs font-bold"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black shadow-sm flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save as PDF</span>
              </button>
            </div>
          </div>

          {/* Printable Sheet (styled for clean A4 printing) */}
          <div className="bg-white text-gray-900 p-6 sm:p-8 rounded-3xl border border-gray-300 shadow-xl max-w-4xl mx-auto print:border-none print:shadow-none print:p-0">
            {/* Report Header */}
            <div className="border-b-2 border-emerald-800 pb-4 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-black">
                  <Sprout className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-emerald-950 tracking-tight">
                    Nandair AgriTech / Ahammed Fertilizer
                  </h1>
                  <p className="text-xs font-bold text-gray-600">
                    {reportLang === 'bn'
                      ? 'মাটি পরীক্ষা ও ফসল পরামর্শ প্রতিবেদন'
                      : 'Soil Health & Crop Advisory Report'}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    Dakshin Dinajpur, West Bengal • Govt. Authorized Soil Testing Laboratory
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-mono font-bold text-emerald-900">
                  ID: {sampleForm.sampleId}
                </div>
                <div className="text-[10px] text-gray-500 font-bold">
                  Date: {sampleForm.collectionDate}
                </div>
                <div className="inline-block mt-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[10px] font-black">
                  ✓ Certified Analysis
                </div>
              </div>
            </div>

            {/* Section 1: Farmer Details */}
            <div className="mb-4">
              <h2 className="text-xs font-black uppercase text-emerald-900 bg-emerald-50 px-2 py-1 rounded border-l-4 border-emerald-800 mb-2">
                {reportLang === 'bn' ? '১. কৃষকের তথ্য (Farmer Details)' : '1. Farmer & Field Details'}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-gray-500 text-[10px] block">
                    {reportLang === 'bn' ? 'কৃষকের নাম:' : 'Farmer Name:'}
                  </span>
                  <span className="font-extrabold">{farmerForm.farmerName}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block">
                    {reportLang === 'bn' ? 'মোবাইল নম্বর:' : 'Phone Number:'}
                  </span>
                  <span className="font-bold">+91 {farmerForm.phoneNumber}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block">
                    {reportLang === 'bn' ? 'গ্রাম / ব্লক:' : 'Village / Block:'}
                  </span>
                  <span className="font-semibold">
                    {farmerForm.village}, {farmerForm.block}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block">
                    {reportLang === 'bn' ? 'জমির পরিমাণ:' : 'Land Area:'}
                  </span>
                  <span className="font-bold text-emerald-900">
                    {fieldForm.totalArea} {fieldForm.areaUnit} ({fieldForm.fieldName})
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block">
                    {reportLang === 'bn' ? 'জিপিএস অবস্থান:' : 'GPS Coordinates:'}
                  </span>
                  <span className="font-mono text-[11px]">
                    {fieldForm.latitude}° N, {fieldForm.longitude}° E
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block">
                    {reportLang === 'bn' ? 'উদ্দিষ্ট ফসল:' : 'Target Crop:'}
                  </span>
                  <span className="font-bold text-emerald-900">
                    {cropDetails.cropName} ({cropDetails.variety})
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block">
                    {reportLang === 'bn' ? 'চাষের মরশুম:' : 'Season:'}
                  </span>
                  <span className="font-semibold">{cropDetails.season}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block">
                    {reportLang === 'bn' ? 'পূর্ববর্তী ফসল:' : 'Previous Crop:'}
                  </span>
                  <span className="font-semibold">{cropDetails.previousCrop}</span>
                </div>
              </div>
            </div>

            {/* Section 2: Soil Test Results Table */}
            <div className="mb-4">
              <h2 className="text-xs font-black uppercase text-emerald-900 bg-emerald-50 px-2 py-1 rounded border-l-4 border-emerald-800 mb-2">
                {reportLang === 'bn'
                  ? '২. মাটি পরীক্ষার ফলাফল (Soil Test Results)'
                  : '2. Laboratory Soil Test Results'}
              </h2>
              <table className="w-full text-xs text-left border border-gray-200">
                <thead className="bg-emerald-900 text-white font-bold text-[11px]">
                  <tr>
                    <th className="p-2 border border-emerald-800">
                      {reportLang === 'bn' ? 'পরামিতি (Parameter)' : 'Parameter'}
                    </th>
                    <th className="p-2 border border-emerald-800 text-center">
                      {reportLang === 'bn' ? 'ফলাফল (Result)' : 'Result'}
                    </th>
                    <th className="p-2 border border-emerald-800 text-center">
                      {reportLang === 'bn' ? 'আদর্শ মান (Ideal)' : 'Optimal Range'}
                    </th>
                    <th className="p-2 border border-emerald-800 text-center">
                      {reportLang === 'bn' ? 'ব্যাখ্যা (Interpretation)' : 'Interpretation'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="p-2 font-bold">pH (1:2.5)</td>
                    <td className="p-2 text-center font-bold">{labResults.ph}</td>
                    <td className="p-2 text-center text-gray-500">6.5 - 7.5</td>
                    <td className="p-2 text-center font-bold text-emerald-800">
                      {reportLang === 'bn' ? 'সামান্য অম্লীয় (ভালো)' : 'Slightly Acidic (Good)'}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold">
                      {reportLang === 'bn' ? 'জৈব কার্বন (Organic Carbon)' : 'Organic Carbon (OC)'}
                    </td>
                    <td className="p-2 text-center font-bold">{labResults.organicCarbon}%</td>
                    <td className="p-2 text-center text-gray-500">&gt; 0.75%</td>
                    <td className="p-2 text-center font-bold text-amber-700">
                      {reportLang === 'bn' ? 'কম (Low)' : 'Low'}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold">
                      {reportLang === 'bn' ? 'উপলব্ধ নাইট্রোজেন (Available N)' : 'Available Nitrogen (N)'}
                    </td>
                    <td className="p-2 text-center font-bold">{labResults.availableN} kg/ha</td>
                    <td className="p-2 text-center text-gray-500">280 - 560 kg/ha</td>
                    <td className="p-2 text-center font-bold text-red-600">
                      {reportLang === 'bn' ? 'কম (Deficient)' : 'Low'}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold">
                      {reportLang === 'bn' ? 'উপলব্ধ ফসফরাস (Available P)' : 'Available Phosphorus (P₂O₅)'}
                    </td>
                    <td className="p-2 text-center font-bold">{labResults.availableP} kg/ha</td>
                    <td className="p-2 text-center text-gray-500">10 - 25 kg/ha</td>
                    <td className="p-2 text-center font-bold text-orange-600">
                      {reportLang === 'bn' ? 'মাঝারি (Medium)' : 'Medium'}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold">
                      {reportLang === 'bn' ? 'উপলব্ধ পটাশিয়াম (Available K)' : 'Available Potassium (K₂O)'}
                    </td>
                    <td className="p-2 text-center font-bold">{labResults.availableK} kg/ha</td>
                    <td className="p-2 text-center text-gray-500">108 - 280 kg/ha</td>
                    <td className="p-2 text-center font-bold text-amber-600">
                      {reportLang === 'bn' ? 'মাঝারি (Medium)' : 'Medium'}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold">
                      {reportLang === 'bn' ? 'জিঙ্ক (Available Zinc)' : 'Available Zinc (Zn)'}
                    </td>
                    <td className="p-2 text-center font-bold">{labResults.zinc} mg/kg</td>
                    <td className="p-2 text-center text-gray-500">&gt; 0.60 mg/kg</td>
                    <td className="p-2 text-center font-bold text-emerald-700">
                      {reportLang === 'bn' ? 'পর্যাপ্ত (Adequate)' : 'Adequate'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Section 3: Fertilizer Product Recommendation Table */}
            <div className="mb-4">
              <h2 className="text-xs font-black uppercase text-emerald-900 bg-emerald-50 px-2 py-1 rounded border-l-4 border-emerald-800 mb-2">
                {reportLang === 'bn'
                  ? `৩. সার ব্যবহারের সুপারিশ — ${cropDetails.cropName}`
                  : `3. Fertilizer Recommendation for ${cropDetails.cropName}`}
              </h2>
              <table className="w-full text-xs text-left border border-gray-200">
                <thead className="bg-gray-100 font-bold text-[11px]">
                  <tr>
                    <th className="p-2 border">
                      {reportLang === 'bn' ? 'পুষ্টি উপাদান' : 'Nutrient'}
                    </th>
                    <th className="p-2 border text-center">
                      {reportLang === 'bn' ? 'প্রয়োজন (kg/একর)' : 'Requirement (kg/acre)'}
                    </th>
                    <th className="p-2 border">
                      {reportLang === 'bn' ? 'প্রস্তাবিত সার (Fertilizer)' : 'Commercial Fertilizer'}
                    </th>
                    <th className="p-2 border text-right">
                      {reportLang === 'bn' ? 'মোট পরিমাণ (kg/একর)' : 'Quantity per Acre'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-semibold">
                  <tr>
                    <td className="p-2">Nitrogen (N)</td>
                    <td className="p-2 text-center font-bold text-emerald-800">
                      {recommendation.nutrientPerAcre.nitrogenKg}
                    </td>
                    <td className="p-2 font-bold">Urea (46% N)</td>
                    <td className="p-2 text-right font-black text-emerald-950">
                      {recommendation.fertilizerPerAcre.ureaKg} kg
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2">Phosphorus (P₂O₅)</td>
                    <td className="p-2 text-center font-bold text-orange-700">
                      {recommendation.nutrientPerAcre.phosphorusKg}
                    </td>
                    <td className="p-2 font-bold">SSP (16% P₂O₅)</td>
                    <td className="p-2 text-right font-black text-emerald-950">
                      {recommendation.fertilizerPerAcre.sspKg} kg
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2">Potassium (K₂O)</td>
                    <td className="p-2 text-center font-bold text-amber-700">
                      {recommendation.nutrientPerAcre.potassiumKg}
                    </td>
                    <td className="p-2 font-bold">MOP (60% K₂O)</td>
                    <td className="p-2 text-right font-black text-emerald-950">
                      {recommendation.fertilizerPerAcre.mopKg} kg
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Section 4: Application Schedule */}
            <div className="mb-4">
              <h2 className="text-xs font-black uppercase text-emerald-900 bg-emerald-50 px-2 py-1 rounded border-l-4 border-emerald-800 mb-2">
                {reportLang === 'bn'
                  ? '৪. সার প্রয়োগের সময়সূচী (Application Schedule)'
                  : '4. Fertilizer Application Schedule'}
              </h2>
              <div className="space-y-1.5 text-xs">
                {recommendation.applicationSchedule.map((sched, idx) => (
                  <div key={idx} className="p-2 rounded bg-gray-50 border border-gray-100 flex justify-between items-center">
                    <div>
                      <span className="font-extrabold text-emerald-950 mr-2">• {sched.stage}:</span>
                      <span className="text-gray-600 text-[11px]">{sched.description}</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-900 text-xs shrink-0">
                      {sched.products}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 5: Additional Advisory */}
            <div className="mb-6">
              <h2 className="text-xs font-black uppercase text-emerald-900 bg-emerald-50 px-2 py-1 rounded border-l-4 border-emerald-800 mb-2">
                {reportLang === 'bn'
                  ? '৫. অতিরিক্ত পরামর্শ (Additional Advisory)'
                  : '5. Additional Advisory & Farm Practices'}
              </h2>
              <ul className="list-disc list-inside space-y-1 text-xs text-gray-700">
                {(reportLang === 'bn'
                  ? recommendation.additionalAdvisoryBn
                  : recommendation.additionalAdvisoryEn
                ).map((adv, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {adv}
                  </li>
                ))}
              </ul>
            </div>

            {/* Signature & Seal Footer */}
            <div className="pt-6 border-t border-gray-200 flex items-end justify-between text-xs text-gray-500">
              <div>
                <p className="font-bold text-gray-800">Ahammed Fertilizer Laboratory Desk</p>
                <p className="text-[10px]">Authorised by State Agronomy Protocol</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full border-2 border-emerald-800 flex items-center justify-center mx-auto text-[9px] font-black text-emerald-900 leading-tight">
                  SEAL &amp;<br />VERIFIED
                </div>
              </div>

              <div className="text-right">
                <div className="border-b border-gray-400 w-36 mb-1" />
                <p className="font-extrabold text-gray-900">Dr. Roy (Agronomist)</p>
                <p className="text-[10px]">Head, Soil Testing Unit</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
