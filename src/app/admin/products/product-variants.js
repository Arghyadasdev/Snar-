"use client";

import { useActionState } from "react";
import { addVariant, updateVariantStock, deleteVariant } from "@/lib/actions/admin-variants";

export default function ProductVariants({ productId, variants }) {
  const [state, formAction, pending] = useActionState(addVariant, undefined);

  return (
    <div className="auth-card" style={{ maxWidth: "560px", marginTop: "1.5rem" }}>
      <div className="order-shipping-title">Color Variants</div>

      {variants.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: ".7rem", marginBottom: "1rem" }}>
          {variants.map((v) => (
            <div key={v.id} style={{ display: "flex", alignItems: "center", gap: ".7rem" }}>
              <img src={v.image_url} alt={v.color_name} style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "6px" }} />
              <div style={{ flex: 1 }}>{v.color_name}</div>
              <form action={updateVariantStock} style={{ display: "flex", alignItems: "center", gap: ".4rem" }}>
                <input type="hidden" name="id" value={v.id} />
                <input type="hidden" name="productId" value={productId} />
                <input className="auth-input" name="stock" type="number" defaultValue={v.stock} style={{ width: "70px" }} />
                <button type="submit" className="btn-outline" style={{ padding: ".3rem .7rem" }}>Save</button>
              </form>
              <form action={deleteVariant}>
                <input type="hidden" name="id" value={v.id} />
                <input type="hidden" name="productId" value={productId} />
                <button type="submit" className="admin-delete-btn">Delete</button>
              </form>
            </div>
          ))}
        </div>
      )}

      <form action={formAction}>
        <input type="hidden" name="productId" value={productId} />
        <label className="auth-label" htmlFor="colorName">Color Name</label>
        <input className="auth-input" id="colorName" name="colorName" placeholder="e.g. Dusty Green" required />

        <label className="auth-label" htmlFor="variantStock">Stock</label>
        <input className="auth-input" id="variantStock" name="stock" type="number" defaultValue={0} />

        <label className="auth-label" htmlFor="variantImageFile">Photo</label>
        <input className="auth-input" id="variantImageFile" name="imageFile" type="file" accept="image/*" required />

        {state?.error && <p className="auth-error">{state.error}</p>}
        {state?.success && <p className="auth-success">{state.success}</p>}

        <button className="btn-outline" type="submit" disabled={pending} style={{ marginTop: ".8rem" }}>
          {pending ? "Adding…" : "Add Color"}
        </button>
      </form>
    </div>
  );
}
