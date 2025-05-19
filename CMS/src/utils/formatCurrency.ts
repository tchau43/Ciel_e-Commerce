/**
 * Formats a number as currency in Vietnamese Dong (VND) format
 * @param amount The amount to format
 * @returns Formatted currency string with VND symbol
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
