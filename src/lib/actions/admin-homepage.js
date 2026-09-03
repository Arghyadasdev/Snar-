"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";
import { uploadProductImage } from "@/lib/cloudinary";

export async function listBannersAdmin() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data } = await admin.from("banners").select("*").order("sort_order", { ascending: true });
  return data || [];
}

export async function getBannerAdmin(id) {
  await requireAdmin();
  const admin = createAdminClient();
  const { data } = await admin.from("banners").select("*").eq("id", id).single();
  return data;
}

async function readBannerForm(formData) {
  const mediaType = formData.get("mediaType")?.toString() || "image";
  let mediaUrl = formData.get("mediaUrl")?.toString().trim() || "";

  const mediaFile = formData.get("mediaFile");
  if (mediaType === "image" && mediaFile instanceof File && mediaFile.size > 0) {
    mediaUrl = await uploadProductImage(mediaFile);
  }

  return {
    eyebrow: formData.get("eyebrow")?.toString().trim() || "",
    headline_line1: formData.get("headlineLine1")?.toString().trim() || "",
    headline_line2: formData.get("headlineLine2")?.toString().trim() || "",
    accent_word: formData.get("accentWord")?.toString().trim() || "",
    subtitle: formData.get("subtitle")?.toString().trim() || "",
    cta1_label: formData.get("cta1Label")?.toString().trim() || "",
    cta1_href: formData.get("cta1Href")?.toString().trim() || "/collections",
    cta2_label: formData.get("cta2Label")?.toString().trim() || "",
    cta2_href: formData.get("cta2Href")?.toString().trim() || "/collections",
    media_type: mediaType,
    media_url: mediaUrl,
    sort_order: Number(formData.get("sortOrder")) || 0,
    is_active: formData.get("isActive") === "on",
  };
}

export async function createBanner(prevState, formData) {
  await requireAdmin();
  const fields = await readBannerForm(formData);

  if (!fields.headline_line1 || !fields.media_url) {
    return { error: "Headline and media (upload or URL) are required." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("banners").insert(fields);
  if (error) return { error: error.message };

  revalidatePath("/admin/homepage");
  revalidatePath("/");
  redirect("/admin/homepage");
}

export async function updateBanner(prevState, formData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  const fields = await readBannerForm(formData);

  if (!fields.headline_line1 || !fields.media_url) {
    return { error: "Headline and media (upload or URL) are required." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("banners").update(fields).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/homepage");
  revalidatePath("/");
  redirect("/admin/homepage");
}

export async function deleteBanner(formData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  const admin = createAdminClient();
  await admin.from("banners").delete().eq("id", id);
  revalidatePath("/admin/homepage");
  revalidatePath("/");
}

export async function listMarqueeAdmin() {
  await requireAdmin();
  const admin = createAdminClient();
  const { data } = await admin.from("marquee_items").select("*").order("sort_order", { ascending: true });
  return data || [];
}

export async function createMarqueeItem(formData) {
  await requireAdmin();
  const text = formData.get("text")?.toString().trim();
  if (!text) return;

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("marquee_items")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  await admin.from("marquee_items").insert({
    text,
    sort_order: (existing?.sort_order || 0) + 1,
  });

  revalidatePath("/admin/homepage");
  revalidatePath("/");
}

export async function updateMarqueeItem(formData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  const text = formData.get("text")?.toString().trim();
  const sortOrder = Number(formData.get("sortOrder")) || 0;
  const isActive = formData.get("isActive") === "on";

  const admin = createAdminClient();
  await admin.from("marquee_items").update({ text, sort_order: sortOrder, is_active: isActive }).eq("id", id);

  revalidatePath("/admin/homepage");
  revalidatePath("/");
}

export async function deleteMarqueeItem(formData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  const admin = createAdminClient();
  await admin.from("marquee_items").delete().eq("id", id);
  revalidatePath("/admin/homepage");
  revalidatePath("/");
}
