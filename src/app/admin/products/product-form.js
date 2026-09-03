"use client";

import { useActionState, useState } from "react";

export default function ProductForm({ action, categories, product }) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [preview, setPreview] = useState(product?.image_url || "");

  function onFileChange(e) {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  }

  return (
    <form className="auth-card" action={formAction} style={{ maxWidth: "560px" }}>
      {product && <input type="hidden" name="id" value={product.id} />}

      <label className="auth-label" htmlFor="name">Name</label>
      <input className="auth-input" id="name" name="name" defaultValue={product?.name} required />

      <label className="auth-label" htmlFor="description">Description</label>
      <textarea className="auth-input" id="description" name="description" rows={3} defaultValue={product?.description} />

      <div style={{ display: "flex", gap: "1rem" }}>
        <div style={{ flex: 1 }}>
          <label className="auth-label" htmlFor="price">Price (₹)</label>
          <input className="auth-input" id="price" name="price" type="number" step="0.01" defaultValue={product?.price} required />
        </div>
        <div style={{ flex: 1 }}>
          <label className="auth-label" htmlFor="compareAtPrice">Compare-at Price (₹)</label>
          <input className="auth-input" id="compareAtPrice" name="compareAtPrice" type="number" step="0.01" defaultValue={product?.compare_at_price ?? ""} />
        </div>
      </div>

      <label className="auth-label" htmlFor="categoryId">Category</label>
      <select className="auth-input" id="categoryId" name="categoryId" defaultValue={product?.category_id} required>
        <option value="" disabled>Select category</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <label className="auth-label" htmlFor="imageFile">Product Photo</label>
      <input className="auth-input" id="imageFile" name="imageFile" type="file" accept="image/*" onChange={onFileChange} />

      {preview && (
        <img src={preview} alt="Preview" style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "8px", marginTop: ".7rem" }} />
      )}

      <label className="auth-label" htmlFor="imageUrl">or Image URL / path (e.g. /cat_tshirt.png) — used if no photo uploaded above</label>
      <input className="auth-input" id="imageUrl" name="imageUrl" defaultValue={product?.image_url} placeholder="/cat_tshirt.png" />

      <label className="auth-label" htmlFor="sizes">Sizes (comma separated)</label>
      <input className="auth-input" id="sizes" name="sizes" defaultValue={(product?.sizes || []).join(", ")} placeholder="S, M, L, XL" />

      <label className="auth-label" htmlFor="stock">Stock</label>
      <input className="auth-input" id="stock" name="stock" type="number" defaultValue={product?.stock ?? 0} />

      <label className="auth-label" style={{ display: "flex", alignItems: "center", gap: ".5rem", marginTop: ".5rem" }}>
        <input type="checkbox" name="isActive" defaultChecked={product ? product.is_active : true} />
        Active (visible in store)
      </label>

      {state?.error && <p className="auth-error">{state.error}</p>}

      <button className="auth-btn" type="submit" disabled={pending}>
        {pending ? "Saving…" : product ? "Save Changes" : "Create Product"}
      </button>
    </form>
  );
}
