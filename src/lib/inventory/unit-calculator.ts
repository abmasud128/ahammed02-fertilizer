/**
 * Reusable Smallest Unit Price & Inventory Calculation Engine
 * Ahammed Fertilizer - Unified Base Unit Calculator
 */

export type PackSizeUnit = 'ml' | 'L' | 'g' | 'kg' | 'pcs';
export type BaseUnit = 'ml' | 'g' | 'pcs';

export interface BaseUnitCalculationInput {
  name?: string;
  packageType?: string; // e.g. Bottle, Bag, Packet, Box, Can, Jar, Pouch
  packSize: number | string; // e.g. 100, 50, 1, 250
  packSizeUnit: PackSizeUnit | string; // ml, L, g, kg, pcs
  buyingPrice: number | string; // per full pack
  sellingPrice: number | string; // per full pack
}

export interface BaseUnitCalculationResult {
  // Normalized inputs
  packSize: number;
  packSizeUnit: PackSizeUnit;
  packageType: string;
  buyingPrice: number;
  sellingPrice: number;

  // Base unit mapping
  baseUnit: BaseUnit;
  packSizeInBaseUnit: number; // e.g. 50 kg -> 50,000 g; 1 L -> 1,000 ml; 100 ml -> 100 ml

  // Auto-calculated fields (stored to 4 decimal places)
  buyPerBaseUnit: number;
  sellPerBaseUnit: number;
  profitPerBaseUnit: number;
  profitPerPack: number;

  // Friendly display units (for kg and L)
  displayUnit: string; // 'kg', 'L', 'g', 'ml', 'pcs'
  buyPerDisplayUnit: number;
  sellPerDisplayUnit: number;
  profitPerDisplayUnit: number;

  // Formatted labels for UI
  buyPerBaseLabel: string;
  sellPerBaseLabel: string;
  profitPerBaseLabel: string;
  displaySummary: string;

  // Validation
  isValid: boolean;
  isLoss: boolean;
  warningMessage?: string;
}

/**
 * Normalizes pack size unit string to standard PackSizeUnit enum
 */
export function normalizePackSizeUnit(rawUnit?: string): PackSizeUnit {
  const u = (rawUnit || '').trim().toLowerCase();
  if (u === 'l' || u === 'ltr' || u === 'litre' || u === 'litres' || u === 'liter') return 'L';
  if (u === 'ml' || u === 'millilitre' || u === 'milliliter') return 'ml';
  if (u === 'kg' || u === 'kgs' || u === 'kilo' || u === 'kilogram' || u === 'kilograms') return 'kg';
  if (u === 'g' || u === 'gm' || u === 'gms' || u === 'gram' || u === 'grams') return 'g';
  return 'pcs';
}

/**
 * Determine the smallest base unit for calculation and physical stock deduction.
 * - ml for liquids (ml, L)
 * - g for weight (g, kg)
 * - pcs for counts (pcs, piece, items)
 */
export function getBaseUnitForPackUnit(packUnit: PackSizeUnit): BaseUnit {
  switch (packUnit) {
    case 'ml':
    case 'L':
      return 'ml';
    case 'g':
    case 'kg':
      return 'g';
    case 'pcs':
    default:
      return 'pcs';
  }
}

/**
 * Convert a pack size and pack unit into the smallest base unit.
 * - 1 L -> 1,000 ml
 * - 50 kg -> 50,000 g
 * - 250 g -> 250 g
 * - 100 ml -> 100 ml
 */
export function convertPackSizeToBaseUnit(packSize: number, packUnit: PackSizeUnit): number {
  if (isNaN(packSize) || packSize <= 0) return 0;

  switch (packUnit) {
    case 'L':
      return packSize * 1000; // 1 L = 1,000 ml
    case 'kg':
      return packSize * 1000; // 1 kg = 1,000 g
    case 'ml':
    case 'g':
    case 'pcs':
    default:
      return packSize;
  }
}

/**
 * Round a number to a specific number of decimal places (default 4 decimals)
 */
export function roundToDecimals(val: number, decimals: number = 4): number {
  if (isNaN(val) || !isFinite(val)) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round(val * factor) / factor;
}

/**
 * Central Reusable Unit Calculation Function
 * Calculates buying and selling rates per base unit and display unit.
 * Handles edge cases: division by zero, empty inputs, negative numbers, loss warnings.
 */
export function calculateBaseUnitPricing(input: BaseUnitCalculationInput): BaseUnitCalculationResult {
  const packSizeNum = typeof input.packSize === 'number' ? input.packSize : parseFloat(String(input.packSize || '0'));
  const packSize = isNaN(packSizeNum) || packSizeNum <= 0 ? 0 : packSizeNum;

  const packSizeUnit = normalizePackSizeUnit(input.packSizeUnit);
  const packageType = (input.packageType || 'Pack').trim();

  const buyPriceNum = typeof input.buyingPrice === 'number' ? input.buyingPrice : parseFloat(String(input.buyingPrice || '0'));
  const buyingPrice = isNaN(buyPriceNum) || buyPriceNum < 0 ? 0 : buyPriceNum;

  const sellPriceNum = typeof input.sellingPrice === 'number' ? input.sellingPrice : parseFloat(String(input.sellingPrice || '0'));
  const sellingPrice = isNaN(sellPriceNum) || sellPriceNum < 0 ? 0 : sellPriceNum;

  const baseUnit = getBaseUnitForPackUnit(packSizeUnit);
  const packSizeInBaseUnit = convertPackSizeToBaseUnit(packSize, packSizeUnit);

  // Default invalid/zero state
  if (packSizeInBaseUnit <= 0) {
    return {
      packSize,
      packSizeUnit,
      packageType,
      buyingPrice,
      sellingPrice,
      baseUnit,
      packSizeInBaseUnit: 0,
      buyPerBaseUnit: 0,
      sellPerBaseUnit: 0,
      profitPerBaseUnit: 0,
      profitPerPack: roundToDecimals(sellingPrice - buyingPrice, 2),
      displayUnit: packSizeUnit,
      buyPerDisplayUnit: 0,
      sellPerDisplayUnit: 0,
      profitPerDisplayUnit: 0,
      buyPerBaseLabel: `₹0.0000 / ${baseUnit}`,
      sellPerBaseLabel: `₹0.0000 / ${baseUnit}`,
      profitPerBaseLabel: `₹0.0000 / ${baseUnit}`,
      displaySummary: 'Invalid Pack Size',
      isValid: false,
      isLoss: sellingPrice < buyingPrice,
      warningMessage: packSize <= 0 ? 'Pack size must be greater than 0' : undefined,
    };
  }

  // 1. Base unit rates (4 decimal places)
  const rawBuyPerBase = buyingPrice / packSizeInBaseUnit;
  const rawSellPerBase = sellingPrice / packSizeInBaseUnit;
  const rawProfitPerBase = rawSellPerBase - rawBuyPerBase;

  const buyPerBaseUnit = roundToDecimals(rawBuyPerBase, 4);
  const sellPerBaseUnit = roundToDecimals(rawSellPerBase, 4);
  const profitPerBaseUnit = roundToDecimals(rawProfitPerBase, 4);
  const profitPerPack = roundToDecimals(sellingPrice - buyingPrice, 2);

  // 2. Friendly display unit rates (for kg show per kg, for L show per L)
  let displayUnit = packSizeUnit;
  let buyPerDisplayUnit = buyPerBaseUnit;
  let sellPerDisplayUnit = sellPerBaseUnit;

  if (packSizeUnit === 'kg') {
    displayUnit = 'kg';
    buyPerDisplayUnit = roundToDecimals(buyingPrice / packSize, 2);
    sellPerDisplayUnit = roundToDecimals(sellingPrice / packSize, 2);
  } else if (packSizeUnit === 'L') {
    displayUnit = 'L';
    buyPerDisplayUnit = roundToDecimals(buyingPrice / packSize, 2);
    sellPerDisplayUnit = roundToDecimals(sellingPrice / packSize, 2);
  } else if (packSizeUnit === 'g') {
    displayUnit = 'g';
    buyPerDisplayUnit = buyPerBaseUnit;
    sellPerDisplayUnit = sellPerBaseUnit;
  } else if (packSizeUnit === 'ml') {
    displayUnit = 'ml';
    buyPerDisplayUnit = buyPerBaseUnit;
    sellPerDisplayUnit = sellPerBaseUnit;
  }

  const profitPerDisplayUnit = roundToDecimals(sellPerDisplayUnit - buyPerDisplayUnit, 2);

  // 3. Formatted string labels for high-clarity UI
  const formatRate = (rate: number, unit: string) => {
    // Show 2 decimals if >= 1, otherwise show up to 4 decimals
    const formatted = rate >= 1 ? rate.toFixed(2) : rate.toFixed(4);
    return `₹${formatted} / ${unit}`;
  };

  const buyPerBaseLabel = formatRate(buyPerBaseUnit, baseUnit);
  const sellPerBaseLabel = formatRate(sellPerBaseUnit, baseUnit);
  const profitPerBaseLabel = formatRate(profitPerBaseUnit, baseUnit);

  // Display summary for cards and badges
  let displaySummary = '';
  if (packSizeUnit === 'kg') {
    displaySummary = `₹${buyPerDisplayUnit.toFixed(2)}/kg buy • ₹${sellPerDisplayUnit.toFixed(2)}/kg sell (${buyPerBaseLabel})`;
  } else if (packSizeUnit === 'L') {
    displaySummary = `₹${buyPerDisplayUnit.toFixed(2)}/L buy • ₹${sellPerDisplayUnit.toFixed(2)}/L sell (${buyPerBaseLabel})`;
  } else {
    displaySummary = `${buyPerBaseLabel} buy • ${sellPerBaseLabel} sell`;
  }

  const isLoss = sellingPrice < buyingPrice;
  const warningMessage = isLoss
    ? `Warning: Selling price is ₹${(buyingPrice - sellingPrice).toFixed(2)} less than buying price (Loss: ₹${Math.abs(profitPerBaseUnit).toFixed(4)}/${baseUnit})`
    : undefined;

  return {
    packSize,
    packSizeUnit,
    packageType,
    buyingPrice,
    sellingPrice,
    baseUnit,
    packSizeInBaseUnit,
    buyPerBaseUnit,
    sellPerBaseUnit,
    profitPerBaseUnit,
    profitPerPack,
    displayUnit,
    buyPerDisplayUnit,
    sellPerDisplayUnit,
    profitPerDisplayUnit,
    buyPerBaseLabel,
    sellPerBaseLabel,
    profitPerBaseLabel,
    displaySummary,
    isValid: true,
    isLoss,
    warningMessage,
  };
}

/**
 * Calculate loose quantity sale amount.
 * - e.g. 30 ml of a 100 ml bottle @ sellPerBaseUnit ₹1.00/ml -> ₹30.00
 * - e.g. 5 kg of a 50 kg bag @ sellPerBaseUnit ₹0.014/g (5,000 g) -> ₹70.00
 * - e.g. 250 ml of a 1 L bottle @ sellPerBaseUnit ₹0.60/ml -> ₹150.00
 * - e.g. 100 g of a 250 g packet @ sellPerBaseUnit ₹0.22/g -> ₹22.00
 */
export function calculateLooseSale(
  looseQuantity: number,
  looseUnit: string,
  sellPerBaseUnit: number,
  buyPerBaseUnit: number = 0
): {
  looseQuantityInBaseUnit: number;
  lineTotal: number;
  lineCost: number;
  lineProfit: number;
} {
  const normUnit = normalizePackSizeUnit(looseUnit);
  let qtyInBase = looseQuantity;

  // Convert loose quantity into base unit
  if (normUnit === 'L') {
    qtyInBase = looseQuantity * 1000; // 1 L = 1000 ml
  } else if (normUnit === 'kg') {
    qtyInBase = looseQuantity * 1000; // 1 kg = 1000 g
  }

  const rawTotal = qtyInBase * sellPerBaseUnit;
  const rawCost = qtyInBase * buyPerBaseUnit;
  const lineTotal = roundToDecimals(rawTotal, 2); // Final bill amount rounded to 2 decimals
  const lineCost = roundToDecimals(rawCost, 2);
  const lineProfit = roundToDecimals(lineTotal - lineCost, 2);

  return {
    looseQuantityInBaseUnit: qtyInBase,
    lineTotal,
    lineCost,
    lineProfit,
  };
}

/**
 * Format stock for high-clarity dual display in UI (e.g. "2 Bottles + 40 ml", "10 Bags + 5 kg").
 */
export function formatBaseStockDisplay(
  totalStockInBaseUnits: number,
  packSizeInBaseUnit: number,
  packageType: string = 'Pack',
  baseUnit: BaseUnit = 'g',
  packSizeUnit?: PackSizeUnit
): {
  primary: string;
  secondary: string;
  wholePacks: number;
  looseBaseUnits: number;
  totalBaseUnits: number;
} {
  const stock = typeof totalStockInBaseUnits === 'number' && !isNaN(totalStockInBaseUnits) ? totalStockInBaseUnits : 0;
  const packSize = packSizeInBaseUnit > 0 ? packSizeInBaseUnit : 1;

  if (stock <= 0) {
    return {
      primary: `0 ${packageType}s (0 ${baseUnit})`,
      secondary: `0 ${baseUnit} total`,
      wholePacks: 0,
      looseBaseUnits: 0,
      totalBaseUnits: 0,
    };
  }

  const wholePacks = Math.floor(stock / packSize);
  const looseBaseUnits = Math.round((stock % packSize) * 100) / 100;
  const packLabel = wholePacks === 1 ? packageType : `${packageType}s`;

  let primary = '';

  if (baseUnit === 'ml') {
    if (looseBaseUnits === 0) {
      const volL = stock / 1000;
      primary = packSizeUnit === 'L' && volL >= 1
        ? `${wholePacks} ${packLabel} (${volL} L)`
        : `${wholePacks} ${packLabel} (${stock.toLocaleString()} ml)`;
    } else if (wholePacks > 0) {
      primary = `${wholePacks} ${packLabel} + ${looseBaseUnits} ml`;
    } else {
      primary = `${looseBaseUnits} ml loose`;
    }

    const secondary = stock >= 1000 ? `${(stock / 1000).toFixed(2)} L total` : `${stock} ml total`;
    return { primary, secondary, wholePacks, looseBaseUnits, totalBaseUnits: stock };
  }

  if (baseUnit === 'g') {
    if (looseBaseUnits === 0) {
      const weightKg = stock / 1000;
      primary = weightKg >= 1
        ? `${wholePacks} ${packLabel} (${weightKg.toLocaleString()} kg)`
        : `${wholePacks} ${packLabel} (${stock.toLocaleString()} g)`;
    } else if (wholePacks > 0) {
      const looseDisplay = looseBaseUnits >= 1000
        ? `${(looseBaseUnits / 1000).toFixed(2)} kg`
        : `${looseBaseUnits} g`;
      primary = `${wholePacks} ${packLabel} + ${looseDisplay}`;
    } else {
      primary = looseBaseUnits >= 1000
        ? `${(looseBaseUnits / 1000).toFixed(2)} kg loose`
        : `${looseBaseUnits} g loose`;
    }

    const metricTons = stock / 1000000;
    const secondary = metricTons >= 1
      ? `${metricTons.toFixed(2)} Metric Tons`
      : stock >= 1000
      ? `${(stock / 1000).toLocaleString()} kg total`
      : `${stock} g total`;

    return { primary, secondary, wholePacks, looseBaseUnits, totalBaseUnits: stock };
  }

  // Count / pieces
  if (looseBaseUnits === 0) {
    primary = `${wholePacks} ${packLabel}`;
  } else if (wholePacks > 0) {
    primary = `${wholePacks} ${packLabel} + ${looseBaseUnits} pcs`;
  } else {
    primary = `${looseBaseUnits} pcs loose`;
  }

  return {
    primary,
    secondary: `${stock} pcs total`,
    wholePacks,
    looseBaseUnits,
    totalBaseUnits: stock,
  };
}
