'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Layers,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  PlusCircle,
  MinusCircle,
  FileText,
  X,
  CheckCircle2,
} from 'lucide-react';
import { ProductRecord, StockMovementRecord } from '@/types/admin';
import { formatStockDisplay, parsePackSize } from '@/lib/inventory/units';

interface EnrichedBatch {
  id: string;
  productId: string;
  batchNumber: string;
  manufacturingDate?: string;
  expiryDate: string;
  purchasePrice: number;
  sellingPrice: number;
  mrp: number;
  quantityAvailable: number;
  productName: string;
  productBrand: string;
  category: string;
  unit: string;
  isPesticide: boolean;
}

export default function AdminStockPage() {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [batches, setBatches] = useState<EnrichedBatch[]>([]);
  const [movements, setMovements] = useState<StockMovementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'batches' | 'products' | 'movements'>('batches');
  const [search, setSearch] = useState('');
  const [filterExp, setFilterExp] = useState<'all' | '30' | '60' | '90' | 'expired'>('all');

  // Adjustment Modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductRecord | null>(null);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [adjustType, setAdjustType] = useState<'adjustment_add' | 'adjustment_sub' | 'damage' | 'expired'>('adjustment_add');
  const [adjustQty, setAdjustQty] = useState(1);
  const [adjustUnit, setAdjustUnit] = useState<'bag' | 'kg'>('bag');
  const [adjustReason, setAdjustReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadStockData();
  }, []);

  const loadStockData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stock');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setBatches(data.batches || []);
        setMovements(data.movements || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdjust = (prod?: ProductRecord) => {
    if (prod) {
      setSelectedProduct(prod);
      const prodBatches = batches.filter((b) => b.productId === prod.id);
      setSelectedBatchId(prodBatches[0]?.id || '');
    } else if (products.length > 0) {
      setSelectedProduct(products[0]);
      const prodBatches = batches.filter((b) => b.productId === products[0].id);
      setSelectedBatchId(prodBatches[0]?.id || '');
    }
    setAdjustType('adjustment_add');
    setAdjustQty(1);
    setAdjustUnit('bag');
    setAdjustReason('');
    setErrorMsg('');
    setSuccessMsg('');
    setIsAdjustModalOpen(true);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    if (!adjustReason.trim()) {
      setErrorMsg('A valid reason is required for manual stock adjustment.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const parsed = parsePackSize(selectedProduct.packSize, selectedProduct.unit);
      const isBagAdjustment = adjustUnit === 'bag' && parsed.isWeightBased && parsed.baseMultiplier > 1;
      const multiplier = isBagAdjustment ? parsed.baseMultiplier : 1;
      const finalQty = Math.round(Number(adjustQty) * multiplier * 100) / 100;
      const formattedReason = isBagAdjustment
        ? `${adjustReason} (${adjustQty} Bags = ${finalQty} kg)`
        : `${adjustReason} (${adjustQty} kg/loose)`;

      const res = await fetch('/api/admin/stock/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          batchId: selectedBatchId || undefined,
          type: adjustType,
          quantity: finalQty,
          reason: formattedReason,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to adjust stock');
      }

      setSuccessMsg('Stock adjustment recorded successfully!');
      setTimeout(() => {
        setIsAdjustModalOpen(false);
        loadStockData();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating stock');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered Batches
  const filteredBatches = batches.filter((b) => {
    const q = search.toLowerCase();
    const matchQ =
      b.batchNumber.toLowerCase().includes(q) ||
      b.productName.toLowerCase().includes(q) ||
      b.productBrand.toLowerCase().includes(q);

    const now = new Date().getTime();
    const expTime = new Date(b.expiryDate).getTime();
    const daysLeft = Math.ceil((expTime - now) / (1000 * 3600 * 24));

    let matchExp = true;
    if (filterExp === 'expired') matchExp = daysLeft <= 0;
    else if (filterExp === '30') matchExp = daysLeft > 0 && daysLeft <= 30;
    else if (filterExp === '60') matchExp = daysLeft > 0 && daysLeft <= 60;
    else if (filterExp === '90') matchExp = daysLeft > 0 && daysLeft <= 90;

    return matchQ && matchExp;
  });

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.categoryId.toLowerCase().includes(q)
    );
  });

  // Filtered Movements
  const filteredMovements = movements.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.productName.toLowerCase().includes(q) ||
      (m.batchNumber && m.batchNumber.toLowerCase().includes(q)) ||
      (m.reason && m.reason.toLowerCase().includes(q))
    );
  });

  const now = new Date().getTime();
  const expiringCount = batches.filter((b) => {
    const days = Math.ceil((new Date(b.expiryDate).getTime() - now) / (1000 * 3600 * 24));
    return days <= 90 && b.quantityAvailable > 0;
  }).length;

  const expiredCount = batches.filter((b) => {
    const days = Math.ceil((new Date(b.expiryDate).getTime() - now) / (1000 * 3600 * 24));
    return days <= 0 && b.quantityAvailable > 0;
  }).length;

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-white/10">
        <div>
          <h1 className="text-2xl font-black text-forest dark:text-emerald-300 flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-leaf" />
            <span>Stock & Batch Inventory</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Track fertilizer warehouse stock, batch expiry countdowns, and pesticide safety guards.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleOpenAdjust()}
            className="flex items-center gap-2 px-4 py-2 bg-leaf hover:bg-forest text-white rounded-xl text-xs font-bold shadow-sm transition-transform active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Manual Stock Adjustment</span>
          </button>
        </div>
      </div>

      {/* ── Highlights / Guard Banners ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Pesticide Expiry Guard */}
        <div className="p-4 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/20 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-leaf shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-forest dark:text-emerald-300">
              Pesticide Expiry Guard Active
            </h4>
            <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-0.5 leading-snug">
              Indian Insecticides Act compliant: POS will strictly reject any sale of expired chemicals.
            </p>
          </div>
        </div>

        {/* 90-Day Expiry Countdown */}
        <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/20 flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300">
              Expiring Soon Alert
            </h4>
            <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-0.5">
              <span className="font-bold text-amber-700">{expiringCount} batches</span> expiring in &le; 90 days.
            </p>
          </div>
        </div>

        {/* Expired Batches */}
        <div className="p-4 rounded-xl border border-red-300 dark:border-red-800 bg-red-50/70 dark:bg-red-950/20 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-red-900 dark:text-red-300">
              Expired Stock (Sale Blocked)
            </h4>
            <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-0.5">
              <span className="font-bold text-red-600">{expiredCount} batches</span> need write-off or return to supplier.
            </p>
          </div>
        </div>
      </div>

      {/* ── Navigation Tabs ── */}
      <div className="flex border-b border-gray-200 dark:border-white/10 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('batches')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'batches'
              ? 'border-leaf text-leaf'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <span>Batch Inventory & Expiry Tracker</span>
          <span className="bg-gray-200 dark:bg-white/10 px-2 py-0.5 rounded-full text-[10px]">
            {batches.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'products'
              ? 'border-leaf text-leaf'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <span>Stock by Product</span>
          <span className="bg-gray-200 dark:bg-white/10 px-2 py-0.5 rounded-full text-[10px]">
            {products.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('movements')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'movements'
              ? 'border-leaf text-leaf'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <span>Stock Movement Audit Ledger</span>
          <span className="bg-gray-200 dark:bg-white/10 px-2 py-0.5 rounded-full text-[10px]">
            {movements.length}
          </span>
        </button>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="bg-white dark:bg-[#0c2e21] p-4 rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              activeTab === 'batches'
                ? 'Search batch no., product name, or manufacturer...'
                : activeTab === 'products'
                ? 'Search product or category...'
                : 'Search audit ledger entries...'
            }
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:ring-2 focus:ring-leaf outline-none"
          />
        </div>

        {activeTab === 'batches' && (
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs text-gray-400 font-semibold shrink-0">Expiry Filter:</span>
            <select
              value={filterExp}
              onChange={(e) => setFilterExp(e.target.value as any)}
              className="text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-3 py-2 outline-none font-medium"
            >
              <option value="all">All Batches</option>
              <option value="30">Expiring in &le; 30 Days</option>
              <option value="60">Expiring in &le; 60 Days</option>
              <option value="90">Expiring in &le; 90 Days</option>
              <option value="expired">Expired (Sale Blocked)</option>
            </select>
          </div>
        )}
      </div>

      {/* ── TAB 1: Batches & Expiry Tracker ── */}
      {activeTab === 'batches' && (
        <div className="bg-white dark:bg-[#0c2e21] rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 dark:bg-white/5 border-b border-gray-100 dark:border-white/10 text-gray-500 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-bold">Batch Number</th>
                  <th className="py-3 px-4 font-bold">Product Name</th>
                  <th className="py-3 px-4 font-bold">Category</th>
                  <th className="py-3 px-4 font-bold">Expiry Date</th>
                  <th className="py-3 px-4 font-bold text-center">Days Left</th>
                  <th className="py-3 px-4 font-bold text-center">Available Stock</th>
                  <th className="py-3 px-4 font-bold text-right">Status / Safety</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {filteredBatches.map((b) => {
                  const expTime = new Date(b.expiryDate).getTime();
                  const daysLeft = Math.ceil((expTime - now) / (1000 * 3600 * 24));
                  const isExpired = daysLeft <= 0;
                  const isUrgent = daysLeft > 0 && daysLeft <= 45;

                  return (
                    <tr key={b.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-gray-800 dark:text-gray-200">
                        {b.batchNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                          {b.productName}
                          {b.isPesticide && (
                            <span className="text-[9px] bg-red-500/10 text-red-600 dark:text-red-400 px-1.5 py-0.2 rounded font-bold">
                              Pesticide
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-400">{b.productBrand}</div>
                      </td>
                      <td className="py-3 px-4 capitalize font-medium text-gray-600 dark:text-gray-400">
                        {b.category}
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-700 dark:text-gray-300">
                        {b.expiryDate}
                      </td>
                      <td className="py-3 px-4 text-center font-bold">
                        {isExpired ? (
                          <span className="text-red-600">Expired</span>
                        ) : (
                          <span className={isUrgent ? 'text-amber-600' : 'text-emerald-600'}>
                            {daysLeft} days
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-sm text-gray-900 dark:text-gray-100">
                        {formatStockDisplay(b.quantityAvailable, undefined, b.unit).primary}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isExpired ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-600 text-white font-black text-[10px] uppercase shadow-xs">
                            <ShieldAlert className="w-3 h-3" /> Sale Blocked
                          </span>
                        ) : isUrgent ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold text-[10px]">
                            <Clock className="w-3 h-3" /> Priority Sell
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold text-[10px]">
                            <CheckCircle2 className="w-3 h-3" /> Healthy
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredBatches.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-gray-400">
                      No batches found matching filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 2: Product Stock Overview ── */}
      {activeTab === 'products' && (
        <div className="bg-white dark:bg-[#0c2e21] rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 dark:bg-white/5 border-b border-gray-100 dark:border-white/10 text-gray-500 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-bold">Product Name</th>
                  <th className="py-3 px-4 font-bold">Category</th>
                  <th className="py-3 px-4 font-bold text-center">Min Threshold</th>
                  <th className="py-3 px-4 font-bold text-center">Total Stock</th>
                  <th className="py-3 px-4 font-bold text-center">Stock Status</th>
                  <th className="py-3 px-4 font-bold text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {filteredProducts.map((p) => {
                  const isLow = (p.totalStock || 0) <= (p.lowStockThreshold || 10);
                  const isOut = (p.totalStock || 0) === 0;
                  const stockInfo = formatStockDisplay(p.totalStock, p.packSize, p.unit);

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-gray-900 dark:text-gray-100">{p.name}</div>
                        <div className="text-[10px] text-gray-400">{p.brand} • {p.packSize}</div>
                      </td>
                      <td className="py-3 px-4 capitalize text-gray-600 dark:text-gray-400">
                        {p.categoryId}
                      </td>
                      <td className="py-3 px-4 text-center text-gray-500 font-medium">
                        {p.lowStockThreshold} {p.unit}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="font-black text-sm text-gray-900 dark:text-gray-100">
                          {stockInfo.primary}
                        </div>
                        {stockInfo.secondary && (
                          <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            {stockInfo.secondary}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isOut ? (
                          <span className="px-2 py-0.5 rounded bg-red-100 text-red-600 font-bold text-[10px]">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 font-bold text-[10px]">
                            Low Stock
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenAdjust(p)}
                          className="px-2.5 py-1 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 font-semibold text-[11px] transition-colors"
                        >
                          Adjust Qty
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 3: Stock Movement Ledger ── */}
      {activeTab === 'movements' && (
        <div className="bg-white dark:bg-[#0c2e21] rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 dark:bg-white/5 border-b border-gray-100 dark:border-white/10 text-gray-500 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-bold">Date & Time</th>
                  <th className="py-3 px-4 font-bold">Product</th>
                  <th className="py-3 px-4 font-bold">Batch No</th>
                  <th className="py-3 px-4 font-bold">Type</th>
                  <th className="py-3 px-4 font-bold text-center">Change Qty</th>
                  <th className="py-3 px-4 font-bold text-center">Balance After</th>
                  <th className="py-3 px-4 font-bold">Reason / Reference</th>
                  <th className="py-3 px-4 font-bold text-right">Performed By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {filteredMovements.map((m) => {
                  const isAdd = m.type === 'purchase' || m.type === 'adjustment_add' || m.type === 'return';

                  return (
                    <tr key={m.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">
                        {new Date(m.createdAt).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-200">
                        {m.productName}
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-500">
                        {m.batchNumber || '—'}
                      </td>
                      <td className="py-3 px-4 capitalize font-semibold">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] ${
                            isAdd
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                          }`}
                        >
                          {isAdd ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {m.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-center font-bold text-sm ${isAdd ? 'text-emerald-600' : 'text-red-600'}`}>
                        {isAdd ? `+${m.quantity}` : `-${m.quantity}`}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-gray-700 dark:text-gray-300">
                        {m.balanceAfter}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {m.reason}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-500 text-[11px]">
                        {m.performedByName || 'Staff'}
                      </td>
                    </tr>
                  );
                })}

                {filteredMovements.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-gray-400">
                      No stock movements recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Manual Stock Adjustment Modal ── */}
      {isAdjustModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0c2e21] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-forest dark:text-emerald-300">
                  Manual Stock Adjustment
                </h3>
                <p className="text-xs text-gray-500">Record stock addition, damage, expiry or audit discrepancy</p>
              </div>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="p-6 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 text-red-600 border border-red-200 font-medium">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                  {successMsg}
                </div>
              )}

              {/* Product Select */}
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Product
                </label>
                <select
                  value={selectedProduct.id}
                  onChange={(e) => {
                    const prod = products.find((p) => p.id === e.target.value);
                    if (prod) {
                      setSelectedProduct(prod);
                      const prodBatches = batches.filter((b) => b.productId === prod.id);
                      setSelectedBatchId(prodBatches[0]?.id || '');
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none font-medium"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.brand}) — Stock: {formatStockDisplay(p.totalStock, p.packSize, p.unit).primary}
                    </option>
                  ))}
                </select>
              </div>

              {/* Batch Select */}
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Target Batch (Optional if general)
                </label>
                <select
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none font-mono"
                >
                  <option value="">Default Available Batch</option>
                  {batches
                    .filter((b) => b.productId === selectedProduct.id)
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.batchNumber} (Exp: {b.expiryDate}) — {b.quantityAvailable} available
                      </option>
                    ))}
                </select>
              </div>

              {/* Adjustment Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Adjustment Type
                  </label>
                  <select
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none font-medium"
                  >
                    <option value="adjustment_add">Add Stock (+)</option>
                    <option value="adjustment_sub">Deduct Stock (-)</option>
                    <option value="damage">Damaged / Leaked (-)</option>
                    <option value="expired">Expired Write-off (-)</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-gray-700 dark:text-gray-300">
                      Quantity
                    </label>
                    {parsePackSize(selectedProduct.packSize, selectedProduct.unit).isWeightBased && (
                      <div className="flex items-center gap-1 text-[10px]">
                        <button
                          type="button"
                          onClick={() => setAdjustUnit('bag')}
                          className={`px-1.5 py-0.2 rounded font-bold transition-colors ${
                            adjustUnit === 'bag'
                              ? 'bg-forest text-white'
                              : 'bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          Bags
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdjustUnit('kg')}
                          className={`px-1.5 py-0.2 rounded font-bold transition-colors ${
                            adjustUnit === 'kg'
                              ? 'bg-forest text-white'
                              : 'bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          Kg
                        </button>
                      </div>
                    )}
                  </div>
                  <input
                    type="number"
                    min="0.01"
                    step="any"
                    required
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none font-bold text-sm"
                  />
                  {parsePackSize(selectedProduct.packSize, selectedProduct.unit).isWeightBased && adjustUnit === 'bag' && (
                    <div className="mt-1 text-[10px] text-forest dark:text-emerald-300 font-semibold">
                      = {adjustQty * parsePackSize(selectedProduct.packSize, selectedProduct.unit).baseMultiplier} kg base weight
                    </div>
                  )}
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Audit Reason (Mandatory) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Bag torn during rain, physical inventory recount, farmer return..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none focus:ring-2 focus:ring-leaf font-medium"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 dark:border-white/10 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-leaf hover:bg-forest text-white rounded-xl font-bold shadow-md transition-colors"
                >
                  {submitting ? 'Updating...' : 'Confirm Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
