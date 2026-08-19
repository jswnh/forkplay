export const APP_CURRENCY = process.env.NEXT_PUBLIC_CURRENCY || "PHP";
export const APP_CURRENCY_SYMBOL =
  process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "₱";

export function formatPrice(
  amount: number | string | null | undefined,
): string {
  if (amount === null || amount === undefined) return `${APP_CURRENCY_SYMBOL}0.00`;
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num) || num === 0) return "Free";
  return `${APP_CURRENCY_SYMBOL}${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatRawAmount(
  amount: number | string | null | undefined,
): string {
  if (amount === null || amount === undefined) return `${APP_CURRENCY_SYMBOL}0.00`;
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return `${APP_CURRENCY_SYMBOL}${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
