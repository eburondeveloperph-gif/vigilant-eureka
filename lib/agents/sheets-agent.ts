/**
 * Google Sheets Agent
 *   sheets_create        — new spreadsheet with optional initial values
 *   sheets_read          — read a range as a 2D array
 *   sheets_append        — append rows to a sheet
 *   sheets_update        — write/overwrite a range
 */

import type { AgentHandler, AgentResult } from './types';
import { googleOauthFetch } from '@/lib/google-oauth-fetch';

const BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

export const handle: AgentHandler = async (
  toolName: string,
  args: Record<string, any>,
): Promise<AgentResult> => {
  try {
    switch (toolName) {
      case 'sheets_create': {
        const title = String(args.title || 'Untitled spreadsheet').trim();
        const initialValues = Array.isArray(args.values) ? args.values : null;
        const body: any = { properties: { title } };
        const data = await googleOauthFetch(BASE, {
          method: 'POST',
          body: JSON.stringify(body),
        });
        if (initialValues) {
          await googleOauthFetch(
            `${BASE}/${data.spreadsheetId}/values/Sheet1!A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
            { method: 'POST', body: JSON.stringify({ values: initialValues }) },
          );
        }
        return {
          status: 'success',
          message: `Created spreadsheet "${title}".`,
          data: {
            spreadsheetId: data.spreadsheetId,
            url: data.spreadsheetUrl,
            title,
          },
        };
      }

      case 'sheets_read': {
        const spreadsheetId = String(args.spreadsheetId || '').trim();
        const range = String(args.range || 'Sheet1!A1:Z1000').trim();
        if (!spreadsheetId) return { status: 'error', message: 'spreadsheetId is required.' };
        const data = await googleOauthFetch(
          `${BASE}/${spreadsheetId}/values/${encodeURIComponent(range)}`,
        );
        const values = data.values || [];
        return {
          status: 'success',
          message: `Read ${values.length} row${values.length === 1 ? '' : 's'} from ${range}.`,
          data: { range: data.range, rowCount: values.length, values },
        };
      }

      case 'sheets_append': {
        const spreadsheetId = String(args.spreadsheetId || '').trim();
        const range = String(args.range || 'Sheet1!A1').trim();
        const values = Array.isArray(args.values) ? args.values : null;
        if (!spreadsheetId || !values) {
          return { status: 'error', message: 'spreadsheetId and values (2D array) are required.' };
        }
        const data = await googleOauthFetch(
          `${BASE}/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
          { method: 'POST', body: JSON.stringify({ values }) },
        );
        const updatedRows = data?.updates?.updatedRows ?? values.length;
        return {
          status: 'success',
          message: `Appended ${updatedRows} row${updatedRows === 1 ? '' : 's'}.`,
          data,
        };
      }

      case 'sheets_update': {
        const spreadsheetId = String(args.spreadsheetId || '').trim();
        const range = String(args.range || '').trim();
        const values = Array.isArray(args.values) ? args.values : null;
        if (!spreadsheetId || !range || !values) {
          return { status: 'error', message: 'spreadsheetId, range and values are required.' };
        }
        const data = await googleOauthFetch(
          `${BASE}/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
          { method: 'PUT', body: JSON.stringify({ values, range }) },
        );
        return {
          status: 'success',
          message: `Updated ${data.updatedRows ?? values.length} row${(data.updatedRows ?? values.length) === 1 ? '' : 's'}.`,
          data,
        };
      }

      default:
        return { status: 'error', message: `Unknown Sheets tool: "${toolName}".` };
    }
  } catch (err: any) {
    return { status: 'error', message: err?.message || 'Sheets request failed.' };
  }
};
