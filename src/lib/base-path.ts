/** Client-safe base path for GitHub Pages (`/garmin`) vs local dev (``). */
export function getBasePath(): string {
  if (typeof window !== "undefined") {
    const { pathname } = window.location;
    if (pathname === "/garmin" || pathname.startsWith("/garmin/")) return "/garmin";
    return "";
  }
  return process.env.NEXT_PUBLIC_BASE_PATH ?? "";
}
