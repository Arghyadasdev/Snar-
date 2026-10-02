import "server-only";

// Indian FY: Apr 1 - Mar 31. "2026-27" means Apr 2026 - Mar 2027.
export function currentFinancialYear(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-12
  const startYear = month >= 4 ? year : year - 1;
  return `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;
}

// Prices in this store are GST-inclusive (what the customer sees is the
// final price), so tax is backed out of the order total rather than added
// on top. Same state as the seller -> CGST+SGST split; different -> IGST.
export function computeGst({ total, sellerState, customerState, gstRatePercent }) {
  const rate = Number(gstRatePercent) || 12;
  const taxableAmount = Math.round((total / (1 + rate / 100)) * 100) / 100;
  const taxAmount = Math.round((total - taxableAmount) * 100) / 100;
  const isIntraState = (sellerState || "").trim().toLowerCase() === (customerState || "").trim().toLowerCase();

  return {
    gstType: isIntraState ? "intra" : "inter",
    gstRate: rate,
    taxableAmount,
    taxAmount,
    cgstAmount: isIntraState ? Math.round((taxAmount / 2) * 100) / 100 : 0,
    sgstAmount: isIntraState ? Math.round((taxAmount / 2) * 100) / 100 : 0,
    igstAmount: isIntraState ? 0 : taxAmount,
  };
}
