// Helper to convert MongoDB's stored cents values into dollar values
const centsToDollars = (cents) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
};

export default centsToDollars;
