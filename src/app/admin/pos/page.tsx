'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  User,
  CreditCard,
  QrCode,
  IndianRupee,
  Receipt,
  Printer,
  Share2,
  Pause,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  X,
  UserPlus,
  Edit2,
  Wifi,
  WifiOff,
  History,
  Package,
} from 'lucide-react';
import { ProductRecord, CustomerRecord, SaleRecord, ShopSettings, ProductUnitVariant } from '@/types/admin';
import { numberToIndianWords } from '@/lib/utils/inr-words';
import { formatStockDisplay, buildProductVariants } from '@/lib/inventory/units';
import {
  calculateBaseUnitPricing,
  calculateLooseSale,
  formatBaseStockDisplay,
  BaseUnit,
  PackSizeUnit,
} from '@/lib/inventory/unit-calculator';

interface CartItem {
  productId: string;
  productName: string;
  brand: string;
  categoryId: string;
  packSize: string;
  unit: string;
  variantId?: string;
  unitMultiplier?: number;
  availableVariants?: ProductUnitVariant[];
  hsnCode: string;
  gstRate: number;
  unitPrice: number;
  quantity: number;
  discount: number;
  batchId?: string;
  batchNumber?: string;
  expiryDate?: string;
  isPesticide?: boolean;

  // Base Unit & Loose Sale attributes
  saleMode?: 'pack' | 'loose';
  packageType?: string;
  packSizeValue?: number;
  packSizeUnit?: string;
  baseUnit?: BaseUnit;
  packSizeInBaseUnit?: number;
  buyPerBaseUnit?: number;
  sellPerBaseUnit?: number;
  looseQuantity?: number;
  looseUnit?: string;
  looseQuantityInBaseUnit?: number;
  lineProfit?: number;
}

interface HeldBill {
  id: string;
  heldAt: string;
  customerName: string;
  customer?: CustomerRecord | null;
  items: CartItem[];
  paymentMode: 'cash' | 'upi' | 'card' | 'credit' | 'split';
  overallDiscount?: number;
  extraCharge?: number;
  extraChargeReason?: string;
  notes?: string;
}

export default function AdminPOSPage() {
  // Master data
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeMobileTab, setActiveMobileTab] = useState<'catalog' | 'cart'>('catalog');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Customer State
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({
    name: '',
    phone: '',
    village: 'Chapmatali',
  });

  // Edit Customer Modal State
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false);
  const [editCustomerForm, setEditCustomerForm] = useState({
    id: '',
    name: '',
    phone: '',
    village: '',
    creditLimit: 25000,
    notes: '',
    currentDue: 0,
  });
  const [isSavingCustomerEdit, setIsSavingCustomerEdit] = useState(false);
  const [customerEditError, setCustomerEditError] = useState('');

  // Billing & Payment
  const [paymentMode, setPaymentMode] = useState<'cash' | 'upi' | 'card' | 'credit' | 'split'>('cash');
  const [overallDiscount, setOverallDiscount] = useState<number>(0);
  // GST System Removed: All sales are 0% tax / non-GST for all products
  const isZeroTax = true;
  const [extraCharge, setExtraCharge] = useState<number>(0);
  const [extraChargeReason, setExtraChargeReason] = useState<string>('');
  const [splitCash, setSplitCash] = useState<number>(0);
  const [splitUPI, setSplitUPI] = useState<number>(0);
  const [splitCredit, setSplitCredit] = useState<number>(0);
  const [orderNotes, setOrderNotes] = useState('');

  // Held Bills
  const [heldBills, setHeldBills] = useState<HeldBill[]>([]);
  const [showHeldBillsModal, setShowHeldBillsModal] = useState(false);

  // Completed Sale Invoice Modal
  const [activeInvoice, setActiveInvoice] = useState<SaleRecord | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [printFormat, setPrintFormat] = useState<'a4' | 'thermal58' | 'thermal80'>('thermal80');

  // UPI QR Modal
  const [showUPIModal, setShowUPIModal] = useState(false);

  // Offline Detection
  const [isOnline, setIsOnline] = useState(true);

  // Bill History Modal
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [pastSales, setPastSales] = useState<SaleRecord[]>([]);

  // Checkout loading / error
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  // Callback refs for keyboard shortcuts
  const checkoutActionRef = useRef<() => void>(() => {});
  const holdActionRef = useRef<() => void>(() => {});

  useEffect(() => {
    loadMasterData();

    // Offline event listeners
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Keyboard shortcuts (F2: New Bill, F4: Pay, F8: Hold, Escape: Close Modals)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        setCart([]);
        searchInputRef.current?.focus();
      } else if (e.key === 'F4') {
        e.preventDefault();
        checkoutActionRef.current();
      } else if (e.key === 'F8') {
        e.preventDefault();
        holdActionRef.current();
      } else if (e.key === 'Escape') {
        setShowHeldBillsModal(false);
        setShowHistoryModal(false);
        setShowInvoiceModal(false);
        setShowUPIModal(false);
        setIsQuickAddOpen(false);
        setIsEditCustomerOpen(false);
        setShowCustomerDropdown(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const loadMasterData = async () => {
    setLoading(true);
    try {
      const [prodRes, custRes, salesRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/customers'),
        fetch('/api/admin/pos/sales'),
      ]);

      if (prodRes.ok) {
        const data = await prodRes.json();
        setProducts(data.products || []);
      }
      if (custRes.ok) {
        const data = await custRes.json();
        setCustomers(data.customers || []);
      }
      if (salesRes.ok) {
        const data = await salesRes.json();
        setPastSales(data.sales || []);
        if (data.settings) setSettings(data.settings);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Add product to cart (supports default or specific unit variant, pack or loose)
  const addToCart = (
    product: ProductRecord,
    chosenVariant?: ProductUnitVariant,
    initialMode: 'pack' | 'loose' = 'pack'
  ) => {
    const currentBaseStock =
      product.totalStockInBaseUnits !== undefined ? product.totalStockInBaseUnits : product.totalStock;

    if (currentBaseStock <= 0) {
      alert(`"${product.name}" is OUT OF STOCK. Cannot bill.`);
      return;
    }

    // Always build full variants including the primary pack size
    const allVariants = buildProductVariants(product);
    const defaultVariant =
      chosenVariant ||
      (allVariants && allVariants.length > 0 ? allVariants[0] : undefined);
    const unitName = defaultVariant ? defaultVariant.unitName : product.packSize || product.unit;
    const unitPrice = defaultVariant ? defaultVariant.sellingPrice : product.sellingPrice;
    const multiplier = defaultVariant ? defaultVariant.multiplier : 1;

    // Smallest Base Unit Parameters
    const bUnit = (product.baseUnit || 'g') as BaseUnit;
    const isLoose = initialMode === 'loose';
    const defaultLooseUnit: string =
      product.packSizeUnit === 'kg' && bUnit === 'g'
        ? 'kg'
        : product.packSizeUnit === 'L' && bUnit === 'ml'
        ? 'L'
        : bUnit;
    const defaultLooseQty =
      defaultLooseUnit === 'kg' || defaultLooseUnit === 'L'
        ? 1
        : bUnit === 'ml'
        ? Math.min(100, product.packSizeInBaseUnit || 100)
        : bUnit === 'g'
        ? Math.min(500, product.packSizeInBaseUnit || 500)
        : 1;
    const defaultLooseInBase =
      defaultLooseUnit === 'kg' || defaultLooseUnit === 'L' ? defaultLooseQty * 1000 : defaultLooseQty;

    // Check if requested initial quantity exceeds available base units
    const packInBase = product.packSizeInBaseUnit || multiplier || 1;
    const neededBaseUnits = isLoose ? defaultLooseInBase : packInBase;

    const currentUsedBaseUnits = cart
      .filter((it) => it.productId === product.id)
      .reduce((acc, it) => acc + (it.saleMode === 'loose' ? (it.looseQuantityInBaseUnit || 0) : it.quantity * (it.packSizeInBaseUnit || it.unitMultiplier || 1)), 0);
    const availableBaseUnits = Math.max(0, currentBaseStock - currentUsedBaseUnits);

    if (neededBaseUnits > availableBaseUnits) {
      alert(`Insufficient stock. Available: ${availableBaseUnits} ${bUnit}.`);
      return;
    }

    // Pesticide Expiry Check on batches
    const firstBatch = product.batches && product.batches.length > 0 ? product.batches[0] : undefined;
    if (product.isPesticide && firstBatch) {
      const isExpired = new Date(firstBatch.expiryDate) < new Date();
      if (isExpired) {
        alert(
          `CRITICAL SAFETY GUARD: Cannot sell expired pesticide batch ${firstBatch.batchNumber} (Expired on ${firstBatch.expiryDate}).`
        );
        return;
      }
    }

    const initialUnitPrice = isLoose
      ? (product.sellPerBaseUnit || unitPrice / packInBase)
      : unitPrice;

    setCart((prev) => {
      // Find item with same productId AND same saleMode AND same variantId
      const existingIndex = prev.findIndex(
        (item) =>
          item.productId === product.id &&
          item.saleMode === initialMode &&
          (item.variantId === defaultVariant?.id || (!item.variantId && !defaultVariant))
      );

      if (existingIndex > -1 && initialMode === 'pack') {
        const item = prev[existingIndex];
        const nextQty = item.quantity + 1;
        const otherItemsBaseUnits = prev
          .filter((_, i) => i !== existingIndex && _.productId === product.id)
          .reduce((sum, it) => sum + (it.saleMode === 'loose' ? (it.looseQuantityInBaseUnit || 0) : it.quantity * (it.packSizeInBaseUnit || it.unitMultiplier || 1)), 0);
        const itemAvail = Math.max(0, currentBaseStock - otherItemsBaseUnits);
        const needed = nextQty * (item.packSizeInBaseUnit || item.unitMultiplier || 1);

        if (needed > itemAvail) {
          alert(`Cannot exceed total available stock of ${itemAvail} ${bUnit}.`);
          return prev;
        }
        const updated = [...prev];
        updated[existingIndex] = { ...item, quantity: nextQty };
        return updated;
      } else {
        return [
          ...prev,
          {
            productId: product.id,
            productName: product.name,
            brand: product.brand,
            categoryId: product.categoryId,
            packSize: product.packSize,
            unit: unitName,
            variantId: defaultVariant?.id,
            unitMultiplier: multiplier,
            availableVariants: allVariants,
            hsnCode: product.hsnCode || '3102',
            gstRate: 0, // GST removed: 0% tax for all
            unitPrice: initialUnitPrice,
            quantity: 1,
            discount: 0,
            batchId: firstBatch?.id,
            batchNumber: firstBatch?.batchNumber || 'BATCH-01',
            expiryDate: firstBatch?.expiryDate,
            isPesticide: product.isPesticide,
            saleMode: initialMode,
            packageType: product.packageType || product.unit,
            packSizeValue: product.packSizeValue || parseFloat(product.packSize) || 1,
            packSizeUnit: product.packSizeUnit || 'kg',
            baseUnit: bUnit,
            packSizeInBaseUnit: product.packSizeInBaseUnit || 1,
            buyPerBaseUnit: product.buyPerBaseUnit || 0,
            sellPerBaseUnit: product.sellPerBaseUnit || 0,
            looseQuantity: isLoose ? defaultLooseQty : undefined,
            looseUnit: isLoose ? defaultLooseUnit : undefined,
            looseQuantityInBaseUnit: isLoose ? defaultLooseInBase : undefined,
          },
        ];
      }
    });
  };

  // Toggle sale mode for cart item (Pack vs Loose)
  const toggleSaleMode = (cartIndex: number, mode: 'pack' | 'loose') => {
    setCart((prev) => {
      const copy = [...prev];
      const item = copy[cartIndex];
      if (!item) return prev;
      const p = products.find((prod) => prod.id === item.productId);

      if (mode === 'loose') {
        const bUnit = item.baseUnit || p?.baseUnit || 'g';
        const defaultLooseUnit: string =
          item.packSizeUnit === 'kg' && bUnit === 'g'
            ? 'kg'
            : item.packSizeUnit === 'L' && bUnit === 'ml'
            ? 'L'
            : bUnit;
        const defaultLooseQty =
          defaultLooseUnit === 'kg' || defaultLooseUnit === 'L' ? 1 : bUnit === 'ml' ? 100 : 500;
        const inBase =
          defaultLooseUnit === 'kg' || defaultLooseUnit === 'L' ? defaultLooseQty * 1000 : defaultLooseQty;

        const effectiveSellPerBase =
          item.sellPerBaseUnit || p?.sellPerBaseUnit || (item.unitPrice / (item.packSizeInBaseUnit || 1));

        copy[cartIndex] = {
          ...item,
          saleMode: 'loose',
          looseQuantity: defaultLooseQty,
          looseUnit: defaultLooseUnit,
          looseQuantityInBaseUnit: inBase,
          unitPrice: effectiveSellPerBase,
        };
      } else {
        copy[cartIndex] = {
          ...item,
          saleMode: 'pack',
          quantity: 1,
          unitPrice: p?.sellingPrice || item.unitPrice,
        };
      }
      return copy;
    });
  };

  // Update loose quantity and unit for cart item (with stock limit verification)
  const updateLooseQuantity = (cartIndex: number, qty: number, unit?: string) => {
    setCart((prev) => {
      const copy = [...prev];
      const item = copy[cartIndex];
      if (!item) return prev;
      const product = products.find((p) => p.id === item.productId);

      const safeQty = Math.max(0, qty);
      const chosenUnit = unit || item.looseUnit || item.baseUnit || 'g';
      let inBase = safeQty;
      if (chosenUnit === 'kg' || chosenUnit === 'L') {
        inBase = safeQty * 1000;
      }

      if (product) {
        const currentBaseStock =
          product.totalStockInBaseUnits !== undefined ? product.totalStockInBaseUnits : product.totalStock;
        const otherItemsBaseUnits = prev
          .filter((_, i) => i !== cartIndex && _.productId === item.productId)
          .reduce(
            (sum, it) =>
              sum +
              (it.saleMode === 'loose'
                ? it.looseQuantityInBaseUnit || 0
                : it.quantity * (it.packSizeInBaseUnit || it.unitMultiplier || 1)),
            0
          );
        const maxAvailableInBase = Math.max(0, currentBaseStock - otherItemsBaseUnits);

        if (inBase > maxAvailableInBase) {
          const maxInChosen =
            chosenUnit === 'kg' || chosenUnit === 'L'
              ? (maxAvailableInBase / 1000).toFixed(2)
              : maxAvailableInBase;
          alert(
            `Cannot exceed total available stock of ${maxInChosen} ${chosenUnit} (${maxAvailableInBase} ${product.baseUnit || 'units'}).`
          );
          return prev;
        }
      }

      copy[cartIndex] = {
        ...item,
        looseQuantity: safeQty,
        looseUnit: chosenUnit,
        looseQuantityInBaseUnit: inBase,
      };
      return copy;
    });
  };

  // Change unit variant of a cart item
  const changeItemVariant = (cartIndex: number, newVariantId: string) => {
    setCart((prev) => {
      const copy = [...prev];
      const item = copy[cartIndex];
      if (!item || !item.availableVariants) return prev;

      const variant = item.availableVariants.find((v) => v.id === newVariantId);
      if (!variant) return prev;

      const product = products.find((p) => p.id === item.productId);
      if (product) {
        const otherItemsStock = prev
          .filter((_, i) => i !== cartIndex && _.productId === item.productId)
          .reduce((sum, it) => sum + it.quantity * (it.unitMultiplier || 1), 0);
        const availableStock = Math.max(0, product.totalStock - otherItemsStock);
        const neededStock = item.quantity * variant.multiplier;

        if (neededStock > availableStock) {
          const display = formatStockDisplay(availableStock, product.packSize, product.unit);
          alert(
            `Cannot switch to "${variant.unitName}". Needs ${neededStock} kg, but only ${display.primary} available.`
          );
          return prev;
        }
      }

      copy[cartIndex] = {
        ...item,
        variantId: variant.id,
        unit: variant.unitName,
        unitPrice: variant.sellingPrice,
        unitMultiplier: variant.multiplier,
      };
      return copy;
    });
  };

  // Barcode / Enter search
  const handleBarcodeOrSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return;

      const exactMatch = products.find(
        (p) =>
          (p.barcode && p.barcode.toLowerCase() === q) ||
          p.name.toLowerCase() === q
      );

      if (exactMatch) {
        addToCart(exactMatch);
        setSearchQuery('');
      }
    }
  };

  // Adjust item quantity (Feature 2: Proportional base weight deduction)
  const updateQuantity = (cartIndex: number, delta: number) => {
    setCart((prev) => {
      const item = prev[cartIndex];
      if (!item) return prev;
      const product = products.find((p) => p.id === item.productId);
      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        return prev.filter((_, i) => i !== cartIndex);
      }

      if (product) {
        const multiplier = item.unitMultiplier && item.unitMultiplier > 0 ? item.unitMultiplier : 1;
        const otherItemsStock = prev
          .filter((_, i) => i !== cartIndex && _.productId === item.productId)
          .reduce((sum, it) => sum + it.quantity * (it.unitMultiplier || 1), 0);
        const availableStock = Math.max(0, product.totalStock - otherItemsStock);
        const neededStock = newQty * multiplier;

        if (neededStock > availableStock) {
          const maxUnits = Math.floor(availableStock / multiplier);
          const display = formatStockDisplay(availableStock, product.packSize, product.unit);
          alert(
            `Maximum available stock is ${display.primary} (Max ${maxUnits} ${item.unit}).`
          );
          return prev;
        }
      }

      const updated = [...prev];
      updated[cartIndex] = { ...item, quantity: newQty };
      return updated;
    });
  };

  // Manual price override for a cart line item (Feature 4)
  const updateItemPrice = (cartIndex: number, newPrice: number) => {
    setCart((prev) => {
      const copy = [...prev];
      if (!copy[cartIndex]) return prev;
      copy[cartIndex] = {
        ...copy[cartIndex],
        unitPrice: Math.max(0, newPrice),
      };
      return copy;
    });
  };

  // Remove from cart
  const removeFromCart = (cartIndex: number) => {
    setCart((prev) => prev.filter((_, i) => i !== cartIndex));
  };

  // Helper to compute line financial stats for any cart item (pack or loose)
  const getItemLineStats = (item: CartItem) => {
    if (item.saleMode === 'loose') {
      const looseCalc = calculateLooseSale(
        item.looseQuantity || 0,
        item.looseUnit || item.baseUnit || 'g',
        item.unitPrice || item.sellPerBaseUnit || 0,
        item.buyPerBaseUnit || 0
      );
      const lineTotal = Math.max(0, looseCalc.lineTotal - item.discount);
      const lineProfit = Math.round((lineTotal - looseCalc.lineCost) * 100) / 100;
      return {
        lineTotal,
        lineCost: looseCalc.lineCost,
        lineProfit,
      };
    }

    const lineTotal = Math.max(0, item.quantity * item.unitPrice - item.discount);
    const p = products.find((prod) => prod.id === item.productId);
    const packCost = item.buyPerBaseUnit && item.packSizeInBaseUnit
      ? item.buyPerBaseUnit * item.packSizeInBaseUnit
      : (p?.purchasePrice || 0);
    const lineCost = item.quantity * packCost;
    const lineProfit = Math.round((lineTotal - lineCost) * 100) / 100;

    return {
      lineTotal,
      lineCost,
      lineProfit,
    };
  };

  // Cart Calculations
  const rawSubtotal = cart.reduce((acc, item) => acc + getItemLineStats(item).lineTotal, 0);
  const subtotalAfterDiscount = Math.max(0, rawSubtotal - overallDiscount);

  // Zero GST System: No tax charged on any sale
  const totalCGST = 0;
  const totalSGST = 0;
  const totalTax = 0;
  const unroundedGrandTotal = subtotalAfterDiscount + (Number(extraCharge) || 0);
  const roundedGrandTotal = Math.round(unroundedGrandTotal);
  const roundOff = Number((roundedGrandTotal - unroundedGrandTotal).toFixed(2));

  // Bill Profit Estimation
  const totalBillCost = cart.reduce((acc, item) => acc + getItemLineStats(item).lineCost, 0);
  const totalBillProfit = Math.round((rawSubtotal - overallDiscount - totalBillCost) * 100) / 100;

  // Hold current bill
  const handleHoldBill = () => {
    if (cart.length === 0) return;
    const held: HeldBill = {
      id: `hold-${Date.now()}`,
      heldAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      customerName: selectedCustomer ? selectedCustomer.name : 'Walk-in Customer',
      customer: selectedCustomer,
      items: cart,
      paymentMode,
      overallDiscount,
      extraCharge: Number(extraCharge) || 0,
      extraChargeReason,
      notes: orderNotes,
    };
    setHeldBills((prev) => [held, ...prev]);
    setCart([]);
    setSelectedCustomer(null);
    setOverallDiscount(0);
    setExtraCharge(0);
    setExtraChargeReason('');
    setOrderNotes('');
    alert('Bill parked on hold! You can resume it anytime.');
  };

  // Resume held bill
  const handleResumeBill = (held: HeldBill) => {
    setCart(held.items);
    setPaymentMode(held.paymentMode);
    setSelectedCustomer(held.customer || null);
    if (held.overallDiscount !== undefined) setOverallDiscount(held.overallDiscount);
    if (held.extraCharge !== undefined) setExtraCharge(held.extraCharge);
    if (held.extraChargeReason !== undefined) setExtraChargeReason(held.extraChargeReason);
    if (held.notes !== undefined) setOrderNotes(held.notes);
    setHeldBills((prev) => prev.filter((h) => h.id !== held.id));
    setShowHeldBillsModal(false);
  };

  // Discard / Delete held bill
  const handleDeleteHeldBill = (heldId: string) => {
    if (confirm('Are you sure you want to discard this held bill?')) {
      setHeldBills((prev) => prev.filter((h) => h.id !== heldId));
    }
  };

  // Quick Add Customer
  const handleQuickAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerForm.name || !newCustomerForm.phone) return;

    try {
      const res = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomerForm),
      });

      if (res.ok) {
        const data = await res.json();
        setCustomers((prev) => [data.customer, ...prev]);
        setSelectedCustomer(data.customer);
        setIsQuickAddOpen(false);
        setNewCustomerForm({ name: '', phone: '', village: 'Chapmatali' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenEditCustomer = (c: CustomerRecord) => {
    setEditCustomerForm({
      id: c.id,
      name: c.name,
      phone: c.phone,
      village: c.village || '',
      creditLimit: c.creditLimit || 25000,
      notes: c.notes || '',
      currentDue: c.currentDue || 0,
    });
    setCustomerEditError('');
    setIsEditCustomerOpen(true);
  };

  const handleSaveCustomerEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCustomerForm.name || !editCustomerForm.phone) {
      setCustomerEditError('Farmer name and phone number are required');
      return;
    }

    setIsSavingCustomerEdit(true);
    setCustomerEditError('');
    try {
      const res = await fetch('/api/admin/customers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editCustomerForm.id,
          name: editCustomerForm.name.trim(),
          phone: editCustomerForm.phone.trim(),
          village: editCustomerForm.village.trim(),
          creditLimit: Number(editCustomerForm.creditLimit) || 0,
          notes: editCustomerForm.notes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setCustomerEditError(data.error || 'Failed to update customer');
        return;
      }

      const updated = data.customer;
      setCustomers((prev) => prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)));
      if (selectedCustomer && selectedCustomer.id === updated.id) {
        setSelectedCustomer({ ...selectedCustomer, ...updated });
      }

      setIsEditCustomerOpen(false);
    } catch (err: any) {
      setCustomerEditError(err.message || 'Error updating customer');
    } finally {
      setIsSavingCustomerEdit(false);
    }
  };

  // Complete Sale Checkout
  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Cart is empty. Please add items to bill.');
      return;
    }

    if (paymentMode === 'credit' && !selectedCustomer) {
      alert('Credit (Udhaar) requires selecting a registered customer.');
      return;
    }

    setIsCheckingOut(true);
    setCheckoutError('');

    try {
      let cashAmount = 0;
      let upiAmount = 0;
      let cardAmount = 0;
      let creditAmount = 0;

      if (paymentMode === 'cash') cashAmount = roundedGrandTotal;
      else if (paymentMode === 'upi') upiAmount = roundedGrandTotal;
      else if (paymentMode === 'card') cardAmount = roundedGrandTotal;
      else if (paymentMode === 'credit') creditAmount = roundedGrandTotal;
      else if (paymentMode === 'split') {
        const splitSum = Math.round((splitCash + splitUPI + splitCredit) * 100) / 100;
        if (Math.abs(splitSum - roundedGrandTotal) > 0.01) {
          alert(`Split payments total (₹${splitSum}) does not match Grand Total (₹${roundedGrandTotal}). Please balance Cash, UPI, and Udhaar.`);
          setIsCheckingOut(false);
          return;
        }
        if (splitCredit > 0 && !selectedCustomer) {
          alert('Split payment with Credit (Udhaar) requires selecting a registered customer.');
          setIsCheckingOut(false);
          return;
        }
        cashAmount = splitCash;
        upiAmount = splitUPI;
        creditAmount = splitCredit;
      }

      const payload = {
        customerId: selectedCustomer?.id,
        customerName: selectedCustomer ? selectedCustomer.name : 'Walk-in Farmer',
        customerPhone: selectedCustomer?.phone,
        customerVillage: selectedCustomer?.village,
        subtotal: rawSubtotal,
        discountAmount: overallDiscount,
        cgstAmount: 0,
        sgstAmount: 0,
        totalTax: 0,
        roundOff,
        isZeroTax: true,
        extraCharge: Number(extraCharge) || 0,
        extraChargeReason: extraChargeReason.trim(),
        grandTotal: roundedGrandTotal,
        paymentMode,
        cashAmount,
        upiAmount,
        cardAmount,
        creditAmount,
        notes: orderNotes,
        items: cart.map((it) => {
          const stats = getItemLineStats(it);
          return {
            productId: it.productId,
            variantId: it.variantId,
            unit: it.saleMode === 'loose' ? `${it.looseQuantity} ${it.looseUnit || it.baseUnit}` : it.unit,
            unitMultiplier: it.unitMultiplier || 1,
            batchId: it.batchId,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            discount: it.discount,
            gstRate: 0, // GST Removed: 0% tax
            saleMode: it.saleMode || 'pack',
            looseQuantity: it.looseQuantity,
            looseUnit: it.looseUnit,
            looseQuantityInBaseUnit: it.looseQuantityInBaseUnit,
            buyPerBaseUnit: it.buyPerBaseUnit,
            sellPerBaseUnit: it.sellPerBaseUnit,
            totalAmount: stats.lineTotal,
          };
        }),
      };

      const res = await fetch('/api/admin/pos/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Checkout failed');
      }

      // Successful Sale
      setActiveInvoice(data.sale);
      setShowInvoiceModal(true);
      setCart([]);
      setSelectedCustomer(null);
      setOverallDiscount(0);
      setExtraCharge(0);
      setExtraChargeReason('');
      setOrderNotes('');

      // Refresh master products and past sales
      loadMasterData();
    } catch (err: any) {
      setCheckoutError(err.message || 'Error completing checkout');
      alert(`Checkout Error: ${err.message}`);
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Keep callback refs updated for keyboard shortcuts
  holdActionRef.current = handleHoldBill;
  checkoutActionRef.current = handleCheckout;

  // Generate WhatsApp Invoice Message
  const getWhatsAppInvoiceLink = (sale: SaleRecord) => {
    const phone = sale.customerPhone ? sale.customerPhone.replace(/[^0-9]/g, '') : '';
    const text = encodeURIComponent(
      `🌾 *Ahammed Fertilizer - Retail Cash Memo / Invoice*\n` +
      `Invoice: #${sale.invoiceNumber}\n` +
      `Date: ${new Date(sale.createdAt).toLocaleDateString('en-IN')}\n` +
      `Customer: ${sale.customerName}\n\n` +
      `*Items:*\n` +
      sale.items.map((i) => `• ${i.productName} (${i.quantity}x) = ₹${i.totalAmount}`).join('\n') +
      `\n\n*Total Amount:* ₹${sale.grandTotal}\n` +
      `*Payment Mode:* ${sale.paymentMode.toUpperCase()}\n` +
      `Shop: Nandair, Chapmatali, Dakshin Dinajpur (733124)\n` +
      `Thank you for farming with us! 🙏`
    );

    return phone ? `https://wa.me/91${phone}?text=${text}` : `https://wa.me/?text=${text}`;
  };

  // Filter products in catalog
  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchQ =
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      (p.barcode && p.barcode.toLowerCase().includes(q)) ||
      (p.hsnCode && p.hsnCode.includes(q));

    const matchCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
    return matchQ && matchCat;
  });

  // Dynamic UPI URL
  const upiId = settings?.upiId || 'ahammedmasud@okaxis';
  const upiPayUrl = `upi://pay?pa=${upiId}&pn=Ahammed%20Fertilizer&am=${roundedGrandTotal}&cu=INR&tn=Bill%20Payment`;
  const upiQrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiPayUrl)}`;

  return (
    <div className="flex-1 flex flex-col w-full h-full overflow-hidden min-w-0">
      {/* ── Offline Banner ── */}
      {!isOnline && (
        <div className="bg-amber-500 text-amber-950 px-4 py-1.5 text-xs font-bold flex items-center justify-between z-30 shadow-xs shrink-0">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span className="truncate">Offline Mode: Internet connection lost. Bills will queue locally and sync automatically.</span>
          </div>
          <span className="text-[10px] bg-amber-900 text-amber-100 px-2 py-0.5 rounded shrink-0">Local Storage Active</span>
        </div>
      )}

      {/* ── Top Bar: Quick Status, Held Bills, Bill History ── */}
      <div className="h-11 sm:h-12 bg-white dark:bg-[#0c2e21] border-b border-gray-200 dark:border-white/10 px-3 sm:px-4 flex items-center justify-between text-xs shrink-0 select-none">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex items-center gap-1.5 font-bold text-forest dark:text-emerald-300 truncate">
            <ShoppingCart className="w-4 h-4 text-leaf shrink-0" />
            <span className="truncate">High-Speed POS Counter Desk</span>
          </div>
          <span className="hidden md:inline text-[11px] text-gray-400">|</span>
          <span className="hidden md:inline text-[11px] text-gray-500 dark:text-gray-400 shrink-0">
            F2: New Bill • F4: Pay
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {heldBills.length > 0 && (
            <button
              type="button"
              onClick={() => setShowHeldBillsModal(true)}
              className="px-2 sm:px-2.5 py-1 bg-amber-500/15 text-amber-700 dark:text-amber-400 rounded-lg font-bold flex items-center gap-1 hover:bg-amber-500/25 transition-colors text-xs"
            >
              <Pause className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Held Bills</span>
              <span className="bg-amber-500 text-white dark:text-forest text-[10px] px-1.5 py-0.2 rounded-full font-black">
                {heldBills.length}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowHistoryModal(true)}
            className="px-2.5 py-1 border border-gray-200 dark:border-white/10 rounded-lg text-gray-600 dark:text-gray-300 font-semibold flex items-center gap-1.5 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-xs"
            title="Bill History"
          >
            <History className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Bill History</span>
          </button>
        </div>
      </div>

      {/* ── Mobile Navigation Tabs (visible only on mobile/tablet below 1024px) ── */}
      <div className="lg:hidden h-11 flex items-center border-b border-gray-200 dark:border-white/10 bg-white dark:bg-[#0c2e21] p-1 shrink-0 gap-1 select-none">
        <button
          type="button"
          onClick={() => setActiveMobileTab('catalog')}
          className={`flex-1 h-9 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeMobileTab === 'catalog'
              ? 'bg-forest text-white shadow-xs'
              : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
          }`}
        >
          <Package className="w-3.5 h-3.5 text-leaf shrink-0" />
          <span>Products ({filteredProducts.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveMobileTab('cart')}
          className={`flex-1 h-9 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeMobileTab === 'cart'
              ? 'bg-leaf text-white shadow-xs'
              : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
          <span>Cart ({cart.length}){cart.length > 0 ? ` • ₹${roundedGrandTotal}` : ''}</span>
        </button>
      </div>

      {/* ── Main POS Workspace: Split 65% Catalog / 35% Cart ── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* ── Left Pane: Product Catalog Grid ── */}
        <div className={`flex-1 flex flex-col border-r border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-[#071d15] overflow-hidden ${
          activeMobileTab === 'catalog' ? 'flex' : 'hidden lg:flex'
        }`}>
          {/* Search & Categories Bar */}
          <div className="p-3 bg-white dark:bg-[#0c2e21] border-b border-gray-200 dark:border-white/10 space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleBarcodeOrSearch}
                placeholder="Scan Barcode (USB) or type product name, brand, HSN..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-xs outline-none focus:ring-2 focus:ring-leaf font-medium"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'all', label: 'All Items' },
                { id: 'fertilizers', label: '🌾 Fertilizers' },
                { id: 'insecticides', label: '🐛 Insecticides' },
                { id: 'fungicides', label: '🍄 Fungicides' },
                { id: 'herbicides', label: '🌿 Herbicides' },
                { id: 'micronutrients', label: '🧪 Micronutrients' },
                { id: 'seeds', label: '🌱 Seeds' },
                { id: 'tools', label: '🛠️ Tools' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-2.5 py-1 rounded-lg font-semibold shrink-0 transition-colors text-[11px] ${
                    selectedCategory === c.id
                      ? 'bg-forest text-white'
                      : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="flex-1 overflow-y-auto p-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">
              {filteredProducts.map((p) => {
                const isOutOfStock = p.totalStock <= 0;
                const isLow = p.totalStock <= p.lowStockThreshold && !isOutOfStock;

                return (
                  <button
                    key={p.id}
                    disabled={isOutOfStock}
                    onClick={() => addToCart(p)}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all select-none ${
                      isOutOfStock
                        ? 'opacity-40 bg-gray-100 dark:bg-white/5 border-gray-200 cursor-not-allowed'
                        : 'bg-white dark:bg-[#0c2e21] border-gray-200/80 dark:border-white/10 hover:border-leaf hover:shadow-md active:scale-98 cursor-pointer'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase line-clamp-1">
                          {p.brand}
                        </span>
                        {p.isPesticide && (
                          <span className="text-[8px] bg-red-500/10 text-red-600 font-bold px-1 py-0.5 rounded shrink-0">
                            Pesticide
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-xs text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug">
                        {p.name}
                      </h4>
                      <p className="text-[10px] text-gray-500 mt-0.5 font-medium">{p.packSize}</p>

                      {/* Unit Variant Pills */}
                      {(() => {
                        const allVariants = buildProductVariants(p);
                        return allVariants.length > 1 ? (
                          <div className="mt-2 flex flex-wrap gap-1" onClick={(e) => e.stopPropagation()}>
                            {allVariants.map((v) => (
                              <button
                                key={v.id}
                                type="button"
                                disabled={isOutOfStock || v.multiplier > p.totalStock}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToCart(p, v);
                                }}
                                title={`Add ${v.unitName} - ₹${v.sellingPrice}`}
                                className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-leaf/10 hover:bg-leaf text-forest dark:text-emerald-300 hover:text-white transition-all disabled:opacity-40 border border-leaf/20"
                              >
                                {v.unitName}: ₹{v.sellingPrice}
                              </button>
                            ))}
                          </div>
                        ) : null;
                      })()}
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-1 flex-wrap" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(p, undefined, 'loose');
                        }}
                        className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-600 text-forest dark:text-emerald-300 hover:text-white transition-all border border-emerald-200/60 dark:border-emerald-800/60"
                        title="Add as loose sale"
                      >
                        ⚖️ Loose ({p.baseUnit || 'unit'})
                      </button>

                      {p.sellPerBaseUnit !== undefined && (
                        <span className="text-[9px] font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                          ₹{p.sellPerBaseUnit >= 1 ? p.sellPerBaseUnit.toFixed(2) : p.sellPerBaseUnit.toFixed(4)}/{p.baseUnit}
                        </span>
                      )}
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                      <div>
                        <span className="text-sm font-black text-forest dark:text-emerald-300">
                          ₹{p.sellingPrice}
                        </span>
                        {p.mrp > p.sellingPrice && (
                          <span className="text-[10px] text-gray-400 line-through ml-1">
                            ₹{p.mrp}
                          </span>
                        )}
                      </div>

                      {(() => {
                        const stockInfo = p.totalStockInBaseUnits !== undefined
                          ? formatBaseStockDisplay(p.totalStockInBaseUnits, p.packSizeInBaseUnit || 1, p.packageType || p.unit, p.baseUnit || 'g', p.packSizeUnit)
                          : formatStockDisplay(p.totalStock, p.packSize, p.unit);
                        return (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                              isOutOfStock
                                ? 'bg-red-500/10 text-red-600'
                                : isLow
                                ? 'bg-amber-500/10 text-amber-700'
                                : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                            }`}
                            title={stockInfo.secondary}
                          >
                            {stockInfo.primary}
                          </span>
                        );
                      })()}
                    </div>
                  </button>
                );
              })}

              {filteredProducts.length === 0 && (
                <div className="col-span-full py-16 text-center text-gray-400 text-xs">
                  No products found. Try scanning another barcode or clearing search.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right Pane: Active Cart & Billing Desk ── */}
        <div
          className={`w-full lg:w-[clamp(320px,28vw,390px)] xl:w-[clamp(360px,27vw,420px)] flex-col bg-white dark:bg-[#0c2e21] shadow-xl overflow-hidden shrink-0 min-w-0 ${
            activeMobileTab === 'cart' ? 'flex flex-1' : 'hidden lg:flex'
          }`}
        >
          {/* Mobile Back to Products Bar */}
          <div className="lg:hidden px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between text-xs shrink-0 select-none">
            <button
              type="button"
              onClick={() => setActiveMobileTab('catalog')}
              className="font-bold text-forest dark:text-emerald-300 hover:underline flex items-center gap-1.5 py-1"
            >
              ← Back to Product Catalog
            </button>
            <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
              {cart.length} item{cart.length !== 1 ? 's' : ''} in cart
            </span>
          </div>

          {/* Customer Selection Header */}
          <div className="p-2.5 sm:p-3 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 space-y-2 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-leaf shrink-0" /> Customer Account
              </span>
              <div className="flex items-center gap-2">
                {selectedCustomer && (
                  <button
                    type="button"
                    onClick={() => handleOpenEditCustomer(selectedCustomer)}
                    className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-0.5"
                    title="Edit selected customer details"
                  >
                    <Edit2 className="w-3 h-3" /> Edit Customer
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsQuickAddOpen(true)}
                  className="text-[11px] font-bold text-leaf hover:underline flex items-center gap-0.5"
                >
                  <UserPlus className="w-3 h-3" /> + Quick Add
                </button>
              </div>
            </div>

            <div className="relative">
              <input
                type="text"
                value={
                  selectedCustomer
                    ? `${selectedCustomer.name} (${selectedCustomer.phone}) - Due: ₹${selectedCustomer.currentDue}`
                    : customerSearch
                }
                onChange={(e) => {
                  setSelectedCustomer(null);
                  setCustomerSearch(e.target.value);
                  setShowCustomerDropdown(true);
                }}
                onFocus={() => setShowCustomerDropdown(true)}
                placeholder="Walk-in Customer (search name/phone)..."
                className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-white/15 bg-white dark:bg-black/30 text-xs outline-none focus:ring-2 focus:ring-leaf font-medium text-gray-900 dark:text-gray-100"
              />

              {selectedCustomer && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCustomer(null);
                    setCustomerSearch('');
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear customer selection"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Customer Dropdown */}
              {showCustomerDropdown && !selectedCustomer && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setShowCustomerDropdown(false)}
                  />
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-[#071d15] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl z-30 max-h-48 overflow-y-auto">
                    <div
                      onClick={() => {
                        setSelectedCustomer(null);
                        setCustomerSearch('');
                        setShowCustomerDropdown(false);
                      }}
                      className="p-2.5 hover:bg-gray-50 dark:hover:bg-white/5 text-xs font-bold cursor-pointer border-b border-gray-100 dark:border-white/5 flex items-center justify-between"
                    >
                      <span>🚶 Walk-in Counter Customer</span>
                      <span className="text-[10px] text-gray-400">Cash / UPI</span>
                    </div>

                    {customers
                      .filter(
                        (c) =>
                          c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                          c.phone.includes(customerSearch) ||
                          (c.village && c.village.toLowerCase().includes(customerSearch.toLowerCase()))
                      )
                      .map((c) => (
                        <div
                          key={c.id}
                          onClick={() => {
                            setSelectedCustomer(c);
                            setShowCustomerDropdown(false);
                          }}
                          className="p-2.5 hover:bg-gray-50 dark:hover:bg-white/5 text-xs cursor-pointer border-b border-gray-100 dark:border-white/5 flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-gray-900 dark:text-gray-100">{c.name}</div>
                            <div className="text-[10px] text-gray-500">{c.phone} • {c.village}</div>
                          </div>
                          <div className="text-right flex items-center gap-1.5">
                            <span
                              className={`text-[11px] font-black ${
                                c.currentDue > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400'
                              }`}
                            >
                              Due: ₹{c.currentDue}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditCustomer(c);
                              }}
                              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400 hover:text-amber-600 transition-colors"
                              title="Edit customer details"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 min-h-[140px] overflow-y-auto p-2.5 sm:p-3 space-y-2">
            {cart.map((item, cartIdx) => {
              const { lineTotal, lineProfit } = getItemLineStats(item);
              const isLoose = item.saleMode === 'loose';

              return (
                <div
                  key={`${item.productId}-${item.variantId || 'base'}-${item.saleMode || 'pack'}`}
                  className="p-2.5 sm:p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0c241b] text-xs flex flex-col gap-2 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-gray-900 dark:text-gray-100 text-xs sm:text-sm line-clamp-2 leading-tight">
                        {item.productName}
                      </h5>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-1.5 mt-1 font-medium">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                          {item.packageType || 'Pack'}: {item.packSize}
                        </span>
                        <span>•</span>
                        <span className="font-mono text-[9px] bg-gray-100 dark:bg-white/10 px-1 py-0.2 rounded">
                          {item.batchNumber}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(cartIdx)}
                      className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                      title="Remove item"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Mode Selector: Full Pack vs Loose Sale */}
                  <div className="flex items-center justify-between gap-1">
                    <div className="inline-flex items-center p-0.5 rounded-lg bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/10 text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => toggleSaleMode(cartIdx, 'pack')}
                        className={`px-2 py-0.5 rounded transition-all ${
                          !isLoose
                            ? 'bg-white dark:bg-emerald-700 text-forest dark:text-white shadow-2xs font-extrabold'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                      >
                        📦 Full Pack
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleSaleMode(cartIdx, 'loose')}
                        className={`px-2 py-0.5 rounded transition-all ${
                          isLoose
                            ? 'bg-emerald-600 text-white shadow-2xs font-extrabold'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                      >
                        ⚖️ Loose Sale
                      </button>
                    </div>

                    {lineProfit !== 0 && (
                      <span className={`text-[10px] font-semibold ${lineProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                        Profit: ₹{lineProfit.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Mode Specific Controls */}
                  {isLoose ? (
                    <div className="flex items-center justify-between pt-1.5 border-t border-gray-100 dark:border-white/5 gap-2 flex-wrap sm:flex-nowrap">
                      {/* Loose Quantity & Unit Selector */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="flex items-center rounded-lg border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-black/30 p-0.5">
                          <input
                            type="number"
                            min="0.01"
                            step="any"
                            value={item.looseQuantity ?? ''}
                            onChange={(e) => updateLooseQuantity(cartIdx, parseFloat(e.target.value) || 0)}
                            className="w-16 sm:w-20 px-2 py-1 text-xs font-bold text-center bg-white dark:bg-black/50 rounded border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-leaf font-mono"
                            placeholder="Qty"
                          />
                          <select
                            value={item.looseUnit || item.baseUnit || 'g'}
                            onChange={(e) => updateLooseQuantity(cartIdx, item.looseQuantity || 0, e.target.value)}
                            className="text-xs font-bold bg-transparent text-forest dark:text-emerald-300 px-1 py-1 outline-none cursor-pointer"
                          >
                            {item.baseUnit === 'ml' ? (
                              <>
                                <option value="ml">ml</option>
                                <option value="L">L</option>
                              </>
                            ) : item.baseUnit === 'g' ? (
                              <>
                                <option value="g">g</option>
                                <option value="kg">kg</option>
                              </>
                            ) : (
                              <option value="pcs">pcs</option>
                            )}
                          </select>
                        </div>
                      </div>

                      {/* Smallest Unit Rate & Line Total */}
                      <div className="flex items-center gap-2 min-w-0 justify-end flex-1">
                        <div className="text-right shrink-0">
                          <span className="text-[9px] text-gray-400 block uppercase font-bold tracking-wider">
                            Base Rate
                          </span>
                          <span className="text-[11px] font-mono font-bold text-gray-700 dark:text-gray-300 block">
                            ₹{(item.sellPerBaseUnit || 0) >= 1 ? (item.sellPerBaseUnit || 0).toFixed(2) : (item.sellPerBaseUnit || 0).toFixed(4)}/{item.baseUnit}
                          </span>
                        </div>

                        <div className="text-right min-w-[65px] shrink-0">
                          <span className="text-[9px] text-gray-400 block uppercase font-bold tracking-wider">
                            Total
                          </span>
                          <span className="font-black text-xs sm:text-sm text-forest dark:text-emerald-300 block mt-0.5">
                            ₹{lineTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-1.5 border-t border-gray-100 dark:border-white/5 gap-2">
                      {/* Quantity Stepper (>= 40px touch targets on mobile) */}
                      <div className="flex items-center gap-1 bg-gray-50 dark:bg-black/30 rounded-lg border border-gray-200 dark:border-white/10 p-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateQuantity(cartIdx, -1)}
                          className="w-10 h-10 sm:w-7 sm:h-7 flex items-center justify-center rounded bg-white dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20 text-gray-800 dark:text-gray-100 shadow-2xs font-bold transition-colors select-none"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                        </button>
                        <span className="w-8 text-center font-bold text-sm sm:text-xs text-gray-900 dark:text-white select-none">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(cartIdx, 1)}
                          className="w-10 h-10 sm:w-7 sm:h-7 flex items-center justify-center rounded bg-white dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20 text-gray-800 dark:text-gray-100 shadow-2xs font-bold transition-colors select-none"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                        </button>
                      </div>

                      {/* Manual Editable Rate & Line Total */}
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="text-right shrink-0">
                          <label className="text-[9px] text-gray-400 block uppercase font-bold tracking-wider">
                            Rate (₹)
                          </label>
                          <div className="flex items-center gap-0.5 justify-end mt-0.5">
                            <span className="text-[11px] font-bold text-gray-400">₹</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.unitPrice}
                              onChange={(e) => updateItemPrice(cartIdx, parseFloat(e.target.value) || 0)}
                              className="w-16 sm:w-18 px-1.5 py-0.5 text-xs font-bold text-right rounded border border-gray-300 dark:border-white/15 bg-white dark:bg-black/30 text-forest dark:text-emerald-300 focus:outline-none focus:ring-1 focus:ring-leaf shadow-2xs"
                              title="Click to manually override selling price per unit"
                            />
                          </div>
                        </div>

                        <div className="text-right min-w-[55px] sm:min-w-[65px] shrink-0">
                          <span className="text-[9px] text-gray-400 block uppercase font-bold tracking-wider">
                            Total
                          </span>
                          <span className="font-black text-xs sm:text-sm text-forest dark:text-emerald-300 block mt-0.5">
                            ₹{lineTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {cart.length === 0 && (
              <div className="py-16 text-center text-gray-400 text-xs">
                <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30 text-forest dark:text-leaf" />
                <p className="font-bold text-gray-600 dark:text-gray-300">Cart is empty</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Scan a barcode or tap products from catalog to start billing
                </p>
              </div>
            )}
          </div>

          {/* Cart Summary & Checkout */}
          <div className="p-2.5 sm:p-3 bg-gray-50 dark:bg-white/5 border-t border-gray-200 dark:border-white/10 space-y-2 shrink-0 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
            {/* Billing Adjustments: Customer Discount, Extra Charges (Zero Tax for all) */}
            <div className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-black/20 border border-gray-200/80 dark:border-white/10 space-y-1.5">
              {/* Customer Discount & Extra Expense Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block mb-0.5">
                    Customer Discount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={overallDiscount || ''}
                    onChange={(e) => setOverallDiscount(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full px-2 py-1 rounded-lg border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-bold text-xs outline-none focus:ring-1 focus:ring-leaf text-emerald-700 dark:text-emerald-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block mb-0.5">
                    Extra Expense (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={extraCharge || ''}
                    onChange={(e) => setExtraCharge(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full px-2 py-1 rounded-lg border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-bold text-xs outline-none focus:ring-1 focus:ring-leaf text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              {extraCharge > 0 && (
                <div className="pt-1">
                  <input
                    type="text"
                    placeholder="Charge reason (e.g., Carry bag, Delivery, Hamali)"
                    value={extraChargeReason}
                    onChange={(e) => setExtraChargeReason(e.target.value)}
                    className="w-full px-2 py-1 rounded-lg border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-[11px] outline-none focus:ring-1 focus:ring-leaf text-gray-700 dark:text-gray-300"
                  />
                </div>
              )}
            </div>

            {/* Subtotal & Round-off (GST Removed / Zero Tax) */}
            <div className="space-y-0.5 text-gray-600 dark:text-gray-400 text-[11px]">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  ₹{rawSubtotal.toLocaleString('en-IN')}
                </span>
              </div>
              {overallDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-semibold">
                  <span>Customer Discount:</span>
                  <span>-₹{overallDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              {extraCharge > 0 && (
                <div className="flex justify-between text-amber-700 dark:text-amber-400 font-semibold">
                  <span>Extra Expense {extraChargeReason ? `(${extraChargeReason})` : ''}:</span>
                  <span>+₹{Number(extraCharge).toFixed(2)}</span>
                </div>
              )}
              {roundOff !== 0 && (
                <div className="flex justify-between text-[10px]">
                  <span>Round-off:</span>
                  <span>{roundOff > 0 ? `+₹${roundOff}` : `-₹${Math.abs(roundOff)}`}</span>
                </div>
              )}
            </div>

            {/* Grand Total */}
            <div className="p-2.5 rounded-xl bg-forest dark:bg-[#07241b] text-white flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] text-emerald-200 uppercase font-bold tracking-wider block">
                  Grand Total Payable
                </span>
                <span className="text-xl font-black text-harvest leading-none">
                  ₹{roundedGrandTotal.toLocaleString('en-IN')}
                </span>
                {totalBillProfit !== 0 && (
                  <span className="text-[10px] text-emerald-200 font-bold block mt-0.5">
                    Est. Margin Profit: ₹{totalBillProfit.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Hold Button */}
              <button
                type="button"
                disabled={cart.length === 0}
                onClick={handleHoldBill}
                className="px-2.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center gap-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed select-none"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Hold (F8)</span>
              </button>
            </div>

            {/* Payment Modes (2x2 on mobile, 4 columns on tablet/desktop) */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Payment Mode
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {(['cash', 'upi', 'credit', 'split'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      setPaymentMode(mode);
                      if (mode === 'upi') setShowUPIModal(true);
                      if (mode === 'split') {
                        setSplitCash(roundedGrandTotal);
                        setSplitUPI(0);
                        setSplitCredit(0);
                      }
                    }}
                    className={`min-h-[42px] py-2 px-1.5 rounded-xl font-black text-xs uppercase transition-all flex items-center justify-center gap-1 select-none ${
                      paymentMode === mode
                        ? 'bg-leaf text-white shadow-xs ring-2 ring-leaf/40'
                        : 'bg-white dark:bg-[#103325] border border-gray-300 dark:border-white/15 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10'
                    }`}
                  >
                    {mode === 'cash' && <span>💵 Cash</span>}
                    {mode === 'upi' && <span>⚡ UPI</span>}
                    {mode === 'credit' && <span>📝 Udhaar</span>}
                    {mode === 'split' && <span>🔀 Split</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Split inputs if split mode */}
            {paymentMode === 'split' && (
              <div className="p-2.5 rounded-xl bg-white dark:bg-black/30 border border-gray-200 dark:border-white/10 space-y-2 text-xs">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-500 dark:text-gray-400 font-bold block mb-0.5">Cash (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={splitCash || ''}
                      onChange={(e) => setSplitCash(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full px-2 py-1 rounded-lg border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-bold text-xs outline-none focus:ring-1 focus:ring-leaf text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 dark:text-gray-400 font-bold block mb-0.5">UPI (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={splitUPI || ''}
                      onChange={(e) => setSplitUPI(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full px-2 py-1 rounded-lg border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-bold text-xs outline-none focus:ring-1 focus:ring-leaf text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 dark:text-gray-400 font-bold block mb-0.5">Udhaar (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={splitCredit || ''}
                      onChange={(e) => setSplitCredit(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full px-2 py-1 rounded-lg border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5 font-bold text-xs outline-none focus:ring-1 focus:ring-leaf text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>

                {/* Split Allocation Helper */}
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-gray-100 dark:border-white/5">
                  {splitCash + splitUPI + splitCredit === roundedGrandTotal ? (
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      ✓ Balanced: ₹{roundedGrandTotal} fully allocated
                    </span>
                  ) : splitCash + splitUPI + splitCredit < roundedGrandTotal ? (
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-amber-600 dark:text-amber-400">
                        Remaining: ₹{roundedGrandTotal - (splitCash + splitUPI + splitCredit)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSplitCash(roundedGrandTotal - (splitUPI + splitCredit))}
                        className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold hover:bg-amber-500/20 text-[10px] transition-colors"
                      >
                        + Auto-Fill Cash
                      </button>
                    </div>
                  ) : (
                    <span className="font-bold text-red-500">
                      ⚠ Over-allocated by ₹{(splitCash + splitUPI + splitCredit) - roundedGrandTotal}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Checkout Action */}
            <button
              type="button"
              disabled={cart.length === 0 || isCheckingOut}
              onClick={handleCheckout}
              className="w-full min-h-[46px] py-3 rounded-xl bg-leaf hover:bg-forest text-white font-black text-sm shadow-md hover:shadow-lg transition-transform active:scale-98 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed select-none"
            >
              {isCheckingOut ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing Bill Memo...</span>
                </>
              ) : (
                <>
                  <Receipt className="w-4 h-4" />
                  <span>GENERATE BILL (F4) • ₹{roundedGrandTotal}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Floating Cart Bar (when browsing products with items in cart) ── */}
      {activeMobileTab === 'catalog' && cart.length > 0 && (
        <div className="lg:hidden fixed bottom-3 left-3 right-3 z-40 bg-forest text-white p-3 rounded-2xl shadow-2xl flex items-center justify-between border border-leaf/40 backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-leaf flex items-center justify-center font-bold text-xs shadow-inner">
              {cart.reduce((s, it) => s + it.quantity, 0)}
            </div>
            <div>
              <span className="text-[10px] text-emerald-200 block uppercase font-bold tracking-wider">
                Payable Amount
              </span>
              <span className="text-sm font-black text-harvest">
                ₹{roundedGrandTotal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveMobileTab('cart')}
            className="px-4 py-2 bg-leaf hover:bg-emerald-600 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all text-white"
          >
            <span>View Cart & Pay</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Dynamic UPI QR Code Modal ── */}
      {showUPIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0c2e21] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 max-w-sm w-full p-6 text-center animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-forest dark:text-emerald-300 text-base flex items-center gap-2">
                <QrCode className="w-5 h-5 text-leaf" /> Scan to Pay via UPI
              </h3>
              <button
                onClick={() => setShowUPIModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-white rounded-xl shadow-inner border border-gray-200 inline-block mb-3">
              <img
                src={upiQrImgUrl}
                alt="UPI Payment QR"
                className="w-48 h-48 mx-auto"
              />
            </div>

            <div className="text-xs space-y-1 mb-4">
              <p className="font-bold text-gray-800 dark:text-gray-200">
                Amount: <span className="text-forest dark:text-emerald-300 font-black text-sm">₹{roundedGrandTotal}</span>
              </p>
              <p className="text-[11px] text-gray-500 font-mono">UPI ID: {upiId}</p>
              <p className="text-[10px] text-gray-400">Google Pay • PhonePe • Paytm • BHIM</p>
            </div>

            <button
              onClick={() => setShowUPIModal(false)}
              className="w-full py-2 bg-leaf text-white font-bold rounded-xl text-xs"
            >
              Confirm Received & Close
            </button>
          </div>
        </div>
      )}

      {/* ── Quick Add Customer Modal ── */}
      {isQuickAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0c2e21] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 max-w-sm w-full p-5 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-forest dark:text-emerald-300 text-sm flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-leaf" /> Quick Add Farmer
              </h3>
              <button
                onClick={() => setIsQuickAddOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickAddCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Farmer / Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCustomerForm.name}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                  placeholder="e.g. Subir Sarkar"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none font-medium text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="text"
                  required
                  value={newCustomerForm.phone}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                  placeholder="e.g. 9832100000"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none font-medium text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Village / Para
                </label>
                <input
                  type="text"
                  value={newCustomerForm.village}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, village: e.target.value })}
                  placeholder="Chapmatali"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 outline-none font-medium text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuickAddOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-leaf text-white font-bold"
                >
                  Save & Select
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Customer Modal ── */}
      {isEditCustomerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0c2e21] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 max-w-sm w-full p-5 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100 dark:border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-forest dark:text-emerald-300 text-sm leading-tight">
                    Edit Customer Details
                  </h3>
                  <p className="text-[10px] text-gray-500">ID: {editCustomerForm.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditCustomerOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {customerEditError && (
              <div className="mb-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold">
                {customerEditError}
              </div>
            )}

            <form onSubmit={handleSaveCustomerEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Farmer / Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={editCustomerForm.name}
                  onChange={(e) => setEditCustomerForm({ ...editCustomerForm, name: e.target.value })}
                  placeholder="e.g. Subrata Roy"
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-white/15 bg-gray-50 dark:bg-white/5 outline-none font-medium text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={editCustomerForm.phone}
                  onChange={(e) => setEditCustomerForm({ ...editCustomerForm, phone: e.target.value })}
                  placeholder="10 digit number"
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-white/15 bg-gray-50 dark:bg-white/5 outline-none font-medium text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Village / Para
                </label>
                <input
                  type="text"
                  value={editCustomerForm.village}
                  onChange={(e) => setEditCustomerForm({ ...editCustomerForm, village: e.target.value })}
                  placeholder="Chapmatali, etc."
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-white/15 bg-gray-50 dark:bg-white/5 outline-none font-medium text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Credit Limit (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={editCustomerForm.creditLimit}
                    onChange={(e) =>
                      setEditCustomerForm({ ...editCustomerForm, creditLimit: Number(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-white/15 bg-gray-50 dark:bg-white/5 outline-none font-medium text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Current Due (বাকি)
                  </label>
                  <div className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/5 bg-gray-100 dark:bg-black/30 font-black text-amber-600 dark:text-amber-400 text-xs flex items-center">
                    ₹{editCustomerForm.currentDue.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Notes / Remarks
                </label>
                <textarea
                  rows={2}
                  value={editCustomerForm.notes}
                  onChange={(e) => setEditCustomerForm({ ...editCustomerForm, notes: e.target.value })}
                  placeholder="Optional notes"
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-white/15 bg-gray-50 dark:bg-white/5 outline-none font-medium text-gray-900 dark:text-gray-100 resize-none"
                />
              </div>

              <div className="pt-2 border-t border-gray-100 dark:border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditCustomerOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 font-semibold hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingCustomerEdit}
                  className="px-4 py-1.5 rounded-lg bg-leaf hover:bg-forest text-white font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSavingCustomerEdit ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Held Bills Modal ── */}
      {showHeldBillsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0c2e21] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 max-w-md w-full p-5 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-forest dark:text-emerald-300 text-sm flex items-center gap-2">
                <Pause className="w-4 h-4 text-amber-500" /> Parked & Held Bills
              </h3>
              <button
                onClick={() => setShowHeldBillsModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {heldBills.map((h) => {
                const total = h.items.reduce((acc, i) => acc + getItemLineStats(i).lineTotal, 0);
                return (
                  <div
                    key={h.id}
                    className="p-3 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-gray-900 dark:text-gray-100">{h.customerName}</div>
                      <div className="text-[10px] text-gray-500">{h.heldAt} • {h.items.length} items</div>
                      <div className="text-leaf font-bold mt-0.5">₹{Math.round(total)}</div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDeleteHeldBill(h.id)}
                        className="px-2 py-1.5 rounded-lg border border-red-200 dark:border-red-900/50 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        title="Discard held bill"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleResumeBill(h)}
                        className="px-3 py-1.5 bg-leaf text-white rounded-lg font-bold flex items-center gap-1 hover:bg-forest transition-colors shadow-2xs"
                      >
                        <Play className="w-3.5 h-3.5" /> Resume
                      </button>
                    </div>
                  </div>
                );
              })}

              {heldBills.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-xs">
                  No parked bills on hold.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Bill History Modal ── */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0c2e21] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 max-w-2xl w-full p-5 sm:p-6 max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-white/10">
              <h3 className="font-black text-forest dark:text-emerald-300 text-base flex items-center gap-2">
                <History className="w-5 h-5 text-leaf" /> Recent Sales History
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search filter for past bills */}
            <div className="py-2.5">
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search recent sales by invoice # or customer name/phone..."
                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-xs outline-none focus:ring-1 focus:ring-leaf font-medium text-gray-900 dark:text-gray-100"
              />
            </div>

            <div className="flex-1 overflow-y-auto py-1 space-y-2">
              {pastSales
                .filter((sale) => {
                  if (!historySearch.trim()) return true;
                  const q = historySearch.toLowerCase().trim();
                  return (
                    sale.invoiceNumber.toLowerCase().includes(q) ||
                    sale.customerName.toLowerCase().includes(q) ||
                    (sale.customerPhone && sale.customerPhone.includes(q))
                  );
                })
                .map((sale) => (
                  <div
                    key={sale.id}
                    className="p-3 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-gray-900 dark:text-gray-100">
                          #{sale.invoiceNumber}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            sale.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                              : 'bg-red-500/10 text-red-600'
                          }`}
                        >
                          {sale.status}
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 uppercase">
                          {sale.paymentMode}
                        </span>
                      </div>
                      <div className="text-gray-600 dark:text-gray-400 mt-0.5">
                        {sale.customerName} • {new Date(sale.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-black text-sm text-forest dark:text-emerald-300">
                        ₹{sale.grandTotal}
                      </span>
                      <button
                        onClick={() => {
                          setActiveInvoice(sale);
                          setShowHistoryModal(false);
                          setShowInvoiceModal(true);
                        }}
                        className="px-2.5 py-1 rounded-lg border border-leaf/30 text-leaf font-bold hover:bg-leaf hover:text-white transition-colors"
                      >
                        View Bill
                      </button>
                    </div>
                  </div>
                ))}

              {pastSales.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-xs">
                  No sales history found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Professional Retail Cash Memo / Invoice Modal (Zero Tax) ── */}
      {showInvoiceModal && activeInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs">
          {/* Dynamic Print CSS for Thermal 58mm, Thermal 80mm, and A4 */}
          <style>{`
            @media print {
              @page {
                size: ${printFormat === 'thermal58' ? '58mm auto' : printFormat === 'thermal80' ? '80mm auto' : 'auto'};
                margin: ${printFormat === 'a4' ? '10mm' : '1mm 2mm'};
              }
              body {
                background: #ffffff !important;
                color: #000000 !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              body * {
                visibility: hidden;
              }
              #printable-invoice-container, #printable-invoice-container * {
                visibility: visible;
              }
              #printable-invoice-container {
                position: absolute;
                left: 0;
                top: 0;
                width: ${printFormat === 'thermal58' ? '50mm' : printFormat === 'thermal80' ? '72mm' : '100%'} !important;
                max-width: ${printFormat === 'thermal58' ? '50mm' : printFormat === 'thermal80' ? '72mm' : '100%'} !important;
                padding: ${printFormat === 'a4' ? '8mm' : '2mm'} !important;
                margin: 0 !important;
                border: none !important;
                box-shadow: none !important;
                font-size: ${printFormat === 'thermal58' ? '8.5px' : printFormat === 'thermal80' ? '9.5px' : '11px'} !important;
                line-height: ${printFormat === 'thermal58' ? '1.2' : '1.3'} !important;
              }
              .print-no-border {
                border: none !important;
              }
            }
          `}</style>

          <div className="bg-white text-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Actions Bar (No Print) */}
            <div className="p-3 bg-gray-100 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2 text-xs print:hidden">
              <div className="flex items-center gap-1 font-bold text-gray-700">
                <span className="mr-1 text-gray-500">Format:</span>
                <button
                  type="button"
                  onClick={() => setPrintFormat('thermal58')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    printFormat === 'thermal58'
                      ? 'bg-forest text-white shadow-xs'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Thermal (58mm)
                </button>
                <button
                  type="button"
                  onClick={() => setPrintFormat('thermal80')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    printFormat === 'thermal80'
                      ? 'bg-forest text-white shadow-xs'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Thermal (80mm)
                </button>
                <button
                  type="button"
                  onClick={() => setPrintFormat('a4')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    printFormat === 'a4'
                      ? 'bg-forest text-white shadow-xs'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Standard A4
                </button>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={getWhatsAppInvoiceLink(activeInvoice)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1 shadow-xs transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" /> WhatsApp
                </a>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-forest hover:bg-leaf text-white rounded-lg font-bold flex items-center gap-1 shadow-xs transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="p-1 text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Invoice Container */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-100 flex justify-center">
              <div
                id="printable-invoice-container"
                className={`bg-white text-gray-900 border border-gray-200 shadow-md p-4 transition-all ${
                  printFormat === 'thermal58'
                    ? 'w-[320px] max-w-[320px] font-mono text-[10px] leading-snug'
                    : printFormat === 'thermal80'
                    ? 'w-[420px] max-w-[420px] font-mono text-[11px] leading-normal'
                    : 'w-full max-w-xl font-sans text-xs'
                }`}
              >
                {/* Header */}
                <div className="text-center pb-2.5 border-b-2 border-dashed border-gray-400">
                  <h2 className="text-base sm:text-lg font-black tracking-tight uppercase">
                    Ahammed Fertilizer
                  </h2>
                  <p className="text-[10px] font-semibold text-gray-700">
                    Fertilizers • Pesticides • Hybrid Seeds • Micronutrients
                  </p>
                  <p className="text-[9px] text-gray-600 leading-tight">
                    Nandair, Puliyapara, Chapmatali, Dakshin Dinajpur, WB - 733124
                  </p>
                  <p className="text-[9px] font-bold text-gray-800">
                    Phone: +91 90910 17035
                  </p>
                  <div className="text-[8px] text-gray-500 mt-0.5">
                    Fert. Lic: {settings?.fertilizerLicence || 'FERT/WB/DD/2022/458'} | Pest. Lic: {settings?.pesticideLicence || 'PEST/DD/RET/2021/892'}
                  </div>
                  <div className="mt-1 text-[9px] font-black uppercase tracking-wider text-gray-700 bg-gray-100 py-0.5 rounded">
                    Retail Cash Memo / Invoice
                  </div>
                </div>

                {/* Bill Details */}
                <div className="py-2 border-b border-dashed border-gray-300 grid grid-cols-2 gap-1 text-[10px]">
                  <div>
                    <div><strong>Inv:</strong> #{activeInvoice.invoiceNumber}</div>
                    <div><strong>Date:</strong> {new Date(activeInvoice.createdAt).toLocaleDateString('en-IN')} {new Date(activeInvoice.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                    <div><strong>Cashier:</strong> {activeInvoice.cashierName}</div>
                  </div>
                  <div className="text-right">
                    <div><strong>Farmer:</strong> {activeInvoice.customerName}</div>
                    <div><strong>Village:</strong> {activeInvoice.customerVillage || 'Chapmatali'}</div>
                    <div><strong>Pay:</strong> <span className="uppercase font-bold">{activeInvoice.paymentMode}</span></div>
                  </div>
                </div>

                {/* Items Layout */}
                {printFormat === 'thermal58' ? (
                  <div className="py-2 border-b border-dashed border-gray-300 space-y-1.5 text-[9.5px]">
                    <div className="font-bold flex justify-between border-b border-gray-300 pb-0.5 text-gray-600 uppercase">
                      <span>Item Details</span>
                      <span>Total</span>
                    </div>
                    {activeInvoice.items.map((it, idx) => (
                      <div key={idx} className="pb-1 border-b border-gray-100 last:border-b-0">
                        <div className="font-bold text-gray-900 break-words leading-tight">
                          {it.productName}
                        </div>
                        <div className="flex justify-between items-center text-[9px] text-gray-600 pt-0.5">
                          <span>
                            {it.quantity} {it.unit} @ ₹{it.unitPrice}
                            {it.batchNumber ? ` [B:${it.batchNumber}]` : ''}
                          </span>
                          <span className="font-bold text-gray-900">
                            ₹{Math.round(it.totalAmount)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : printFormat === 'thermal80' ? (
                  /* 80mm Layout: Compact 4-column layout */
                  <div className="py-2 border-b border-dashed border-gray-300">
                    <table className="w-full text-left text-[10.5px]">
                      <thead>
                        <tr className="border-b border-gray-300 font-bold text-gray-600 uppercase text-[9px]">
                          <th className="pb-1">Item</th>
                          <th className="pb-1 text-center">Qty</th>
                          <th className="pb-1 text-right">Rate</th>
                          <th className="pb-1 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {activeInvoice.items.map((it, idx) => (
                          <tr key={idx} className="py-0.5">
                            <td className="py-1 pr-1 break-words leading-tight">
                              <span className="font-bold">{it.productName}</span>
                              <div className="text-[8.5px] text-gray-500">
                                {it.unit} {it.batchNumber ? `• B:${it.batchNumber}` : ''}
                              </div>
                            </td>
                            <td className="py-1 text-center font-bold">{it.quantity}</td>
                            <td className="py-1 text-right">₹{it.unitPrice}</td>
                            <td className="py-1 text-right font-bold">₹{Math.round(it.totalAmount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* A4 Standard Table Layout (Clean without GST column) */
                  <div className="py-2 border-b border-gray-200">
                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className="border-b border-gray-300 text-[10px] uppercase font-bold text-gray-600">
                          <th className="pb-1">Item Description</th>
                          <th className="pb-1 text-center">HSN</th>
                          <th className="pb-1 text-center">Qty</th>
                          <th className="pb-1 text-right">Rate</th>
                          <th className="pb-1 text-right">Total Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {activeInvoice.items.map((it, idx) => (
                          <tr key={idx} className="py-1">
                            <td className="py-1">
                              <div className="font-bold">{it.productName}</div>
                              <span className="text-[9px] text-gray-500">
                                {it.unit} {it.batchNumber ? `• B:${it.batchNumber}` : ''}
                              </span>
                            </td>
                            <td className="py-1 text-center font-mono text-[10px]">{it.hsnCode}</td>
                            <td className="py-1 text-center font-bold">{it.quantity}</td>
                            <td className="py-1 text-right">₹{it.unitPrice}</td>
                            <td className="py-1 text-right font-bold">₹{Math.round(it.totalAmount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Totals Breakdown (Zero Tax / Clean Cash Memo) */}
                <div className="pt-2 space-y-1 text-[10.5px]">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{activeInvoice.subtotal.toFixed(2)}</span>
                  </div>

                  {activeInvoice.discountAmount > 0 && (
                    <div className="flex justify-between font-bold text-emerald-700">
                      <span>Customer Discount:</span>
                      <span>-₹{activeInvoice.discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {activeInvoice.extraCharge && activeInvoice.extraCharge > 0 ? (
                    <div className="flex justify-between font-semibold text-gray-800">
                      <span>Extra ({activeInvoice.extraChargeReason || 'Charges'}):</span>
                      <span>+₹{activeInvoice.extraCharge.toFixed(2)}</span>
                    </div>
                  ) : null}

                  {activeInvoice.roundOff !== 0 && (
                    <div className="flex justify-between text-[9px] text-gray-500">
                      <span>Round-off:</span>
                      <span>₹{activeInvoice.roundOff}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm sm:text-base font-black border-t-2 border-gray-900 pt-1.5 mt-1">
                    <span>GRAND TOTAL:</span>
                    <span>₹{activeInvoice.grandTotal}</span>
                  </div>
                </div>

                {/* Total in words */}
                <div className="mt-2 p-1.5 bg-gray-50 rounded text-[9px] font-semibold text-gray-700 italic border border-gray-100">
                  Words: {numberToIndianWords(activeInvoice.grandTotal)}
                </div>

                {/* Footer Declaration */}
                <div className="mt-3 pt-2 border-t border-dashed border-gray-300 text-center text-[8.5px] text-gray-500 leading-tight">
                  <p>Goods once sold cannot be returned after 7 days or if seal broken.</p>
                  <p className="font-bold text-gray-800 mt-0.5">THANK YOU FOR YOUR PATRONAGE! HAPPY FARMING!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
