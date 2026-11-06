// Per-size price override support. `sizes` is products.sizes — an array of
// either plain strings (legacy, no override) or { size, price } objects
// where price is null/undefined when that size uses the product's base price.
export function normalizeSizes(sizes) {
  if (!Array.isArray(sizes)) return [];
  return sizes.map((s) =>
    typeof s === "string" ? { size: s, price: null } : { size: s.size, price: s.price ?? null }
  );
}

export function resolveSizePrice(sizes, size, basePrice) {
  const entry = normalizeSizes(sizes).find((s) => s.size === size);
  return entry?.price != null ? Number(entry.price) : Number(basePrice);
}
