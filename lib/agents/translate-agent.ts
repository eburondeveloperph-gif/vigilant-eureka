/**
 * Google Translate Agent (Cloud Translation Basic v2)
 *   translate_text            — translate one or more text strings
 *   translate_detect_language — detect language for text
 */

import type { AgentHandler, AgentResult } from './types';
import { withApiKey } from '@/lib/google-api-key';

const BASE = 'https://translation.googleapis.com/language/translate/v2';

async function translateFetch(path: string, body: Record<string, any>): Promise<any> {
  const url = withApiKey(`${BASE}${path}`);
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  let data: any = null;
  try { data = await response.json(); } catch { /* ignore */ }
  if (!response.ok) {
    throw new Error(data?.error?.message || `Translate API error (HTTP ${response.status}).`);
  }
  return data;
}

function textInputs(args: Record<string, any>): string[] {
  if (Array.isArray(args.texts)) {
    return args.texts.map((text: any) => String(text).trim()).filter(Boolean);
  }
  const text = String(args.text || args.q || '').trim();
  return text ? [text] : [];
}

export const handle: AgentHandler = async (
  toolName: string,
  args: Record<string, any>,
): Promise<AgentResult> => {
  try {
    switch (toolName) {
      case 'translate_text': {
        const target = String(args.target || args.targetLanguage || '').trim();
        const texts = textInputs(args);
        if (!target) return { status: 'error', message: 'target language is required.' };
        if (texts.length === 0) return { status: 'error', message: 'text is required.' };

        const data = await translateFetch('', {
          q: texts,
          target,
          ...(args.source ? { source: String(args.source) } : {}),
          format: args.format === 'html' ? 'html' : 'text',
        });
        const translations = (data.data?.translations || []).map((item: any, index: number) => ({
          input: texts[index],
          translatedText: item.translatedText,
          detectedSourceLanguage: item.detectedSourceLanguage,
          model: item.model,
        }));
        return {
          status: 'success',
          message: `Translated ${translations.length} text${translations.length === 1 ? '' : 's'} to ${target}.`,
          data: { target, translations },
        };
      }

      case 'translate_detect_language': {
        const texts = textInputs(args);
        if (texts.length === 0) return { status: 'error', message: 'text is required.' };
        const data = await translateFetch('/detect', { q: texts });
        const detections = (data.data?.detections || []).map((group: any[], index: number) => ({
          input: texts[index],
          detections: (group || []).map((detection: any) => ({
            language: detection.language,
            confidence: detection.confidence,
            isReliable: detection.isReliable,
          })),
        }));
        const firstLanguage = detections[0]?.detections?.[0]?.language;
        return {
          status: 'success',
          message: firstLanguage
            ? `Detected language: ${firstLanguage}.`
            : 'Language detection completed.',
          data: { detections },
        };
      }

      default:
        return { status: 'error', message: `Unknown Translate tool: "${toolName}".` };
    }
  } catch (err: any) {
    return { status: 'error', message: err?.message || 'Translate request failed.' };
  }
};
