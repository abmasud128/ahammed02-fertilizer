'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertTriangle,
  Download,
  Barcode,
  CheckCircle,
  X,
  FileSpreadsheet,
  ShieldAlert,
  IndianRupee,
  Layers,
} from 'lucide-react';
import { ProductRecord, CategoryRecord, ProductUnitVariant } from '@/types/admin';
import { formatStockDisplay, parsePackSize, calculateOpeningBaseStock } from '@/lib/inventory/units';
import {
  calculateBaseUnitPricing,
  formatBaseStockDisplay,
  PackSizeUnit,
  BaseUnit,
} from '@/lib/inventory/unit-calculator';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [userRole, setUserRole] = useState<'owner' | 'cashier'>('owner');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductRecord | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    categoryId: 'fertilizers',
    packageType: 'Bag',
    unit: 'bag',
    packSizeValue: 50,
    packSizeUnit: 'kg' as PackSizeUnit,
    packSize: '50 kg',
    hsnCode: '',
    gstRate: 5,
    purchasePrice: 0,
    sellingPrice: 0,
    mrp: 0,
    barcode: '',
    lowStockThreshold: 10,
    isPesticide: false,
    notes: '',
    initialBatchNumber: 'BATCH-01',
    initialExpiryDate: '2027-12-31',
    initialQuantity: 10,
  });

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [variants, setVariants] = useState<ProductUnitVariant[]>([]);

  // Fertilizer check: Fertilizer products strictly sell in standard packaging without multiple unit variants
  const isFertilizer =
    formData.categoryId === 'fertilizers' ||
    formData.categoryId.toLowerCase().includes('fertilizer');

  // Auto-calculated Smallest Unit Pricing (Instant Live Recalculation)
  const liveBasePricing = useMemo(() => {
    return calculateBaseUnitPricing({
      name: formData.name,
      packageType: formData.packageType,
      packSize: formData.packSizeValue,
      packSizeUnit: formData.packSizeUnit,
      buyingPrice: formData.purchasePrice,
      sellingPrice: formData.sellingPrice,
    });
  }, [formData.name, formData.packageType, formData.packSizeValue, formData.packSizeUnit, formData.purchasePrice, formData.sellingPrice]);

  useEffect(() => {
    fetch('/api/admin/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.user) setUserRole(data.user.role);
      })
      .catch(() => {});

    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      brand: '',
      categoryId: 'fertilizers',
      packageType: 'Bag',
      unit: 'bag',
      packSizeValue: 50,
      packSizeUnit: 'kg',
      packSize: '50 kg',
      hsnCode: '',
      gstRate: 5,
      purchasePrice: 0,
      sellingPrice: 0,
      mrp: 0,
      barcode: `890${Math.floor(100000000 + Math.random() * 900000000)}`,
      lowStockThreshold: 10,
      isPesticide: false,
      notes: '',
      initialBatchNumber: `BAT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      initialExpiryDate: '2027-12-31',
      initialQuantity: 20,
    });
    setVariants([]);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: ProductRecord) => {
    setEditingProduct(p);
    const numMatch = (p.packSize || '').match(/(\d+(\.\d+)?)/);
    const packVal = p.packSizeValue !== undefined ? p.packSizeValue : (numMatch ? parseFloat(numMatch[1]) : 1);
    const packUnit = (p.packSizeUnit || (p.unit === 'bottle' ? 'ml' : 'kg')) as PackSizeUnit;
    const pkgType = p.packageType || (p.unit === 'bottle' ? 'Bottle' : p.unit === 'packet' ? 'Packet' : 'Bag');

    setFormData({
      name: p.name,
      brand: p.brand,
      categoryId: p.categoryId,
      packageType: pkgType,
      unit: p.unit,
      packSizeValue: packVal,
      packSizeUnit: packUnit,
      packSize: p.packSize || `${packVal} ${packUnit}`,
      hsnCode: p.hsnCode,
      gstRate: p.gstRate,
      purchasePrice: p.purchasePrice,
      sellingPrice: p.sellingPrice,
      mrp: p.mrp,
      barcode: p.barcode || '',
      lowStockThreshold: p.lowStockThreshold,
      isPesticide: p.isPesticide || false,
      notes: p.notes || '',
      initialBatchNumber: '',
      initialExpiryDate: '',
      initialQuantity: 0,
    });
    const isFert = p.categoryId === 'fertilizers' || p.categoryId.toLowerCase().includes('fertilizer');
    setVariants(!isFert && p.variants && p.variants.length > 0 ? [...p.variants] : []);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        id: `var-${Date.now()}-${prev.length + 1}`,
        unitName: '1 kg',
        multiplier: 1,
        sellingPrice: Number(formData.sellingPrice) || 0,
        purchasePrice: Number(formData.purchasePrice) || 0,
        mrp: Number(formData.mrp) || 0,
      },
    ]);
  };

  const handleUpdateVariant = (idx: number, updates: Partial<ProductUnitVariant>) => {
    setVariants((prev) => {
      const copy = [...prev];
      const current = copy[idx];
      let newUpdates = { ...updates };
      if (updates.unitName && updates.unitName !== current.unitName) {
        const parsed = parsePackSize(updates.unitName, formData.unit);
        if (parsed.value > 0) {
          newUpdates.multiplier = parsed.baseMultiplier;
        }
      }
      copy[idx] = { ...current, ...newUpdates };
      return copy;
    });
  };

  const handleRemoveVariant = (idx: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete product');
      }
    } catch {
      alert('Network error deleting product');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.brand) {
      setErrorMsg('Product name and brand are required.');
      return;
    }

    if (formData.packSizeValue <= 0) {
      setErrorMsg('Pack size must be greater than 0.');
      return;
    }

    if (formData.purchasePrice < 0 || formData.sellingPrice < 0) {
      setErrorMsg('Prices must be 0 or greater.');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    const validVariants = isFertilizer
      ? []
      : variants
          .filter((v) => v.unitName && v.unitName.trim().length > 0)
          .map((v) => ({
            ...v,
            multiplier: Number(v.multiplier) || 1,
            sellingPrice: Number(v.sellingPrice) || 0,
            purchasePrice: Number(v.purchasePrice) || 0,
            mrp: Number(v.mrp) || 0,
          }));

    const packSizeStr = `${formData.packSizeValue} ${formData.packSizeUnit}`;

    try {
      if (editingProduct) {
        // Edit existing
        const res = await fetch('/api/admin/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingProduct.id,
            name: formData.name,
            brand: formData.brand,
            categoryId: formData.categoryId,
            packageType: formData.packageType,
            packSizeValue: Number(formData.packSizeValue),
            packSizeUnit: formData.packSizeUnit,
            unit: formData.unit,
            packSize: packSizeStr,
            variants: validVariants,
            hsnCode: formData.hsnCode,
            gstRate: Number(formData.gstRate),
            purchasePrice: Number(formData.purchasePrice),
            sellingPrice: Number(formData.sellingPrice),
            mrp: Number(formData.mrp),
            barcode: formData.barcode,
            lowStockThreshold: Number(formData.lowStockThreshold),
            isPesticide: formData.isPesticide,
            notes: formData.notes,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to update product');
        }
      } else {
        // Create new
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            brand: formData.brand,
            categoryId: formData.categoryId,
            packageType: formData.packageType,
            packSizeValue: Number(formData.packSizeValue),
            packSizeUnit: formData.packSizeUnit,
            unit: formData.unit,
            packSize: packSizeStr,
            variants: validVariants,
            hsnCode: formData.hsnCode,
            gstRate: Number(formData.gstRate),
            purchasePrice: Number(formData.purchasePrice),
            sellingPrice: Number(formData.sellingPrice),
            mrp: Number(formData.mrp),
            barcode: formData.barcode,
            lowStockThreshold: Number(formData.lowStockThreshold),
            isPesticide: formData.isPesticide,
            notes: formData.notes,
            initialBatch: formData.initialQuantity > 0 ? {
              batchNumber: formData.initialBatchNumber,
              expiryDate: formData.initialExpiryDate,
              quantity: Number(formData.initialQuantity),
            } : undefined,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to add product');
        }
      }

      setIsModalOpen(false);
      loadProducts();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  // Filtered products
  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchQuery =
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      (p.barcode && p.barcode.toLowerCase().includes(q)) ||
      (p.hsnCode && p.hsnCode.includes(q));

    const matchCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;

    let matchStock = true;
    if (stockFilter === 'low') {
      matchStock = (p.totalStock || 0) <= (p.lowStockThreshold || 10) && (p.totalStock || 0) > 0;
    } else if (stockFilter === 'out') {
      matchStock = (p.totalStock || 0) === 0;
    }

    return matchQuery && matchCategory && matchStock;
  });

  const exportCSV = () => {
    const headers = [
      'ID',
      'Name',
      'Brand',
      'Category',
      'Pack Size',
      'Unit',
      'HSN Code',
      'GST Rate (%)',
      'Purchase Price',
      'Selling Price',
      'MRP',
      'Stock Available',
      'Low Stock Threshold',
      'Barcode',
      'Is Pesticide',
    ];

    const rows = products.map((p) => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.brand.replace(/"/g, '""')}"`,
      p.categoryId,
      `"${p.packSize}"`,
      p.unit,
      p.hsnCode,
      p.gstRate,
      p.purchasePrice,
      p.sellingPrice,
      p.mrp,
      p.totalStock,
      p.lowStockThreshold,
      p.barcode || '',
      p.isPesticide ? 'YES' : 'NO',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ahammed_products_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isOwner = userRole === 'owner';

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-white/10">
        <div>
          <h1 className="text-2xl font-black text-forest dark:text-emerald-300 flex items-center gap-2.5">
            <Package className="w-7 h-7 text-leaf" />
            <span>Product Master Catalog</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Manage fertilizer bags, pesticide bottles, seeds, MRPs, HSN codes, and GST rates.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-semibold hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 bg-leaf hover:bg-forest text-white rounded-xl text-xs font-bold shadow-sm transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Product</span>
          </button>
        </div>
      </div>

      {/* ── Filters & Search ── */}
      <div className="bg-white dark:bg-[#0c2e21] p-4 rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product by name, brand, barcode, or HSN code..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:ring-2 focus:ring-leaf outline-none"
            />
          </div>

          {/* Stock Filter */}
          <div className="flex items-center gap-1.5 w-full md:w-auto">
            <span className="text-xs text-gray-400 font-semibold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Stock:
            </span>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-3 py-2 outline-none font-medium"
            >
              <option value="all">All Inventory</option>
              <option value="low">Low Stock Alert (&le; Threshold)</option>
              <option value="out">Out of Stock (0 units)</option>
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
              selectedCategory === 'all'
                ? 'bg-forest text-white'
                : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            All Categories ({products.length})
          </button>
          {categories.map((c) => {
            const count = products.filter((p) => p.categoryId === c.id).length;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors flex items-center gap-1.5 ${
                  selectedCategory === c.id
                    ? 'bg-forest text-white'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                <span>{c.icon}</span>
                <span>{c.name}</span>
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Mobile Product Cards List (visible on md:hidden) ── */}
      <div className="md:hidden space-y-3">
        {filtered.map((p) => {
          const isLow = (p.totalStock || 0) <= (p.lowStockThreshold || 10);
          const isOut = (p.totalStock || 0) === 0;
          const stockInfo = p.totalStockInBaseUnits !== undefined
            ? formatBaseStockDisplay(p.totalStockInBaseUnits, p.packSizeInBaseUnit || 1, p.packageType || p.unit, p.baseUnit || 'g', p.packSizeUnit)
            : formatStockDisplay(p.totalStock, p.packSize, p.unit);

          return (
            <div
              key={p.id}
              className="p-4 rounded-2xl bg-white dark:bg-[#0c2e21] border border-gray-100 dark:border-white/10 shadow-xs space-y-3 text-xs"
            >
              {/* Top: Name, Brand, Pesticide */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    {p.brand}
                  </span>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">
                    {p.name}
                  </h4>
                </div>
                {p.isPesticide && (
                  <span className="text-[10px] bg-red-500/10 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded font-bold shrink-0">
                    Pesticide
                  </span>
                )}
              </div>

              {/* Middle Grid: Category, Unit, Stock */}
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                <div>
                  <span className="text-[10px] text-gray-400 block font-semibold">Category / Pack</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200 capitalize">
                    {p.categoryId} • {p.packSize || p.unit}
                  </span>
                  {p.sellPerBaseUnit !== undefined && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono block mt-0.5">
                      ₹{p.sellPerBaseUnit >= 1 ? p.sellPerBaseUnit.toFixed(2) : p.sellPerBaseUnit.toFixed(4)}/{p.baseUnit}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 block font-semibold">Stock Available</span>
                  <span
                    className={`inline-block text-[11px] font-black px-1.5 py-0.5 rounded-md ${
                      isOut
                        ? 'bg-red-500/10 text-red-600'
                        : isLow
                        ? 'bg-amber-500/10 text-amber-600'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {stockInfo.primary}
                  </span>
                  {stockInfo.secondary && (
                    <span className="text-[9px] text-gray-400 block mt-0.5">
                      {stockInfo.secondary}
                    </span>
                  )}
                </div>
              </div>

              {/* Price & Actions Row */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-[10px] text-gray-400 block">Selling Price</span>
                  <span className="text-base font-black text-forest dark:text-emerald-300">
                    ₹{p.sellingPrice}
                  </span>
                  {p.mrp > p.sellingPrice && (
                    <span className="text-[11px] text-gray-400 line-through ml-1.5">
                      ₹{p.mrp}
                    </span>
                  )}
                  {p.profitPerPack !== undefined && p.profitPerPack > 0 && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium block">
                      Profit: ₹{p.profitPerPack.toFixed(2)}/pack
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-white/10 hover:bg-leaf hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  {isOwner && (
                    <button
                      onClick={() => handleDelete(p.id, p.name)}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-all"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-8 text-center text-gray-400 bg-white dark:bg-[#0c2e21] rounded-2xl border border-gray-100 dark:border-white/10">
            <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="font-semibold text-sm">No products found</p>
          </div>
        )}
      </div>

      {/* ── Product List Table (Desktop & Tablet) ── */}
      <div className="hidden md:block bg-white dark:bg-[#0c2e21] rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 dark:bg-white/5 border-b border-gray-100 dark:border-white/10 text-gray-500 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 font-bold">Product & Brand</th>
                <th className="py-3.5 px-4 font-bold">Category</th>
                <th className="py-3.5 px-4 font-bold">Pack / Unit</th>
                <th className="py-3.5 px-4 font-bold">HSN & GST</th>
                {isOwner && <th className="py-3.5 px-4 font-bold text-right">Cost Price</th>}
                <th className="py-3.5 px-4 font-bold text-right">Selling Price</th>
                <th className="py-3.5 px-4 font-bold text-right">MRP</th>
                <th className="py-3.5 px-4 font-bold text-center">Available Stock</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {filtered.map((p) => {
                const isLow = (p.totalStock || 0) <= (p.lowStockThreshold || 10);
                const isOut = (p.totalStock || 0) === 0;

                return (
                  <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                    {/* Name & Brand */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        {p.name}
                        {p.isPesticide && (
                          <span className="text-[10px] bg-red-500/10 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" /> Pesticide
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-0.5">
                        <span>Brand: {p.brand}</span>
                        {p.barcode && (
                          <span className="font-mono text-[10px] bg-gray-100 dark:bg-white/10 px-1.5 py-0.2 rounded">
                            #{p.barcode}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-leaf border border-emerald-200 dark:border-emerald-800 font-semibold capitalize text-[11px]">
                        {p.categoryId}
                      </span>
                    </td>

                    {/* Pack / Unit */}
                    <td className="py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                      <div>{p.packSize || p.unit}</div>
                      {p.variants && p.variants.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {p.variants.map((v) => (
                            <span
                              key={v.id}
                              className="text-[9px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 px-1 py-0.2 rounded font-mono font-medium"
                            >
                              {v.unitName}: ₹{v.sellingPrice}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* HSN & GST */}
                    <td className="py-3 px-4">
                      <div className="font-mono text-[11px] text-gray-700 dark:text-gray-300">
                        {p.hsnCode || '—'}
                      </div>
                      <span className="text-[10px] font-semibold text-leaf bg-leaf/10 px-1.5 py-0.5 rounded">
                        {p.gstRate}% GST
                      </span>
                    </td>

                    {/* Purchase Price (Owner) */}
                    {isOwner && (
                      <td className="py-3 px-4 text-right">
                        <div className="font-semibold text-gray-700 dark:text-gray-300">
                          ₹{p.purchasePrice}
                        </div>
                        {p.buyPerBaseUnit !== undefined && (
                          <div className="text-[10px] text-gray-400 font-mono">
                            ₹{p.buyPerBaseUnit >= 1 ? p.buyPerBaseUnit.toFixed(2) : p.buyPerBaseUnit.toFixed(4)}/{p.baseUnit}
                          </div>
                        )}
                      </td>
                    )}

                    {/* Selling Price */}
                    <td className="py-3 px-4 text-right">
                      <div className="font-bold text-forest dark:text-emerald-300 text-sm">
                        ₹{p.sellingPrice}
                      </div>
                      {p.sellPerBaseUnit !== undefined && (
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                          ₹{p.sellPerBaseUnit >= 1 ? p.sellPerBaseUnit.toFixed(2) : p.sellPerBaseUnit.toFixed(4)}/{p.baseUnit}
                        </div>
                      )}
                      {p.profitPerPack !== undefined && p.profitPerPack > 0 && (
                        <div className="text-[9px] text-gray-400 font-medium">
                          +₹{p.profitPerPack.toFixed(2)}/pack
                        </div>
                      )}
                    </td>

                    {/* MRP */}
                    <td className="py-3 px-4 text-right text-gray-500 line-through">
                      ₹{p.mrp}
                    </td>

                    {/* Stock (Unified Base Unit & Pack Display) */}
                    <td className="py-3 px-4 text-center">
                      {(() => {
                        const stockInfo = p.totalStockInBaseUnits !== undefined
                          ? formatBaseStockDisplay(p.totalStockInBaseUnits, p.packSizeInBaseUnit || 1, p.packageType || p.unit, p.baseUnit || 'g', p.packSizeUnit)
                          : formatStockDisplay(p.totalStock, p.packSize, p.unit);
                        return (
                          <div>
                            <div
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold ${
                                isOut
                                  ? 'bg-red-500/15 text-red-600'
                                  : isLow
                                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                                  : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                              }`}
                            >
                              {isLow && <AlertTriangle className="w-3 h-3" />}
                              <span>{stockInfo.primary}</span>
                            </div>
                            {stockInfo.secondary && (
                              <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                                {stockInfo.secondary}
                              </div>
                            )}
                            <div className="text-[10px] text-gray-400 mt-0.5">
                              Min: {p.lowStockThreshold} {p.unit}
                            </div>
                          </div>
                        );
                      })()}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-600 dark:text-gray-300 transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {isOwner && (
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg text-red-500 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={isOwner ? 9 : 8} className="py-12 text-center text-gray-400">
                    <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-sm">No products found matching filters</p>
                    <p className="text-xs text-gray-500 mt-1">Try clearing search query or change category</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add / Edit Product Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0c2e21] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-forest dark:text-emerald-300">
                  {editingProduct ? 'Edit Product Details' : 'Add New Agricultural Product'}
                </h3>
                <p className="text-xs text-gray-500">
                  {editingProduct
                    ? `Editing ${editingProduct.name}`
                    : 'Configure prices, HSN, tax rate, and opening inventory'}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 text-red-600 font-medium">
                  {errorMsg}
                </div>
              )}

              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. IFFCO Urea Neem Coated"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none focus:ring-2 focus:ring-leaf font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Brand / Manufacturer *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. IFFCO, FMC, Bayer, Syngenta"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none focus:ring-2 focus:ring-leaf font-medium"
                  />
                </div>
              </div>

              {/* Category, Package Type, Pack Size (Number & Unit) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      const isNowFert = newCat === 'fertilizers' || newCat.toLowerCase().includes('fertilizer');
                      setFormData({ ...formData, categoryId: newCat });
                      if (isNowFert) {
                        setVariants([]);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none focus:ring-2 focus:ring-leaf font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Package / Unit Type *
                  </label>
                  <select
                    value={formData.packageType}
                    onChange={(e) => {
                      const newPkg = e.target.value;
                      let defaultUnit: PackSizeUnit = formData.packSizeUnit;
                      if (newPkg === 'Bottle' && defaultUnit !== 'ml' && defaultUnit !== 'L') defaultUnit = 'ml';
                      if (newPkg === 'Bag' && defaultUnit !== 'kg' && defaultUnit !== 'g') defaultUnit = 'kg';
                      setFormData({
                        ...formData,
                        packageType: newPkg,
                        unit: newPkg.toLowerCase(),
                        packSizeUnit: defaultUnit,
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none focus:ring-2 focus:ring-leaf font-medium"
                  >
                    <option value="Bottle">Bottle (তরল/স্প্রে)</option>
                    <option value="Bag">Bag (বস্তা/সার)</option>
                    <option value="Packet">Packet (প্যাকেট)</option>
                    <option value="Box">Box (বাক্স)</option>
                    <option value="Can">Can (জার/ক্যান)</option>
                    <option value="Jar">Jar</option>
                    <option value="Pouch">Pouch (ছোট পাউচ)</option>
                    <option value="Piece">Piece (পিস/যন্ত্রপাতি)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Pack Size (Number & Unit) *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0.001"
                      step="any"
                      required
                      value={formData.packSizeValue}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setFormData({
                          ...formData,
                          packSizeValue: val,
                          packSize: `${val} ${formData.packSizeUnit}`,
                        });
                      }}
                      placeholder="e.g. 100, 50, 1, 250"
                      className="w-3/5 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none focus:ring-2 focus:ring-leaf font-bold"
                    />
                    <select
                      value={formData.packSizeUnit}
                      onChange={(e) => {
                        const u = e.target.value as PackSizeUnit;
                        setFormData({
                          ...formData,
                          packSizeUnit: u,
                          packSize: `${formData.packSizeValue} ${u}`,
                        });
                      }}
                      className="w-2/5 px-2 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none focus:ring-2 focus:ring-leaf font-bold"
                    >
                      <option value="ml">ml (মিলিলিটার)</option>
                      <option value="L">L (লিটার)</option>
                      <option value="g">g (গ্রাম)</option>
                      <option value="kg">kg (কেজি)</option>
                      <option value="pcs">pcs (পিস)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* HSN & GST */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    HSN Code
                  </label>
                  <input
                    type="text"
                    value={formData.hsnCode}
                    onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                    placeholder="e.g. 3102 10 00"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none focus:ring-2 focus:ring-leaf font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    GST Rate (%) (Configurable)
                  </label>
                  <select
                    value={formData.gstRate}
                    onChange={(e) => setFormData({ ...formData, gstRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none focus:ring-2 focus:ring-leaf font-medium"
                  >
                    <option value={0}>0% (Exempt)</option>
                    <option value={5}>5% (Fertilizers/Subsidized)</option>
                    <option value={12}>12% (Bio-nutrients)</option>
                    <option value={18}>18% (Pesticides / Insecticides)</option>
                    <option value={28}>28% (Specialty)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Barcode / EAN (USB scanner ready)
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={formData.barcode}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      placeholder="890..."
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none focus:ring-2 focus:ring-leaf font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing: Purchase, Selling, MRP */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Purchase Cost (₹ per full pack) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 outline-none focus:ring-2 focus:ring-leaf font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Selling Price (₹ per full pack) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 outline-none focus:ring-2 focus:ring-leaf font-bold text-forest dark:text-emerald-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Printed MRP (₹ per full pack) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 outline-none focus:ring-2 focus:ring-leaf font-bold"
                  />
                </div>
              </div>

              {/* Auto-Calculated Smallest Unit Pricing Card (Live Read-Only) */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50/40 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800/60 shadow-2xs space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                      ₹
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                        Smallest Unit & Profit Breakdown
                        <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                          Auto Calculated
                        </span>
                      </h5>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">
                        Base unit: <span className="font-bold text-gray-700 dark:text-gray-300">{liveBasePricing.baseUnit}</span> (1 full {formData.packageType || 'pack'} = {liveBasePricing.packSizeInBaseUnit.toLocaleString()} {liveBasePricing.baseUnit})
                      </p>
                    </div>
                  </div>

                  {liveBasePricing.isLoss && (
                    <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 px-2 py-0.5 rounded-lg flex items-center gap-1">
                      ⚠️ Selling price &lt; Buying price
                    </span>
                  )}
                </div>

                {/* Rates Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-black/30 border border-emerald-100 dark:border-white/5">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Buy / Base Unit</span>
                    <span className="font-black text-sm text-gray-800 dark:text-gray-200 font-mono block mt-0.5">
                      ₹{liveBasePricing.buyPerBaseUnit >= 1 ? liveBasePricing.buyPerBaseUnit.toFixed(2) : liveBasePricing.buyPerBaseUnit.toFixed(4)}
                    </span>
                    <span className="text-[10px] text-gray-400">per {liveBasePricing.baseUnit}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white dark:bg-black/30 border border-emerald-100 dark:border-white/5">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Sell / Base Unit</span>
                    <span className="font-black text-sm text-forest dark:text-emerald-300 font-mono block mt-0.5">
                      ₹{liveBasePricing.sellPerBaseUnit >= 1 ? liveBasePricing.sellPerBaseUnit.toFixed(2) : liveBasePricing.sellPerBaseUnit.toFixed(4)}
                    </span>
                    <span className="text-[10px] text-gray-400">per {liveBasePricing.baseUnit}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white dark:bg-black/30 border border-emerald-100 dark:border-white/5">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Profit / Base Unit</span>
                    <span className={`font-black text-sm font-mono block mt-0.5 ${liveBasePricing.profitPerBaseUnit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                      ₹{Math.abs(liveBasePricing.profitPerBaseUnit) >= 1 ? liveBasePricing.profitPerBaseUnit.toFixed(2) : liveBasePricing.profitPerBaseUnit.toFixed(4)}
                    </span>
                    <span className="text-[10px] text-gray-400">per {liveBasePricing.baseUnit}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white dark:bg-black/30 border border-emerald-100 dark:border-white/5">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Profit / Pack</span>
                    <span className={`font-black text-sm font-mono block mt-0.5 ${liveBasePricing.profitPerPack >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                      ₹{liveBasePricing.profitPerPack.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-gray-400">per full {formData.packageType || 'pack'}</span>
                  </div>
                </div>

                {/* Friendly Display Unit rates for kg and L */}
                {(liveBasePricing.packSizeUnit === 'kg' || liveBasePricing.packSizeUnit === 'L') && (
                  <div className="text-[11px] font-medium text-emerald-800 dark:text-emerald-300 bg-white/80 dark:bg-black/40 px-3 py-1.5 rounded-lg border border-emerald-200/50 dark:border-white/5 flex items-center justify-between flex-wrap gap-1">
                    <span>Friendly Rate: <b>₹{liveBasePricing.buyPerDisplayUnit.toFixed(2)}</b>/{liveBasePricing.displayUnit} buy • <b>₹{liveBasePricing.sellPerDisplayUnit.toFixed(2)}</b>/{liveBasePricing.displayUnit} sell</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-300">
                      Profit: ₹{liveBasePricing.profitPerDisplayUnit.toFixed(2)}/{liveBasePricing.displayUnit}
                    </span>
                  </div>
                )}

                {liveBasePricing.warningMessage && (
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg border border-amber-200 dark:border-amber-800">
                    ⚠️ {liveBasePricing.warningMessage}
                  </p>
                )}
              </div>

              {/* Multiple Unit Types & Variant Pricing (Hidden for Fertilizers as they use standard single bag/packet units) */}
              {!isFertilizer && (
                <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5 text-xs">
                        <Layers className="w-4 h-4 text-leaf" />
                        Multiple Unit Types & Variant Pricing (ঐচ্ছিক বিভিন্ন ওজন/প্যাক সাইজ)
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                        Add multiple packaging options under this product (e.g. 50 kg bag & 1 kg loose). Stock will deduct proportionally from main total stock.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="px-2.5 py-1 bg-leaf hover:bg-forest text-white rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> + Add Unit Option
                    </button>
                  </div>

                  {/* Primary Pinned Packaging Unit */}
                  <div className="bg-emerald-100/60 dark:bg-emerald-900/30 p-2.5 rounded-lg border border-emerald-300 dark:border-emerald-700/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-forest dark:text-emerald-200">
                          Primary Packaging: {formData.packSize || formData.unit}
                        </span>
                        <span className="text-[10px] bg-forest text-white px-1.5 py-0.5 rounded font-mono font-bold">
                          Default Pinned
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                        Base rate: ₹{formData.sellingPrice || 0} • Cost: ₹{formData.purchasePrice || 0} • MRP: ₹{formData.mrp || 0}
                      </p>
                    </div>
                    <span className="text-[10px] text-forest dark:text-emerald-300 font-bold bg-white dark:bg-black/40 px-2 py-1 rounded border border-emerald-200 dark:border-emerald-800">
                      Base Multiplier: {parsePackSize(formData.packSize, formData.unit).baseMultiplier} {parsePackSize(formData.packSize, formData.unit).baseUnit}
                    </span>
                  </div>

                  {variants.length > 0 ? (
                    <div className="space-y-2 mt-2">
                      <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-gray-500 uppercase px-1">
                        <div className="col-span-4">Unit Name (e.g. 50 kg bag / 1 kg)</div>
                        <div className="col-span-2 text-center" title="Multiplier to base units (e.g. 50 for 50kg bag, 1 for 1kg)">
                          Multiplier ({formData.unit}s)
                        </div>
                        <div className="col-span-2 text-right">Selling (₹)</div>
                        <div className="col-span-2 text-right">Cost (₹)</div>
                        <div className="col-span-1 text-right">MRP (₹)</div>
                        <div className="col-span-1 text-center">Del</div>
                      </div>

                      {variants.map((v, vIdx) => (
                        <div
                          key={v.id || vIdx}
                          className="grid grid-cols-12 gap-2 items-center bg-white dark:bg-[#0c2e21] p-2 rounded-lg border border-gray-200 dark:border-white/10"
                        >
                          <div className="col-span-4">
                            <input
                              type="text"
                              required
                              placeholder="e.g. 50 kg bag"
                              value={v.unitName}
                              onChange={(e) => handleUpdateVariant(vIdx, { unitName: e.target.value })}
                              className="w-full px-2 py-1 text-xs rounded border border-gray-200 dark:border-white/10 bg-transparent outline-none focus:ring-1 focus:ring-leaf font-semibold"
                            />
                          </div>

                          <div className="col-span-2">
                            <input
                              type="number"
                              min="0.001"
                              step="any"
                              required
                              value={v.multiplier}
                              onChange={(e) => handleUpdateVariant(vIdx, { multiplier: Number(e.target.value) })}
                              className="w-full px-2 py-1 text-xs text-center rounded border border-gray-200 dark:border-white/10 bg-transparent outline-none focus:ring-1 focus:ring-leaf font-mono"
                            />
                          </div>

                          <div className="col-span-2">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              required
                              value={v.sellingPrice}
                              onChange={(e) => handleUpdateVariant(vIdx, { sellingPrice: Number(e.target.value) })}
                              className="w-full px-2 py-1 text-xs text-right rounded border border-gray-200 dark:border-white/10 bg-transparent outline-none focus:ring-1 focus:ring-leaf font-bold text-forest dark:text-emerald-300"
                            />
                          </div>

                          <div className="col-span-2">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={v.purchasePrice}
                              onChange={(e) => handleUpdateVariant(vIdx, { purchasePrice: Number(e.target.value) })}
                              className="w-full px-2 py-1 text-xs text-right rounded border border-gray-200 dark:border-white/10 bg-transparent outline-none focus:ring-1 focus:ring-leaf text-gray-500"
                            />
                          </div>

                          <div className="col-span-1">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={v.mrp}
                              onChange={(e) => handleUpdateVariant(vIdx, { mrp: Number(e.target.value) })}
                              className="w-full px-1.5 py-1 text-[11px] text-right rounded border border-gray-200 dark:border-white/10 bg-transparent outline-none focus:ring-1 focus:ring-leaf text-gray-400"
                            />
                          </div>

                          <div className="col-span-1 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveVariant(vIdx)}
                              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5 mx-auto" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-2 text-[11px] text-gray-400 border border-dashed border-gray-200 dark:border-white/10 rounded-lg">
                      No custom unit variants added yet. By default, the product will sell using its primary pack size ({formData.packSize || formData.unit}).
                    </div>
                  )}
                </div>
              )}

              {/* Threshold and Pesticide Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Low Stock Threshold (Alerts)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none focus:ring-2 focus:ring-leaf font-medium"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-800 dark:text-gray-200">
                    <input
                      type="checkbox"
                      checked={formData.isPesticide}
                      onChange={(e) => setFormData({ ...formData, isPesticide: e.target.checked })}
                      className="w-4 h-4 rounded text-leaf focus:ring-leaf"
                    />
                    <span>Is Pesticide / Insecticide / Fungicide?</span>
                  </label>
                </div>
              </div>

              {/* Opening Stock (Only when creating new product) */}
              {!editingProduct && (
                <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-3">
                  <h4 className="font-bold text-forest dark:text-emerald-300 text-xs flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-leaf" />
                    Opening Stock Batch (Initial Inventory)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        Batch Number
                      </label>
                      <input
                        type="text"
                        value={formData.initialBatchNumber}
                        onChange={(e) => setFormData({ ...formData, initialBatchNumber: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-black/30 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="date"
                        value={formData.initialExpiryDate}
                        onChange={(e) => setFormData({ ...formData, initialExpiryDate: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-black/30"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        Opening Quantity ({formData.unit}s)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.initialQuantity}
                        onChange={(e) => setFormData({ ...formData, initialQuantity: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-black/30 font-bold"
                      />
                      {formData.initialQuantity > 0 && (
                        <div className="mt-1.5 text-[10px] font-bold text-forest dark:text-emerald-300 bg-white dark:bg-black/40 px-2 py-1 rounded border border-emerald-300/50 shadow-2xs">
                          ⚡ Unified Base Weight: {calculateOpeningBaseStock(formData.initialQuantity, formData.packSize, formData.unit).toLocaleString()} kg ({((calculateOpeningBaseStock(formData.initialQuantity, formData.packSize, formData.unit) / 1000)).toFixed(2)} Metric Tons)
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 dark:border-white/10 rounded-xl font-semibold hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-leaf hover:bg-forest text-white rounded-xl font-bold shadow-md transition-colors flex items-center gap-2"
                >
                  {saving && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <span>{editingProduct ? 'Save Changes' : 'Create Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
