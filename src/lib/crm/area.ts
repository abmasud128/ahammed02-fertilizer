/**
 * Ahammed Fertilizer - CRM Area Conversion Engine
 * Canonical base unit: Decimal (100 decimal = 1 acre)
 * Configurable bigha conversion: Default 33 decimal per bigha for West Bengal standard
 */
import { AreaUnit } from '@/types/crm';

export const DEFAULT_BIGHA_TO_DECIMAL = 33.0; // Standard in Bengal plains (approx 1333 sq m per bigha)

export function convertAreaToDecimal(
  value: number,
  unit: AreaUnit,
  bighaToDecimalRatio: number = DEFAULT_BIGHA_TO_DECIMAL
): number {
  if (!value || isNaN(value) || value < 0) return 0;

  let decimals = 0;
  switch (unit) {
    case 'acre':
      decimals = value * 100.0;
      break;
    case 'bigha':
      decimals = value * bighaToDecimalRatio;
      break;
    case 'decimal':
    default:
      decimals = value;
      break;
  }

  // Round to 2 decimal places for clean storage
  return Math.round(decimals * 100) / 100;
}

export function convertDecimalToUnits(
  decimalValue: number,
  bighaToDecimalRatio: number = DEFAULT_BIGHA_TO_DECIMAL
): { decimal: number; acre: number; bigha: number } {
  const dec = Math.max(0, decimalValue || 0);
  return {
    decimal: Math.round(dec * 100) / 100,
    acre: Math.round((dec / 100.0) * 100) / 100,
    bigha: Math.round((dec / bighaToDecimalRatio) * 100) / 100,
  };
}

export function formatAreaDisplay(
  value: number,
  unit: AreaUnit,
  bighaToDecimalRatio: number = DEFAULT_BIGHA_TO_DECIMAL
): string {
  const decimal = convertAreaToDecimal(value, unit, bighaToDecimalRatio);
  const units = convertDecimalToUnits(decimal, bighaToDecimalRatio);

  if (unit === 'bigha') {
    return `${value} Bigha (${units.decimal} Decimal / ${units.acre} Acre)`;
  } else if (unit === 'acre') {
    return `${value} Acre (${units.decimal} Decimal / ${units.bigha} Bigha)`;
  }
  return `${value} Decimal (${units.bigha} Bigha / ${units.acre} Acre)`;
}
