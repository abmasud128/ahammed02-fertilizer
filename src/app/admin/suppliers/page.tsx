'use client';

import React, { useState, useEffect } from 'react';
import {
  Truck,
  Plus,
  Search,
  IndianRupee,
  Phone,
  Building,
  Calendar,
  AlertCircle,
  CheckCircle2,
  FileText,
  X,
  Trash2,
  PackagePlus,
} from 'lucide-react';
import { SupplierRecord, PurchaseRecord, ProductRecord } from '@/types/admin';

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<SupplierRecord[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'suppliers' | 'purchases'>('suppliers');
  const [search, setSearch] = useState('');

  // Add Supplier Modal
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    gstin: '',
    address: '',
    paymentTerms: '15 Days Credit',
    openingBalance: 0,
  });

  // Purchase Entry Modal
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [purchaseForm, setPurchaseForm] = useState({
    supplierId: '',
    invoiceNo: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    paymentStatus: 'paid' as 'paid' | 'partial' | 'due',
    amountPaid: 0,
    notes: '',
    items: [
      {
        productId: '',
        batchNumber: `BAT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        mfgDate: new Date().toISOString().split('T')[0],
        expDate: '2027-12-31',
        quantity: 10,
        unitCost: 250,
        gstRate: 5,
      },
    ],
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [supRes, purRes, prodRes] = await Promise.all([
        fetch('/api/admin/suppliers'),
        fetch('/api/admin/purchases'),
        fetch('/api/admin/products'),
      ]);

      if (supRes.ok) {
        const data = await supRes.json();
        setSuppliers(data.suppliers || []);
      }
      if (purRes.ok) {
        const data = await purRes.json();
        setPurchases(data.purchases || []);
      }
      if (prodRes.ok) {
        const data = await prodRes.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPurchase = () => {
    if (suppliers.length === 0) {
      alert('Please add at least one supplier first.');
      return;
    }
    if (products.length === 0) {
      alert('Please add at least one product first.');
      return;
    }

    setPurchaseForm({
      supplierId: suppliers[0].id,
      invoiceNo: `INV-${Date.now().toString().slice(-6)}`,
      purchaseDate: new Date().toISOString().split('T')[0],
      paymentStatus: 'paid',
      amountPaid: 0,
      notes: '',
      items: [
        {
          productId: products[0].id,
          batchNumber: `BAT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
          mfgDate: new Date().toISOString().split('T')[0],
          expDate: '2027-12-31',
          quantity: 20,
          unitCost: products[0].purchasePrice || 250,
          gstRate: products[0].gstRate || 5,
        },
      ],
    });
    setErrorMsg('');
    setIsPurchaseModalOpen(true);
  };

  const handleSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierForm.name || !supplierForm.phone) {
      setErrorMsg('Supplier name and phone are required.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplierForm),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create supplier');
      }

      setIsSupplierModalOpen(false);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating supplier');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePurchaseItemChange = (index: number, field: string, value: any) => {
    const updated = [...purchaseForm.items];
    (updated[index] as any)[field] = value;

    if (field === 'productId') {
      const prod = products.find((p) => p.id === value);
      if (prod) {
        updated[index].unitCost = prod.purchasePrice || 0;
        updated[index].gstRate = prod.gstRate || 5;
      }
    }

    setPurchaseForm({ ...purchaseForm, items: updated });
  };

  const addPurchaseItemRow = () => {
    if (products.length === 0) return;
    setPurchaseForm({
      ...purchaseForm,
      items: [
        ...purchaseForm.items,
        {
          productId: products[0].id,
          batchNumber: `BAT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
          mfgDate: new Date().toISOString().split('T')[0],
          expDate: '2027-12-31',
          quantity: 10,
          unitCost: products[0].purchasePrice || 250,
          gstRate: products[0].gstRate || 5,
        },
      ],
    });
  };

  const removePurchaseItemRow = (idx: number) => {
    if (purchaseForm.items.length <= 1) return;
    setPurchaseForm({
      ...purchaseForm,
      items: purchaseForm.items.filter((_, i) => i !== idx),
    });
  };

  // Compute purchase totals
  const computedSubtotal = purchaseForm.items.reduce(
    (acc, it) => acc + (it.quantity || 0) * (it.unitCost || 0),
    0
  );
  const computedTax = purchaseForm.items.reduce(
    (acc, it) => acc + ((it.quantity || 0) * (it.unitCost || 0) * (it.gstRate || 0)) / 100,
    0
  );
  const computedGrandTotal = computedSubtotal + computedTax;

  const handlePurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchaseForm.supplierId || !purchaseForm.invoiceNo) {
      setErrorMsg('Supplier and invoice number are required.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const paidAmt =
        purchaseForm.paymentStatus === 'paid'
          ? computedGrandTotal
          : purchaseForm.paymentStatus === 'due'
          ? 0
          : Number(purchaseForm.amountPaid);

      const res = await fetch('/api/admin/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: purchaseForm.supplierId,
          invoiceNo: purchaseForm.invoiceNo,
          purchaseDate: purchaseForm.purchaseDate,
          paymentStatus: purchaseForm.paymentStatus,
          amountPaid: paidAmt,
          notes: purchaseForm.notes,
          items: purchaseForm.items.map((it) => ({
            productId: it.productId,
            batchNumber: it.batchNumber,
            mfgDate: it.mfgDate,
            expDate: it.expDate,
            quantity: Number(it.quantity),
            unitCost: Number(it.unitCost),
            gstRate: Number(it.gstRate),
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to record purchase');
      }

      setIsPurchaseModalOpen(false);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error recording purchase');
    } finally {
      setSubmitting(false);
    }
  };

  const totalSupplierDue = suppliers.reduce((acc, s) => acc + (s.currentDue || 0), 0);

  const filteredSuppliers = suppliers.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.contactPerson && s.contactPerson.toLowerCase().includes(q)) ||
      s.phone.includes(q) ||
      (s.gstin && s.gstin.toLowerCase().includes(q))
    );
  });

  const filteredPurchases = purchases.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.supplierName.toLowerCase().includes(q) ||
      p.invoiceNo.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-white/10">
        <div>
          <h1 className="text-2xl font-black text-forest dark:text-emerald-300 flex items-center gap-2.5">
            <Truck className="w-7 h-7 text-leaf" />
            <span>Suppliers & Purchases</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Record fertilizer factory invoices, supplier credit dues, and inward stock batches.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setSupplierForm({
                name: '',
                contactPerson: '',
                phone: '',
                email: '',
                gstin: '',
                address: '',
                paymentTerms: '15 Days Credit',
                openingBalance: 0,
              });
              setErrorMsg('');
              setIsSupplierModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-semibold hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Supplier</span>
          </button>

          <button
            onClick={handleOpenPurchase}
            className="flex items-center gap-2 px-4 py-2 bg-leaf hover:bg-forest text-white rounded-xl text-xs font-bold shadow-sm transition-transform active:scale-95"
          >
            <PackagePlus className="w-4 h-4" />
            <span>+ Inward Purchase Voucher</span>
          </button>
        </div>
      </div>

      {/* ── Summary KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#0c2e21] p-5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Suppliers
            </p>
            <h3 className="text-2xl font-extrabold text-forest dark:text-emerald-300 mt-1">
              {suppliers.length}
            </h3>
            <span className="text-[11px] text-gray-400 mt-0.5 block">IFFCO, FMC, Bayer & Local Distributors</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-leaf/10 border border-leaf/20 flex items-center justify-center text-leaf">
            <Building className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#0c2e21] p-5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Supplier Outstanding Due
            </p>
            <h3 className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
              ₹{totalSupplierDue.toLocaleString('en-IN')}
            </h3>
            <span className="text-[11px] text-gray-400 mt-0.5 block">Pending Payable to Distributors</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#0c2e21] p-5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Purchase Vouchers
            </p>
            <h3 className="text-2xl font-extrabold text-forest dark:text-emerald-300 mt-1">
              {purchases.length}
            </h3>
            <span className="text-[11px] text-emerald-600 font-medium mt-0.5 block">Stock auto-credited to inventory</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600">
            <FileText className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex border-b border-gray-200 dark:border-white/10 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'suppliers'
              ? 'border-leaf text-leaf'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <span>Suppliers Directory</span>
          <span className="bg-gray-200 dark:bg-white/10 px-2 py-0.5 rounded-full text-[10px]">
            {suppliers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('purchases')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'purchases'
              ? 'border-leaf text-leaf'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <span>Inward Purchase Invoices</span>
          <span className="bg-gray-200 dark:bg-white/10 px-2 py-0.5 rounded-full text-[10px]">
            {purchases.length}
          </span>
        </button>
      </div>

      {/* ── Search Bar ── */}
      <div className="bg-white dark:bg-[#0c2e21] p-4 rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              activeTab === 'suppliers'
                ? 'Search supplier by company name, contact person, phone, or GSTIN...'
                : 'Search purchase invoice number or supplier...'
            }
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 focus:ring-2 focus:ring-leaf outline-none"
          />
        </div>
      </div>

      {/* ── TAB 1: Suppliers Directory ── */}
      {activeTab === 'suppliers' && (
        <div className="bg-white dark:bg-[#0c2e21] rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 dark:bg-white/5 border-b border-gray-100 dark:border-white/10 text-gray-500 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-bold">Company / Agency</th>
                  <th className="py-3 px-4 font-bold">Contact Person</th>
                  <th className="py-3 px-4 font-bold">Phone & City</th>
                  <th className="py-3 px-4 font-bold">GSTIN</th>
                  <th className="py-3 px-4 font-bold">Terms</th>
                  <th className="py-3 px-4 font-bold text-right">Current Due (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {filteredSuppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-gray-100">
                      {s.name}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300">
                      {s.contactPerson || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-gray-800 dark:text-gray-200 font-medium">{s.phone}</div>
                      <div className="text-[10px] text-gray-400">{s.address || 'West Bengal'}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-gray-600 dark:text-gray-400">
                      {s.gstin || '—'}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-500">
                      {s.paymentTerms}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-sm">
                      <span className={s.currentDue > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400'}>
                        ₹{s.currentDue.toLocaleString('en-IN')}
                      </span>
                    </td>
                  </tr>
                ))}

                {filteredSuppliers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-gray-400">
                      No suppliers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 2: Purchase Invoices ── */}
      {activeTab === 'purchases' && (
        <div className="bg-white dark:bg-[#0c2e21] rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 dark:bg-white/5 border-b border-gray-100 dark:border-white/10 text-gray-500 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-bold">Invoice No</th>
                  <th className="py-3 px-4 font-bold">Supplier</th>
                  <th className="py-3 px-4 font-bold">Purchase Date</th>
                  <th className="py-3 px-4 font-bold">Items Count</th>
                  <th className="py-3 px-4 font-bold text-right">Subtotal</th>
                  <th className="py-3 px-4 font-bold text-right">Tax (GST)</th>
                  <th className="py-3 px-4 font-bold text-right">Grand Total</th>
                  <th className="py-3 px-4 font-bold text-center">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {filteredPurchases.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-900 dark:text-gray-100">
                      {p.invoiceNo}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-800 dark:text-gray-200">
                      {p.supplierName}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-500">
                      {p.purchaseDate}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-600 dark:text-gray-400">
                      {p.items?.length || 0} product(s)
                    </td>
                    <td className="py-3.5 px-4 text-right text-gray-500">
                      ₹{p.subtotal.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right text-gray-500">
                      ₹{p.taxTotal.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-sm text-forest dark:text-emerald-300">
                      ₹{p.grandTotal.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          p.paymentStatus === 'paid'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                            : p.paymentStatus === 'partial'
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                            : 'bg-red-500/15 text-red-600'
                        }`}
                      >
                        {p.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}

                {filteredPurchases.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-gray-400">
                      No purchase vouchers recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Add Supplier Modal ── */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0c2e21] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
              <h3 className="text-base font-black text-forest dark:text-emerald-300">
                Register New Supplier / Distributor
              </h3>
              <button
                onClick={() => setIsSupplierModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSupplierSubmit} className="p-6 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 text-red-600 border border-red-200 font-medium">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Supplier / Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={supplierForm.name}
                  onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  placeholder="e.g. IFFCO State Marketing Division"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={supplierForm.contactPerson}
                    onChange={(e) => setSupplierForm({ ...supplierForm, contactPerson: e.target.value })}
                    placeholder="e.g. Rajesh Ghosh"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={supplierForm.phone}
                    onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                    placeholder="e.g. +91 98320 00000"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    GSTIN
                  </label>
                  <input
                    type="text"
                    value={supplierForm.gstin}
                    onChange={(e) => setSupplierForm({ ...supplierForm, gstin: e.target.value })}
                    placeholder="19AAAAA0000A1Z5"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Payment Terms
                  </label>
                  <input
                    type="text"
                    value={supplierForm.paymentTerms}
                    onChange={(e) => setSupplierForm({ ...supplierForm, paymentTerms: e.target.value })}
                    placeholder="e.g. 15 Days Credit"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Address / City
                </label>
                <input
                  type="text"
                  value={supplierForm.address}
                  onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                  placeholder="e.g. Balurghat, Dakshin Dinajpur"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Opening Balance Due (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={supplierForm.openingBalance}
                  onChange={(e) => setSupplierForm({ ...supplierForm, openingBalance: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none font-medium"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 dark:border-white/10 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-leaf hover:bg-forest text-white rounded-xl font-bold shadow-md transition-colors"
                >
                  {submitting ? 'Saving...' : 'Add Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Inward Purchase Voucher Modal ── */}
      {isPurchaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0c2e21] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-forest dark:text-emerald-300">
                  New Inward Purchase Voucher
                </h3>
                <p className="text-xs text-gray-500">Record stock received with batch no., expiry, and GST</p>
              </div>
              <button
                onClick={() => setIsPurchaseModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePurchaseSubmit} className="overflow-y-auto p-6 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 text-red-600 border border-red-200 font-medium">
                  {errorMsg}
                </div>
              )}

              {/* Supplier & Invoice info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Select Supplier *
                  </label>
                  <select
                    value={purchaseForm.supplierId}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, supplierId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none font-medium"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Supplier Invoice No *
                  </label>
                  <input
                    type="text"
                    required
                    value={purchaseForm.invoiceNo}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, invoiceNo: e.target.value })}
                    placeholder="e.g. IFFCO-2026-908"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Purchase Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={purchaseForm.purchaseDate}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, purchaseDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none font-medium"
                  />
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
                <div className="p-3 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
                  <h4 className="font-bold text-gray-800 dark:text-gray-200">
                    Purchase Items & Inward Batches
                  </h4>
                  <button
                    type="button"
                    onClick={addPurchaseItemRow}
                    className="px-2.5 py-1 bg-leaf hover:bg-forest text-white rounded-lg text-[11px] font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Item Row
                  </button>
                </div>

                <div className="p-3 space-y-3">
                  {purchaseForm.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 space-y-2"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Product</label>
                          <select
                            value={it.productId}
                            onChange={(e) => handlePurchaseItemChange(idx, 'productId', e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 outline-none font-medium text-xs"
                          >
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.brand})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Batch Number</label>
                          <input
                            type="text"
                            value={it.batchNumber}
                            onChange={(e) => handlePurchaseItemChange(idx, 'batchNumber', e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 outline-none font-mono text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Expiry Date</label>
                          <input
                            type="date"
                            value={it.expDate}
                            onChange={(e) => handlePurchaseItemChange(idx, 'expDate', e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 outline-none text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-end">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            value={it.quantity}
                            onChange={(e) => handlePurchaseItemChange(idx, 'quantity', Number(e.target.value))}
                            className="w-full px-2 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 outline-none font-bold text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Unit Cost (₹)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={it.unitCost}
                            onChange={(e) => handlePurchaseItemChange(idx, 'unitCost', Number(e.target.value))}
                            className="w-full px-2 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 outline-none font-bold text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 mb-0.5">GST Rate (%)</label>
                          <select
                            value={it.gstRate}
                            onChange={(e) => handlePurchaseItemChange(idx, 'gstRate', Number(e.target.value))}
                            className="w-full px-2 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 outline-none text-xs"
                          >
                            <option value={0}>0%</option>
                            <option value={5}>5%</option>
                            <option value={12}>12%</option>
                            <option value={18}>18%</option>
                            <option value={28}>28%</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <span className="block text-[10px] text-gray-400">Total:</span>
                            <span className="font-bold text-forest dark:text-emerald-300 text-xs">
                              ₹{Math.round(it.quantity * it.unitCost * (1 + it.gstRate / 100))}
                            </span>
                          </div>
                          {purchaseForm.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removePurchaseItemRow(idx)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Subtotal:</span>
                  <span className="font-bold">₹{computedSubtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Input GST Tax:</span>
                  <span className="font-bold">₹{Math.round(computedTax).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-black border-t border-gray-200 dark:border-white/10 pt-2 text-forest dark:text-emerald-300">
                  <span>Grand Total Payable:</span>
                  <span>₹{Math.round(computedGrandTotal).toLocaleString('en-IN')}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Payment Status
                    </label>
                    <select
                      value={purchaseForm.paymentStatus}
                      onChange={(e) => setPurchaseForm({ ...purchaseForm, paymentStatus: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 outline-none font-semibold text-xs"
                    >
                      <option value="paid">Fully Paid (₹{Math.round(computedGrandTotal)})</option>
                      <option value="partial">Partial Payment</option>
                      <option value="due">Full Due / Credit (₹0 Paid)</option>
                    </select>
                  </div>

                  {purchaseForm.paymentStatus === 'partial' && (
                    <div>
                      <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Amount Paid Now (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={computedGrandTotal}
                        value={purchaseForm.amountPaid}
                        onChange={(e) => setPurchaseForm({ ...purchaseForm, amountPaid: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 outline-none font-bold text-xs"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPurchaseModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 dark:border-white/10 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-leaf hover:bg-forest text-white rounded-xl font-bold shadow-md transition-colors"
                >
                  {submitting ? 'Recording...' : 'Stock In & Record Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
