/**
 * Shared Google OAuth fetch helper.
 *
 * Used by every agent that calls a Google API requiring per-user authorization
 * (Sheets, Slides, Tasks, People, Forms, Chat, YouTube write operations, …).
 *
 * Reads the cached Firebase Google OAuth access token (set during sign-in) via
 * lib/firebase.ts. If no token is present, throws with a clear "ask the user
 * to sign in again" message that agents can surface verbatim to Beatrice.
 */

import { clearStoredGoogleAccessToken, getStoredGoogleAccessToken } from './firebase';

export class GoogleAuthError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'GoogleAuthError';
    this.status = status;
  }
}

const NOT_SIGNED_IN_MSG =
  'Google Workspace is not connected. Ask the user to sign in with Google so a fresh OAuth token is available.';

export async function googleOauthFetch(
  url: string,
  init: RequestInit = {},
): Promise<any> {
  const token = getStoredGoogleAccessToken();
  if (!token) throw new GoogleAuthError(NOT_SIGNED_IN_MSG);
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }
  const resp = await fetch(url, { ...init, headers });
  let data: any = null;
  try { data = await resp.json(); } catch { /* not JSON */ }
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      clearStoredGoogleAccessToken();
    }
    const msg = data?.error?.message || `Google API error (HTTP ${resp.status}).`;
    throw new GoogleAuthError(msg, resp.status);
  }
  return data;
}
