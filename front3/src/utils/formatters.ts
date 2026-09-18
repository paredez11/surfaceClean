// front3/src/utils/formatters.ts

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const formatDate = (
  date: string | null | undefined,
): string => {
  if (!date) return "—";

  return dateFormatter.format(new Date(date));
};

export const formatCurrency = (
  amount: number | null | undefined,
): string => {
  if (amount === null || amount === undefined) return "—";

  return currencyFormatter.format(amount);
};