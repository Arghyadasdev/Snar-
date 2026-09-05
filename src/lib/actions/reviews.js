"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, requireUser } from "@/lib/auth/dal";

export async function getMyReview(productId) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("reviews")
    .select("id, rating, review_text")
    .eq("product_id", productId)
    .eq("user_id", user.id)
    .limit(1);
  return data?.[0] || null;
}

export async function submitReview(prevState, formData) {
  const productId = formData.get("productId")?.toString();
  const slug = formData.get("slug")?.toString() || "/";
  const rating = Number(formData.get("rating"));
  const reviewText = formData.get("reviewText")?.toString().trim() || "";

  const user = await requireUser(`/product/${slug}`);

  if (!rating || rating < 1 || rating > 5) {
    return { error: "Pick a rating from 1 to 5." };
  }

  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const { error } = await supabase.from("reviews").upsert(
    {
      product_id: productId,
      user_id: user.id,
      customer_name: profile?.full_name || user.email?.split("@")[0] || "Customer",
      rating,
      review_text: reviewText,
    },
    { onConflict: "product_id,user_id" }
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/product/${slug}`);
  return { success: true };
}
