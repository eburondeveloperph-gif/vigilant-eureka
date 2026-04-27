/**
 * Google Forms Agent
 *   forms_create          — create a form, optionally with starter questions
 *   forms_get             — read form metadata/items
 *   forms_add_question    — add a text/choice question
 *   forms_list_responses  — list submitted responses
 */

import type { AgentHandler, AgentResult } from './types';
import { googleOauthFetch } from '@/lib/google-oauth-fetch';

const BASE = 'https://forms.googleapis.com/v1/forms';

type ChoiceType = 'RADIO' | 'CHECKBOX' | 'DROP_DOWN';

function normaliseChoiceType(value: unknown): ChoiceType {
  const raw = String(value || 'RADIO').toUpperCase();
  if (raw === 'CHECKBOX' || raw === 'DROP_DOWN') return raw;
  return 'RADIO';
}

function buildQuestionItem(args: Record<string, any>) {
  const title = String(args.title || args.question || '').trim();
  if (!title) throw new Error('title/question is required.');

  const description = args.description ? String(args.description) : undefined;
  const required = Boolean(args.required);
  const options = Array.isArray(args.options)
    ? args.options.map((option: any) => String(option).trim()).filter(Boolean)
    : [];

  const question: any = { required };
  if (options.length > 0) {
    question.choiceQuestion = {
      type: normaliseChoiceType(args.choiceType || args.type),
      options: options.map((value: string) => ({ value })),
      shuffle: Boolean(args.shuffle),
    };
  } else {
    question.textQuestion = {
      paragraph: Boolean(args.paragraph),
    };
  }

  return {
    title,
    ...(description ? { description } : {}),
    questionItem: { question },
  };
}

function summariseForm(form: any) {
  const formId = form.formId || form.formId;
  return {
    formId,
    title: form.info?.title || form.info?.documentTitle || 'Untitled form',
    documentTitle: form.info?.documentTitle,
    responderUri: form.responderUri,
    revisionId: form.revisionId,
    itemCount: form.items?.length || 0,
    items: (form.items || []).map((item: any) => ({
      itemId: item.itemId,
      title: item.title,
      description: item.description,
      questionId: item.questionItem?.question?.questionId,
      type: item.questionItem?.question?.choiceQuestion
        ? item.questionItem.question.choiceQuestion.type
        : item.questionItem?.question?.textQuestion
          ? 'TEXT'
          : 'OTHER',
    })),
  };
}

export const handle: AgentHandler = async (
  toolName: string,
  args: Record<string, any>,
): Promise<AgentResult> => {
  try {
    switch (toolName) {
      case 'forms_create': {
        const title = String(args.title || 'Untitled form').trim();
        const documentTitle = String(args.documentTitle || title).trim();
        const form = await googleOauthFetch(BASE, {
          method: 'POST',
          body: JSON.stringify({
            info: { title, documentTitle },
          }),
        });

        const starterQuestions = Array.isArray(args.questions) ? args.questions : [];
        if (starterQuestions.length > 0) {
          const requests = starterQuestions.slice(0, 50).map((question: any, index: number) => ({
            createItem: {
              item: buildQuestionItem(question),
              location: { index },
            },
          }));
          await googleOauthFetch(`${BASE}/${form.formId}:batchUpdate`, {
            method: 'POST',
            body: JSON.stringify({ requests }),
          });
        }

        return {
          status: 'success',
          message: `Created Google Form "${title}"${starterQuestions.length ? ` with ${starterQuestions.length} question${starterQuestions.length === 1 ? '' : 's'}` : ''}.`,
          data: {
            formId: form.formId,
            responderUri: form.responderUri,
            editUrl: `https://docs.google.com/forms/d/${form.formId}/edit`,
            title,
          },
        };
      }

      case 'forms_get': {
        const formId = String(args.formId || args.id || '').trim();
        if (!formId) return { status: 'error', message: 'formId is required.' };
        const form = await googleOauthFetch(`${BASE}/${encodeURIComponent(formId)}`);
        const summary = summariseForm(form);
        return {
          status: 'success',
          message: `"${summary.title}" has ${summary.itemCount} item${summary.itemCount === 1 ? '' : 's'}.`,
          data: summary,
        };
      }

      case 'forms_add_question': {
        const formId = String(args.formId || args.id || '').trim();
        if (!formId) return { status: 'error', message: 'formId is required.' };
        const index = Math.max(0, Number(args.index) || 0);
        const item = buildQuestionItem(args);
        const data = await googleOauthFetch(`${BASE}/${encodeURIComponent(formId)}:batchUpdate`, {
          method: 'POST',
          body: JSON.stringify({
            requests: [
              {
                createItem: {
                  item,
                  location: { index },
                },
              },
            ],
          }),
        });
        const created = data.replies?.[0]?.createItem;
        return {
          status: 'success',
          message: `Added question "${item.title}".`,
          data: {
            formId,
            itemId: created?.itemId,
            questionIds: created?.questionId || [],
            raw: data,
          },
        };
      }

      case 'forms_list_responses': {
        const formId = String(args.formId || args.id || '').trim();
        if (!formId) return { status: 'error', message: 'formId is required.' };
        const pageSize = Math.min(Math.max(Number(args.limit) || 20, 1), 100);
        const url = new URL(`${BASE}/${encodeURIComponent(formId)}/responses`);
        url.searchParams.set('pageSize', String(pageSize));
        if (args.after) {
          url.searchParams.set('filter', `timestamp >= ${new Date(args.after).toISOString()}`);
        }
        const data = await googleOauthFetch(url.toString());
        const responses = (data.responses || []).map((response: any) => ({
          responseId: response.responseId,
          createTime: response.createTime,
          lastSubmittedTime: response.lastSubmittedTime,
          respondentEmail: response.respondentEmail,
          answers: response.answers,
        }));
        return {
          status: 'success',
          message: `Loaded ${responses.length} form response${responses.length === 1 ? '' : 's'}.`,
          data: { formId, responses, nextPageToken: data.nextPageToken },
        };
      }

      default:
        return { status: 'error', message: `Unknown Forms tool: "${toolName}".` };
    }
  } catch (err: any) {
    return { status: 'error', message: err?.message || 'Forms request failed.' };
  }
};
