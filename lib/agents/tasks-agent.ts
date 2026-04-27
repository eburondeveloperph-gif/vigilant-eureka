/**
 * Google Tasks Agent
 *   tasks_list_lists       — show available task lists
 *   tasks_list             — list tasks in a list
 *   tasks_create           — add a task
 *   tasks_complete         — mark a task complete
 *   tasks_delete           — remove a task
 */

import type { AgentHandler, AgentResult } from './types';
import { googleOauthFetch } from '@/lib/google-oauth-fetch';

const BASE = 'https://tasks.googleapis.com/tasks/v1';

async function defaultListId(): Promise<string> {
  const data = await googleOauthFetch(`${BASE}/users/@me/lists`);
  return data?.items?.[0]?.id || '@default';
}

export const handle: AgentHandler = async (
  toolName: string,
  args: Record<string, any>,
): Promise<AgentResult> => {
  try {
    switch (toolName) {
      case 'tasks_list_lists': {
        const data = await googleOauthFetch(`${BASE}/users/@me/lists`);
        const lists = (data.items || []).map((l: any) => ({ id: l.id, title: l.title }));
        return {
          status: 'success',
          message: `${lists.length} task list${lists.length === 1 ? '' : 's'}.`,
          data: { lists },
        };
      }

      case 'tasks_list': {
        const listId = (args.listId as string) || (await defaultListId());
        const showCompleted = Boolean(args.showCompleted);
        const data = await googleOauthFetch(
          `${BASE}/lists/${encodeURIComponent(listId)}/tasks?showCompleted=${showCompleted}&maxResults=100`,
        );
        const items = (data.items || []).map((t: any) => ({
          id: t.id,
          title: t.title,
          notes: t.notes,
          due: t.due,
          status: t.status, // needsAction | completed
          completed: t.completed,
        }));
        return {
          status: 'success',
          message: `${items.length} task${items.length === 1 ? '' : 's'}.`,
          data: { listId, items },
        };
      }

      case 'tasks_create': {
        const title = String(args.title || '').trim();
        if (!title) return { status: 'error', message: 'title is required.' };
        const listId = (args.listId as string) || (await defaultListId());
        const body: any = { title };
        if (args.notes) body.notes = String(args.notes);
        if (args.due) body.due = new Date(args.due).toISOString();
        const data = await googleOauthFetch(
          `${BASE}/lists/${encodeURIComponent(listId)}/tasks`,
          { method: 'POST', body: JSON.stringify(body) },
        );
        return {
          status: 'success',
          message: `Added task "${title}".`,
          data: { id: data.id, listId, title: data.title, due: data.due },
        };
      }

      case 'tasks_complete': {
        const taskId = String(args.taskId || args.id || '').trim();
        if (!taskId) return { status: 'error', message: 'taskId is required.' };
        const listId = (args.listId as string) || (await defaultListId());
        const data = await googleOauthFetch(
          `${BASE}/lists/${encodeURIComponent(listId)}/tasks/${encodeURIComponent(taskId)}`,
          { method: 'PATCH', body: JSON.stringify({ status: 'completed' }) },
        );
        return { status: 'success', message: `Marked "${data.title}" complete.`, data };
      }

      case 'tasks_delete': {
        const taskId = String(args.taskId || args.id || '').trim();
        if (!taskId) return { status: 'error', message: 'taskId is required.' };
        const listId = (args.listId as string) || (await defaultListId());
        await googleOauthFetch(
          `${BASE}/lists/${encodeURIComponent(listId)}/tasks/${encodeURIComponent(taskId)}`,
          { method: 'DELETE' },
        );
        return { status: 'success', message: 'Task deleted.', data: { taskId } };
      }

      default:
        return { status: 'error', message: `Unknown Tasks tool: "${toolName}".` };
    }
  } catch (err: any) {
    return { status: 'error', message: err?.message || 'Tasks request failed.' };
  }
};
