export const formatPrice = (price) => `₹${Number(price).toLocaleString("en-IN")}`;

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

export const formatQuantity = (qty, unit = "Quintal") => `${qty} ${unit}`;

export const formatChange = (change) => {
  const value = Number(change);
  const sign = value > 0 ? "+" : "";
  return `${sign}${value}%`;
};