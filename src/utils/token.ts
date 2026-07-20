/**
 * Extract EWT token from cookie (mirrors token.ts in the reference project).
 * EWT stores the token in document.cookie under the key "token".
 */
export function getToken(): string | null {
  const m = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}
