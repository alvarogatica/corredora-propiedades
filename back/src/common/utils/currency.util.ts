import { PropertyCurrency } from '../enums';

/**
 * Formatea un monto numérico al estándar visual chileno:
 * - CLP: "$120.000.000" (sin decimales y con punto de miles)
 * - UF: "UF 3.500,5"
 */
export function formatChileanPrice(
  amount: number | string,
  currency: PropertyCurrency = PropertyCurrency.CLP,
): string {
  const numericAmount = Number(amount);
  if (Number.isNaN(numericAmount)) return '$0';

  if (currency === PropertyCurrency.UF) {
    const formattedUf = new Intl.NumberFormat('es-CL', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numericAmount);
    return `UF ${formattedUf}`;
  }

  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(Math.round(numericAmount));
}
