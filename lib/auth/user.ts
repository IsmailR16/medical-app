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
    // Update profile fields if they changed in Clerk
    const needsUpdate =
      existingUser.email !== email ||
      existingUser.full_name !== fullName ||
      existingUser.avatar_url !== avatarUrl;

    if (needsUpdate) {
      const { data: updatedUser } = await supabase
        .from("users")
        .update({
          email,
          full_name: fullName,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", clerkUser.id)
        .select("*")
        .single();

      return (updatedUser as AppUser) ?? (existingUser as AppUser);
    }

    return existingUser as AppUser;
  }

  // User doesn't exist — create with free-tier defaults
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
    })
    .select("*")
    .single();

  if (error) {
    console.error("Failed to create user in Supabase:", error);
    return null;
  }

  return newUser as AppUser;
});
