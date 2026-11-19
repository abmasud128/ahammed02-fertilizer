import {
  CategoryRecord,
  ProductRecord,
  ProductBatch,
  SupplierRecord,
  CustomerRecord,
  SaleRecord,
  ExpenseRecord,
  ShopSettings,
  AdminUser,
} from '@/types/admin';

export const INITIAL_SETTINGS: ShopSettings = {
  id: 'settings-default',
  shopName: 'Ahammed Fertilizer',
  shopNameBn: 'আহাম্মেদ ফার্টিলাইজার',
  tagline: 'Your Trusted Partner in Agriculture',
  taglineBn: 'কৃষিতে আপনার বিশ্বস্ত সঙ্গী',
  phone: '9091017035',
  email: 'abmasud128@gmail.com',
  addressLine1: 'Nandair, Puliyapara',
  addressLine2: 'Chapmatali, Dakshin Dinajpur',
  state: 'West Bengal',
  pinCode: '733124',
  gstin: '19ABCDE1234F1Z5',
  fertilizerLicence: 'WB/DD/FERT/2015/0428',
  pesticideLicence: 'WB/DD/PEST/2016/1109',
  seedsLicence: 'WB/DD/SEED/2018/0091',
  upiId: '9091017035@upi',
  invoicePrefix: 'AF-2026-',
  nextInvoiceNumber: 1001,
  lowStockDefault: 10,
  thermalPrinterSize: '80mm',
  termsConditions:
    '1. Goods once sold will not be returned without cash memo.\n2. Store all pesticides strictly away from children and cattle.\n3. Verify seal and batch number upon delivery.',
  termsConditionsBn:
    '১. আসল ক্যাশমেমো ছাড়া পণ্য ফেরত বা বদল করা হবে না।\n২. কীটনাশক ওষুধ শিশুদের নাগালের বাইরে নিরাপদ স্থানে রাখুন।\n৩. ডেলিভারির সময় সিল ও ব্যাচ নম্বর যাচাই করুন।',
  updatedAt: new Date().toISOString(),
};

export const INITIAL_USERS: AdminUser[] = [
  {
    id: 'user-owner-1',
    email: 'owner@ahammed.com',
    fullName: 'Ahammed Masud (Owner)',
    phone: '9091017035',
    role: 'owner',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user-cashier-1',
    email: 'cashier@ahammed.com',
    fullName: 'Rahul Soren (Counter Staff)',
    phone: '9800000000',
    role: 'cashier',
    isActive: true,
    createdAt: '2026-02-01T00:00:00Z',
  },
];

export const INITIAL_CATEGORIES: CategoryRecord[] = [
  { id: 'fertilizers', name: 'Fertilizers', nameBn: 'সার', icon: '🌱', isActive: true },
  { id: 'micronutrients', name: 'Micronutrients', nameBn: 'অণুখাদ্য', icon: '🧪', isActive: true },
  { id: 'insecticides', name: 'Insecticides', nameBn: 'কীটনাশক', icon: '🐛', isActive: true },
  { id: 'fungicides', name: 'Fungicides', nameBn: 'ছত্রাকনাশক', icon: '🍄', isActive: true },
  { id: 'herbicides', name: 'Herbicides', nameBn: 'আগাছানাশক', icon: '🌿', isActive: true },
  { id: 'seeds', name: 'Seeds', nameBn: 'বীজ', icon: '🌾', isActive: true },
  { id: 'tools', name: 'Tools & Sprayers', nameBn: 'স্প্রেয়ার ও সরঞ্জাম', icon: '⚙️', isActive: true },
];

// Clean slate: all demo collections initialized as empty
export const INITIAL_PRODUCTS: ProductRecord[] = [];
export const INITIAL_BATCHES: ProductBatch[] = [];
export const INITIAL_SUPPLIERS: SupplierRecord[] = [];
export const INITIAL_CUSTOMERS: CustomerRecord[] = [];
export const INITIAL_SALES: SaleRecord[] = [];
export const INITIAL_EXPENSES: ExpenseRecord[] = [];
