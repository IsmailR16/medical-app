import "server-only";
import { cache } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

export interface AppUser {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: "free" | "pro" | "institution";
  subscription_status: "active" | "canceled" | "past_due" | "trialing" | "incomplete";
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  // Consent tracking
  terms_accepted_at: string | null;
  terms_version: string | null;
  privacy_policy_accepted_at: string | null;
  privacy_policy_version: string | null;
  no_real_patient_data_acknowledged_at: string | null;
  marketing_consent: boolean;
  // Login tracking (for inactivity-based deletion)
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * JIT (Just-In-Time) user sync — deduplicated per request via React cache().
 * Call this in any server component or API route that needs the current user.
 *
 * - If the user already exists in Supabase → returns it
 * - If not → creates a new row with free-tier defaults
 * - Also updates email/name/avatar if they changed in Clerk
 */
export const getOrCreateUser = cache(async (): Promise<AppUser | null> => {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) return null;

  const fullName =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;
  const avatarUrl = clerkUser.imageUrl ?? null;

  const supabase = createServiceRoleClient();

  // Try to fetch existing user
  const { data: existingUser } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", clerkUser.id)
    .single();

  if (existingUser) {
    // Update profile fields + last_login_at on every call.
    // last_login_at is only updated if it's been > 1 hour since the last update,
    // to avoid hammering the DB on every navigation.
    const profileChanged =
      existingUser.email !== email ||
      existingUser.full_name !== fullName ||
      existingUser.avatar_url !== avatarUrl;
    const lastLogin = existingUser.last_login_at
      ? new Date(existingUser.last_login_at as string).getTime()
      : 0;
    const loginStale = Date.now() - lastLogin > 60 * 60 * 1000; // 1 hour

    if (profileChanged || loginStale) {
      const update: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (profileChanged) {
        update.email = email;
        update.full_name = fullName;
        update.avatar_url = avatarUrl;
      }
      if (loginStale) {
        update.last_login_at = new Date().toISOString();
        // Reset inactivity-warning flags so the next 2-year cycle can fire
        // warnings again if the user goes inactive again.
        update.warning_30d_sent_at = null;
        update.warning_7d_sent_at = null;
      }
      const { data: updatedUser } = await supabase
        .from("users")
        .update(update)
        .eq("user_id", clerkUser.id)
        .select("*")
        .single();

      return (updatedUser as AppUser) ?? (existingUser as AppUser);
    }

    return existingUser as AppUser;
  }

  // User doesn't exist — create with free-tier defaults.
  // Consent fields stay null until user goes through /accept-terms.
  //
  // Race-safe: the Clerk user.created webhook may insert this row in parallel
  // with this request. If INSERT hits a duplicate (Postgres error 23505),
  // re-fetch the existing row instead of returning null.
  const { data: newUser, error } = await supabase
    .from("users")
    .insert({
      user_id: clerkUser.id,
      email,
      full_name: fullName,
      avatar_url: avatarUrl,
      plan: "free",
      subscription_status: "inactive",
      cancel_at_period_end: false,
      last_login_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      // Webhook beat us to it — fetch the row that was just inserted.
      const { data: racedUser } = await supabase
        .from("users")
        .select("*")
        .eq("user_id", clerkUser.id)
        .single();
      if (racedUser) return racedUser as AppUser;
    }
    console.error("Failed to create user in Supabase:", error);
    return null;
  }

  return newUser as AppUser;
});
