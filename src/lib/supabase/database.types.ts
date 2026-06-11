export type SubscriptionStatus = "active" | "cancelled" | "ended" | "refunded" | "disputed";

export type OnboardingStep = "signup" | "subscribe" | "connect_garmin" | "ready";

export type CoachPersonaDb = "caring" | "sarcastic";

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  locale: "en" | "ru";
  coach_persona: CoachPersonaDb;
  onboarding_step: OnboardingStep;
  gumroad_email: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string | null;
  gumroad_sale_id: string;
  gumroad_subscription_id: string | null;
  gumroad_product_id: string | null;
  gumroad_product_permalink: string | null;
  purchaser_email: string;
  status: SubscriptionStatus;
  access_granted: boolean;
  price_cents: number | null;
  currency: string | null;
  purchased_at: string;
  cancelled_at: string | null;
  ends_at: string | null;
  raw_payload: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface GarminConnectionStatus {
  id: string;
  user_id: string;
  garmin_email: string | null;
  last_login_at: string | null;
  last_sync_at: string | null;
  last_sync_status: "ok" | "mfa_required" | "failed" | null;
  last_sync_error: string | null;
  mfa_pending: boolean;
  created_at: string;
  updated_at: string;
}

export interface DashboardSnapshot {
  id: string;
  user_id: string;
  synced_at: string;
  device: string | null;
  source: string;
  payload: Record<string, unknown>;
  created_at: string;
}
