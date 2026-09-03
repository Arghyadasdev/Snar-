"use client";

import { useActionState } from "react";
import { addProductImage, deleteProductImage } from "@/lib/actions/admin-product-images";

export default function ProductGallery({ productId, images }) {
  const [state, formAction, pending] = useActionState(addProductImage, undefined);

  return (
    <div className="auth-card" style={{ maxWidth: "560px", marginTop: "1.5rem" }}>
      <div className="order-shipping-title">Additional Photos</div>

      {images.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: ".7rem", marginBottom: "1rem" }}>
          {images.map((img) => (
            <div key={img.id} style={{ position: "relative" }}>
              <img src={img.image_url} alt="" loading="lazy" style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px" }} />
              <form action={deleteProductImage} style={{ position: "absolute", top: "-6px", right: "-6px" }}>
                <input type="hidden" name="id" value={img.id} />
                <input type="hidden" name="productId" value={productId} />
                <button
                  type="submit"
                  aria-label="Remove photo"
                  style={{
                    width: "20px", height: "20px", borderRadius: "50%", border: "none",
                    background: "#FF6B6B", color: "#fff", fontSize: ".7rem", lineHeight: 1, cursor: "pointer",
                  }}
                >
                  ×
                </button>
              </form>
            </div>
          ))}
        </div>
      )}

      <form action={formAction}>
        <input type="hidden" name="productId" value={productId} />
        <input className="auth-input" name="imageFile" type="file" accept="image/*" required />
        {state?.error && <p className="auth-error">{state.error}</p>}
        {state?.success && <p className="auth-success">{state.success}</p>}
        <button className="btn-outline" type="submit" disabled={pending} style={{ marginTop: ".8rem" }}>
          {pending ? "Uploading…" : "Add Photo"}
        </button>
      </form>
    </div>
  );
}
