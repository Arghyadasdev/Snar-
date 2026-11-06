// Per-size price/stock override support. `sizes` is products.sizes — an
// array of either plain strings (legacy, no override) or
// { size, price, stock } objects where price/stock are null/undefined
// when that size uses the product's base price / overall stock.
export function normalizeSizes(sizes) {
  if (!Array.isArray(sizes)) return [];
  return sizes.map((s) =>
    typeof s === "string"
      ? { size: s, price: null, stock: null }
      : { size: s.size, price: s.price ?? null, stock: s.stock ?? null }
  );
}

export function resolveSizePrice(sizes, size, basePrice) {
  const entry = normalizeSizes(sizes).find((s) => s.size === size);
  return entry?.price != null ? Number(entry.price) : Number(basePrice);
}

// null means "no size-specific cap" — falls back to the product/variant's
// overall stock, which the caller already has.
export function resolveSizeStock(sizes, size) {
  const entry = normalizeSizes(sizes).find((s) => s.size === size);
  return entry?.stock != null ? Number(entry.stock) : null;
}
