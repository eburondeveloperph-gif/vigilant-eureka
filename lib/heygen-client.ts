type HeyGenCreateVideoAgentPayload = {
  prompt: string;
  mode?: 'generate' | 'chat';
  avatar_id?: string;
  voice_id?: string;
  style_id?: string;
  orientation?: 'landscape' | 'portrait';
  files?: Array<Record<string, any>>;
  callback_url?: string;
  callback_id?: string;
  incognito_mode?: boolean;
};

export type HeyGenVideoAgentSession = {
  session_id: string;
  status: 'thinking' | 'waiting_for_input' | 'reviewing' | 'generating' | 'completed' | 'failed';
  progress?: number;
  title?: string | null;
  video_id?: string | null;
  created_at?: number;
  messages?: Array<Record<string, any>>;
};

export type HeyGenVideoAgentSessionListItem = {
  session_id: string;
  title?: string | null;
  created_at: number;
};

export type HeyGenVideoAgentSessionList = {
  data: HeyGenVideoAgentSessionListItem[];
  has_more: boolean;
  next_token?: string | null;
};

export type HeyGenVideoDetail = {
  id: string;
  title?: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at?: number | null;
  completed_at?: number | null;
  video_url?: string | null;
  thumbnail_url?: string | null;
  gif_url?: string | null;
  captioned_video_url?: string | null;
  subtitle_url?: string | null;
  duration?: number | null;
  video_page_url?: string | null;
  failure_code?: string | null;
  failure_message?: string | null;
};

export class HeyGenApiError extends Error {
  status?: number;
  code?: string;
  retryAfterSeconds?: number;

  constructor(message: string, status?: number, code?: string, retryAfterSeconds?: number) {
    super(message);
    this.name = 'HeyGenApiError';
    this.status = status;
    this.code = code;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

const getProxyBase = () => {
  const env = (import.meta as any).env || {};
  return String(env.VITE_HEYGEN_PROXY_URL || '/api/heygen').replace(/\/+$/, '');
};

async function readJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function heygenFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${getProxyBase()}${path}`, {
    ...init,
    headers: {
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers || {}),
    },
  });
  const data = await readJson(response);
  if (!response.ok) {
    const retryAfter = response.headers.get('Retry-After');
    throw new HeyGenApiError(
      data?.error?.message || data?.message || `HeyGen API error (HTTP ${response.status}).`,
      response.status,
      data?.error?.code || data?.code,
      retryAfter ? Number(retryAfter) : undefined,
    );
  }
  return data as T;
}

export async function createHeyGenVideoAgentSession(
  payload: HeyGenCreateVideoAgentPayload,
): Promise<HeyGenVideoAgentSession> {
  const data = await heygenFetch<{ data: HeyGenVideoAgentSession }>('/video-agents', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data.data;
}

export async function getHeyGenVideoAgentSession(sessionId: string): Promise<HeyGenVideoAgentSession> {
  const data = await heygenFetch<{ data: HeyGenVideoAgentSession }>(
    `/video-agents/${encodeURIComponent(sessionId)}`,
  );
  return data.data;
}

export async function listHeyGenVideoAgentSessions(options: {
  limit?: number;
  token?: string;
} = {}): Promise<HeyGenVideoAgentSessionList> {
  const params = new URLSearchParams();
  const limit = Math.min(Math.max(Number(options.limit) || 20, 1), 100);
  params.set('limit', String(limit));
  if (options.token) params.set('token', options.token);
  return heygenFetch<HeyGenVideoAgentSessionList>(`/video-agents?${params.toString()}`);
}

export async function getHeyGenVideo(videoId: string): Promise<HeyGenVideoDetail> {
  const data = await heygenFetch<{ data: HeyGenVideoDetail }>(
    `/videos/${encodeURIComponent(videoId)}`,
  );
  return data.data;
}
