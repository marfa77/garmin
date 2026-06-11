import { createServiceRoleClient } from "@/lib/supabase/server";
import {
  gumroadPurchaserEmail,
  gumroadSaleId,
  isGarminGumroadProduct,
  parseGumroadFormData,
} from "@/lib/gumroad";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const form = await request.formData();
  const payload = parseGumroadFormData(form);

  if (!isGarminGumroadProduct(payload)) {
    return NextResponse.json({ ok: true, skipped: "other_product" });
  }

  const saleId = gumroadSaleId(payload);
  const email = gumroadPurchaserEmail(payload);

  const supabase = createServiceRoleClient();

  await supabase.from("gumroad_webhook_events").insert({
    gumroad_sale_id: saleId,
    event_type: payload.refunded === "true" ? "refund" : "sale",
    payload,
  });

  if (!saleId || !email) {
    return NextResponse.json({ ok: false, error: "Missing sale_id or email" }, { status: 400 });
  }

  const isRefund = payload.refunded === "true" || payload.chargeback === "true";

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  const subscriptionRow = {
    user_id: profile?.id ?? null,
    gumroad_sale_id: saleId,
    gumroad_subscription_id: payload.subscription_id || null,
    gumroad_product_id: payload.product_id || null,
    gumroad_product_permalink: payload.product_permalink || null,
    purchaser_email: email,
    status: isRefund ? "refunded" : "active",
    access_granted: !isRefund,
    price_cents: payload.price ? Math.round(parseFloat(payload.price) * 100) : null,
    currency: payload.currency || "usd",
    purchased_at: new Date().toISOString(),
    raw_payload: payload,
  };

  const { error: subError } = await supabase.from("subscriptions").upsert(subscriptionRow, {
    onConflict: "gumroad_sale_id",
  });

  if (subError) {
    return NextResponse.json({ ok: false, error: subError.message }, { status: 500 });
  }

  if (profile?.id && !isRefund) {
    await supabase
      .from("profiles")
      .update({ onboarding_step: "connect_garmin", gumroad_email: email })
      .eq("id", profile.id);
  }

  await supabase
    .from("gumroad_webhook_events")
    .update({ processed_at: new Date().toISOString() })
    .eq("gumroad_sale_id", saleId);

  return NextResponse.json({ ok: true });
}
