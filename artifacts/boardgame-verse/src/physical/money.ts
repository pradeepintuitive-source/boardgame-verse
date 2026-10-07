/** Whole rupees only. The photographed rules use integer ₹ amounts. */
export function assertRupees(amount: number, label = "Amount"): number {
  if (!Number.isInteger(amount)) {
    throw new Error(`${label} must be a whole number of rupees.`);
  }
  return amount;
}

/** Indian digit grouping for display. Not used for calculations. */
export function formatInr(amount: number): string {
  const negative = amount < 0;
  const abs = Math.abs(Math.trunc(amount));
  const digits = String(abs);
  if (digits.length <= 3) return `${negative ? "-" : ""}₹${digits}`;
  const head = digits.slice(0, -3);
  const tail = digits.slice(-3);
  const grouped = head.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `${negative ? "-" : ""}₹${grouped},${tail}`;
}
