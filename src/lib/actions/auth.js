"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signup(prevState, formData) {
  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();
  const next = formData.get("next")?.toString() || "/";

  if (!name || name.length < 2) {
    return { error: "Please enter your full name." };
  }
  if (!email) {
    return { error: "Please enter a valid email." };
  }
  if (!password || password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } },
  });

  if (error) {
    if (error.code === "over_email_send_rate_limit" || error.status === 429) {
      return {
        error:
          "Too many signup emails were sent recently (Supabase's free email limit). Turn off \"Confirm email\" in Supabase Dashboard → Authentication → Sign In / Providers → Email, then try again — no email will be needed at all.",
      };
    }
    if (error.code === "user_already_exists" || error.message.toLowerCase().includes("already registered")) {
      return { error: "An account with this email already exists. Try logging in instead." };
    }
    return { error: error.message };
  }

  // If email confirmation is required, Supabase creates the user but returns
  // no session — signUp "succeeds" without actually logging the user in.
  if (!data.session) {
    return {
      success:
        "Account created. Check your email to confirm it before logging in — or ask your admin to disable email confirmation for instant signup.",
    };
  }

  redirect(next);
}

export async function login(prevState, formData) {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();
  const next = formData.get("next")?.toString() || "/";

  if (!email || !password) {
    return { error: "Please enter your email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.code === "email_not_confirmed") {
      return {
        error:
          "Please confirm your email before logging in (check your inbox), or ask your admin to disable email confirmation in Supabase.",
      };
    }
    if (error.code === "over_email_send_rate_limit" || error.status === 429) {
      return { error: "Too many attempts right now — please wait a few minutes and try again." };
    }
    return { error: "Invalid email or password." };
  }

  redirect(next);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
