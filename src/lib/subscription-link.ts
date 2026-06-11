import { createServiceRoleClient } from "@/lib/supabase/server";

/** Attach Gumroad purchases made before signup to the logged-in profile. */
export async function linkSubscriptionsByEmail(userId: string, email: string) {
  const admin = createServiceRoleClient();
  await admin
    .from("subscriptions")
    .update({ user_id: userId })
    .eq("purchaser_email", email.toLowerCase())
    .is("user_id", null)
    .eq("status", "active");
}
