/**
 * Type definitions for Ahammed Fertilizer Private Admin & POS System
 */

export type UserRole = 'owner' | 'cashier';

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface ShopSettings {
  id: string;
  shopName: string;
  shopNameBn: string;
  tagline: string;
  taglineBn: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  state: string;
  pinCode: string;
  gstin: string;
  fertilizerLicence: string;
  pesticideLicence: string;
  seedsLicence: string;
  upiId: string;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  lowStockDefault: number;
  thermalPrinterSize: '58mm' | '80mm';
  termsConditions: string;
  termsConditionsBn: string;
  updatedAt: string;
}

export type UnitType = 'kg' | 'g' | 'litre' | 'ml' | 'packet' | 'bag' | 'bottle' | 'piece';

export interface ProductUnitVariant {
  id: string;
  unitName: string; // e.g. "50 kg bag", "1 kg loose", "500 ml bottle", "1 Litre pack"
  multiplier: number; // conversion factor in base units (e.g. 50 for 50kg bag when base is kg; 1 for 1kg; 0.5 for 500ml when base is litre)
  sellingPrice: number;
  purchasePrice: number;
  mrp: number;
  barcode?: string;
  isDefault?: boolean;
}

export interface CategoryRecord {
  id: string;
  name: string;
  nameBn: string;
  icon: string;
  description?: string;
  isActive: boolean;
}

export interface ProductBatch {
  id: string;
  productId: string;
  batchNumber: string;
  manufacturingDate?: string;
  expiryDate: string;
  purchasePrice: number;
  sellingPrice: number;
  mrp: number;
  quantityAvailable: number;
  createdAt: string;
}

export type PackSizeUnit = 'ml' | 'L' | 'g' | 'kg' | 'pcs';
export type BaseUnit = 'ml' | 'g' | 'pcs';

export interface ProductRecord {
  id: string;
  name: string;
  nameBn?: string;
  brand: string;
  categoryId: string;
  unit: UnitType;
  packSize: string;
  packageType?: string; // e.g. Bottle, Bag, Packet, Box, Can, Jar, Pouch
  packSizeValue?: number; // Numeric pack size e.g. 100, 50, 1, 250
  packSizeUnit?: PackSizeUnit; // ml, L, g, kg, pcs
  baseUnit?: BaseUnit; // ml for liquids, g for weight, pcs for counts
  packSizeInBaseUnit?: number; // e.g. 100 ml -> 100, 50 kg -> 50000, 1 L -> 1000
  buyPerBaseUnit?: number; // Buying price per smallest base unit (4 decimals)
  sellPerBaseUnit?: number; // Selling price per smallest base unit (4 decimals)
  profitPerBaseUnit?: number; // Profit per smallest base unit (4 decimals)
  profitPerPack?: number; // Profit per full pack (2 decimals)
  displayUnit?: string; // Friendly unit: 'kg' for kg, 'L' for L, etc.
  buyPerDisplayUnit?: number;
  sellPerDisplayUnit?: number;
  profitPerDisplayUnit?: number;
  totalStockInBaseUnits?: number; // Total physical inventory tracked in base units
  variants?: ProductUnitVariant[]; // Multiple unit types and prices under same product
  hsnCode: string;
  gstRate: number; // e.g. 0, 5, 12, 18
  purchasePrice: number;
  sellingPrice: number;
  mrp: number;
  barcode?: string;
  lowStockThreshold: number;
  isPesticide: boolean;
  safetyNotes?: string;
  safetyNotesBn?: string;
  imageUrl?: string;
  notes?: string;
  isActive: boolean;
  totalStock: number;
  batches?: ProductBatch[];
  createdAt: string;
  updatedAt: string;
}

export type MovementType =
  | 'purchase'
  | 'sale'
  | 'adjustment_add'
  | 'adjustment_sub'
  | 'damage'
  | 'expired'
  | 'return';

export interface StockMovementRecord {
  id: string;
  productId: string;
  productName: string;
  batchId?: string;
  batchNumber?: string;
  type: MovementType;
  quantity: number;
  balanceAfter: number;
  referenceId?: string;
  reason?: string;
  performedBy?: string;
  performedByName?: string;
  createdAt: string;
}

export interface SupplierRecord {
  id: string;
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  address?: string;
  gstin?: string;
  paymentTerms?: string;
  openingBalance: number;
  currentDue: number;
  createdAt: string;
  updatedAt: string;
}

export type PaymentStatus = 'paid' | 'partial' | 'due';

export interface PurchaseItemRecord {
  id: string;
  purchaseId: string;
  productId: string;
  productName: string;
  batchNumber: string;
  mfgDate?: string;
  expDate: string;
  quantity: number;
  unitCost: number;
  gstRate: number;
  gstAmount: number;
  totalCost: number;
}

export interface PurchaseRecord {
  id: string;
  supplierId: string;
  supplierName: string;
  invoiceNo: string;
  purchaseDate: string;
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  amountDue: number;
  notes?: string;
  items: PurchaseItemRecord[];
  createdBy?: string;
  createdAt: string;
}

export interface CustomerRecord {
  id: string;
  name: string;
  phone: string;
  fatherName?: string;
  village?: string;
  para?: string;
  aadhaar?: string;
  landArea?: string;
  landUnit?: string;
  primaryCrops?: string[];
  creditLimit: number;
  currentDue: number;
  notes?: string;
  totalPurchases?: number;
  createdAt: string;
  updatedAt: string;
}

export type PaymentMode = 'cash' | 'upi' | 'card' | 'credit' | 'split';
export type BillStatus = 'completed' | 'cancelled' | 'refunded' | 'on_hold';

export interface SaleItemRecord {
  id: string;
  saleId: string;
  productId: string;
  variantId?: string;
  unitMultiplier?: number;
  batchId?: string;
  batchNumber?: string;
  productName: string;
  hsnCode?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount: number;
  gstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  totalAmount: number;
  unitCost: number; // For gross profit calculations
  saleMode?: 'pack' | 'loose';
  looseQuantity?: number;
  looseUnit?: string;
  looseQuantityInBaseUnit?: number;
  buyPerBaseUnit?: number;
  sellPerBaseUnit?: number;
  baseUnit?: string;
  profit?: number;
}

export interface SaleRecord {
  id: string;
  invoiceNumber: string;
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
  totalCost: number;
  grossProfit: number;
  paymentMode: PaymentMode;
  cashAmount: number;
  upiAmount: number;
  cardAmount: number;
  creditAmount: number;
  status: BillStatus;
  cancelledReason?: string;
  cancelledBy?: string;
  cashierId?: string;
  cashierName?: string;
  notes?: string;
  items: SaleItemRecord[];
  createdAt: string;
}

export type LedgerType = 'bill_credit' | 'payment_received' | 'adjustment';

export interface CustomerLedgerEntry {
  id: string;
  customerId: string;
  saleId?: string;
  invoiceNumber?: string;
  type: LedgerType;
  amount: number;
  balanceAfter: number;
  paymentMode?: string;
  notes?: string;
  recordedBy?: string;
  createdAt: string;
}

export type ExpenseCategory =
  | 'rent'
  | 'electricity'
  | 'transport'
  | 'salary'
  | 'packaging'
  | 'tea_refreshment'
  | 'licence_fees'
  | 'maintenance'
  | 'other';

export interface ExpenseRecord {
  id: string;
  category: ExpenseCategory;
  amount: number;
  paymentMode: string;
  description: string;
  expenseDate: string;
  date?: string;
  recordedBy?: string;
  recordedByName?: string;
  createdAt: string;
}

export interface AuditLogRecord {
  id: string;
  userId?: string;
  userEmail: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, any>;
  createdAt: string;
}

export interface DashboardMetrics {
  todaySales: number;
  todayProfit: number;
  monthSales: number;
  totalStockValue: number;
  lowStockCount: number;
  expiringCount: number;
  customerDuesTotal: number;
  salesTrend7Days: { date: string; sales: number; profit: number }[];
  categorySales: { category: string; value: number; color: string }[];
  topProducts: { name: string; quantity: number; amount: number }[];
  lowStockProducts: ProductRecord[];
  expiringBatches: (ProductBatch & { productName: string; isPesticide: boolean })[];
}
