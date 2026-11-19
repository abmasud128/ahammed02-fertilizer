'use client';

import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  X,
  PlusCircle,
  FileText,
  User,
  Phone,
  MapPin,
  Calendar,
} from 'lucide-react';
import { CrmTestRequest, CrmTestResult, TestRequestStatus, TestType } from '@/types/crm';

export default function LabTestsPage() {
  const [requests, setRequests] = useState<CrmTestRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Selected test for results entry or viewing
  const [selectedRequest, setSelectedRequest] = useState<CrmTestRequest | null>(null);
  const [currentResult, setCurrentResult] = useState<CrmTestResult | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  // Form for result parameters
  const [testedBy, setTestedBy] = useState('Ahammed Masud');
  const [instrument, setInstrument] = useState('Digital Soil & Water Testing Kit AG-400');
  const [recommendation, setRecommendation] = useState('');
  const [parameters, setParameters] = useState<
    Array<{ key: string; label: string; value: string | number; unit: string; idealRange: string; status: any }>
  >([]);

  const [savingResult, setSavingResult] = useState(false);

  const loadRequests = () => {
    setLoading(true);
    fetch('/api/admin/crm/tests')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.requests) {
          setRequests(data.requests);
        }
      })
      .catch((err) => console.error('Fetch tests error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleOpenResultEntry = async (req: CrmTestRequest) => {
    setSelectedRequest(req);
    try {
      const res = await fetch(`/api/admin/crm/tests?id=${req.id}`);
      const data = await res.json();
      if (data.result) {
        setCurrentResult(data.result);
        setTestedBy(data.result.testedBy || 'Ahammed Masud');
        setInstrument(data.result.methodOrInstrument || 'Digital Testing Kit');
        setRecommendation(data.result.recommendationText || '');
        setParameters(data.result.parameters || []);
      } else {
        // Populate standard default parameters based on test type
        setCurrentResult(null);
        if (req.testType === 'soil') {
          setParameters([
            { key: 'ph', label: 'Soil pH', value: 6.5, unit: '', idealRange: '6.5 - 7.5', status: 'optimal' },
            { key: 'ec', label: 'Electrical Conductivity', value: 0.4, unit: 'dS/m', idealRange: '< 1.0', status: 'optimal' },
            { key: 'oc', label: 'Organic Carbon', value: 0.65, unit: '%', idealRange: '> 0.75%', status: 'low' },
            { key: 'n', label: 'Available Nitrogen (N)', value: 250, unit: 'kg/ha', idealRange: '280 - 560', status: 'low' },
            { key: 'p', label: 'Available Phosphorus (P)', value: 24, unit: 'kg/ha', idealRange: '20 - 50', status: 'optimal' },
            { key: 'k', label: 'Available Potassium (K)', value: 190, unit: 'kg/ha', idealRange: '150 - 300', status: 'optimal' },
            { key: 'zn', label: 'Zinc (Zn)', value: 0.8, unit: 'ppm', idealRange: '> 1.0 ppm', status: 'low' },
          ]);
          setRecommendation('মাটিতে চুন ২৫ কেজি প্রতি বিঘা হারে প্রয়োগ করুন। জিঙ্ক সালফেট ৫ কেজি প্রয়োগের পরামর্শ দেওয়া হল।');
        } else {
          setParameters([
            { key: 'ph', label: 'Water pH', value: 7.4, unit: '', idealRange: '7.5 - 8.5', status: 'optimal' },
            { key: 'do', label: 'Dissolved Oxygen (DO)', value: 4.8, unit: 'mg/L', idealRange: '> 5.0 mg/L', status: 'low' },
            { key: 'nh3', label: 'Ammonia (NH3)', value: 0.05, unit: 'mg/L', idealRange: '< 0.02 mg/L', status: 'high' },
            { key: 'alk', label: 'Alkalinity', value: 110, unit: 'mg/L', idealRange: '100 - 150 mg/L', status: 'optimal' },
          ]);
          setRecommendation('পুকুরে অক্সিজেনের ঘাটতি কমাতে অ্যারেশন চালু রাখুন। জিওলাইট প্রয়োগ করে অ্যামোনিয়া হ্রাস করুন।');
        }
      }
      setShowResultModal(true);
    } catch (err) {
      console.error('Failed to load test details:', err);
    }
  };

  const handleSaveResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    try {
      setSavingResult(true);
      const res = await fetch('/api/admin/crm/tests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_result',
          requestId: selectedRequest.id,
          testedBy,
          methodOrInstrument: instrument,
          parameters,
          recommendationText: recommendation,
        }),
      });

      if (res.ok) {
        setShowResultModal(false);
        loadRequests();
      }
    } catch (err) {
      console.error('Failed to save test result:', err);
    } finally {
      setSavingResult(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: TestRequestStatus) => {
    try {
      await fetch('/api/admin/crm/tests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      loadRequests();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const filtered = requests.filter((r) => {
    const matchSearch =
      r.requestNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.customerName.toLowerCase().includes(search.toLowerCase()) ||
      r.customerVillage.toLowerCase().includes(search.toLowerCase()) ||
      r.customerMobile.includes(search);

    const matchType = activeType === 'all' || r.testType === activeType;
    return matchSearch && matchType;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider mb-1">
            <FlaskConical className="w-4 h-4" />
            Diagnostic Soil & Water Quality Laboratory
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            মাটি ও জল পরীক্ষা ব্যবস্থাপনা (Lab Tests)
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            পাবলিক বুকিং ও সরাসরি দোকানের টেস্ট রিকোয়েস্ট ট্র্যাক করুন ও ডিজিটাল ল্যাব রিপোর্ট প্রদান করুন।
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 p-1 rounded-2xl self-start sm:self-auto">
          <button
            onClick={() => setActiveType('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeType === 'all' ? 'bg-forest text-white shadow-sm' : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            সকল টেস্ট ({requests.length})
          </button>
          <button
            onClick={() => setActiveType('soil')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeType === 'soil' ? 'bg-amber-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            মাটি পরীক্ষা
          </button>
          <button
            onClick={() => setActiveType('pond')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeType === 'pond' ? 'bg-cyan-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            পুকুরের জল
          </button>
        </div>
      </div>

      {/* ── Search Bar ── */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="রেফারেন্স নম্বর, নাম, বা গ্রাম দিয়ে খুঁজুন..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/15 bg-white dark:bg-[#082218] text-xs focus:ring-2 focus:ring-forest"
        />
      </div>

      {/* ── Test Requests Grid ── */}
      {loading ? (
        <div className="py-16 text-center text-xs text-gray-400">লোড হচ্ছে...</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-xs text-gray-400 bg-white dark:bg-[#082218] rounded-3xl border border-gray-200 dark:border-white/10">
          কোনো টেস্ট রিকোয়েস্ট পাওয়া যায়নি।
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="bg-white dark:bg-[#082218] rounded-2xl p-5 border border-gray-200 dark:border-white/10 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-forest dark:text-leaf">
                      {r.requestNumber}
                    </span>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mt-1">
                      {r.customerName}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {r.customerVillage} • {r.customerMobile}
                    </p>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                      r.status === 'result_ready'
                        ? 'bg-emerald-100 text-emerald-800'
                        : r.status === 'new'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {r.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="mt-3 p-3 rounded-xl bg-sand/30 dark:bg-white/5 border border-forest/10 text-xs space-y-1">
                  <p>
                    <span className="font-semibold text-gray-500">পরীক্ষার বিষয়:</span>{' '}
                    <strong className="capitalize text-forest dark:text-leaf">
                      {r.testType === 'soil' ? 'মাটি পরীক্ষা' : r.testType === 'pond' ? 'পুকুরের জল' : 'নলকূপের জল'}
                    </strong>
                  </p>
                  {r.plotDetails && (
                    <p>
                      <span className="font-semibold text-gray-500">জমির বিবরণ:</span> {r.plotDetails}
                    </p>
                  )}
                  <p>
                    <span className="font-semibold text-gray-500">ফি:</span> ₹{r.price} ({r.paymentStatus})
                  </p>
                  {r.notes && (
                    <p className="italic text-gray-500 line-clamp-2">নোট: &quot;{r.notes}&quot;</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-gray-100 dark:border-white/5 flex items-center justify-between gap-2">
                <select
                  value={r.status}
                  onChange={(e) => handleUpdateStatus(r.id, e.target.value as TestRequestStatus)}
                  className="px-2 py-1.5 rounded-xl border border-gray-200 dark:border-white/15 bg-sand/30 dark:bg-black/20 text-[11px] font-bold"
                >
                  <option value="new">নতুন (New)</option>
                  <option value="scheduled">নির্ধারিত (Scheduled)</option>
                  <option value="sample_collected">নমুনা সংগৃহীত (Collected)</option>
                  <option value="result_ready">রিপোর্ট তৈরি (Ready)</option>
                  <option value="delivered">হস্তান্তরিত (Delivered)</option>
                </select>

                <button
                  onClick={() => handleOpenResultEntry(r)}
                  className="px-3 py-1.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest/90 transition-all shadow-xs"
                >
                  {r.status === 'result_ready' ? 'রিপোর্ট দেখুন' : 'রিপোর্ট লিখুন'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── MODAL: ENTER / VIEW LAB RESULT ── */}
      {showResultModal && selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#082218] rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  ল্যাব টেস্ট রিপোর্ট ও প্যারামিটার
                </h3>
                <p className="text-xs text-gray-500">
                  {selectedRequest.requestNumber} • {selectedRequest.customerName} ({selectedRequest.testType.toUpperCase()})
                </p>
              </div>
              <button
                onClick={() => setShowResultModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveResult} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    পরীক্ষাকারী কর্মী / বিজ্ঞানী
                  </label>
                  <input
                    type="text"
                    required
                    value={testedBy}
                    onChange={(e) => setTestedBy(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/15 bg-sand/30 dark:bg-black/20 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    যন্ত্রপাতি / কিটের নাম
                  </label>
                  <input
                    type="text"
                    value={instrument}
                    onChange={(e) => setInstrument(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/15 bg-sand/30 dark:bg-black/20 text-xs"
                  />
                </div>
              </div>

              {/* Parameters List */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  প্যারামিটারের মান ও আদর্শ মাত্রা (Parameters & Ideal Ranges)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {parameters.map((param, idx) => (
                    <div
                      key={param.key}
                      className="p-3 rounded-2xl bg-sand/30 dark:bg-white/5 border border-forest/10 space-y-1.5"
                    >
                      <div className="flex justify-between text-xs font-bold">
                        <span>{param.label}</span>
                        <span className="text-gray-400 text-[10px]">আদর্শ: {param.idealRange}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={param.value}
                          onChange={(e) => {
                            const updated = [...parameters];
                            updated[idx].value = e.target.value;
                            setParameters(updated);
                          }}
                          placeholder="মান..."
                          className="px-2 py-1.5 rounded-lg border text-xs"
                        />
                        <select
                          value={param.status}
                          onChange={(e) => {
                            const updated = [...parameters];
                            updated[idx].status = e.target.value;
                            setParameters(updated);
                          }}
                          className="px-2 py-1.5 rounded-lg border text-xs"
                        >
                          <option value="optimal">সঠিক (Optimal)</option>
                          <option value="low">কম (Low)</option>
                          <option value="high">বেশি (High)</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendation text */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  বিশেষজ্ঞের সার/চুন ব্যবহারের সুপারিশ (Recommendation) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={recommendation}
                  onChange={(e) => setRecommendation(e.target.value)}
                  placeholder="মাটির পিএইচ অনুযায়ী চুন ও সারের সঠিক মাত্রা লিখুন..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/15 bg-sand/30 dark:bg-black/20 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" /> রিপোর্ট প্রিন্ট
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowResultModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={savingResult}
                    className="px-5 py-2 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest/90 disabled:opacity-50 shadow-md"
                  >
                    {savingResult ? 'সংরক্ষণ হচ্ছে...' : 'ল্যাব রিপোর্ট সংরক্ষণ করুন'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
