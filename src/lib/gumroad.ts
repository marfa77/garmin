export const GUMROAD_CHECKOUT_URL =
  process.env.NEXT_PUBLIC_GUMROAD_CHECKOUT_URL ?? "https://pixidstudio.gumroad.com/l/uinvw";

export function gumroadCheckoutUrl(email?: string | null): string {
  const url = new URL(GUMROAD_CHECKOUT_URL);
  if (email?.trim()) {
    url.searchParams.set("email", email.trim());
  }
  return url.toString();
}

export function parseGumroadFormData(form: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  form.forEach((value, key) => {
    out[key] = String(value);
  });
  return out;
}

export function gumroadSaleId(payload: Record<string, string>): string | null {
  return payload.sale_id || payload.saleId || payload.order_number || null;
}

export function gumroadPurchaserEmail(payload: Record<string, string>): string | null {
  const email = payload.email || payload.purchaser_email || payload.buyer_email;
  return email?.trim().toLowerCase() || null;
}
