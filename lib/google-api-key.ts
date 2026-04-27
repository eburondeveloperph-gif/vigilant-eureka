/**
 * Google Public API Key
 *
 * Used for Google APIs that accept an API key (no per-user OAuth needed):
 *   • YouTube Data API v3
 *   • Google Translate (basic v2)
 *   • Custom Search (if added later)
 *
 * The default key is intended for browser use. **It MUST be restricted on the
 * Google Cloud Console** to:
 *   • specific HTTP referrers (your origin), AND
 *   • a single API at a time (e.g. YouTube Data API v3, Cloud Translation API).
 *
 * For per-user, scoped data (Gmail, Calendar, Drive, Sheets, Slides, Docs,
 * Tasks, Contacts/People, Forms, Chat, YouTube *upload* / playlist *write*)
 * we always use the user's Firebase Google OAuth access token instead.
 *
 * Override at runtime by setting VITE_GOOGLE_API_KEY in .env.local.
 */

const DEFAULT_GOOGLE_API_KEY = 'AIzaSyCzHS4ua-9B3V1dRqEH_uxnSYXw3u3RJCM';

export function getGoogleApiKey(): string {
  const env = (import.meta as any).env || {};
  return env.VITE_GOOGLE_API_KEY || DEFAULT_GOOGLE_API_KEY;
}

/** Append `key=<API key>` to a URL safely (handles existing query strings). */
export function withApiKey(url: string, extraParams: Record<string, string | number | boolean | undefined> = {}): string {
  const u = new URL(url);
  u.searchParams.set('key', getGoogleApiKey());
  for (const [k, v] of Object.entries(extraParams)) {
    if (v === undefined || v === null || v === '') continue;
    u.searchParams.set(k, String(v));
  }
  return u.toString();
}
