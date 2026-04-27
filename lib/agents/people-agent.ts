/**
 * Google Contacts (People API) Agent
 *   people_search   — search the user's contacts
 *   people_list     — list connections (recent contacts)
 */

import type { AgentHandler, AgentResult } from './types';
import { googleOauthFetch } from '@/lib/google-oauth-fetch';

const BASE = 'https://people.googleapis.com/v1';
const PERSON_FIELDS = 'names,emailAddresses,phoneNumbers,organizations,photos';

function summarisePerson(p: any) {
  return {
    resourceName: p.resourceName,
    name: p.names?.[0]?.displayName,
    emails: (p.emailAddresses || []).map((e: any) => e.value),
    phones: (p.phoneNumbers || []).map((n: any) => n.canonicalForm || n.value),
    organisation: p.organizations?.[0]?.name,
    photo: p.photos?.[0]?.url,
  };
}

export const handle: AgentHandler = async (
  toolName: string,
  args: Record<string, any>,
): Promise<AgentResult> => {
  try {
    switch (toolName) {
      case 'people_search': {
        const query = String(args.query || '').trim();
        if (!query) return { status: 'error', message: 'query is required.' };
        // people:searchContacts requires a warm-up call first per Google docs;
        // we send a lightweight call then the actual search.
        try {
          await googleOauthFetch(
            `${BASE}/people:searchContacts?query=&readMask=${encodeURIComponent(PERSON_FIELDS)}&pageSize=1`,
          );
        } catch { /* warm-up best-effort */ }
        const data = await googleOauthFetch(
          `${BASE}/people:searchContacts?query=${encodeURIComponent(query)}&readMask=${encodeURIComponent(PERSON_FIELDS)}&pageSize=10`,
        );
        const results = (data.results || []).map((r: any) => summarisePerson(r.person || {}));
        return {
          status: 'success',
          message: `Found ${results.length} contact${results.length === 1 ? '' : 's'} matching "${query}".`,
          data: { query, results },
        };
      }

      case 'people_list': {
        const pageSize = Math.min(Math.max(Number(args.limit) || 30, 1), 100);
        const data = await googleOauthFetch(
          `${BASE}/people/me/connections?personFields=${encodeURIComponent(PERSON_FIELDS)}&pageSize=${pageSize}&sortOrder=LAST_MODIFIED_DESCENDING`,
        );
        const connections = (data.connections || []).map(summarisePerson);
        return {
          status: 'success',
          message: `Loaded ${connections.length} contact${connections.length === 1 ? '' : 's'}.`,
          data: { connections },
        };
      }

      default:
        return { status: 'error', message: `Unknown People tool: "${toolName}".` };
    }
  } catch (err: any) {
    return { status: 'error', message: err?.message || 'People request failed.' };
  }
};
