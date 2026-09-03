"use client";

import { useActionState, useState } from "react";

export default function BannerForm({ action, banner }) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [mediaType, setMediaType] = useState(banner?.media_type || "image");
  const [preview, setPreview] = useState(banner?.media_type === "image" ? banner?.media_url : "");

  function onFileChange(e) {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  }

  return (
    <form className="auth-card" action={formAction} style={{ maxWidth: "560px" }}>
      {banner && <input type="hidden" name="id" value={banner.id} />}

      <label className="auth-label" htmlFor="eyebrow">Eyebrow (small label above headline)</label>
      <input className="auth-input" id="eyebrow" name="eyebrow" defaultValue={banner?.eyebrow} placeholder="PREMIUM SPORTSWEAR" />

      <div style={{ display: "flex", gap: "1rem" }}>
        <div style={{ flex: 1 }}>
          <label className="auth-label" htmlFor="headlineLine1">Headline Line 1</label>
          <input className="auth-input" id="headlineLine1" name="headlineLine1" defaultValue={banner?.headline_line1} required />
        </div>
        <div style={{ flex: 1 }}>
          <label className="auth-label" htmlFor="headlineLine2">Headline Line 2</label>
          <input className="auth-input" id="headlineLine2" name="headlineLine2" defaultValue={banner?.headline_line2} />
        </div>
        <div style={{ flex: 1 }}>
          <label className="auth-label" htmlFor="accentWord">Accent Word</label>
          <input className="auth-input" id="accentWord" name="accentWord" defaultValue={banner?.accent_word} placeholder="EDGE" />
        </div>
      </div>

      <label className="auth-label" htmlFor="subtitle">Subtitle</label>
      <input className="auth-input" id="subtitle" name="subtitle" defaultValue={banner?.subtitle} />

      <div style={{ display: "flex", gap: "1rem" }}>
        <div style={{ flex: 1 }}>
          <label className="auth-label" htmlFor="cta1Label">Button 1 Label</label>
          <input className="auth-input" id="cta1Label" name="cta1Label" defaultValue={banner?.cta1_label || "SHOP NOW"} />
        </div>
        <div style={{ flex: 1 }}>
          <label className="auth-label" htmlFor="cta1Href">Button 1 Link</label>
          <input className="auth-input" id="cta1Href" name="cta1Href" defaultValue={banner?.cta1_href || "/collections"} />
        </div>
      </div>
      <div style={{ display: "flex", gap: "1rem" }}>
        <div style={{ flex: 1 }}>
          <label className="auth-label" htmlFor="cta2Label">Button 2 Label (optional)</label>
          <input className="auth-input" id="cta2Label" name="cta2Label" defaultValue={banner?.cta2_label} />
        </div>
        <div style={{ flex: 1 }}>
          <label className="auth-label" htmlFor="cta2Href">Button 2 Link</label>
          <input className="auth-input" id="cta2Href" name="cta2Href" defaultValue={banner?.cta2_href || "/collections"} />
        </div>
      </div>

      <label className="auth-label" htmlFor="mediaType">Background Media Type</label>
      <select className="auth-input" id="mediaType" name="mediaType" value={mediaType} onChange={(e) => setMediaType(e.target.value)}>
        <option value="image">Image</option>
        <option value="video">Video</option>
      </select>

      {mediaType === "image" ? (
        <>
          <label className="auth-label" htmlFor="mediaFile">Upload Photo</label>
          <input className="auth-input" id="mediaFile" name="mediaFile" type="file" accept="image/*" onChange={onFileChange} />
          {preview && <img src={preview} alt="Preview" style={{ width: "160px", height: "90px", objectFit: "cover", borderRadius: "8px", marginTop: ".7rem" }} />}
        </>
      ) : (
        <p className="shop-sub" style={{ margin: ".3rem 0 0" }}>Video upload isn&apos;t supported yet — paste a path/URL below (e.g. a file in /public).</p>
      )}

      <label className="auth-label" htmlFor="mediaUrl">{mediaType === "image" ? "or Image URL / path" : "Video URL / path"}</label>
      <input className="auth-input" id="mediaUrl" name="mediaUrl" defaultValue={banner?.media_url} placeholder={mediaType === "video" ? "/banner.mp4" : "/banner_1.png"} />

      <label className="auth-label" htmlFor="sortOrder">Sort Order</label>
      <input className="auth-input" id="sortOrder" name="sortOrder" type="number" defaultValue={banner?.sort_order ?? 0} />

      <label className="auth-label" style={{ display: "flex", alignItems: "center", gap: ".5rem", marginTop: ".5rem" }}>
        <input type="checkbox" name="isActive" defaultChecked={banner ? banner.is_active : true} />
        Active (visible on homepage)
      </label>

      {state?.error && <p className="auth-error">{state.error}</p>}

      <button className="auth-btn" type="submit" disabled={pending}>
        {pending ? "Saving…" : banner ? "Save Changes" : "Create Banner"}
      </button>
    </form>
  );
}
