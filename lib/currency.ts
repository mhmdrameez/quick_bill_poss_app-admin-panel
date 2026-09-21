// lib/currency.ts

/**
 * Quick Bill POS Integer Currency Law:
 * All monetary fields stored in Firestore must be non-negative integers representing paise (₹1 = 100 paise).
 */

/** Convert display rupees (e.g. 12.50) to storage paise integer (e.g. 1250) */
export function rupeesToPaise(rupees: number | string): number {
  const num = typeof rupees === 'string' ? parseFloat(rupees) : rupees;
  if (isNaN(num) || num < 0) {
    return 0;
  }
  const paise = Math.round(num * 100);
  if (!Number.isInteger(paise)) {
    throw new Error(`INTEGER_CURRENCY_VIOLATION: ${rupees} produces non-integer paise`);
  }
  return paise;
}

/** Convert storage paise (e.g. 1250) to display rupees string (e.g. "12.50") */
export function paiseToRupees(paise: number | undefined | null): string {
  if (paise === undefined || paise === null || isNaN(paise)) {
    return '0.00';
  }
  const intPaise = Math.round(paise);
  return (intPaise / 100).toFixed(2);
}

/** Format paise as Indian Rupee display string: ₹1,234.50 */
export function formatCurrency(paise: number | undefined | null): string {
  if (paise === undefined || paise === null || isNaN(paise)) {
    return '₹0.00';
  }
  const intPaise = Math.round(paise);
  const rupees = intPaise / 100;
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rupees);
}

/** Calculate Cart item line total in paise */
export function calculateItemTotalPaise(unitPricePaise: number, quantity: number): number {
  return Math.round(unitPricePaise * quantity);
}

/** Calculate sale subtotal, tax, discount, grand total strictly in integer paise */
export function calculateSaleTotals(
  items: Array<{ unitPricePaise: number; quantity: number }>,
  taxRatePercent: number = 0,
  taxEnabled: boolean = true,
  discountPaise: number = 0
): { subtotalPaise: number; taxPaise: number; discountPaise: number; grandTotalPaise: number } {
  const subtotalPaise = items.reduce(
    (sum, item) => sum + Math.round(item.unitPricePaise * item.quantity),
    0
  );
  
  const taxPaise = taxEnabled && taxRatePercent > 0
    ? Math.round((subtotalPaise * taxRatePercent) / 100)
    : 0;
    
  const validDiscountPaise = Math.min(Math.max(0, Math.round(discountPaise)), subtotalPaise + taxPaise);
  const grandTotalPaise = Math.max(0, subtotalPaise + taxPaise - validDiscountPaise);

  return {
    subtotalPaise,
    taxPaise,
    discountPaise: validDiscountPaise,
    grandTotalPaise,
  };
}
