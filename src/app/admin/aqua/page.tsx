'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Fish,
  Users,
  Waves,
  PlayCircle,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Plus,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  ExternalLink,
  FlaskConical,
  Microscope,
  Stethoscope,
  Pill,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { AquaFarmer, AquaPond, AquaProductionCycle } from '@/types/aqua';

export default function AdminAquaDashboardPage() {
  const [activeTab, setActiveTab] = useState<'farmers' | 'water' | 'problems' | 'treatment'>('farmers');
  const [metrics, setMetrics] = useState<any>(null);
  const [farmers, setFarmers] = useState<AquaFarmer[]>([]);
  const [ponds, setPonds] = useState<AquaPond[]>([]);
  const [cycles, setCycles] = useState<AquaProductionCycle[]>([]);
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab 2: Water Quality state
  const [waterRecords, setWaterRecords] = useState<any[]>([]);
  const [showWaterModal, setShowWaterModal] = useState(false);
  const [waterData, setWaterData] = useState({
    farmerId: '',
    pondId: '',
    readingDate: new Date().toISOString().split('T')[0],
    phLevel: 7.8,
    dissolvedOxygenPpm: 5.6,
    waterTempC: 28,
    ammoniaPpm: 0.02,
    nitritePpm: 0.01,
    alkalinityPpm: 120,
    waterTransparencyCm: 35,
    observationNotes: 'নিয়মিত ল্যাব পরিদর্শন ও গুণমান পরীক্ষা সম্পন্ন। প্যারামিটার স্বাভাবিক।',
  });

  // Tab 3: Problems & Diseases state
  const [problemRecords, setProblemRecords] = useState<any[]>([]);
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [problemData, setProblemData] = useState({
    farmerId: '',
    pondId: '',
    reportDate: new Date().toISOString().split('T')[0],
    problemCategory: 'water_quality',
    severity: 'moderate',
    affectedSpeciesId: 'spec-rohu',
    symptomDescription: '',
  });

  // Tab 4: Treatment & Care state
  const [treatmentRecords, setTreatmentRecords] = useState<any[]>([]);
  const [showTreatmentModal, setShowTreatmentModal] = useState(false);
  const [treatmentData, setTreatmentData] = useState({
    farmerId: '',
    pondId: '',
    treatmentDate: new Date().toISOString().split('T')[0],
    prescribedBy: 'আহাম্মেদ ফার্টিলাইজার মৎস্য বিশেষজ্ঞ',
    medicineOrChemicalName: 'চুন (Quicklime / কলিচুন)',
    dosage: 'প্রতি শতকে ২৫০ গ্রাম',
    applicationMethod: 'জলে গুলে পুকুরে সমভাবে ছিটানো',
    targetCondition: 'পানির পিএইচ নিয়ন্ত্রণ ও তলার গ্যাস শোধন',
    notes: 'সকালে রোদ উঠলে প্রয়োগ করুন। প্রয়োগের সময় মাছকে খাদ্য দেওয়া বন্ধ রাখুন।',
  });

  // Filters
  const [selectedBlock, setSelectedBlock] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Details Modal & Verification State
  const [detailsFarmer, setDetailsFarmer] = useState<AquaFarmer | null>(null);
  const [verifyMsg, setVerifyMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Register Modal state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regData, setRegData] = useState({
    fullName: '',
    mobileNumber: '',
    pin: '1234',
    districtId: 'dist-dd',
    blockId: 'blk-balurghat',
    villageId: 'vil-nandair',
    address: '',
    experienceYears: '3',
    pondCount: '1',
    totalWaterAreaDecimal: '50',
    consentDataCollection: true,
    consentDataSharing: true,
    consentPhotoUse: false,
  });
  const [regLoading, setRegLoading] = useState(false);
  const [regMsg, setRegMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchDashboardData = () => {
    setLoading(true);
    let url = '/api/admin/aqua/dashboard';
    const params = new URLSearchParams();
    if (selectedBlock) params.set('blockId', selectedBlock);
    if (statusFilter) params.set('verificationStatus', statusFilter);
    if (params.toString()) url += `?${params.toString()}`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.success) {
          setMetrics(data.metrics);
          setFarmers(data.farmers || []);
          setPonds(data.ponds || []);
          setCycles(data.cycles || []);
          setDuplicates(data.duplicates || []);
          if (data.farmers && data.farmers.length > 0) {
            if (!waterData.farmerId) setWaterData((p) => ({ ...p, farmerId: data.farmers[0].id }));
            if (!problemData.farmerId) setProblemData((p) => ({ ...p, farmerId: data.farmers[0].id }));
            if (!treatmentData.farmerId) setTreatmentData((p) => ({ ...p, farmerId: data.farmers[0].id }));
          }
        }
      })
      .finally(() => setLoading(false));
  };

  const fetchWaterQuality = () => {
    fetch('/api/admin/aqua/water-quality')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.success) setWaterRecords(data.records || []);
      })
      .catch(console.error);
  };

  const fetchProblems = () => {
    fetch('/api/admin/aqua/problems')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.success) setProblemRecords(data.records || []);
      })
      .catch(console.error);
  };

  const fetchTreatments = () => {
    fetch('/api/admin/aqua/treatment')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.success) setTreatmentRecords(data.records || []);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchDashboardData();
    fetchWaterQuality();
    fetchProblems();
    fetchTreatments();
  }, [selectedBlock, statusFilter]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    setRegMsg(null);

    try {
      const res = await fetch('/api/admin/aqua/farmers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regData),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to register farmer');
      }

      setRegMsg({
        type: 'success',
        text: `চাষী সফলভাবে নিবন্ধিত হয়েছে! নিবন্ধন নম্বর: ${data.farmer.registrationNumber}`,
      });
      setTimeout(() => {
        setShowRegisterModal(false);
        setRegMsg(null);
        fetchDashboardData();
      }, 1200);
    } catch (err: any) {
      setRegMsg({ type: 'error', text: err.message });
    } finally {
      setRegLoading(false);
    }
  };

  const handleVerify = async (type: 'farmer' | 'pond' | 'stocking', id: string, status: 'verified' | 'rejected') => {
    try {
      const res = await fetch('/api/admin/aqua/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id, status, rejectionReason: status === 'rejected' ? 'তথ্য অসম্পূর্ণ বা অনুপযুক্ত' : '' }),
      });
      if (res.ok) {
        setVerifyMsg({
          type: 'success',
          text: status === 'verified' ? '✓ চাষী সফলভাবে অনুমোদিত হয়েছে! এখন তিনি সিস্টেমে লগইন করতে পারবেন।' : '✕ আবেদনটি বাতিল করা হয়েছে।',
        });
        if (detailsFarmer && detailsFarmer.id === id) {
          setDetailsFarmer({ ...detailsFarmer, verificationStatus: status });
        }
        fetchDashboardData();
        setTimeout(() => setVerifyMsg(null), 4000);
      }
    } catch {
      setVerifyMsg({ type: 'error', text: 'যাচাইকরণ ব্যর্থ হয়েছে।' });
    }
  };

  // Add Water Quality Handler
  const handleSaveWaterQuality = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/aqua/water-quality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(waterData),
      });
      const data = await res.json();
      if (data.success) {
        setVerifyMsg({ type: 'success', text: '✓ পানির গুণমান টেস্ট ফলাফল সফলভাবে সেভ করা হয়েছে এবং চাষী দেখতে পাবেন।' });
        setShowWaterModal(false);
        fetchWaterQuality();
      } else {
        alert(data.error || 'ত্রুটি ঘটেছে');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Add Problem Report Handler
  const handleSaveProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/aqua/problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(problemData),
      });
      const data = await res.json();
      if (data.success) {
        setVerifyMsg({ type: 'success', text: '✓ রোগ বা সমস্যা নির্ণয় সফলভাবে নথিভুক্ত হয়েছে এবং চাষীর পোর্টালে দৃশ্যমান।' });
        setShowProblemModal(false);
        setProblemData((p) => ({ ...p, symptomDescription: '' }));
        fetchProblems();
      } else {
        alert(data.error || 'ত্রুটি ঘটেছে');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Add Treatment Prescription Handler
  const handleSaveTreatment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/aqua/treatment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(treatmentData),
      });
      const data = await res.json();
      if (data.success) {
        setVerifyMsg({ type: 'success', text: '✓ প্রেসক্রিপশন ও চিকিৎসার নির্দেশিকা সফলভাবে জারি করা হয়েছে এবং চাষী দেখতে পাবেন।' });
        setShowTreatmentModal(false);
        fetchTreatments();
      } else {
        alert(data.error || 'ত্রুটি ঘটেছে');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredFarmers = farmers.filter((f) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      f.fullName.toLowerCase().includes(q) ||
      f.mobileNumber.includes(q) ||
      f.registrationNumber.toLowerCase().includes(q)
    );
  });

  const pendingFarmers = farmers.filter((f) => f.verificationStatus === 'pending');

  return (
    <div className="space-y-5 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#0c241b] border border-gray-200 dark:border-white/10 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
            <Fish className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-emerald-950 dark:text-emerald-100">
                মৎস্য চাষ প্ল্যাটফর্ম (Aquaculture Hub)
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Admin Specialist Desk
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              দক্ষিণ দিনাজপুরের নিবন্ধিত মাছ চাষী, পুকুর, পানির গুণমান ল্যাব, রোগ নির্ণয় ও চিকিৎসা ব্যবস্থাপনা
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'farmers' && (
            <button
              onClick={() => setShowRegisterModal(true)}
              type="button"
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ চাষী নিবন্ধন করুন</span>
            </button>
          )}
          {activeTab === 'water' && (
            <button
              onClick={() => setShowWaterModal(true)}
              type="button"
              className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ নতুন পানির গুণমান টেস্ট</span>
            </button>
          )}
          {activeTab === 'problems' && (
            <button
              onClick={() => setShowProblemModal(true)}
              type="button"
              className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ নতুন রোগ বা সমস্যা নির্ণয়</span>
            </button>
          )}
          {activeTab === 'treatment' && (
            <button
              onClick={() => setShowTreatmentModal(true)}
              type="button"
              className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ নতুন চিকিৎসা ও প্রেসক্রিপশন</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-[#0c241b] border border-gray-200 dark:border-white/10 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">মোট চাষী</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-950 dark:text-emerald-50">
              {metrics?.totalFarmers || 0}
            </span>
            <span className="text-xs text-gray-400">জন</span>
          </div>
          <div className="flex items-center gap-2 mt-2 text-[11px]">
            <span className="text-emerald-600 font-bold">
              ✓ {metrics?.verifiedFarmers || 0} যাচাইকৃত
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-amber-600 font-bold">
              ⏳ {metrics?.pendingFarmers || 0} অপেক্ষমান
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0c241b] border border-gray-200 dark:border-white/10 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">পুকুরের সংখ্যা</span>
            <Waves className="w-4 h-4 text-teal-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-teal-950 dark:text-teal-50">
              {metrics?.totalPonds || 0}
            </span>
            <span className="text-xs text-gray-400">টি পুকুর</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-2">
            দক্ষিণ দিনাজপুরের ৮টি ব্লকে তালিকাভুক্ত
          </p>
        </div>

        <div className="bg-white dark:bg-[#0c241b] border border-gray-200 dark:border-white/10 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">পানির ল্যাব টেস্ট</span>
            <FlaskConical className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-cyan-950 dark:text-cyan-50">
              {waterRecords.length}
            </span>
            <span className="text-xs text-gray-400">টি টেস্ট</span>
          </div>
          <p className="text-[11px] text-cyan-600 font-bold mt-2">
            বিশেষজ্ঞ অনুমোদিত ল্যাব রেজাল্ট
          </p>
        </div>

        <div className="bg-white dark:bg-[#0c241b] border border-gray-200 dark:border-white/10 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">চিকিৎসা প্রেসক্রিপশন</span>
            <Stethoscope className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-950 dark:text-amber-50">
              {treatmentRecords.length}
            </span>
            <span className="text-xs text-gray-400">টি প্রেসক্রিপশন</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-2">
            রোগ নির্ণয়: {problemRecords.length} টি নথিবদ্ধ
          </p>
        </div>
      </div>

      {/* Verification Notification Toast/Banner */}
      {verifyMsg && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between shadow-md transition-all ${
            verifyMsg.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>{verifyMsg.text}</span>
          </div>
          <button
            onClick={() => setVerifyMsg(null)}
            className="text-white/80 hover:text-white text-xs underline"
          >
            বন্ধ করুন
          </button>
        </div>
      )}

      {/* Main Feature Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-gray-100 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10">
        <button
          onClick={() => setActiveTab('farmers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition-all ${
            activeTab === 'farmers'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-white/10'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>👨‍🌾 চাষী ও পুকুর (Farmers & Ponds)</span>
          {pendingFarmers.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-amber-950 font-bold ml-1">
              {pendingFarmers.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('water')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition-all ${
            activeTab === 'water'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-white/10'
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          <span>🧪 পানির গুণমান ল্যাব (Water Quality Lab)</span>
          <span className="text-[10px] opacity-75">({waterRecords.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('problems')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition-all ${
            activeTab === 'problems'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-white/10'
          }`}
        >
          <Microscope className="w-4 h-4" />
          <span>🔬 রোগ ও সমস্যা নির্ণয় (Disease Diagnosis)</span>
          <span className="text-[10px] opacity-75">({problemRecords.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('treatment')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition-all ${
            activeTab === 'treatment'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-white/10'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>💊 চিকিৎসা ও কেয়ার (Treatment & Care)</span>
          <span className="text-[10px] opacity-75">({treatmentRecords.length})</span>
        </button>
      </div>

      {/* ── TAB 1: FARMERS & PONDS ── */}
      {activeTab === 'farmers' && (
        <div className="space-y-4">
          {/* Duplicate Alert Banner if any */}
          {duplicates.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-extrabold text-sm block">
                  সতর্কতা: ডুপ্লিকেট চাষী পর্যালোচনা পাওয়া গেছে ({duplicates.length} টি)
                </span>
                <p className="text-[11px] mt-0.5 opacity-90">
                  একই গ্রামে বা ব্লকে কাছাকাছি নামে একাধিক চাষী নিবন্ধন সনাক্ত হয়েছে। তথ্য যাচাই করে অনুমোদন করুন।
                </p>
              </div>
            </div>
          )}

          {/* Filters & Search Toolbar */}
          <div className="bg-white dark:bg-[#0c241b] border border-gray-200 dark:border-white/10 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="চাষীর নাম বা মোবাইল..."
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-semibold text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <select
                value={selectedBlock}
                onChange={(e) => setSelectedBlock(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-semibold text-xs"
              >
                <option value="">সকল ব্লক (All Blocks)</option>
                <option value="blk-balurghat">বালুরঘাট (Balurghat)</option>
                <option value="blk-hili">হিলি (Hili)</option>
                <option value="blk-kumarganj">কুমারগঞ্জ (Kumarganj)</option>
                <option value="blk-gangarampur">গঙ্গারামপুর (Gangarampur)</option>
                <option value="blk-banshihari">বংশীহারী (Banshihari)</option>
                <option value="blk-tapan">তপন (Tapan)</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-semibold text-xs"
              >
                <option value="">সকল স্ট্যাটাস</option>
                <option value="verified">যাচাইকৃত (Verified)</option>
                <option value="pending">পর্যালোচনাধীন (Pending)</option>
              </select>
            </div>

            <div className="text-xs text-gray-400 font-semibold">
              মোট দেখানো হচ্ছে: {filteredFarmers.length} জন
            </div>
          </div>

          {/* Pending Registrations Attention Banner */}
          {pendingFarmers.length > 0 && (
            <div className="bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-transparent border-2 border-amber-500/40 rounded-2xl p-4 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <span className="font-extrabold text-sm text-amber-900 dark:text-amber-200 block">
                    অনুমোদনের জন্য নতুন মৎস্য চাষী অপেক্ষমান ({pendingFarmers.length} জন)
                  </span>
                  <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80 mt-0.5">
                    চাষীরা পোর্টাল থেকে নিবন্ধন করেছেন। তাদের পুকুর ও জলকরের বিবরণ দেখে অনুমোদন (Approve) করুন যাতে তারা পাসওয়ার্ড দিয়ে সিস্টেমে লগইন করতে পারে।
                  </p>
                </div>
              </div>
              <button
                onClick={() => setStatusFilter('pending')}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 shadow-xs"
              >
                অপেক্ষমান তালিকা দেখুন
              </button>
            </div>
          )}

          {/* Main Table: Registered Farmers */}
          <div className="bg-white dark:bg-[#0c241b] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-emerald-950 dark:text-emerald-100">
                নিবন্ধিত মৎস্য চাষী তালিকা (Registered Farmers)
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 border-b border-gray-100 dark:border-white/10 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3">নিবন্ধন নম্বর</th>
                    <th className="p-3">চাষীর নাম</th>
                    <th className="p-3">মোবাইল নম্বর</th>
                    <th className="p-3">গ্রাম / ব্লক</th>
                    <th className="p-3 text-center">পুকুর</th>
                    <th className="p-3 text-right">জলকর (শতক)</th>
                    <th className="p-3 text-center">স্ট্যাটাস</th>
                    <th className="p-3 text-right">পদক্ষেপ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5 font-medium">
                  {filteredFarmers.map((f) => (
                    <tr key={f.id} className="hover:bg-emerald-50/50 dark:hover:bg-white/5 transition-colors">
                      <td className="p-3 font-mono font-bold text-emerald-800 dark:text-emerald-300">
                        {f.registrationNumber}
                      </td>
                      <td className="p-3 font-bold text-gray-900 dark:text-gray-100">
                        {f.fullName}
                        {f.hasDuplicateWarning && (
                          <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                            Duplicate Warning
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-gray-600 dark:text-gray-300">
                        +91 {f.mobileNumber}
                      </td>
                      <td className="p-3 text-gray-600 dark:text-gray-400">
                        {f.villageName || f.villageId}
                      </td>
                      <td className="p-3 text-center font-bold">
                        {f.pondCount}
                      </td>
                      <td className="p-3 text-right font-bold text-emerald-900 dark:text-emerald-200">
                        {f.totalWaterAreaDecimal}
                      </td>
                      <td className="p-3 text-center">
                        {f.verificationStatus === 'verified' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            <CheckCircle className="w-3 h-3" />
                            <span>যাচাইকৃত</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3" />
                            <span>পর্যালোচনাধীন</span>
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setDetailsFarmer(f)}
                          className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-800 dark:text-gray-200 font-bold text-[10px] transition-colors"
                          title="বিস্তারিত তথ্য দেখুন"
                        >
                          👁️ বিবরণ
                        </button>
                        {f.verificationStatus === 'pending' ? (
                          <button
                            onClick={() => handleVerify('farmer', f.id, 'verified')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shadow-2xs transition-transform active:scale-95"
                          >
                            ✓ অনুমোদন দিন
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                            অনুমোদিত
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: WATER QUALITY LAB ── */}
      {activeTab === 'water' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#0c241b] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold text-cyan-950 dark:text-cyan-100 flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-cyan-600" />
                  <span>পানির গুণমান ল্যাব টেস্ট তালিকা (Water Quality Lab Tests)</span>
                </h2>
                <p className="text-[11px] text-gray-500">
                  অ্যাডমিন ও ল্যাব বিশেষজ্ঞ কর্তৃক পরিচালিত টেস্ট। চাষীরা তাদের পোর্টালে এই ফলাফল দেখতে পাবেন।
                </p>
              </div>
              <button
                onClick={() => setShowWaterModal(true)}
                className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-xs flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>+ টেস্ট এন্ট্রি</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 border-b border-gray-100 dark:border-white/10 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3">তারিখ</th>
                    <th className="p-3">চাষীর নাম</th>
                    <th className="p-3">মোবাইল</th>
                    <th className="p-3 text-center">pH</th>
                    <th className="p-3 text-center">DO (ppm)</th>
                    <th className="p-3 text-center">তাপমাত্রা</th>
                    <th className="p-3 text-center">অ্যামোনিয়া</th>
                    <th className="p-3">মন্তব্য ও ল্যাব স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5 font-medium">
                  {waterRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-500">
                        কোনো পানির গুণমান টেস্ট এন্ট্রি পাওয়া যায়নি। উপরের বোতাম থেকে নতুন টেস্ট এন্ট্রি করুন।
                      </td>
                    </tr>
                  ) : (
                    waterRecords.map((r) => (
                      <tr key={r.id} className="hover:bg-cyan-50/40 dark:hover:bg-white/5 transition-colors">
                        <td className="p-3 font-mono font-bold text-cyan-800 dark:text-cyan-300">
                          {r.readingDate}
                        </td>
                        <td className="p-3 font-bold text-gray-900 dark:text-gray-100">
                          {r.farmerName}
                        </td>
                        <td className="p-3 font-mono text-gray-600 dark:text-gray-400">
                          {r.farmerPhone ? `+91 ${r.farmerPhone}` : 'N/A'}
                        </td>
                        <td className="p-3 text-center font-bold text-emerald-700 dark:text-emerald-300">
                          {r.phLevel}
                        </td>
                        <td className="p-3 text-center font-bold text-cyan-700 dark:text-cyan-300">
                          {r.dissolvedOxygenPpm} ppm
                        </td>
                        <td className="p-3 text-center font-bold text-amber-700 dark:text-amber-300">
                          {r.waterTempC}°C
                        </td>
                        <td className="p-3 text-center font-bold">
                          {r.ammoniaPpm} ppm
                        </td>
                        <td className="p-3 text-gray-600 dark:text-gray-300">
                          <span className="line-clamp-1">{r.observationNotes || 'ল্যাব অনুমোদিত'}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: DISEASE & PROBLEM DIAGNOSIS ── */}
      {activeTab === 'problems' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#0c241b] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold text-amber-950 dark:text-amber-100 flex items-center gap-2">
                  <Microscope className="w-4 h-4 text-amber-600" />
                  <span>রোগ ও সমস্যা নির্ণয় লগ (Clinical Disease & Problem Diagnoses)</span>
                </h2>
                <p className="text-[11px] text-gray-500">
                  অ্যাডমিন ও মৎস্য বিশেষজ্ঞদের পরিদর্শন লগ। চাষী শুধুমাত্র দেখতে পাবেন, পরিবর্তন করতে পারবেন না।
                </p>
              </div>
              <button
                onClick={() => setShowProblemModal(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>+ রোগ নির্ণয় এন্ট্রি</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 border-b border-gray-100 dark:border-white/10 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3">তারিখ</th>
                    <th className="p-3">চাষীর নাম</th>
                    <th className="p-3">শ্রেণী</th>
                    <th className="p-3 text-center">তীব্রতা</th>
                    <th className="p-3">লক্ষণ ও ক্লিনিকাল পর্যবেক্ষণ</th>
                    <th className="p-3 text-center">স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5 font-medium">
                  {problemRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">
                        কোনো সক্রিয় রোগ বা সমস্যা এন্ট্রি নেই।
                      </td>
                    </tr>
                  ) : (
                    problemRecords.map((r) => (
                      <tr key={r.id} className="hover:bg-amber-50/40 dark:hover:bg-white/5 transition-colors">
                        <td className="p-3 font-mono font-bold text-amber-900 dark:text-amber-300">
                          {r.reportDate}
                        </td>
                        <td className="p-3 font-bold text-gray-900 dark:text-gray-100">
                          {r.farmerName}
                        </td>
                        <td className="p-3 capitalize font-bold text-gray-700 dark:text-gray-300">
                          {r.problemCategory}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              r.severity === 'critical'
                                ? 'bg-red-100 text-red-800'
                                : r.severity === 'high' || r.severity === 'severe'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {r.severity?.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-gray-800 dark:text-gray-200">
                          {r.symptomDescription}
                        </td>
                        <td className="p-3 text-center">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            <ShieldCheck className="w-3 h-3" />
                            <span>যাচাইকৃত</span>
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: TREATMENT & CARE ── */}
      {activeTab === 'treatment' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#0c241b] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold text-teal-950 dark:text-teal-100 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                  <span>চিকিৎসা ও ওষুধ প্রেসক্রিপশন লগ (Treatments & Prescriptions)</span>
                </h2>
                <p className="text-[11px] text-gray-500">
                  অ্যাডমিন কর্তৃক নির্ধারিত ওষুধ ও প্রয়োগের মাত্রা। চাষী অ্যাপে সঠিক নিয়ম দেখে প্রয়োগ করবেন।
                </p>
              </div>
              <button
                onClick={() => setShowTreatmentModal(true)}
                className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>+ নতুন প্রেসক্রিপশন</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 border-b border-gray-100 dark:border-white/10 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3">তারিখ</th>
                    <th className="p-3">চাষীর নাম</th>
                    <th className="p-3">ওষুধ / কেমিক্যালের নাম</th>
                    <th className="p-3">নির্দেশিত মাত্রা (Dosage)</th>
                    <th className="p-3">প্রয়োগ পদ্ধতি</th>
                    <th className="p-3">প্রেসক্রাইবার</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5 font-medium">
                  {treatmentRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">
                        কোনো প্রেসক্রিপশন এন্ট্রি পাওয়া যায়নি। উপরের বোতাম থেকে নতুন প্রেসক্রিপশন ইস্যু করুন।
                      </td>
                    </tr>
                  ) : (
                    treatmentRecords.map((r) => (
                      <tr key={r.id} className="hover:bg-teal-50/40 dark:hover:bg-white/5 transition-colors">
                        <td className="p-3 font-mono font-bold text-teal-900 dark:text-teal-300">
                          {r.treatmentDate}
                        </td>
                        <td className="p-3 font-bold text-gray-900 dark:text-gray-100">
                          {r.farmerName}
                        </td>
                        <td className="p-3 font-bold text-teal-800 dark:text-teal-200">
                          {r.medicineOrChemicalName}
                        </td>
                        <td className="p-3 font-bold text-amber-700 dark:text-amber-300">
                          {r.dosage}
                        </td>
                        <td className="p-3 text-gray-700 dark:text-gray-300">
                          {r.applicationMethod}
                        </td>
                        <td className="p-3 text-gray-500 font-semibold">
                          {r.prescribedBy || 'মৎস্য বিশেষজ্ঞ'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: WATER QUALITY ENTRY ── */}
      {showWaterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0c241b] border border-gray-200 dark:border-white/10 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-cyan-600" />
                <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white">
                  নতুন পানির গুণমান ল্যাব টেস্ট এন্ট্রি
                </h3>
              </div>
              <button onClick={() => setShowWaterModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveWaterQuality} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  মৎস্য চাষী নির্বাচন করুন *
                </label>
                <select
                  required
                  value={waterData.farmerId}
                  onChange={(e) => setWaterData({ ...waterData, farmerId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-bold"
                >
                  <option value="">-- চাষী নির্বাচন করুন --</option>
                  {farmers.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.fullName} (+91 {f.mobileNumber}) - {f.registrationNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    টেস্ট তারিখ *
                  </label>
                  <input
                    type="date"
                    required
                    value={waterData.readingDate}
                    onChange={(e) => setWaterData({ ...waterData, readingDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    pH Level (যেমন 7.5) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={waterData.phLevel}
                    onChange={(e) => setWaterData({ ...waterData, phLevel: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    DO (ppm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={waterData.dissolvedOxygenPpm}
                    onChange={(e) => setWaterData({ ...waterData, dissolvedOxygenPpm: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    তাপমাত্রা (°C)
                  </label>
                  <input
                    type="number"
                    value={waterData.waterTempC}
                    onChange={(e) => setWaterData({ ...waterData, waterTempC: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    অ্যামোনিয়া (ppm)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={waterData.ammoniaPpm}
                    onChange={(e) => setWaterData({ ...waterData, ammoniaPpm: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  ল্যাব পর্যবেক্ষণ ও নির্দেশিকা *
                </label>
                <textarea
                  rows={2}
                  required
                  value={waterData.observationNotes}
                  onChange={(e) => setWaterData({ ...waterData, observationNotes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-semibold"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowWaterModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 bg-gray-100 hover:bg-gray-200 font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-white bg-cyan-600 hover:bg-cyan-700 font-bold shadow-md"
                >
                  টেস্ট সেভ ও প্রকাশ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: PROBLEM / DISEASE ENTRY ── */}
      {showProblemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0c241b] border border-gray-200 dark:border-white/10 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Microscope className="w-5 h-5 text-amber-600" />
                <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white">
                  নতুন রোগ বা সমস্যা নির্ণয় নথিভুক্তকরণ
                </h3>
              </div>
              <button onClick={() => setShowProblemModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProblem} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  মৎস্য চাষী নির্বাচন করুন *
                </label>
                <select
                  required
                  value={problemData.farmerId}
                  onChange={(e) => setProblemData({ ...problemData, farmerId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-bold"
                >
                  <option value="">-- চাষী নির্বাচন করুন --</option>
                  {farmers.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.fullName} (+91 {f.mobileNumber}) - {f.registrationNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    তারিখ *
                  </label>
                  <input
                    type="date"
                    required
                    value={problemData.reportDate}
                    onChange={(e) => setProblemData({ ...problemData, reportDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    তীব্রতা (Severity) *
                  </label>
                  <select
                    value={problemData.severity}
                    onChange={(e) => setProblemData({ ...problemData, severity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-bold"
                  >
                    <option value="mild">স্বাভাবিক (Mild)</option>
                    <option value="moderate">মাঝারি (Moderate)</option>
                    <option value="severe">উচ্চ (Severe)</option>
                    <option value="critical">সংকটজনক (Critical)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  সমস্যার ধরণ (Category) *
                </label>
                <select
                  value={problemData.problemCategory}
                  onChange={(e) => setProblemData({ ...problemData, problemCategory: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-bold"
                >
                  <option value="water_quality">পানির বিষাক্ততা বা গ্যাস সমস্যা</option>
                  <option value="disease">মাছের রোগ ও ইনফেকশন (Bacterial/Parasitic)</option>
                  <option value="mortality">মাছের আকস্মিক মৃত্যু (Mortality)</option>
                  <option value="feed_refusal">খাদ্য গ্রহণ বন্ধ করা (Feed Refusal)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  লক্ষণ ও বিশেষজ্ঞ পর্যবেক্ষণ বিবরণ *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="যেমন: ভোরবেলায় মাছ খাবি খাচ্ছে, লেজে লাল দাগ বা খাবার গ্রহণ হ্রাস পেয়েছে..."
                  value={problemData.symptomDescription}
                  onChange={(e) => setProblemData({ ...problemData, symptomDescription: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-semibold"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowProblemModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 bg-gray-100 hover:bg-gray-200 font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-white bg-amber-600 hover:bg-amber-700 font-bold shadow-md"
                >
                  ডায়াগনোসিস সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: TREATMENT & PRESCRIPTION ENTRY ── */}
      {showTreatmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0c241b] border border-gray-200 dark:border-white/10 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-600" />
                <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white">
                  নতুন ওষুধ ও চিকিৎসা প্রেসক্রিপশন প্রদান
                </h3>
              </div>
              <button onClick={() => setShowTreatmentModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTreatment} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  মৎস্য চাষী নির্বাচন করুন *
                </label>
                <select
                  required
                  value={treatmentData.farmerId}
                  onChange={(e) => setTreatmentData({ ...treatmentData, farmerId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-bold"
                >
                  <option value="">-- চাষী নির্বাচন করুন --</option>
                  {farmers.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.fullName} (+91 {f.mobileNumber}) - {f.registrationNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    প্রেসক্রিপশন তারিখ *
                  </label>
                  <input
                    type="date"
                    required
                    value={treatmentData.treatmentDate}
                    onChange={(e) => setTreatmentData({ ...treatmentData, treatmentDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    ওষুধ / রাসায়নিকের নাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={treatmentData.medicineOrChemicalName}
                    onChange={(e) => setTreatmentData({ ...treatmentData, medicineOrChemicalName: e.target.value })}
                    placeholder="যেমন: চুন, পটাশ, জিওলাইট..."
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    নির্দেশিত মাত্রা (Dosage) *
                  </label>
                  <input
                    type="text"
                    required
                    value={treatmentData.dosage}
                    onChange={(e) => setTreatmentData({ ...treatmentData, dosage: e.target.value })}
                    placeholder="যেমন: প্রতি শতকে ২৫০ গ্রাম"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    উদ্দিষ্ট কারণ (Target Condition)
                  </label>
                  <input
                    type="text"
                    value={treatmentData.targetCondition}
                    onChange={(e) => setTreatmentData({ ...treatmentData, targetCondition: e.target.value })}
                    placeholder="যেমন: তলার গ্যাস শোধন"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  প্রয়োগ পদ্ধতি (Application Method)
                </label>
                <input
                  type="text"
                  value={treatmentData.applicationMethod}
                  onChange={(e) => setTreatmentData({ ...treatmentData, applicationMethod: e.target.value })}
                  placeholder="যেমন: জলে গুলে সমভাবে ছিটানো"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  বিশেষ নোট ও পরামর্শ
                </label>
                <textarea
                  rows={2}
                  value={treatmentData.notes}
                  onChange={(e) => setTreatmentData({ ...treatmentData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-semibold"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTreatmentModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 bg-gray-100 hover:bg-gray-200 font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-white bg-teal-600 hover:bg-teal-700 font-bold shadow-md"
                >
                  প্রেসক্রিপশন জারি করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Register Farmer Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0c241b] border border-gray-200 dark:border-white/10 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Fish className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-sm sm:text-base text-emerald-950 dark:text-emerald-100">
                  দোকান থেকে চাষী নিবন্ধন (Shop Assisted Registration)
                </h3>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {regMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-bold ${
                  regMsg.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {regMsg.text}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  চাষীর পুরো নাম *
                </label>
                <input
                  type="text"
                  required
                  value={regData.fullName}
                  onChange={(e) => setRegData({ ...regData, fullName: e.target.value })}
                  placeholder="যেমন: সন্তোষ পাল"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  মোবাইল নম্বর * (১০ ডিজিট)
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={regData.mobileNumber}
                  onChange={(e) =>
                    setRegData({ ...regData, mobileNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })
                  }
                  placeholder="9876543210"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    ব্লক *
                  </label>
                  <select
                    value={regData.blockId}
                    onChange={(e) => setRegData({ ...regData, blockId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-bold"
                  >
                    <option value="blk-balurghat">বালুরঘাট (Balurghat)</option>
                    <option value="blk-hili">হিলি (Hili)</option>
                    <option value="blk-kumarganj">কুমারগঞ্জ (Kumarganj)</option>
                    <option value="blk-gangarampur">গঙ্গারামপুর (Gangarampur)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    গ্রাম *
                  </label>
                  <select
                    value={regData.villageId}
                    onChange={(e) => setRegData({ ...regData, villageId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-bold"
                  >
                    <option value="vil-nandair">নন্দাইর (Nandair)</option>
                    <option value="vil-puliyapara">পুলিয়াপাড়া (Puliyapara)</option>
                    <option value="vil-chapmatali">চাপমাতলী (Chapmatali)</option>
                    <option value="vil-patiram">পতিরাম (Patiram)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    পুকুর সংখ্যা
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={regData.pondCount}
                    onChange={(e) => setRegData({ ...regData, pondCount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-bold text-center"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    জলকর আয়তন (শতক)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={regData.totalWaterAreaDecimal}
                    onChange={(e) => setRegData({ ...regData, totalWaterAreaDecimal: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-bold text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  চাষীর লগইন পিন (PIN)
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={regData.pin}
                  onChange={(e) => setRegData({ ...regData, pin: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-bold text-center tracking-widest"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all disabled:opacity-50"
                >
                  {regLoading ? 'নিবন্ধন করা হচ্ছে...' : 'নিবন্ধন নিশ্চিত করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Farmer Details & Approval Modal */}
      {detailsFarmer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0c241b] border border-gray-200 dark:border-white/10 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 flex items-center justify-center">
                  <Fish className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white leading-tight">
                    মৎস্য চাষীর বিবরণ ও অনুমোদন
                  </h3>
                  <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
                    {detailsFarmer.registrationNumber}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setDetailsFarmer(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 space-y-2.5">
                <div className="flex justify-between items-center pb-2 border-b border-gray-200/50 dark:border-white/10">
                  <span className="text-gray-500">চাষীর পুরো নাম:</span>
                  <span className="font-black text-gray-900 dark:text-white text-sm">
                    {detailsFarmer.fullName}
                  </span>
                </div>
                {detailsFarmer.fatherName && (
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200/50 dark:border-white/10">
                    <span className="text-gray-500">পিতার নাম:</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">
                      {detailsFarmer.fatherName}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pb-2 border-b border-gray-200/50 dark:border-white/10">
                  <span className="text-gray-500">মোবাইল নম্বর:</span>
                  <span className="font-mono font-bold text-gray-900 dark:text-white">
                    +91 {detailsFarmer.mobileNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-200/50 dark:border-white/10">
                  <span className="text-gray-500">গ্রাম ও এলাকা:</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {detailsFarmer.address || detailsFarmer.villageName || 'নন্দাইর, দক্ষিণ দিনাজপুর'}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-200/50 dark:border-white/10">
                  <span className="text-gray-500">পিন কোড:</span>
                  <span className="font-mono font-bold text-gray-800 dark:text-gray-200">
                    {detailsFarmer.pinCode || '733124'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-black/20 border border-gray-100 dark:border-white/5">
                    <span className="text-[10px] text-gray-400 block">পুকুর সংখ্যা</span>
                    <span className="text-base font-black text-cyan-600 dark:text-cyan-400">
                      {detailsFarmer.pondCount} টি
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-black/20 border border-gray-100 dark:border-white/5">
                    <span className="text-[10px] text-gray-400 block">মোট জলকর</span>
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                      {detailsFarmer.totalWaterAreaDecimal} শতক
                    </span>
                  </div>
                </div>
                {detailsFarmer.experienceYears && (
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-gray-500">চাষের অভিজ্ঞতা:</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">
                      {detailsFarmer.experienceYears} বছর
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-100 dark:bg-white/5">
                <span className="text-gray-500 font-bold">বর্তমান অবস্থা:</span>
                {detailsFarmer.verificationStatus === 'verified' ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>যাচাইকৃত ও অনুমোদিত</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                    <Clock className="w-3.5 h-3.5" />
                    <span>অনুমোদনের অপেক্ষমান</span>
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                {detailsFarmer.verificationStatus === 'pending' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleVerify('farmer', detailsFarmer.id, 'verified')}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>অনুমোদন করুন (Approve Farmer)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVerify('farmer', detailsFarmer.id, 'rejected')}
                      className="px-4 py-2.5 rounded-xl border border-red-300 hover:bg-red-50 text-red-600 dark:hover:bg-red-950 font-bold text-xs transition-colors"
                    >
                      বাতিল
                    </button>
                  </>
                ) : (
                  <div className="w-full text-center py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl">
                    ✓ এই চাষী ইতিমধ্যে অনুমোদিত এবং সিস্টেমে সক্রিয়
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setDetailsFarmer(null)}
                  className="px-4 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 dark:bg-white/10 dark:hover:bg-white/20 font-bold text-xs transition-colors"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
