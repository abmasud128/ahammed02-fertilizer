/**
 * Inventory Unit Conversion & Stock Formatting Utilities
 * Ahammed Fertilizer - Unified Base Weight (KG / Litres) Management
 */

import type { ProductUnitVariant } from '../../types/admin';

export interface ParsedPackSize {
  value: number; // e.g. 50
  rawUnit: string; // e.g. 'kg', 'g', 'l', 'ml'
  baseUnit: 'kg' | 'litre' | 'piece' | 'packet';
  baseMultiplier: number; // multiplier to convert 1 primary pack into base units (e.g. 50 kg bag -> 50)
  isWeightBased: boolean;
  isVolumeBased: boolean;
}

/**
 * Parse pack size specification like "50 kg", "45kg", "500 g", "1 Litre", "250 ml", etc.
 */
export function parsePackSize(packSize?: string, unit?: string): ParsedPackSize {
  const normPack = (packSize || '').toLowerCase().trim();
  const normUnit = (unit || '').toLowerCase().trim();

  // 1. Kilograms check (e.g. "50 kg", "45kg", "50 kgs")
  const kgMatch = normPack.match(/([\d.]+)\s*(kg|kgs|kilo|kilogram)/i);
  if (kgMatch) {
    const val = parseFloat(kgMatch[1]) || 50;
    return {
      value: val,
      rawUnit: 'kg',
      baseUnit: 'kg',
      baseMultiplier: val,
      isWeightBased: true,
      isVolumeBased: false,
    };
  }

  // 2. Grams check (e.g. "500 g", "250 gm", "100 grams") - NOT kg
  const gMatch = normPack.match(/([\d.]+)\s*(g|gm|gms|gram|grams)/i);
  if (gMatch && !normPack.includes('kg')) {
    const val = parseFloat(gMatch[1]) || 500;
    return {
      value: val,
      rawUnit: 'g',
      baseUnit: 'kg',
      baseMultiplier: val / 1000, // 500g = 0.5 kg
      isWeightBased: true,
      isVolumeBased: false,
    };
  }

  // 3. Litres check (e.g. "1 litre", "1 L", "5 ltr", "5 litres")
  const litreMatch = normPack.match(/([\d.]+)\s*(l|ltr|litre|litres|liter)/i);
  if (litreMatch && !normPack.includes('ml')) {
    const val = parseFloat(litreMatch[1]) || 1;
    return {
      value: val,
      rawUnit: 'litre',
      baseUnit: 'litre',
      baseMultiplier: val,
      isWeightBased: false,
      isVolumeBased: true,
    };
  }

  // 4. Millilitres check (e.g. "500 ml", "250ml", "60 ml")
  const mlMatch = normPack.match(/([\d.]+)\s*(ml|millilitre)/i);
  if (mlMatch) {
    const val = parseFloat(mlMatch[1]) || 500;
    return {
      value: val,
      rawUnit: 'ml',
      baseUnit: 'litre',
      baseMultiplier: val / 1000, // 500ml = 0.5 litre
      isWeightBased: false,
      isVolumeBased: true,
    };
  }

  // 5. Raw number in packSize (e.g. "50" or "45")
  const numMatch = normPack.match(/([\d.]+)/);
  if (numMatch) {
    const val = parseFloat(numMatch[1]) || 1;
    if (normUnit === 'bag' || normUnit === 'kg') {
      return {
        value: val,
        rawUnit: 'kg',
        baseUnit: 'kg',
        baseMultiplier: val,
        isWeightBased: true,
        isVolumeBased: false,
      };
    }
    if (normUnit === 'bottle' || normUnit === 'litre') {
      return {
        value: val,
        rawUnit: 'litre',
        baseUnit: 'litre',
        baseMultiplier: val,
        isWeightBased: false,
        isVolumeBased: true,
      };
    }
    return {
      value: val,
      rawUnit: normUnit || 'piece',
      baseUnit: 'piece',
      baseMultiplier: val,
      isWeightBased: false,
      isVolumeBased: false,
    };
  }

  // 6. Default fallback based on unit type
  if (normUnit === 'bag') {
    return {
      value: 50,
      rawUnit: 'kg',
      baseUnit: 'kg',
      baseMultiplier: 50,
      isWeightBased: true,
      isVolumeBased: false,
    };
  }
  if (normUnit === 'kg') {
    return {
      value: 1,
      rawUnit: 'kg',
      baseUnit: 'kg',
      baseMultiplier: 1,
      isWeightBased: true,
      isVolumeBased: false,
    };
  }
  if (normUnit === 'litre') {
    return {
      value: 1,
      rawUnit: 'litre',
      baseUnit: 'litre',
      baseMultiplier: 1,
      isWeightBased: false,
      isVolumeBased: true,
    };
  }

  return {
    value: 1,
    rawUnit: normUnit || 'piece',
    baseUnit: 'piece',
    baseMultiplier: 1,
    isWeightBased: false,
    isVolumeBased: false,
  };
}

/**
 * Calculate total base inventory (Total KG / Litres) from opening quantity and pack size.
 * e.g. 220 bags of 50 kg -> 11,000 kg base weight.
 */
export function calculateOpeningBaseStock(
  quantity: number,
  packSize?: string,
  unit?: string
): number {
  const parsed = parsePackSize(packSize, unit);
  // If unit is bag or bottle and has weight/volume multiplier
  return Math.round(quantity * parsed.baseMultiplier * 100) / 100;
}

export interface StockDisplayInfo {
  primary: string; // e.g. "220 Bags (11,000 kg)" or "10 Bags + 39 kg"
  secondary: string; // e.g. "11.00 Metric Tons" or "539 kg total"
  full: string;
  wholeBags: number;
  looseKg: number;
  totalKg: number;
  metricTons: number;
  isWeightBased: boolean;
}

/**
 * Format stock for high-clarity dual display in UI (bags + loose kg / metric tons).
 */
export function formatStockDisplay(
  totalStock: number,
  packSize?: string,
  unit?: string
): StockDisplayInfo {
  const parsed = parsePackSize(packSize, unit);
  const stock = typeof totalStock === 'number' && !isNaN(totalStock) ? totalStock : 0;

  if (parsed.isWeightBased && parsed.baseMultiplier > 0) {
    const bagWeight = parsed.baseMultiplier; // e.g. 50 kg or 45 kg
    const wholeBags = Math.floor(stock / bagWeight);
    const looseKg = Math.round((stock % bagWeight) * 100) / 100;
    const metricTons = Math.round((stock / 1000) * 100) / 100;

    let primary = '';
    if (stock <= 0) {
      primary = `0 Bags (0 kg)`;
    } else if (wholeBags > 0 && looseKg === 0) {
      primary = `${wholeBags} ${wholeBags === 1 ? 'Bag' : 'Bags'} (${stock.toLocaleString()} kg)`;
    } else if (wholeBags > 0 && looseKg > 0) {
      primary = `${wholeBags} ${wholeBags === 1 ? 'Bag' : 'Bags'} + ${looseKg} kg`;
    } else {
      primary = `${looseKg} kg loose`;
    }

    const secondary = metricTons >= 1 ? `${metricTons} Metric Tons` : `${stock.toLocaleString()} kg total`;
    const full = `${primary} (${secondary})`;

    return {
      primary,
      secondary,
      full,
      wholeBags,
      looseKg,
      totalKg: stock,
      metricTons,
      isWeightBased: true,
    };
  }

  if (parsed.isVolumeBased && parsed.baseMultiplier > 0) {
    const bottleVol = parsed.baseMultiplier; // e.g. 0.5 L
    const wholeBottles = Math.floor(stock / bottleVol);
    const looseLitre = Math.round((stock % bottleVol) * 1000) / 1000;

    let primary = '';
    if (stock <= 0) {
      primary = `0 Bottles (0 L)`;
    } else if (looseLitre === 0) {
      primary = `${wholeBottles} Bottles (${stock} L)`;
    } else {
      primary = `${wholeBottles} Bottles + ${looseLitre * 1000} ml`;
    }

    return {
      primary,
      secondary: `${stock} L total`,
      full: primary,
      wholeBags: wholeBottles,
      looseKg: looseLitre,
      totalKg: stock,
      metricTons: 0,
      isWeightBased: false,
    };
  }

  // Simple item / piece count
  const primary = `${stock} ${unit || 'units'}`;
  return {
    primary,
    secondary: '',
    full: primary,
    wholeBags: stock,
    looseKg: 0,
    totalKg: stock,
    metricTons: 0,
    isWeightBased: false,
  };
}

/**
 * Normalizes and builds a complete list of variants for POS and Catalog.
 * Guarantees that:
 * 1. The product's Primary Unit (e.g. "50 kg Bag", multiplier: 50, primary prices) is ALWAYS included as the default first option!
 * 2. Loose variants (e.g. "1 kg", multiplier: 1) are preserved with accurate base weight multipliers.
 * 3. Any old legacy fraction multipliers (like 0.02 for 1 kg) are automatically corrected to exact weight in kg (1.0).
 */
export function buildProductVariants(product: {
  id: string;
  name: string;
  unit: string;
  packSize?: string;
  sellingPrice: number;
  purchasePrice?: number;
  mrp?: number;
  variants?: ProductUnitVariant[];
}): ProductUnitVariant[] {
  const safePackSize = (product.packSize || '').trim();
  const parsed = parsePackSize(safePackSize, product.unit);
  const primaryUnitName = safePackSize
    ? `${safePackSize} ${product.unit === 'bag' ? 'Bag' : product.unit === 'bottle' ? 'Bottle' : ''}`.trim()
    : product.unit === 'bag'
    ? '50 kg Bag'
    : product.unit || '1 unit';

  const primaryVariant: ProductUnitVariant = {
    id: `primary-${product.id}`,
    unitName: primaryUnitName,
    multiplier: parsed.baseMultiplier,
    sellingPrice: product.sellingPrice,
    purchasePrice: product.purchasePrice || 0,
    mrp: product.mrp || product.sellingPrice,
    isDefault: true,
  };

  const existingVariants = Array.isArray(product.variants) ? product.variants : [];
  if (existingVariants.length === 0) {
    return [primaryVariant];
  }

  // Sanitize existing variants
  const sanitizedCustom: ProductUnitVariant[] = [];

  for (const v of existingVariants) {
    if (!v.unitName || !v.unitName.trim()) continue;

    const vParsed = parsePackSize(v.unitName, product.unit);
    let correctMultiplier = Number(v.multiplier) || 1;

    // Detect if this variant is basically the primary unit itself
    const primaryPackText = safePackSize.toLowerCase();
    const isSameAsPrimary =
      Math.abs(correctMultiplier - parsed.baseMultiplier) < 0.001 ||
      (correctMultiplier === 1 && parsed.baseMultiplier === 1) ||
      (primaryPackText.length > 0 && v.unitName.toLowerCase().includes(primaryPackText));

    if (isSameAsPrimary) {
      // Don't duplicate primary, just update primary's price if variant has custom price
      primaryVariant.unitName = v.unitName;
      if (v.sellingPrice) primaryVariant.sellingPrice = v.sellingPrice;
      if (v.purchasePrice) primaryVariant.purchasePrice = v.purchasePrice;
      if (v.mrp) primaryVariant.mrp = v.mrp;
      continue;
    }

    // Fix legacy fraction multipliers (e.g. 0.02 for 1kg in a 50kg bag)
    if (correctMultiplier < 1 && vParsed.isWeightBased && vParsed.baseMultiplier >= 1) {
      correctMultiplier = vParsed.baseMultiplier; // e.g. 1 kg loose = 1 kg
    } else if (vParsed.value > 0 && Math.abs(correctMultiplier - 1) < 0.01 && vParsed.value !== 1) {
      // e.g. name was "5 kg" but multiplier was mistakenly set to 1
      correctMultiplier = vParsed.baseMultiplier;
    }

    sanitizedCustom.push({
      id: v.id || `var-${Date.now()}-${sanitizedCustom.length + 1}`,
      unitName: v.unitName,
      multiplier: correctMultiplier,
      sellingPrice: Number(v.sellingPrice) || 0,
      purchasePrice: Number(v.purchasePrice) || 0,
      mrp: Number(v.mrp) || Number(v.sellingPrice) || 0,
      barcode: v.barcode,
      isDefault: false,
    });
  }

  return [primaryVariant, ...sanitizedCustom];
}
