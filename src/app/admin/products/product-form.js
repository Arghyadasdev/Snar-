"use client";

import { useActionState, useMemo, useState } from "react";
import { deleteProductImage } from "@/lib/actions/admin-product-images";

function discountPct(price, compareAt) {
  const p = Number(price) || 0;
  const c = Number(compareAt) || 0;
  return c > p ? Math.round((1 - p / c) * 100) : 0;
}

export default function ProductForm({ action, categories, product, images = [] }) {
  const [state, formAction, pending] = useActionState(action, undefined);

  const roots = useMemo(() => categories.filter((c) => !c.parent_id), [categories]);
  const byId = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c])), [categories]);

  const initialCategory = product ? byId[product.category_id] : null;
  const initialMainId = initialCategory
    ? (initialCategory.parent_id || initialCategory.id)
    : "";
  const initialSubId = initialCategory && initialCategory.parent_id ? initialCategory.id : "";

  const [mainCategoryId, setMainCategoryId] = useState(initialMainId);
  const [subCategoryId, setSubCategoryId] = useState(initialSubId);
  const subcategories = categories.filter((c) => c.parent_id === mainCategoryId);
  const effectiveCategoryId = subCategoryId || mainCategoryId;

  function onMainCategoryChange(e) {
    const id = e.target.value;
    setMainCategoryId(id);
    setSubCategoryId("");
  }

  // Live preview state — mirrors what the storefront product page will show.
  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [price, setPrice] = useState(product?.price ?? "");
  const [compareAtPrice, setCompareAtPrice] = useState(product?.compare_at_price ?? "");
  const [imageUrl, setImageUrl] = useState(product?.image_url || "");
  const [photoPreviews, setPhotoPreviews] = useState([]);

  function onPhotosChange(e) {
    const files = Array.from(e.target.files || []);
    setPhotoPreviews(files.map((f) => URL.createObjectURL(f)));
  }

  const coverPreview = photoPreviews[0] || imageUrl;
  const discount = discountPct(price, compareAtPrice);
  const mainCategoryName = byId[mainCategoryId]?.name;
  const subCategoryName = byId[subCategoryId]?.name;

  return (
    <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start", flexWrap: "wrap" }}>
      <form className="auth-card" action={formAction} style={{ maxWidth: "560px", flex: "1 1 480px" }}>
        {product && <input type="hidden" name="id" value={product.id} />}
        <input type="hidden" name="categoryId" value={effectiveCategoryId} />

        <label className="auth-label" htmlFor="name">Name</label>
        <input className="auth-input" id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} required />

        <label className="auth-label" htmlFor="description">Description</label>
        <textarea className="auth-input" id="description" name="description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />

        <div className="form-row-2">
          <div style={{ flex: 1 }}>
            <label className="auth-label" htmlFor="price">Price (₹)</label>
            <input className="auth-input" id="price" name="price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </div>
          <div style={{ flex: 1 }}>
            <label className="auth-label" htmlFor="compareAtPrice">Compare-at Price (₹)</label>
            <input className="auth-input" id="compareAtPrice" name="compareAtPrice" type="number" step="0.01" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} />
          </div>
        </div>

        <div className="form-row-2">
          <div style={{ flex: 1 }}>
            <label className="auth-label" htmlFor="mainCategoryId">Main Category</label>
            <select className="auth-input" id="mainCategoryId" value={mainCategoryId} onChange={onMainCategoryChange} required>
              <option value="" disabled>Select main category</option>
              {roots.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label className="auth-label" htmlFor="subCategoryId">Sub-category</label>
            {subcategories.length > 0 ? (
              <select className="auth-input" id="subCategoryId" value={subCategoryId} onChange={(e) => setSubCategoryId(e.target.value)}>
                <option value="">— none —</option>
                {subcategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            ) : (
              <p style={{ color: "var(--muted, #999)", fontSize: ".82rem", margin: ".5rem 0 0" }}>
                No sub-categories under {mainCategoryName || "this category"} yet — add one in Admin → Categories.
              </p>
            )}
          </div>
        </div>

        <label className="auth-label">Photos</label>

        {images.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: ".6rem", marginBottom: ".7rem" }}>
            {images.map((img) => (
              <div key={img.id} style={{ position: "relative" }}>
                <img src={img.image_url} alt="" style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px" }} />
                <form action={deleteProductImage} style={{ position: "absolute", top: "-6px", right: "-6px" }}>
                  <input type="hidden" name="id" value={img.id} />
                  <input type="hidden" name="productId" value={product?.id} />
                  <button
                    type="submit"
                    aria-label="Remove photo"
                    style={{ width: "20px", height: "20px", borderRadius: "50%", border: "none", background: "#FF6B6B", color: "#fff", fontSize: ".7rem", lineHeight: 1, cursor: "pointer" }}
                  >
                    ×
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}

        <input className="auth-input" id="imageFiles" name="imageFiles" type="file" accept="image/*" multiple onChange={onPhotosChange} />
        <p style={{ color: "var(--muted, #999)", fontSize: ".78rem", margin: ".4rem 0 0" }}>
          {images.length === 0
            ? "Pick several at once — the first one becomes the main photo."
            : "Pick more to add to the gallery above."}
        </p>

        {photoPreviews.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: ".6rem", marginTop: ".7rem" }}>
            {photoPreviews.map((src, i) => (
              <img key={src} src={src} alt="" style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px", outline: i === 0 && images.length === 0 ? "2px solid var(--ac, #00C4D4)" : "none" }} />
            ))}
          </div>
        )}

        <label className="auth-label" htmlFor="imageUrl" style={{ marginTop: "1rem" }}>or Image URL / path (e.g. /cat_tshirt.png) — used if no photo uploaded above</label>
        <input className="auth-input" id="imageUrl" name="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="/cat_tshirt.png" />

        <label className="auth-label" htmlFor="sizes">
          Sizes (comma separated — size:price:stock, e.g. M:1100:5 — leave price or stock blank to use the product&apos;s default; stock 0 shows that size sold out)
        </label>
        <input
          className="auth-input"
          id="sizes"
          name="sizes"
          defaultValue={(product?.sizes || [])
            .map((s) => {
              if (typeof s === "string") return s;
              const price = s.price != null ? s.price : "";
              const stock = s.stock != null ? s.stock : "";
              return stock !== "" ? `${s.size}:${price}:${stock}` : price !== "" ? `${s.size}:${price}` : s.size;
            })
            .join(", ")}
          placeholder="S, M:1100:5, L:1200, XL::0"
        />

        <label className="auth-label" htmlFor="stock">Stock</label>
        <input className="auth-input" id="stock" name="stock" type="number" defaultValue={product?.stock ?? 0} />

        <div className="form-row-2">
          <div style={{ flex: 1 }}>
            <label className="auth-label" htmlFor="sku">SKU <span style={{ fontWeight: 400 }}>(optional, shown on invoices)</span></label>
            <input className="auth-input" id="sku" name="sku" defaultValue={product?.sku} placeholder="TSH-RED-M" />
          </div>
          <div style={{ flex: 1 }}>
            <label className="auth-label" htmlFor="hsnCode">HSN Code <span style={{ fontWeight: 400 }}>(optional)</span></label>
            <input className="auth-input" id="hsnCode" name="hsnCode" defaultValue={product?.hsn_code} placeholder="6109" />
          </div>
        </div>

        <label className="auth-label" htmlFor="specifications">Product Details (one per line, &quot;Label: Value&quot;)</label>
        <textarea
          className="auth-input"
          id="specifications"
          name="specifications"
          rows={4}
          defaultValue={(product?.specifications || []).map((s) => `${s.label}: ${s.value}`).join("\n")}
          placeholder={"Material: Polyester & Elastane\nFit: Regular\nCare: Machine wash cold"}
        />

        <label className="auth-label" style={{ display: "flex", alignItems: "center", gap: ".5rem", marginTop: ".5rem" }}>
          <input type="checkbox" name="isActive" defaultChecked={product ? product.is_active : true} />
          Active (visible in store)
        </label>

        {state?.error && <p className="auth-error">{state.error}</p>}

        <button className="auth-btn" type="submit" disabled={pending}>
          {pending ? "Saving…" : product ? "Save Changes" : "Create Product"}
        </button>
      </form>

      <div style={{ position: "sticky", top: "1.5rem", flex: "1 1 320px", maxWidth: "380px" }}>
        <div style={{ fontSize: ".7rem", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted, #999)", marginBottom: ".75rem" }}>
          Live Preview — Product Page
        </div>
        <div className="auth-card" style={{ maxWidth: "380px" }}>
          <div style={{ width: "100%", aspectRatio: "1", borderRadius: "10px", overflow: "hidden", background: "#eee", marginBottom: "1rem" }}>
            {coverPreview ? (
              <img src={coverPreview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: ".8rem" }}>
                No photo yet
              </div>
            )}
          </div>
          {photoPreviews.length > 1 && (
            <div style={{ display: "flex", gap: ".4rem", marginBottom: "1rem" }}>
              {photoPreviews.slice(1).map((src) => (
                <img key={src} src={src} alt="" style={{ width: "44px", height: "44px", objectFit: "cover", borderRadius: "6px" }} />
              ))}
            </div>
          )}
          <div style={{ fontSize: ".7rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ac, #00C4D4)" }}>
            {subCategoryName || mainCategoryName || "Category"}
          </div>
          <div style={{ fontSize: "1.2rem", fontWeight: 700, margin: ".3rem 0" }}>{name || "Product name"}</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: ".6rem" }}>
            <span style={{ fontSize: "1.1rem", fontWeight: 700 }}>₹{price ? Number(price).toFixed(2) : "0.00"}</span>
            {discount > 0 && (
              <>
                <span style={{ textDecoration: "line-through", color: "var(--muted, #999)", fontSize: ".9rem" }}>₹{Number(compareAtPrice).toFixed(2)}</span>
                <span style={{ color: "#2E9E5B", fontSize: ".8rem", fontWeight: 700 }}>{discount}% OFF</span>
              </>
            )}
          </div>
          {description && <p style={{ fontSize: ".85rem", color: "var(--off, #555)", marginTop: ".7rem", lineHeight: 1.5 }}>{description}</p>}
        </div>
      </div>
    </div>
  );
}
