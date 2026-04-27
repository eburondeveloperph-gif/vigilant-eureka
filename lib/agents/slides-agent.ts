/**
 * Google Slides Agent
 *   slides_create        — new presentation
 *   slides_add_slide     — append a TITLE_AND_BODY slide
 *   slides_get           — load metadata for an existing deck
 */

import type { AgentHandler, AgentResult } from './types';
import { googleOauthFetch } from '@/lib/google-oauth-fetch';

const BASE = 'https://slides.googleapis.com/v1/presentations';

const newId = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export const handle: AgentHandler = async (
  toolName: string,
  args: Record<string, any>,
): Promise<AgentResult> => {
  try {
    switch (toolName) {
      case 'slides_create': {
        const title = String(args.title || 'Untitled deck').trim();
        const data = await googleOauthFetch(BASE, {
          method: 'POST',
          body: JSON.stringify({ title }),
        });
        return {
          status: 'success',
          message: `Created Slides deck "${title}".`,
          data: {
            presentationId: data.presentationId,
            url: `https://docs.google.com/presentation/d/${data.presentationId}/edit`,
            title,
          },
        };
      }

      case 'slides_add_slide': {
        const presentationId = String(args.presentationId || '').trim();
        const title = String(args.title || '').trim();
        const body = String(args.body || '').trim();
        if (!presentationId) return { status: 'error', message: 'presentationId is required.' };
        const slideId = newId('slide');
        const titleId = newId('title');
        const bodyId = newId('body');
        const requests: any[] = [
          {
            createSlide: {
              objectId: slideId,
              slideLayoutReference: { predefinedLayout: 'TITLE_AND_BODY' },
              placeholderIdMappings: [
                { objectId: titleId, layoutPlaceholder: { type: 'TITLE', index: 0 } },
                { objectId: bodyId, layoutPlaceholder: { type: 'BODY', index: 0 } },
              ],
            },
          },
        ];
        if (title) {
          requests.push({ insertText: { objectId: titleId, text: title } });
        }
        if (body) {
          requests.push({ insertText: { objectId: bodyId, text: body } });
        }
        const data = await googleOauthFetch(`${BASE}/${presentationId}:batchUpdate`, {
          method: 'POST',
          body: JSON.stringify({ requests }),
        });
        return {
          status: 'success',
          message: `Added slide "${title || '(untitled)'}".`,
          data: { slideId, raw: data },
        };
      }

      case 'slides_get': {
        const presentationId = String(args.presentationId || '').trim();
        if (!presentationId) return { status: 'error', message: 'presentationId is required.' };
        const data = await googleOauthFetch(`${BASE}/${presentationId}`);
        return {
          status: 'success',
          message: `"${data.title}" has ${data.slides?.length ?? 0} slide${(data.slides?.length ?? 0) === 1 ? '' : 's'}.`,
          data: {
            presentationId: data.presentationId,
            title: data.title,
            slideCount: data.slides?.length ?? 0,
            url: `https://docs.google.com/presentation/d/${data.presentationId}/edit`,
          },
        };
      }

      default:
        return { status: 'error', message: `Unknown Slides tool: "${toolName}".` };
    }
  } catch (err: any) {
    return { status: 'error', message: err?.message || 'Slides request failed.' };
  }
};
