/** Parses ParaBank's rendered currency strings (e.g. "$1,234.56", "-$50.00") into a number. */
export function parseCurrency(text: string): number {
  const normalized = text.replace(/[^0-9.-]/g, '');
  return Number.parseFloat(normalized);
}
