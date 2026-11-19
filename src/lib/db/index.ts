import fs from 'fs/promises';
import path from 'path';
import { getCloudData, saveCloudData } from '../cloud-store';
import {
  AdminUser,
  ShopSettings,
  CategoryRecord,
  ProductRecord,
  ProductBatch,
  StockMovementRecord,
  SupplierRecord,
  PurchaseRecord,
  CustomerRecord,
  CustomerLedgerEntry,
  SaleRecord,
  ExpenseRecord,
  AuditLogRecord,
  DashboardMetrics,
} from '@/types/admin';
import {
  INITIAL_SETTINGS,
  INITIAL_USERS,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_BATCHES,
  INITIAL_SUPPLIERS,
  INITIAL_CUSTOMERS,
  INITIAL_SALES,
  INITIAL_EXPENSES,
} from './seed-data';
import {
  parsePackSize,
  buildProductVariants,
  calculateOpeningBaseStock,
} from '../inventory/units';
import {
  calculateBaseUnitPricing,
  calculateLooseSale,
  convertPackSizeToBaseUnit,
  formatBaseStockDisplay,
  roundToDecimals,
  PackSizeUnit,
  BaseUnit,
} from '../inventory/unit-calculator';

interface AdminStore {
  settings: ShopSettings;
  users: AdminUser[];
  categories: CategoryRecord[];
  products: ProductRecord[];
  batches: ProductBatch[];
  movements: StockMovementRecord[];
  suppliers: SupplierRecord[];
  purchases: PurchaseRecord[];
  customers: CustomerRecord[];
  ledger: CustomerLedgerEntry[];
  sales: SaleRecord[];
  expenses: ExpenseRecord[];
  auditLogs: AuditLogRecord[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'admin-store.json');

let inMemoryStore: AdminStore | null = null;

function migrateStoreToBaseWeight(store: AdminStore): boolean {
  let modified = false;
  const isMigrated = (store.settings as any).isStockBaseWeightMigrated;

  if (!isMigrated) {
    for (const p of store.products) {
      const parsed = parsePackSize(p.packSize, p.unit);
      // If product is weight-based (e.g. 50 kg or 45 kg bag) and was previously stored in raw bags
      if ((p.unit === 'bag' || parsed.isWeightBased) && parsed.baseMultiplier > 1) {
        if (typeof p.totalStock === 'number') {
          const oldStock = p.totalStock;
          p.totalStock = Math.round(oldStock * parsed.baseMultiplier * 100) / 100;
          modified = true;

          // Also scale batches for this product
          const pBatches = store.batches.filter((b) => b.productId === p.id);
          for (const b of pBatches) {
            b.quantityAvailable = Math.round(b.quantityAvailable * parsed.baseMultiplier * 100) / 100;
          }
        }
      }
    }
    (store.settings as any).isStockBaseWeightMigrated = true;
    modified = true;
  }

  // Always ensure variants are properly constructed with primary unit
  for (const p of store.products) {
    const beforeVariants = JSON.stringify(p.variants || []);
    p.variants = buildProductVariants(p);
    const afterVariants = JSON.stringify(p.variants);
    if (beforeVariants !== afterVariants) {
      modified = true;
    }
  }
  return modified;
}

function migrateStoreToBaseUnitCalculations(store: AdminStore): boolean {
  let modified = false;

  for (const p of store.products) {
    if (
      p.buyPerBaseUnit === undefined ||
      p.sellPerBaseUnit === undefined ||
      p.packSizeInBaseUnit === undefined ||
      p.totalStockInBaseUnits === undefined
    ) {
      const packStr = (p.packSize || '').trim();
      const numMatch = packStr.match(/(\d+(\.\d+)?)/);
      const parsedNum = numMatch ? parseFloat(numMatch[1]) : 1;

      let detectedUnit: PackSizeUnit = 'pcs';
      const lower = `${packStr} ${p.unit || ''}`.toLowerCase();
      if (lower.includes('ml') || lower.includes('milli')) {
        detectedUnit = 'ml';
      } else if (lower.includes('litre') || lower.includes('ltr') || lower.includes('liter') || (lower.includes(' l') && !lower.includes('ml'))) {
        detectedUnit = 'L';
      } else if (lower.includes('kg') || lower.includes('kilo')) {
        detectedUnit = 'kg';
      } else if (lower.includes(' g') || lower.includes('gm') || lower.includes('gram')) {
        detectedUnit = 'g';
      } else if (p.unit === 'bag' || p.unit === 'kg') {
        detectedUnit = 'kg';
      } else if (p.unit === 'bottle' || p.unit === 'litre') {
        detectedUnit = 'ml';
      }

      let pkgType = 'Pack';
      if (p.unit === 'bottle' || lower.includes('bottle')) pkgType = 'Bottle';
      else if (p.unit === 'bag' || lower.includes('bag')) pkgType = 'Bag';
      else if (p.unit === 'packet' || lower.includes('packet')) pkgType = 'Packet';
      else if (p.unit === 'piece') pkgType = 'Piece';

      const pricing = calculateBaseUnitPricing({
        name: p.name,
        packageType: p.packageType || pkgType,
        packSize: p.packSizeValue || parsedNum,
        packSizeUnit: p.packSizeUnit || detectedUnit,
        buyingPrice: p.purchasePrice,
        sellingPrice: p.sellingPrice,
      });

      p.packageType = pricing.packageType;
      p.packSizeValue = pricing.packSize;
      p.packSizeUnit = pricing.packSizeUnit;
      p.baseUnit = pricing.baseUnit;
      p.packSizeInBaseUnit = pricing.packSizeInBaseUnit;
      p.buyPerBaseUnit = pricing.buyPerBaseUnit;
      p.sellPerBaseUnit = pricing.sellPerBaseUnit;
      p.profitPerBaseUnit = pricing.profitPerBaseUnit;
      p.profitPerPack = pricing.profitPerPack;
      p.displayUnit = pricing.displayUnit;
      p.buyPerDisplayUnit = pricing.buyPerDisplayUnit;
      p.sellPerDisplayUnit = pricing.sellPerDisplayUnit;
      p.profitPerDisplayUnit = pricing.profitPerDisplayUnit;

      if (p.totalStockInBaseUnits === undefined) {
        if (pricing.baseUnit === 'ml') {
          p.totalStockInBaseUnits = p.unit === 'litre' ? p.totalStock * 1000 : (p.totalStock <= 20 ? p.totalStock * 1000 : p.totalStock * pricing.packSizeInBaseUnit);
        } else if (pricing.baseUnit === 'g') {
          p.totalStockInBaseUnits = p.totalStock > 100 ? p.totalStock * 1000 : p.totalStock * pricing.packSizeInBaseUnit;
        } else {
          p.totalStockInBaseUnits = p.totalStock;
        }
      }

      modified = true;
    }
  }

  return modified;
}

// Initialize or load the store (Synced live with Supabase cloud across Vercel)
async function loadStore(): Promise<AdminStore> {
  const defaultInit = (): AdminStore => ({
    settings: INITIAL_SETTINGS,
    users: INITIAL_USERS,
    categories: INITIAL_CATEGORIES,
    products: INITIAL_PRODUCTS,
    batches: INITIAL_BATCHES,
    movements: [],
    suppliers: INITIAL_SUPPLIERS,
    purchases: [],
    customers: INITIAL_CUSTOMERS,
    ledger: [],
    sales: INITIAL_SALES,
    expenses: INITIAL_EXPENSES,
    auditLogs: [],
  });

  const store = await getCloudData<AdminStore>('admin-store', STORE_FILE, defaultInit);
  const didMigrate1 = migrateStoreToBaseWeight(store);
  const didMigrate2 = migrateStoreToBaseUnitCalculations(store);
  if (didMigrate1 || didMigrate2) {
    await persistStore(store);
  }
  inMemoryStore = store;
  return store;
}

async function persistStore(store: AdminStore): Promise<void> {
  inMemoryStore = store;
  await saveCloudData('admin-store', STORE_FILE, store);
}

/* ============================================================================
   REPOSITORY METHODS
   ============================================================================ */

export const db = {
  // Settings
  async getSettings(): Promise<ShopSettings> {
    const store = await loadStore();
    return store.settings;
  },

  async updateSettings(updates: Partial<ShopSettings>): Promise<ShopSettings> {
    const store = await loadStore();
    store.settings = { ...store.settings, ...updates, updatedAt: new Date().toISOString() };
    await persistStore(store);
    return store.settings;
  },

  // Users
  async getUsers(): Promise<AdminUser[]> {
    const store = await loadStore();
    return store.users;
  },

  async getUserByEmail(email: string): Promise<AdminUser | undefined> {
    const store = await loadStore();
    return store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  async getUserById(id: string): Promise<AdminUser | undefined> {
    const store = await loadStore();
    return store.users.find((u) => u.id === id);
  },

  // Categories
  async getCategories(): Promise<CategoryRecord[]> {
    const store = await loadStore();
    return store.categories;
  },

  // Products
  async getProducts(): Promise<ProductRecord[]> {
    const store = await loadStore();
    // Attach batches, compute stock, and ensure variants list includes primary pack
    return store.products.map((p) => {
      const pBatches = store.batches.filter((b) => b.productId === p.id);
      const computedStock = pBatches.reduce((acc, b) => acc + (b.quantityAvailable || 0), 0);
      return {
        ...p,
        batches: pBatches,
        totalStock: pBatches.length > 0 ? computedStock : p.totalStock,
        variants: buildProductVariants(p),
      };
    });
  },

  async getProductById(id: string): Promise<ProductRecord | undefined> {
    const products = await this.getProducts();
    return products.find((p) => p.id === id);
  },

  async createProduct(
    product: Omit<ProductRecord, 'id' | 'createdAt' | 'updatedAt' | 'totalStock'> & {
      initialBatch?: {
        batchNumber: string;
        expiryDate: string;
        mfgDate?: string;
        quantity: number;
      };
    }
  ): Promise<ProductRecord> {
    const store = await loadStore();
    const id = `prod-${Date.now()}`;

    // Auto-calculate smallest base unit pricing
    const pricing = calculateBaseUnitPricing({
      name: product.name,
      packageType: product.packageType || product.unit,
      packSize: product.packSizeValue !== undefined ? product.packSizeValue : (product.packSize || '1'),
      packSizeUnit: product.packSizeUnit || 'kg',
      buyingPrice: product.purchasePrice,
      sellingPrice: product.sellingPrice,
    });

    const rawOpeningQty = product.initialBatch ? product.initialBatch.quantity : 0;
    // Calculate base opening stock (in base units: ml for liquid, g for weight, pcs for counts)
    const baseOpeningStock = rawOpeningQty * pricing.packSizeInBaseUnit;

    const variantsWithPrimary = buildProductVariants({
      id,
      name: product.name,
      unit: product.unit,
      packSize: product.packSize || `${pricing.packSize} ${pricing.packSizeUnit}`,
      sellingPrice: product.sellingPrice,
      purchasePrice: product.purchasePrice,
      mrp: product.mrp,
      variants: product.variants,
    });

    const newProduct: ProductRecord = {
      ...product,
      id,
      packageType: pricing.packageType,
      packSizeValue: pricing.packSize,
      packSizeUnit: pricing.packSizeUnit,
      baseUnit: pricing.baseUnit,
      packSizeInBaseUnit: pricing.packSizeInBaseUnit,
      buyPerBaseUnit: pricing.buyPerBaseUnit,
      sellPerBaseUnit: pricing.sellPerBaseUnit,
      profitPerBaseUnit: pricing.profitPerBaseUnit,
      profitPerPack: pricing.profitPerPack,
      displayUnit: pricing.displayUnit,
      buyPerDisplayUnit: pricing.buyPerDisplayUnit,
      sellPerDisplayUnit: pricing.sellPerDisplayUnit,
      profitPerDisplayUnit: pricing.profitPerDisplayUnit,
      totalStockInBaseUnits: baseOpeningStock,
      variants: variantsWithPrimary,
      totalStock: baseOpeningStock,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.products.unshift(newProduct);

    if (product.initialBatch && product.initialBatch.quantity > 0) {
      const batch: ProductBatch = {
        id: `batch-${Date.now()}`,
        productId: id,
        batchNumber: product.initialBatch.batchNumber || 'BATCH-01',
        manufacturingDate: product.initialBatch.mfgDate,
        expiryDate: product.initialBatch.expiryDate,
        purchasePrice: product.purchasePrice,
        sellingPrice: product.sellingPrice,
        mrp: product.mrp,
        quantityAvailable: baseOpeningStock,
        createdAt: new Date().toISOString(),
      };
      store.batches.push(batch);

      // Record movement
      store.movements.unshift({
        id: `mov-${Date.now()}`,
        productId: id,
        productName: newProduct.name,
        batchId: batch.id,
        batchNumber: batch.batchNumber,
        type: 'adjustment_add',
        quantity: baseOpeningStock,
        balanceAfter: baseOpeningStock,
        reason: `Initial Opening Stock Entry (${rawOpeningQty} ${pricing.packageType}s = ${baseOpeningStock} ${pricing.baseUnit})`,
        createdAt: new Date().toISOString(),
      });
    }

    await persistStore(store);
    return newProduct;
  },

  async updateProduct(id: string, updates: Partial<ProductRecord>): Promise<ProductRecord> {
    const store = await loadStore();
    const idx = store.products.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Product not found');

    const current = store.products[idx];
    const merged = { ...current, ...updates };

    // Recalculate smallest base unit pricing
    const pricing = calculateBaseUnitPricing({
      name: merged.name,
      packageType: merged.packageType || merged.unit,
      packSize: merged.packSizeValue !== undefined ? merged.packSizeValue : (merged.packSize || '1'),
      packSizeUnit: merged.packSizeUnit || 'kg',
      buyingPrice: merged.purchasePrice,
      sellingPrice: merged.sellingPrice,
    });

    merged.packageType = pricing.packageType;
    merged.packSizeValue = pricing.packSize;
    merged.packSizeUnit = pricing.packSizeUnit;
    merged.baseUnit = pricing.baseUnit;
    merged.packSizeInBaseUnit = pricing.packSizeInBaseUnit;
    merged.buyPerBaseUnit = pricing.buyPerBaseUnit;
    merged.sellPerBaseUnit = pricing.sellPerBaseUnit;
    merged.profitPerBaseUnit = pricing.profitPerBaseUnit;
    merged.profitPerPack = pricing.profitPerPack;
    merged.displayUnit = pricing.displayUnit;
    merged.buyPerDisplayUnit = pricing.buyPerDisplayUnit;
    merged.sellPerDisplayUnit = pricing.sellPerDisplayUnit;
    merged.profitPerDisplayUnit = pricing.profitPerDisplayUnit;

    if (merged.totalStockInBaseUnits === undefined) {
      merged.totalStockInBaseUnits = merged.totalStock;
    }

    if (updates.variants || updates.packSize || updates.sellingPrice) {
      merged.variants = buildProductVariants(merged);
    }

    store.products[idx] = {
      ...merged,
      updatedAt: new Date().toISOString(),
    };
    await persistStore(store);
    return store.products[idx];
  },

  async deleteProduct(id: string): Promise<boolean> {
    const store = await loadStore();
    store.products = store.products.filter((p) => p.id !== id);
    store.batches = store.batches.filter((b) => b.productId !== id);
    await persistStore(store);
    return true;
  },

  // Batches
  async getBatches(productId?: string): Promise<ProductBatch[]> {
    const store = await loadStore();
    if (productId) {
      return store.batches.filter((b) => b.productId === productId);
    }
    return store.batches;
  },

  async createBatch(batch: Omit<ProductBatch, 'id' | 'createdAt'>): Promise<ProductBatch> {
    const store = await loadStore();
    const newBatch: ProductBatch = {
      ...batch,
      id: `batch-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    store.batches.push(newBatch);

    const product = store.products.find((p) => p.id === batch.productId);
    if (product) {
      product.totalStock += batch.quantityAvailable;
      store.movements.unshift({
        id: `mov-${Date.now()}`,
        productId: product.id,
        productName: product.name,
        batchId: newBatch.id,
        batchNumber: newBatch.batchNumber,
        type: 'purchase',
        quantity: batch.quantityAvailable,
        balanceAfter: product.totalStock,
        reason: 'New Batch Received',
        createdAt: new Date().toISOString(),
      });
    }

    await persistStore(store);
    return newBatch;
  },

  // Stock Movement & Manual Adjustment
  async getStockMovements(productId?: string): Promise<StockMovementRecord[]> {
    const store = await loadStore();
    if (productId) {
      return store.movements.filter((m) => m.productId === productId);
    }
    return store.movements;
  },

  async adjustStock(params: {
    productId: string;
    batchId?: string;
    type: 'adjustment_add' | 'adjustment_sub' | 'damage' | 'expired';
    quantity: number;
    reason: string;
    performedByName?: string;
  }): Promise<StockMovementRecord> {
    const store = await loadStore();
    const product = store.products.find((p) => p.id === params.productId);
    if (!product) throw new Error('Product not found');

    let targetBatch = params.batchId
      ? store.batches.find((b) => b.id === params.batchId)
      : store.batches.find((b) => b.productId === params.productId);

    const isAddition = params.type === 'adjustment_add';
    const delta = isAddition ? params.quantity : -params.quantity;

    if (targetBatch) {
      if (!isAddition && targetBatch.quantityAvailable < params.quantity) {
        throw new Error(
          `Cannot reduce ${params.quantity}. Batch only has ${targetBatch.quantityAvailable} available.`
        );
      }
      targetBatch.quantityAvailable += delta;
      if (targetBatch.quantityAvailable < 0) targetBatch.quantityAvailable = 0;
    }

    if (product.totalStockInBaseUnits !== undefined) {
      product.totalStockInBaseUnits = Math.max(0, (product.totalStockInBaseUnits || 0) + delta);
    }
    const packSize = product.packSizeInBaseUnit && product.packSizeInBaseUnit > 0 ? product.packSizeInBaseUnit : 1;
    product.totalStock = product.totalStockInBaseUnits !== undefined
      ? Math.max(0, Math.round((product.totalStockInBaseUnits / packSize) * 100) / 100)
      : Math.max(0, product.totalStock + delta);

    const balanceAfter = product.totalStockInBaseUnits !== undefined
      ? product.totalStockInBaseUnits
      : product.totalStock;

    const movement: StockMovementRecord = {
      id: `mov-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      batchId: targetBatch?.id,
      batchNumber: targetBatch?.batchNumber,
      type: params.type,
      quantity: params.quantity,
      balanceAfter,
      reason: params.reason,
      performedByName: params.performedByName || 'Ahammed Masud',
      createdAt: new Date().toISOString(),
    };

    store.movements.unshift(movement);
    await persistStore(store);
    return movement;
  },

  // Suppliers & Purchases
  async getSuppliers(): Promise<SupplierRecord[]> {
    const store = await loadStore();
    return store.suppliers;
  },

  async createSupplier(supplier: Omit<SupplierRecord, 'id' | 'createdAt' | 'updatedAt' | 'currentDue'>): Promise<SupplierRecord> {
    const store = await loadStore();
    const newSupplier: SupplierRecord = {
      ...supplier,
      id: `sup-${Date.now()}`,
      currentDue: supplier.openingBalance || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.suppliers.unshift(newSupplier);
    await persistStore(store);
    return newSupplier;
  },

  async getPurchases(): Promise<PurchaseRecord[]> {
    const store = await loadStore();
    return store.purchases;
  },

  async createPurchase(purchaseData: {
    supplierId: string;
    invoiceNo: string;
    purchaseDate: string;
    paymentStatus: 'paid' | 'partial' | 'due';
    amountPaid: number;
    notes?: string;
    items: {
      productId: string;
      batchNumber: string;
      mfgDate?: string;
      expDate: string;
      quantity: number;
      unitCost: number;
      gstRate: number;
    }[];
  }): Promise<PurchaseRecord> {
    const store = await loadStore();
    const supplier = store.suppliers.find((s) => s.id === purchaseData.supplierId);
    if (!supplier) throw new Error('Supplier not found');

    let subtotal = 0;
    let taxTotal = 0;

    const purchaseItems = purchaseData.items.map((item, idx) => {
      const lineCost = item.quantity * item.unitCost;
      const lineTax = (lineCost * item.gstRate) / 100;
      subtotal += lineCost;
      taxTotal += lineTax;

      const product = store.products.find((p) => p.id === item.productId);

      // Create or update batch
      let batch = store.batches.find(
        (b) => b.productId === item.productId && b.batchNumber === item.batchNumber
      );
      if (batch) {
        batch.quantityAvailable += item.quantity;
      } else {
        batch = {
          id: `batch-${Date.now()}-${idx}`,
          productId: item.productId,
          batchNumber: item.batchNumber,
          manufacturingDate: item.mfgDate,
          expiryDate: item.expDate,
          purchasePrice: item.unitCost,
          sellingPrice: product ? product.sellingPrice : item.unitCost * 1.15,
          mrp: product ? product.mrp : item.unitCost * 1.2,
          quantityAvailable: item.quantity,
          createdAt: new Date().toISOString(),
        };
        store.batches.push(batch);
      }

      if (product) {
        product.totalStock += item.quantity;
        store.movements.unshift({
          id: `mov-${Date.now()}-${idx}`,
          productId: product.id,
          productName: product.name,
          batchId: batch.id,
          batchNumber: batch.batchNumber,
          type: 'purchase',
          quantity: item.quantity,
          balanceAfter: product.totalStock,
          reason: `Purchase Invoice #${purchaseData.invoiceNo}`,
          createdAt: new Date().toISOString(),
        });
      }

      return {
        id: `pitem-${Date.now()}-${idx}`,
        purchaseId: '',
        productId: item.productId,
        productName: product ? product.name : 'Unknown Product',
        batchNumber: item.batchNumber,
        mfgDate: item.mfgDate,
        expDate: item.expDate,
        quantity: item.quantity,
        unitCost: item.unitCost,
        gstRate: item.gstRate,
        gstAmount: lineTax,
        totalCost: lineCost + lineTax,
      };
    });

    const grandTotal = subtotal + taxTotal;
    const amountDue = grandTotal - purchaseData.amountPaid;

    supplier.currentDue += amountDue;

    const newPurchase: PurchaseRecord = {
      id: `pur-${Date.now()}`,
      supplierId: supplier.id,
      supplierName: supplier.name,
      invoiceNo: purchaseData.invoiceNo,
      purchaseDate: purchaseData.purchaseDate,
      subtotal,
      taxTotal,
      grandTotal,
      paymentStatus: purchaseData.paymentStatus,
      amountPaid: purchaseData.amountPaid,
      amountDue,
      notes: purchaseData.notes,
      items: purchaseItems,
      createdAt: new Date().toISOString(),
    };

    store.purchases.unshift(newPurchase);
    await persistStore(store);
    return newPurchase;
  },

  // Customers & Ledger
  async getCustomers(): Promise<CustomerRecord[]> {
    const store = await loadStore();
    return store.customers;
  },

  async getCustomerById(id: string): Promise<CustomerRecord | undefined> {
    const store = await loadStore();
    return store.customers.find((c) => c.id === id);
  },

  async createCustomer(customer: Omit<CustomerRecord, 'id' | 'createdAt' | 'updatedAt' | 'currentDue' | 'totalPurchases'>): Promise<CustomerRecord> {
    const store = await loadStore();
    const newCustomer: CustomerRecord = {
      ...customer,
      id: `cust-${Date.now()}`,
      currentDue: 0,
      totalPurchases: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.customers.unshift(newCustomer);
    await persistStore(store);
    return newCustomer;
  },

  async updateCustomer(id: string, updates: Partial<Omit<CustomerRecord, 'id' | 'createdAt'>>): Promise<CustomerRecord> {
    const store = await loadStore();
    const idx = store.customers.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Customer not found');

    store.customers[idx] = {
      ...store.customers[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await persistStore(store);
    return store.customers[idx];
  },

  async deleteCustomer(id: string): Promise<boolean> {
    const store = await loadStore();
    const initialLen = store.customers.length;
    store.customers = store.customers.filter((c) => c.id !== id);
    if (store.customers.length !== initialLen) {
      await persistStore(store);
      return true;
    }
    return false;
  },

  async recordCustomerPayment(params: {
    customerId: string;
    amount: number;
    paymentMode: string;
    notes?: string;
  }): Promise<CustomerLedgerEntry> {
    const store = await loadStore();
    const customer = store.customers.find((c) => c.id === params.customerId);
    if (!customer) throw new Error('Customer not found');

    customer.currentDue -= params.amount;
    if (customer.currentDue < 0) customer.currentDue = 0;

    const entry: CustomerLedgerEntry = {
      id: `led-${Date.now()}`,
      customerId: customer.id,
      type: 'payment_received',
      amount: params.amount,
      balanceAfter: customer.currentDue,
      paymentMode: params.paymentMode,
      notes: params.notes || 'Cash/UPI Credit Repayment',
      createdAt: new Date().toISOString(),
    };

    store.ledger.unshift(entry);
    await persistStore(store);
    return entry;
  },

  async getCustomerLedger(customerId: string): Promise<CustomerLedgerEntry[]> {
    const store = await loadStore();
    return store.ledger.filter((l) => l.customerId === customerId);
  },

  // Sales (POS)
  async getSales(): Promise<SaleRecord[]> {
    const store = await loadStore();
    return store.sales;
  },

  async getSaleById(id: string): Promise<SaleRecord | undefined> {
    const store = await loadStore();
    return store.sales.find((s) => s.id === id);
  },

  async createSale(saleData: {
    customerId?: string;
    customerName: string;
    customerPhone?: string;
    customerVillage?: string;
    subtotal: number;
    discountAmount: number;
    cgstAmount: number;
    sgstAmount: number;
    totalTax: number;
    roundOff: number;
    isZeroTax?: boolean;
    extraCharge?: number;
    extraChargeReason?: string;
    grandTotal: number;
    paymentMode: 'cash' | 'upi' | 'card' | 'credit' | 'split';
    cashAmount: number;
    upiAmount: number;
    cardAmount: number;
    creditAmount: number;
    notes?: string;
    cashierName?: string;
    items: {
      productId: string;
      variantId?: string;
      unit?: string;
      unitMultiplier?: number;
      batchId?: string;
      quantity: number;
      unitPrice: number;
      discount: number;
      gstRate: number;
      unitCost?: number;
      saleMode?: 'pack' | 'loose';
      looseQuantity?: number;
      looseUnit?: string;
      looseQuantityInBaseUnit?: number;
      buyPerBaseUnit?: number;
      sellPerBaseUnit?: number;
      totalAmount?: number;
    }[];
  }): Promise<SaleRecord> {
    const store = await loadStore();
    const settings = store.settings;
    const invNumber = `${settings.invoicePrefix}${settings.nextInvoiceNumber}`;
    settings.nextInvoiceNumber += 1;

    let totalCost = 0;
    const saleId = `sale-${Date.now()}`;
    const isZeroTax = true; // GST system removed: all sales are 0% tax / non-GST

    const saleItems = saleData.items.map((item, idx) => {
      const product = store.products.find((p) => p.id === item.productId);
      if (!product) throw new Error(`Product not found: ${item.productId}`);

      const isLoose = item.saleMode === 'loose' || (item.looseQuantityInBaseUnit !== undefined && item.looseQuantityInBaseUnit > 0);

      // Calculate deduction amount in base units
      let stockDeduction = 0;
      if (isLoose && item.looseQuantityInBaseUnit) {
        stockDeduction = item.looseQuantityInBaseUnit;
      } else {
        const packMultiplier = product.packSizeInBaseUnit || (item.unitMultiplier && item.unitMultiplier > 0 ? item.unitMultiplier : 1);
        stockDeduction = item.quantity * packMultiplier;
      }

      // Check available stock
      const availableStock = product.totalStockInBaseUnits !== undefined ? product.totalStockInBaseUnits : product.totalStock;
      if (availableStock < stockDeduction) {
        throw new Error(
          `Insufficient stock for ${product.name} (Available: ${availableStock} ${product.baseUnit || 'units'}, Requested: ${stockDeduction})`
        );
      }

      // Pesticide Expiry Guard
      const batch = item.batchId
        ? store.batches.find((b) => b.id === item.batchId)
        : store.batches.find((b) => b.productId === item.productId && b.quantityAvailable >= stockDeduction);

      if (batch && product.isPesticide) {
        const isExpired = new Date(batch.expiryDate) < new Date();
        if (isExpired) {
          throw new Error(`CRITICAL: Cannot sell expired pesticide batch ${batch.batchNumber} (Expired: ${batch.expiryDate})`);
        }
      }

      let remainingDeduction = stockDeduction;
      const productBatches = store.batches.filter((b) => b.productId === product.id && b.quantityAvailable > 0);

      if (batch && batch.quantityAvailable > 0) {
        const deductFromBatch = Math.min(batch.quantityAvailable, remainingDeduction);
        batch.quantityAvailable = Math.round((batch.quantityAvailable - deductFromBatch) * 100) / 100;
        remainingDeduction = Math.round((remainingDeduction - deductFromBatch) * 100) / 100;
      }

      if (remainingDeduction > 0) {
        for (const b of productBatches) {
          if (b.id === batch?.id || b.quantityAvailable <= 0) continue;
          const deductFromB = Math.min(b.quantityAvailable, remainingDeduction);
          b.quantityAvailable = Math.round((b.quantityAvailable - deductFromB) * 100) / 100;
          remainingDeduction = Math.round((remainingDeduction - deductFromB) * 100) / 100;
          if (remainingDeduction <= 0) break;
        }
      }

      if (product.totalStockInBaseUnits !== undefined) {
        product.totalStockInBaseUnits = Math.max(0, Math.round((product.totalStockInBaseUnits - stockDeduction) * 100) / 100);
      }
      product.totalStock = Math.max(0, Math.round((product.totalStock - (stockDeduction / (product.packSizeInBaseUnit || 1))) * 100) / 100);

      // Line cost and total
      let lineTotal = 0;
      let lineCost = 0;
      let lineProfit = 0;

      if (isLoose) {
        const looseCalc = calculateLooseSale(
          item.looseQuantity || item.quantity,
          item.looseUnit || product.baseUnit || 'g',
          item.unitPrice || product.sellPerBaseUnit || 0,
          item.buyPerBaseUnit || product.buyPerBaseUnit || 0
        );
        lineTotal = item.totalAmount !== undefined ? item.totalAmount : looseCalc.lineTotal;
        lineCost = looseCalc.lineCost;
        lineProfit = looseCalc.lineProfit;
      } else {
        lineTotal = item.quantity * item.unitPrice - item.discount;
        const packCost = item.unitCost || product.purchasePrice || 0;
        lineCost = item.quantity * packCost;
        lineProfit = lineTotal - lineCost;
      }

      totalCost += lineCost;

      // GST removed: 0% tax for all sales
      const effectiveGstRate = 0;
      const taxAmount = 0;

      // Movement audit
      store.movements.unshift({
        id: `mov-${Date.now()}-${idx}`,
        productId: product.id,
        productName: product.name,
        batchId: batch?.id,
        batchNumber: batch?.batchNumber,
        type: 'sale',
        quantity: stockDeduction,
        balanceAfter: product.totalStockInBaseUnits !== undefined ? product.totalStockInBaseUnits : product.totalStock,
        reason: isLoose
          ? `Loose Sale Memo #${invNumber} (${item.looseQuantity} ${item.looseUnit || product.baseUnit})`
          : `Sale Memo #${invNumber} (${item.quantity} ${item.unit || product.unit})`,
        createdAt: new Date().toISOString(),
      });

      return {
        id: `sitem-${Date.now()}-${idx}`,
        saleId,
        productId: product.id,
        variantId: item.variantId,
        unitMultiplier: stockDeduction,
        batchId: batch?.id,
        batchNumber: batch?.batchNumber,
        productName: product.name,
        hsnCode: product.hsnCode,
        quantity: item.quantity,
        unit: isLoose ? `${item.looseQuantity} ${item.looseUnit || product.baseUnit}` : (item.unit || product.unit),
        unitPrice: item.unitPrice,
        discount: item.discount,
        gstRate: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        totalAmount: lineTotal,
        unitCost: isLoose ? lineCost : (item.unitCost || product.purchasePrice || 0),
        saleMode: isLoose ? ('loose' as const) : ('pack' as const),
        looseQuantity: item.looseQuantity,
        looseUnit: item.looseUnit,
        looseQuantityInBaseUnit: item.looseQuantityInBaseUnit,
        buyPerBaseUnit: item.buyPerBaseUnit || product.buyPerBaseUnit,
        sellPerBaseUnit: item.sellPerBaseUnit || product.sellPerBaseUnit,
        baseUnit: product.baseUnit,
        profit: lineProfit,
      };
    });

    const grossProfit = saleData.grandTotal - totalCost;

    // Handle Customer Credit (Udhaar)
    if (saleData.creditAmount > 0) {
      let customer = saleData.customerId
        ? store.customers.find((c) => c.id === saleData.customerId)
        : store.customers.find((c) => c.phone === saleData.customerPhone);

      if (!customer && saleData.customerPhone) {
        // Quick create customer
        customer = {
          id: `cust-${Date.now()}`,
          name: saleData.customerName,
          phone: saleData.customerPhone,
          village: saleData.customerVillage || '',
          creditLimit: 30000,
          currentDue: 0,
          totalPurchases: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        store.customers.push(customer);
      }

      if (customer) {
        customer.currentDue += saleData.creditAmount;
        customer.totalPurchases = (customer.totalPurchases || 0) + saleData.grandTotal;

        store.ledger.unshift({
          id: `led-${Date.now()}`,
          customerId: customer.id,
          saleId,
          invoiceNumber: invNumber,
          type: 'bill_credit',
          amount: saleData.creditAmount,
          balanceAfter: customer.currentDue,
          paymentMode: 'credit',
          notes: `Credit on Bill #${invNumber}`,
          createdAt: new Date().toISOString(),
        });
      }
    }

    const newSale: SaleRecord = {
      id: saleId,
      invoiceNumber: invNumber,
      customerId: saleData.customerId,
      customerName: saleData.customerName,
      customerPhone: saleData.customerPhone,
      customerVillage: saleData.customerVillage,
      subtotal: saleData.subtotal,
      discountAmount: saleData.discountAmount,
      cgstAmount: 0,
      sgstAmount: 0,
      totalTax: 0,
      roundOff: saleData.roundOff,
      isZeroTax: true,
      extraCharge: saleData.extraCharge || 0,
      extraChargeReason: saleData.extraChargeReason || '',
      grandTotal: saleData.grandTotal,
      totalCost,
      grossProfit,
      paymentMode: saleData.paymentMode,
      cashAmount: saleData.cashAmount,
      upiAmount: saleData.upiAmount,
      cardAmount: saleData.cardAmount,
      creditAmount: saleData.creditAmount,
      status: 'completed',
      cashierName: saleData.cashierName || 'Counter Staff',
      notes: saleData.notes,
      items: saleItems,
      createdAt: new Date().toISOString(),
    };

    store.sales.unshift(newSale);
    await persistStore(store);
    return newSale;
  },

  async cancelSale(id: string, reason: string, cancelledByName: string): Promise<SaleRecord> {
    const store = await loadStore();
    const sale = store.sales.find((s) => s.id === id);
    if (!sale) throw new Error('Sale not found');
    if (sale.status === 'cancelled') throw new Error('Sale is already cancelled');

    sale.status = 'cancelled';
    sale.cancelledReason = reason;
    sale.cancelledBy = cancelledByName;

    // Restore stock
    for (const item of sale.items) {
      const product = store.products.find((p) => p.id === item.productId);
      const multiplier = item.unitMultiplier && item.unitMultiplier > 0 ? item.unitMultiplier : 1;
      const restoredStock = Math.round(item.quantity * multiplier * 100) / 100;
      if (product) {
        product.totalStock = Math.round((product.totalStock + restoredStock) * 100) / 100;
        if (product.totalStockInBaseUnits !== undefined) {
          product.totalStockInBaseUnits = Math.round((product.totalStockInBaseUnits + restoredStock) * 100) / 100;
        }
      }
      if (item.batchId) {
        const batch = store.batches.find((b) => b.id === item.batchId);
        if (batch) batch.quantityAvailable = Math.round((batch.quantityAvailable + restoredStock) * 100) / 100;
      }

      store.movements.unshift({
        id: `mov-${Date.now()}`,
        productId: item.productId,
        productName: item.productName,
        type: 'return',
        quantity: restoredStock,
        balanceAfter: product ? product.totalStock : 0,
        reason: `Restocked from Cancelled Bill #${sale.invoiceNumber}: ${reason} (${item.quantity} ${item.unit || ''})`,
        createdAt: new Date().toISOString(),
      });
    }

    // Rollback customer credit if applicable
    if (sale.creditAmount > 0 && sale.customerId) {
      const customer = store.customers.find((c) => c.id === sale.customerId);
      if (customer) {
        customer.currentDue -= sale.creditAmount;
        if (customer.currentDue < 0) customer.currentDue = 0;
        store.ledger.unshift({
          id: `led-${Date.now()}`,
          customerId: customer.id,
          saleId: sale.id,
          type: 'adjustment',
          amount: -sale.creditAmount,
          balanceAfter: customer.currentDue,
          notes: `Reversed Credit from Cancelled Bill #${sale.invoiceNumber}`,
          createdAt: new Date().toISOString(),
        });
      }
    }

    store.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      userEmail: cancelledByName,
      action: 'bill_cancelled',
      entityType: 'sale',
      entityId: sale.id,
      details: { invoiceNumber: sale.invoiceNumber, reason, grandTotal: sale.grandTotal },
      createdAt: new Date().toISOString(),
    });

    await persistStore(store);
    return sale;
  },

  // Expenses
  async getExpenses(): Promise<ExpenseRecord[]> {
    const store = await loadStore();
    return store.expenses;
  },

  async createExpense(expense: Omit<ExpenseRecord, 'id' | 'createdAt'>): Promise<ExpenseRecord> {
    const store = await loadStore();
    const newExpense: ExpenseRecord = {
      ...expense,
      id: `exp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    store.expenses.unshift(newExpense);
    await persistStore(store);
    return newExpense;
  },

  // Audit Logs
  async getAuditLogs(): Promise<AuditLogRecord[]> {
    const store = await loadStore();
    return store.auditLogs;
  },

  async recordAudit(log: Omit<AuditLogRecord, 'id' | 'createdAt'>): Promise<void> {
    const store = await loadStore();
    store.auditLogs.unshift({
      ...log,
      id: `audit-${Date.now()}`,
      createdAt: new Date().toISOString(),
    });
    await persistStore(store);
  },

  // Dashboard Aggregates
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const store = await loadStore();
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const activeSales = store.sales.filter((s) => s.status === 'completed');

    const todaySalesList = activeSales.filter((s) => s.createdAt.startsWith(todayStr));
    const todaySales = todaySalesList.reduce((acc, s) => acc + s.grandTotal, 0);
    const todayProfit = todaySalesList.reduce((acc, s) => acc + (s.grossProfit || 0), 0);

    const monthSalesList = activeSales.filter((s) => s.createdAt >= monthStart);
    const monthSales = monthSalesList.reduce((acc, s) => acc + s.grandTotal, 0);

    // Stock Valuation (accurately accounts for base units vs package sizes and batches)
    const totalStockValue = store.products.reduce((acc, p) => {
      const pBatches = store.batches.filter((b) => b.productId === p.id && b.quantityAvailable > 0);
      let productVal = 0;

      if (pBatches.length > 0) {
        for (const b of pBatches) {
          const packSize = p.packSizeInBaseUnit && p.packSizeInBaseUnit > 0 ? p.packSizeInBaseUnit : 1;
          const packs = b.quantityAvailable / packSize;
          const buyPrice = b.purchasePrice || p.purchasePrice || 0;
          productVal += packs * buyPrice;
        }
      } else {
        const baseStock = typeof p.totalStockInBaseUnits === 'number'
          ? p.totalStockInBaseUnits
          : (p.totalStock || 0);
        const packSize = p.packSizeInBaseUnit && p.packSizeInBaseUnit > 0 ? p.packSizeInBaseUnit : 1;
        const packs = baseStock / packSize;
        const buyPrice = p.purchasePrice || (p as any).costPrice || 0;
        productVal += packs * buyPrice;
      }

      return acc + (isNaN(productVal) || productVal < 0 ? 0 : Math.round(productVal * 100) / 100);
    }, 0);

    // Low stock products (correctly calculates available packs against lowStockThreshold)
    const lowStockProducts = store.products.filter((p) => {
      const packSize = p.packSizeInBaseUnit && p.packSizeInBaseUnit > 0 ? p.packSizeInBaseUnit : 1;
      const baseStock = typeof p.totalStockInBaseUnits === 'number'
        ? p.totalStockInBaseUnits
        : (p.totalStock || 0);
      const packs = baseStock / packSize;
      return packs <= (p.lowStockThreshold || 10);
    });

    // Expiring Batches (within 90 days or expired)
    const ninetyDaysAhead = new Date(Date.now() + 90 * 24 * 3600 * 1000);
    const expiringBatches = store.batches
      .filter((b) => new Date(b.expiryDate) <= ninetyDaysAhead && b.quantityAvailable > 0)
      .map((b) => {
        const prod = store.products.find((p) => p.id === b.productId);
        return {
          ...b,
          productName: prod ? prod.name : 'Unknown Product',
          isPesticide: prod ? prod.isPesticide : false,
        };
      })
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

    // Customer dues
    const customerDuesTotal = store.customers.reduce((acc, c) => acc + (c.currentDue || 0), 0);

    // 7 Days Trend
    const salesTrend7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 3600 * 1000);
      const dStr = d.toISOString().split('T')[0];
      const daySales = activeSales.filter((s) => s.createdAt.startsWith(dStr));
      salesTrend7Days.push({
        date: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
        sales: daySales.reduce((acc, s) => acc + s.grandTotal, 0),
        profit: daySales.reduce((acc, s) => acc + (s.grossProfit || 0), 0),
      });
    }

    // Category Sales Pie
    const categoryTotals: Record<string, number> = {};
    for (const sale of activeSales) {
      for (const item of sale.items) {
        const prod = store.products.find((p) => p.id === item.productId);
        const cat = prod?.categoryId || 'other';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + item.totalAmount;
      }
    }

    const catColors: Record<string, string> = {
      fertilizers: '#2E9E4F',
      insecticides: '#E11D48',
      fungicides: '#8B5CF6',
      herbicides: '#F59E0B',
      micronutrients: '#06B6D4',
      seeds: '#10B981',
      tools: '#6B7280',
    };

    const categorySales = Object.entries(categoryTotals).map(([cat, val]) => ({
      category: cat.charAt(0).toUpperCase() + cat.slice(1),
      value: Math.round(val),
      color: catColors[cat] || '#2E9E4F',
    }));

    // Top selling products
    const productQtyMap: Record<string, { quantity: number; amount: number; name: string }> = {};
    for (const sale of activeSales) {
      for (const item of sale.items) {
        if (!productQtyMap[item.productId]) {
          productQtyMap[item.productId] = { quantity: 0, amount: 0, name: item.productName };
        }
        productQtyMap[item.productId].quantity += item.quantity;
        productQtyMap[item.productId].amount += item.totalAmount;
      }
    }

    const topProducts = Object.values(productQtyMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return {
      todaySales,
      todayProfit,
      monthSales,
      totalStockValue,
      lowStockCount: lowStockProducts.length,
      expiringCount: expiringBatches.length,
      customerDuesTotal,
      salesTrend7Days,
      categorySales,
      topProducts,
      lowStockProducts,
      expiringBatches,
    };
  },
};
