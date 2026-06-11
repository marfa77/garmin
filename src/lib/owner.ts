/** Accounts with full dashboard access without Garmin OAuth (local token sync). */
const OWNER_EMAILS = (process.env.OWNER_EMAILS ?? "pv.inform@gmail.com")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isOwnerEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return OWNER_EMAILS.includes(email.trim().toLowerCase());
}
