import type { SupabaseClient } from "@supabase/supabase-js";

/** When true, skip Gumroad paywall — for demand testing / beta. */
export function isFreeBeta(): boolean {
  return (
    process.env.FREE_BETA === "true" || process.env.NEXT_PUBLIC_FREE_BETA === "true"
  );
}

export async function userHasAccess(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  if (isFreeBeta()) return true;

  const { data, error } = await supabase.rpc("has_active_subscription", { uid: userId });
  if (error) throw error;
  return Boolean(data);
}
