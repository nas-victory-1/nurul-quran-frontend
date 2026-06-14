import type { JwtClaims } from "@/types";

// Decode the payload of a JWT without verifying its signature (verification is
// the server's job). Returns null if the token is malformed.
export function decodeJwt(token: string): JwtClaims | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    // base64url -> base64
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json) as JwtClaims;
  } catch {
    return null;
  }
}
