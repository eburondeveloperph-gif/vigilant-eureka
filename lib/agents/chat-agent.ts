/**
 * Google Chat Agent
 *   chat_list_spaces    — list spaces visible to the signed-in user
 *   chat_list_messages  — list recent messages in a space
 *   chat_send_message   — send a plain-text message to a space
 */

import type { AgentHandler, AgentResult } from './types';
import { googleOauthFetch } from '@/lib/google-oauth-fetch';

const BASE = 'https://chat.googleapis.com/v1';

function normaliseSpaceName(value: unknown): string {
  const raw = String(value || '').trim();
  if (!raw) return '';
  return raw.startsWith('spaces/') ? raw : `spaces/${raw}`;
}

function summariseSpace(space: any) {
  return {
    name: space.name,
    displayName: space.displayName || space.spaceDetails?.description || space.name,
    type: space.type || space.spaceType,
    spaceThreadingState: space.spaceThreadingState,
    spaceHistoryState: space.spaceHistoryState,
    createTime: space.createTime,
    lastActiveTime: space.lastActiveTime,
  };
}

function summariseMessage(message: any) {
  return {
    name: message.name,
    sender: message.sender?.displayName || message.sender?.name,
    createTime: message.createTime,
    text: message.text || '',
    thread: message.thread?.name,
  };
}

export const handle: AgentHandler = async (
  toolName: string,
  args: Record<string, any>,
): Promise<AgentResult> => {
  try {
    switch (toolName) {
      case 'chat_list_spaces': {
        const pageSize = Math.min(Math.max(Number(args.limit) || 20, 1), 100);
        const query = String(args.query || '').trim().toLowerCase();
        const url = new URL(`${BASE}/spaces`);
        url.searchParams.set('pageSize', String(pageSize));
        if (args.pageToken) url.searchParams.set('pageToken', String(args.pageToken));
        const data = await googleOauthFetch(url.toString());
        let spaces = (data.spaces || []).map(summariseSpace);
        if (query) {
          spaces = spaces.filter((space: any) =>
            [space.name, space.displayName, space.type].some(value =>
              String(value || '').toLowerCase().includes(query),
            ),
          );
        }
        return {
          status: 'success',
          message: `Loaded ${spaces.length} Google Chat space${spaces.length === 1 ? '' : 's'}.`,
          data: { spaces, nextPageToken: data.nextPageToken },
        };
      }

      case 'chat_list_messages': {
        const space = normaliseSpaceName(args.space || args.spaceName || args.parent);
        if (!space) return { status: 'error', message: 'space is required, e.g. "spaces/AAAA...".' };
        const pageSize = Math.min(Math.max(Number(args.limit) || 20, 1), 100);
        const url = new URL(`${BASE}/${space}/messages`);
        url.searchParams.set('pageSize', String(pageSize));
        if (args.pageToken) url.searchParams.set('pageToken', String(args.pageToken));
        const data = await googleOauthFetch(url.toString());
        const messages = (data.messages || []).map(summariseMessage);
        return {
          status: 'success',
          message: `Loaded ${messages.length} message${messages.length === 1 ? '' : 's'} from ${space}.`,
          data: { space, messages, nextPageToken: data.nextPageToken },
        };
      }

      case 'chat_send_message': {
        const space = normaliseSpaceName(args.space || args.spaceName || args.parent);
        const text = String(args.text || args.message || '').trim();
        if (!space) return { status: 'error', message: 'space is required, e.g. "spaces/AAAA...".' };
        if (!text) return { status: 'error', message: 'message text is required.' };
        const body: any = { text };
        if (args.threadKey) {
          body.thread = { threadKey: String(args.threadKey) };
        } else if (args.thread) {
          body.thread = { name: String(args.thread) };
        }
        const url = new URL(`${BASE}/${space}/messages`);
        if (args.messageReplyOption) {
          url.searchParams.set('messageReplyOption', String(args.messageReplyOption));
        }
        const data = await googleOauthFetch(url.toString(), {
          method: 'POST',
          body: JSON.stringify(body),
        });
        return {
          status: 'success',
          message: `Sent message to ${space}.`,
          data: summariseMessage(data),
        };
      }

      default:
        return { status: 'error', message: `Unknown Chat tool: "${toolName}".` };
    }
  } catch (err: any) {
    return { status: 'error', message: err?.message || 'Google Chat request failed.' };
  }
};
