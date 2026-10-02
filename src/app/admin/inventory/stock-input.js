"use client";

export default function StockInput({ action, hiddenFields, stock, lowStockThreshold = 10 }) {
  return (
    <form action={action} style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
      {Object.entries(hiddenFields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <input
        type="number"
        name="stock"
        min="0"
        defaultValue={stock}
        className="auth-input"
        style={{ width: "80px", padding: ".4rem .6rem", color: stock <= lowStockThreshold ? "#FF6B6B" : undefined }}
      />
      <button type="submit" className="btn-outline" style={{ padding: ".4rem .9rem" }}>Save</button>
    </form>
  );
}
