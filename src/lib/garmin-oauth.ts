import { createHash, randomBytes } from "crypto";

const AUTH_URL = "https://connect.garmin.com/oauth2Confirm";
const TOKEN_URL = "https://diauth.garmin.com/di-oauth2-service/oauth/token";

export type GarminOAuthTokens = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_token_expires_in?: number;
  token_type?: string;
  scope?: string;
};

export type GarminOAuthBlob = {
  v: 2;
  oauth: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
    refresh_token_expires_at: number;
    token_type: string;
  };
};

export function appOrigin(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
  return url.replace(/\/$/, "");
}

export function garminRedirectUri(): string {
  return `${appOrigin()}/api/garmin/oauth/callback`;
}

export function isGarminOAuthConfigured(): boolean {
  return Boolean(process.env.GARMIN_CLIENT_ID?.trim() && process.env.GARMIN_CLIENT_SECRET?.trim());
}

/** PKCE code_verifier — 43–128 chars from unreserved set. */
export function generateCodeVerifier(): string {
  return randomBytes(48)
    .toString("base64url")
    .replace(/[^a-zA-Z0-9\-._~]/g, "")
    .slice(0, 64);
}

export function generateCodeChallenge(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

export function buildGarminAuthUrl(params: {
  clientId: string;
  state: string;
  codeChallenge: string;
}): string {
  const qs = new URLSearchParams({
    client_id: params.clientId,
    response_type: "code",
    redirect_uri: garminRedirectUri(),
    state: params.state,
    code_challenge: params.codeChallenge,
    code_challenge_method: "S256",
  });
  return `${AUTH_URL}?${qs.toString()}`;
}

export async function exchangeGarminCode(
  code: string,
  codeVerifier: string
): Promise<GarminOAuthTokens> {
  const clientId = process.env.GARMIN_CLIENT_ID!.trim();
  const clientSecret = process.env.GARMIN_CLIENT_SECRET!.trim();

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    client_secret: clientSecret,
    code,
    code_verifier: codeVerifier,
    redirect_uri: garminRedirectUri(),
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: body.toString(),
  });

  if (!res.ok) {
    throw new Error(`Garmin token exchange failed (${res.status})`);
  }

  return res.json() as Promise<GarminOAuthTokens>;
}

export async function refreshGarminToken(refreshToken: string): Promise<GarminOAuthTokens> {
  const clientId = process.env.GARMIN_CLIENT_ID!.trim();
  const clientSecret = process.env.GARMIN_CLIENT_SECRET!.trim();

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: body.toString(),
  });

  if (!res.ok) {
    throw new Error(`Garmin token refresh failed (${res.status})`);
  }

  return res.json() as Promise<GarminOAuthTokens>;
}

export function oauthTokensToBlob(tokens: GarminOAuthTokens): string {
  const now = Date.now();
  const blob: GarminOAuthBlob = {
    v: 2,
    oauth: {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: now + tokens.expires_in * 1000,
      refresh_token_expires_at: now + (tokens.refresh_token_expires_in ?? 90 * 24 * 3600) * 1000,
      token_type: tokens.token_type ?? "Bearer",
    },
  };
  return JSON.stringify(blob);
}

export function parseOAuthBlob(tokenBlob: string): GarminOAuthBlob | null {
  try {
    const parsed = JSON.parse(tokenBlob) as GarminOAuthBlob;
    if (parsed?.v === 2 && parsed.oauth?.access_token && parsed.oauth?.refresh_token) {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return null;
}
