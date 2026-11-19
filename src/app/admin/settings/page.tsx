'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building,
  Shield,
  CreditCard,
  QrCode,
  FileText,
  Save,
  CheckCircle2,
  Users,
  AlertCircle,
  Database,
  Download,
} from 'lucide-react';
import { ShopSettings, AdminUser } from '@/types/admin';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    shopName: '',
    address: '',
    phone: '',
    email: '',
    gstin: '',
    fertilizerLicence: '',
    pesticideLicence: '',
    invoicePrefix: 'AF-INV-2026-',
    upiId: '',
    defaultLowStockThreshold: 10,
    enablePublicStockSync: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        setFormData({
          shopName: data.settings.shopName,
          address: data.settings.address,
          phone: data.settings.phone,
          email: data.settings.email,
          gstin: data.settings.gstin,
          fertilizerLicence: data.settings.fertilizerLicence,
          pesticideLicence: data.settings.pesticideLicence,
          invoicePrefix: data.settings.invoicePrefix,
          upiId: data.settings.upiId,
          defaultLowStockThreshold: data.settings.defaultLowStockThreshold,
          enablePublicStockSync: data.settings.enablePublicStockSync,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update settings');
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const handleExportBackup = async () => {
    try {
      const [prodRes, purRes, salesRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/purchases'),
        fetch('/api/admin/pos/sales'),
      ]);

      const backup = {
        exportedAt: new Date().toISOString(),
        settings: formData,
        products: (await prodRes.json()).products,
        purchases: (await purRes.json()).purchases,
        sales: (await salesRes.json()).sales,
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `ahammed_fertilizer_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch {
      alert('Failed to generate backup export');
    }
  };

  if (loading || !settings) {
    return <div className="p-8 text-center text-gray-400">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-white/10">
        <div>
          <h1 className="text-2xl font-black text-forest dark:text-emerald-300 flex items-center gap-2.5">
            <Settings className="w-7 h-7 text-leaf" />
            <span>Store Configuration & Licences (সেটিংস ও লাইসেন্স)</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Configure retail legal licences, GSTIN, invoice prefix series, dynamic UPI payments, and data backups.
          </p>
        </div>

        <button
          onClick={handleExportBackup}
          className="flex items-center gap-2 px-3.5 py-2 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-bold hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-leaf" />
          <span>Export Store Backup (JSON)</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-leaf" />
          <span>Shop settings updated and active across POS billing memos!</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 text-red-600 border border-red-200 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Section 1: Shop & Contact Details */}
        <div className="bg-white dark:bg-[#0c2e21] p-6 rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-forest dark:text-emerald-300 flex items-center gap-2">
            <Building className="w-4 h-4 text-leaf" /> Store Details & Contact
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                Shop Business Name
              </label>
              <input
                type="text"
                required
                value={formData.shopName}
                onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                Helpline Phone
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
              Store Physical Address (Printed on invoices)
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none font-medium"
            />
          </div>
        </div>

        {/* Section 2: Statutory Licences & GSTIN */}
        <div className="bg-white dark:bg-[#0c2e21] p-6 rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-forest dark:text-emerald-300 flex items-center gap-2">
            <Shield className="w-4 h-4 text-leaf" /> Statutory Agricultural Licences & GST
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                GSTIN Number
              </label>
              <input
                type="text"
                required
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                Fertilizer Licence No
              </label>
              <input
                type="text"
                required
                value={formData.fertilizerLicence}
                onChange={(e) => setFormData({ ...formData, fertilizerLicence: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                Pesticide Retail Licence No
              </label>
              <input
                type="text"
                required
                value={formData.pesticideLicence}
                onChange={(e) => setFormData({ ...formData, pesticideLicence: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Billing, UPI QR & Number Series */}
        <div className="bg-white dark:bg-[#0c2e21] p-6 rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-forest dark:text-emerald-300 flex items-center gap-2">
            <QrCode className="w-4 h-4 text-leaf" /> Billing Series & Dynamic UPI ID
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                Invoice Number Prefix
              </label>
              <input
                type="text"
                required
                value={formData.invoicePrefix}
                onChange={(e) => setFormData({ ...formData, invoicePrefix: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none font-mono font-bold"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">
                Next generated bill: {formData.invoicePrefix}{settings.nextInvoiceNumber}
              </span>
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                Shop UPI VPA (for Dynamic QR code)
              </label>
              <input
                type="text"
                required
                value={formData.upiId}
                onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                placeholder="ahammedmasud@okaxis"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none font-mono font-bold text-forest dark:text-emerald-300"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-800 dark:text-gray-200">
              <input
                type="checkbox"
                checked={formData.enablePublicStockSync}
                onChange={(e) => setFormData({ ...formData, enablePublicStockSync: e.target.checked })}
                className="w-4 h-4 rounded text-leaf"
              />
              <span>
                Sync In-Stock Inventory with Public Website (marks 0 stock items as &apos;Currently Unavailable&apos;)
              </span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-leaf hover:bg-forest text-white rounded-xl font-bold shadow-md transition-all flex items-center gap-2 active:scale-98"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save Store Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
