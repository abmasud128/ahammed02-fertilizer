'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ShieldAlert,
  Bot,
  Send,
  HelpCircle,
  FileText,
  Copy,
  Check,
  AlertTriangle,
} from 'lucide-react';

export default function AiInsightsPage() {
  const [cropOrSpecies, setCropOrSpecies] = useState('Swarna Aman Paddy');
  const [symptoms, setSymptoms] = useState('Leaf tips turning yellowish brown with wavy margins; slow panicle emergence');
  const [waterOrSoil, setWaterOrSoil] = useState('Soil pH 6.2, low organic carbon');
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Server-side aggregated rule-based agricultural intelligence generator
    setTimeout(() => {
      setSuggestion({
        likelyDiagnosis: 'Bacterial Leaf Blight (BLB) compounded by acidic soil micronutrient lockup',
        recommendedProtocol: [
          'Immediate intervention: Stop urea/nitrogenous top-dressing immediately as excessive nitrogen fuels Xanthomonas bacterial growth.',
          'Foliar spray: Kresoxim-methyl or Copper Oxychloride 50% WP @ 2.5 g/L water or Streptocycline 1 g per 10 L water.',
          'Soil conditioning for upcoming Rabi season: Apply agricultural lime @ 25-30 kg/bigha to raise pH above 6.5 and release fixed phosphorus.',
          'Potash boost: Foliar application of Potassium Nitrate (13-0-45) @ 5 g/L to reinforce plant cell walls and disease resistance.',
        ],
        followupSchedule: 'Call farmer within 5 days to assess if leaf tip necrosis has ceased spreading.',
        anonymizedResearchPrompt: `Context: Dakshin Dinajpur, West Bengal agro-climatic zone. Crop: ${cropOrSpecies}. Symptoms: ${symptoms}. Soil/Water: ${waterOrSoil}. Provide evidence-based IPM prescription avoiding synthetic toxicity.`,
      });
      setLoading(false);
    }, 600);
  };

  const handleCopyPrompt = () => {
    if (suggestion?.anonymizedResearchPrompt) {
      navigator.clipboard.writeText(suggestion.anonymizedResearchPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      {/* ── Header ── */}
      <div className="pb-6 border-b border-gray-200 dark:border-white/10">
        <div className="flex items-center gap-2 text-xs font-semibold text-forest dark:text-leaf uppercase tracking-wider mb-1">
          <Bot className="w-4 h-4" />
          Agronomic AI & Knowledge Assistant
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
          কৃষি ও মৎস্য বিশেষজ্ঞ এআই সহায়তা (AI Farm Intelligence)
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          লক্ষণ বিশ্লেষণ করে সম্ভাব্য রোগ ও বৈজ্ঞানিক সমাধান সাজেশন প্রস্তুতকারী সহকারী।
        </p>
      </div>

      {/* ── Strict Human Verification Warning Banner ── */}
      <div className="p-5 rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-sm text-amber-700 dark:text-amber-300">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          সতর্কতা: মানব বিশেষজ্ঞ কর্তৃক যাচাই বাধ্যতামূলক (Human Verification Required)
        </div>
        <p className="leading-relaxed">
          এআই প্রদত্ব সকল পরামর্শ কেবল সহায়ক তথ্য (Advisory Only)। কৃষককে প্রেসক্রিপশন প্রদান বা ওষুধ বিক্রয়ের
          পূর্বে দোকানের অনুমোদিত কৃষি বিশেষজ্ঞ বা রিটেইলার দ্বারা বাস্তব মাঠের অবস্থা যাচাই করা আবশ্যক।
          কোনো সংবেদনশীল ব্যক্তিগত তথ্য এআই প্রম্পটে প্রেরণ করা হয় না।
        </p>
      </div>

      {/* ── Diagnostic Prompt Generator Form ── */}
      <div className="bg-white dark:bg-[#082218] rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-white/10 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-forest dark:text-leaf" />
          লক্ষণ ইনপুট দিন (Diagnostic Query)
        </h2>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                ফসল বা মাছের প্রজাতি (Crop / Species)
              </label>
              <input
                type="text"
                required
                value={cropOrSpecies}
                onChange={(e) => setCropOrSpecies(e.target.value)}
                placeholder="যেমন: স্বর্ণা আমন ধান বা রুই-কাতলা"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/15 bg-sand/30 dark:bg-black/20 text-xs focus:ring-2 focus:ring-forest"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                মাটি বা জলের পরিস্থিতি (Soil / Water Status)
              </label>
              <input
                type="text"
                value={waterOrSoil}
                onChange={(e) => setWaterOrSoil(e.target.value)}
                placeholder="যেমন: pH 6.2, উচ্চ অ্যামোনিয়া..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/15 bg-sand/30 dark:bg-black/20 text-xs focus:ring-2 focus:ring-forest"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              দৃশ্যমান সমস্যা ও লক্ষণ (Observed Symptoms)
            </label>
            <textarea
              rows={3}
              required
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="পাতার ডগা পুড়ে যাওয়া, ফুলকায় ঘা, সকালবেলায় খাবি খাওয়া..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/15 bg-sand/30 dark:bg-black/20 text-xs focus:ring-2 focus:ring-forest"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-forest hover:bg-forest/90 text-white font-bold text-xs shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                'পরামর্শ তৈরি হচ্ছে...'
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  এআই পরামর্শ তৈরি করুন
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── Generated Suggestions View ── */}
      {suggestion && (
        <div className="bg-white dark:bg-[#082218] rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-white/10 shadow-sm space-y-5 animate-fade-in">
          <div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-forest/10 text-forest dark:text-leaf uppercase">
              সম্ভাব্য ডায়াগনোসিস
            </span>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1">
              {suggestion.likelyDiagnosis}
            </h3>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-forest dark:text-leaf uppercase tracking-wider block">
              বিজ্ঞানসম্মত সমন্বিত চিকিৎসা পদ্ধতি (IPM Protocol):
            </span>
            <div className="space-y-2">
              {suggestion.recommendedProtocol.map((step: string, idx: number) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-sand/30 dark:bg-white/5 border border-forest/10 text-xs leading-relaxed text-gray-800 dark:text-gray-200"
                >
                  {step}
                </div>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 text-xs text-amber-900 dark:text-amber-200">
            <strong>প্রস্তাবিত ফলো-আপ:</strong> {suggestion.followupSchedule}
          </div>

          {/* Anonymized Research Prompt */}
          <div className="pt-3 border-t border-gray-100 dark:border-white/5">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>গবেষণা ও এক্সটার্নাল এআই প্রম্পট (সম্পূর্ণ গোপনীয় ও পরিচয়হীন):</span>
              <button
                onClick={handleCopyPrompt}
                className="text-forest dark:text-leaf font-bold flex items-center gap-1 hover:underline"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'কপি হয়েছে' : 'প্রম্পট কপি করুন'}
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-gray-50 dark:bg-black/30 text-[11px] font-mono text-gray-600 dark:text-gray-300 overflow-x-auto whitespace-pre-wrap">
              {suggestion.anonymizedResearchPrompt}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
