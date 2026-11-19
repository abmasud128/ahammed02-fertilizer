'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  IndianRupee,
  TrendingUp,
  Package,
  AlertTriangle,
  Clock,
  Users,
  ShoppingCart,
  PlusCircle,
  Truck,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { DashboardMetrics } from '@/types/admin';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'owner' | 'cashier'>('owner');

  useEffect(() => {
    fetch('/api/admin/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.user) {
          setUserRole(data.user.role);
        }
      })
      .catch(() => {});

    loadDashboardMetrics();
  }, []);

  const loadDashboardMetrics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/dashboard');
      if (!res.ok) throw new Error('Failed to load dashboard metrics');
      const data = await res.json();
      if (data.success) {
        setMetrics(data.metrics);
      } else {
        setError(data.error || 'Failed to load metrics');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
          <div className="h-80 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="p-8 text-center bg-white dark:bg-[#0c2e21] rounded-2xl border border-red-200 dark:border-red-900/40">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Unable to load dashboard</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">{error || 'Unknown error'}</p>
        <button
          onClick={loadDashboardMetrics}
          className="px-4 py-2 bg-leaf hover:bg-forest text-white rounded-xl font-semibold text-sm transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const isOwner = userRole === 'owner';

  return (
    <div className="space-y-6">
      {/* ── Welcome & Quick Action Bar ── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-forest to-[#14533b] text-white p-6 rounded-2xl shadow-sm border border-emerald-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌱</span>
            <h1 className="text-2xl font-extrabold tracking-tight">Ahammed Fertilizer Dashboard</h1>
            <span className="text-xs bg-harvest text-forest font-bold px-2 py-0.5 rounded-full uppercase">
              {userRole}
            </span>
          </div>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1">
            Retail Desk at Nandair, Chapmatali • West Bengal (733124)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/pos"
            className="flex items-center gap-2 px-4 py-2.5 bg-harvest hover:bg-yellow-400 text-forest font-bold rounded-xl shadow-md text-sm transition-transform active:scale-95"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>⚡ New Bill (POS)</span>
          </Link>
          <Link
            href="/admin/products"
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-sm border border-white/15 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Product</span>
          </Link>
          {isOwner && (
            <Link
              href="/admin/suppliers"
              className="flex items-center gap-2 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-sm border border-white/15 transition-colors"
            >
              <Truck className="w-4 h-4" />
              <span>Purchase</span>
            </Link>
          )}
        </div>
      </div>

      {/* ── KPI Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Sales */}
        <div className="bg-white dark:bg-[#0c2e21] p-5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Today&apos;s Sales
            </p>
            <h3 className="text-2xl font-extrabold text-forest dark:text-emerald-300 mt-1">
              {formatINR(metrics.todaySales)}
            </h3>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> Live POS Counter
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-leaf">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

        {/* Today's Profit (Owner only) */}
        {isOwner ? (
          <div className="bg-white dark:bg-[#0c2e21] p-5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Today&apos;s Gross Profit
              </p>
              <h3 className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">
                {formatINR(metrics.todayProfit)}
              </h3>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium block mt-1">
                Margin approx.{' '}
                {metrics.todaySales > 0
                  ? Math.round((metrics.todayProfit / metrics.todaySales) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-leaf/10 border border-leaf/20 flex items-center justify-center text-leaf">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#0c2e21] p-5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Counter Shift
              </p>
              <h3 className="text-2xl font-extrabold text-forest dark:text-emerald-300 mt-1">
                Active Staff
              </h3>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium block mt-1">
                Standard POS Mode
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-leaf/10 border border-leaf/20 flex items-center justify-center text-leaf">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        )}

        {/* This Month's Sales */}
        <div className="bg-white dark:bg-[#0c2e21] p-5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              This Month&apos;s Sales
            </p>
            <h3 className="text-2xl font-extrabold text-forest dark:text-emerald-300 mt-1">
              {formatINR(metrics.monthSales)}
            </h3>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium block mt-1">
              Current Billing Cycle
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Total Stock Value */}
        <div className="bg-white dark:bg-[#0c2e21] p-5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Total Stock Value
            </p>
            <h3 className="text-2xl font-extrabold text-forest dark:text-emerald-300 mt-1">
              {formatINR(metrics.totalStockValue)}
            </h3>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium block mt-1">
              Cost of Inventory on Hand
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600">
            <Package className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ── Alert Pills: Low Stock & Expiring Batches ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/stock"
          className="p-4 rounded-xl border border-amber-300 dark:border-amber-700/60 bg-amber-50/80 dark:bg-amber-950/30 flex items-center justify-between group hover:border-amber-500 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500 text-white">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                Low Stock Warning
              </p>
              <h4 className="text-lg font-black text-amber-950 dark:text-amber-100">
                {metrics.lowStockCount} Products Need Restock
              </h4>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-amber-700 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/admin/stock"
          className="p-4 rounded-xl border border-red-300 dark:border-red-700/60 bg-red-50/80 dark:bg-red-950/30 flex items-center justify-between group hover:border-red-500 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-red-600 text-white">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-red-800 dark:text-red-300">
                Expiring Batches (90d)
              </p>
              <h4 className="text-lg font-black text-red-950 dark:text-red-100">
                {metrics.expiringCount} Batches Expiring Soon
              </h4>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-red-700 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/admin/customers"
          className="p-4 rounded-xl border border-emerald-300 dark:border-emerald-700/60 bg-emerald-50/80 dark:bg-emerald-950/30 flex items-center justify-between group hover:border-emerald-500 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-leaf text-white">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                Customer Credit (Udhaar)
              </p>
              <h4 className="text-lg font-black text-emerald-950 dark:text-emerald-100">
                {formatINR(metrics.customerDuesTotal)} Pending Due
              </h4>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-emerald-700 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* ── Charts Section: 7-Day Sales Trend & Category Breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7-Day Trend Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0c2e21] p-5 sm:p-6 rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">
                Sales Trend (Last 7 Days)
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Daily revenue and gross profit</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 dark:bg-white/10 rounded-lg text-gray-600 dark:text-gray-300">
              Weekly Activity
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.salesTrend7Days} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2E9E4F" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2E9E4F" stopOpacity={0.0} />
                  </linearGradient>
                  {isOwner && (
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F2B705" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#F2B705" stopOpacity={0.0} />
                    </linearGradient>
                  )}
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" stroke="#888" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#888"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    `₹${Number(value).toLocaleString('en-IN')}`,
                    name === 'sales' ? 'Revenue' : 'Profit',
                  ]}
                  contentStyle={{
                    backgroundColor: '#0c2e21',
                    borderColor: '#2E9E4F',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#2E9E4F"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                  name="sales"
                />
                {isOwner && (
                  <Area
                    type="monotone"
                    dataKey="profit"
                    stroke="#F2B705"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorProfit)"
                    name="profit"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="bg-white dark:bg-[#0c2e21] p-5 sm:p-6 rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">
              Sales by Category
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Revenue distribution</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {metrics.categorySales.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.categorySales}
                    dataKey="value"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {metrics.categorySales.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Sales']}
                    contentStyle={{
                      backgroundColor: '#0c2e21',
                      borderColor: '#2E9E4F',
                      borderRadius: '0.5rem',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-gray-400">No sales recorded yet</p>
            )}
          </div>

          <div className="text-[11px] text-gray-500 dark:text-gray-400 text-center pt-2 border-t border-gray-100 dark:border-white/10">
            Top sales contributor: Fertilizer & Insecticide
          </div>
        </div>
      </div>

      {/* ── Two Tables: Low Stock & Expiring Batches ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Watchlist */}
        <div className="bg-white dark:bg-[#0c2e21] p-5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">
                Low Stock Threshold Alerts
              </h3>
            </div>
            <Link
              href="/admin/stock"
              className="text-xs font-semibold text-leaf hover:underline flex items-center gap-1"
            >
              View all stock →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/10 text-gray-400 uppercase tracking-wider text-[10px]">
                  <th className="pb-2">Product</th>
                  <th className="pb-2">Category</th>
                  <th className="pb-2 text-center">Current</th>
                  <th className="pb-2 text-center">Threshold</th>
                  <th className="pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {metrics.lowStockProducts.slice(0, 5).map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-2.5 font-medium text-gray-800 dark:text-gray-200">
                      <div>{p.name}</div>
                      <span className="text-[10px] text-gray-400">{p.brand}</span>
                    </td>
                    <td className="py-2.5 text-gray-500 dark:text-gray-400 capitalize">
                      {p.categoryId}
                    </td>
                    <td className="py-2.5 text-center font-bold text-red-600 dark:text-red-400">
                      {p.totalStock} {p.unit}
                    </td>
                    <td className="py-2.5 text-center text-gray-400">
                      {p.lowStockThreshold} {p.unit}
                    </td>
                    <td className="py-2.5 text-right">
                      <Link
                        href="/admin/suppliers"
                        className="px-2 py-1 bg-leaf/10 hover:bg-leaf text-leaf hover:text-white rounded-md text-[11px] font-semibold transition-colors"
                      >
                        Reorder
                      </Link>
                    </td>
                  </tr>
                ))}
                {metrics.lowStockProducts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-gray-400">
                      All products have healthy inventory!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expiring Batches & Pesticide Expiry Guard */}
        <div className="bg-white dark:bg-[#0c2e21] p-5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-red-500/10 text-red-600">
                <ShieldAlert className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">
                Batches Expiring Soon (30/60/90 Days)
              </h3>
            </div>
            <Link
              href="/admin/stock"
              className="text-xs font-semibold text-leaf hover:underline flex items-center gap-1"
            >
              Batch manager →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/10 text-gray-400 uppercase tracking-wider text-[10px]">
                  <th className="pb-2">Batch No</th>
                  <th className="pb-2">Product</th>
                  <th className="pb-2">Expiry Date</th>
                  <th className="pb-2 text-center">Qty Left</th>
                  <th className="pb-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {metrics.expiringBatches.slice(0, 5).map((b) => {
                  const isExpired = new Date(b.expiryDate) < new Date();
                  const daysLeft = Math.ceil(
                    (new Date(b.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
                  );

                  return (
                    <tr key={b.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                      <td className="py-2.5 font-mono font-medium text-gray-700 dark:text-gray-300">
                        {b.batchNumber}
                      </td>
                      <td className="py-2.5 text-gray-800 dark:text-gray-200">
                        <div className="flex items-center gap-1.5">
                          {b.productName}
                          {b.isPesticide && (
                            <span className="text-[9px] bg-red-500/10 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded font-bold">
                              Pesticide
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 text-gray-600 dark:text-gray-400 font-mono">
                        {b.expiryDate}
                      </td>
                      <td className="py-2.5 text-center font-bold text-gray-700 dark:text-gray-300">
                        {b.quantityAvailable}
                      </td>
                      <td className="py-2.5 text-right">
                        {isExpired ? (
                          <span className="px-2 py-0.5 rounded bg-red-600 text-white font-bold text-[10px]">
                            EXPIRED (Sale Blocked)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold text-[10px]">
                            {daysLeft} days left
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {metrics.expiringBatches.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-gray-400">
                      No products expiring within 90 days.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Top Selling Products Bar ── */}
      <div className="bg-white dark:bg-[#0c2e21] p-5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs">
        <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-3">
          Top Fast-Moving Agricultural Products
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {metrics.topProducts.map((p, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-extrabold text-leaf">#{idx + 1} Best Seller</span>
                <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 mt-1 line-clamp-1">
                  {p.name}
                </h4>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs font-semibold">
                <span className="text-gray-500 dark:text-gray-400">{p.quantity} units</span>
                <span className="text-forest dark:text-emerald-400 font-bold">
                  {formatINR(p.amount)}
                </span>
              </div>
            </div>
          ))}
          {metrics.topProducts.length === 0 && (
            <div className="col-span-5 text-center text-xs text-gray-400 py-3">
              No sales data recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
