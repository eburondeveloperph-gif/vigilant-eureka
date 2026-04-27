/**
 * Video Agent — Handles AI video generation via HeyGen
 */
import {
  createHeyGenVideoAgentSession,
  getHeyGenVideo,
  getHeyGenVideoAgentSession,
  listHeyGenVideoAgentSessions,
  type HeyGenVideoDetail,
} from '@/lib/heygen-client';
import { useUI } from '@/lib/state';
import type { AgentHandler, AgentResult } from './types';

const DEFAULT_POLL_INTERVAL_MS = 10000;
const MAX_UI_POLL_ATTEMPTS = 72;

function stringArg(args: Record<string, any>, ...keys: string[]) {
  for (const key of keys) {
    const value = args[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return undefined;
}

function normaliseMode(value: unknown): 'generate' | 'chat' {
  return value === 'chat' ? 'chat' : 'generate';
}

function normaliseOrientation(value: unknown): 'landscape' | 'portrait' | undefined {
  return value === 'landscape' || value === 'portrait' ? value : undefined;
}

function buildVideoTaskResult(
  message: string,
  data: Record<string, any>,
  video?: HeyGenVideoDetail | null,
) {
  const videoUrl = video?.video_url || data.videoUrl || data.video_url;
  const videoId = video?.id || data.videoId || data.video_id;
  return {
    title: videoUrl ? 'HeyGen Video Ready' : 'HeyGen Video Rendering',
    message,
    artifactType: 'video' as const,
    ...(videoUrl ? { previewData: videoUrl } : {}),
    downloadFilename: videoUrl
      ? `heygen_${videoId || 'video'}.mp4`
      : `heygen_${data.sessionId || data.session_id || videoId || 'video_job'}.json`,
    downloadData: videoUrl || JSON.stringify(data, null, 2),
    mimeType: videoUrl ? 'video/mp4' : 'application/json',
  };
}

async function startUiPoll(sessionId?: string, videoId?: string | null) {
  if (!sessionId && !videoId) return;

  let activeVideoId = videoId || undefined;
  for (let attempt = 0; attempt < MAX_UI_POLL_ATTEMPTS; attempt++) {
    await new Promise(resolve => setTimeout(resolve, DEFAULT_POLL_INTERVAL_MS));
    try {
      let session: Awaited<ReturnType<typeof getHeyGenVideoAgentSession>> | null = null;
      if (sessionId) {
        session = await getHeyGenVideoAgentSession(sessionId);
        activeVideoId = session.video_id || activeVideoId;
      }

      let video: HeyGenVideoDetail | null = null;
      if (activeVideoId) {
        video = await getHeyGenVideo(activeVideoId);
      }

      const status = video?.status || session?.status || 'generating';
      const progress = Number(session?.progress);
      if (video?.status === 'completed' && video.video_url) {
        useUI.getState().setTaskResult(buildVideoTaskResult('Your HeyGen video is ready.', {
          provider: 'heygen',
          sessionId,
          videoId: activeVideoId,
          status,
          progress: Number.isFinite(progress) ? progress : undefined,
        }, video));
        return;
      }
      if (video?.status === 'failed' || session?.status === 'failed') {
        useUI.getState().setTaskResult({
          title: 'HeyGen Video Failed',
          message: video?.failure_message || 'HeyGen could not complete this video.',
          downloadFilename: `heygen_${sessionId || activeVideoId || 'video'}_failed.json`,
          downloadData: JSON.stringify({ session, video }, null, 2),
          mimeType: 'application/json',
        });
        return;
      }
      useUI.getState().setTaskResult(buildVideoTaskResult(
        Number.isFinite(progress)
          ? `HeyGen is rendering the video (${progress}%).`
          : `HeyGen is rendering the video (${status}).`,
        {
          provider: 'heygen',
          sessionId,
          videoId: activeVideoId,
          status,
          progress: Number.isFinite(progress) ? progress : undefined,
        },
      ));
    } catch {
      // Keep polling; transient network/API errors are common while jobs start.
    }
  }
}

export const handle: AgentHandler = async (toolName, args, _ctx): Promise<AgentResult> => {
  switch (toolName) {
    case 'video_generate': {
      try {
        const prompt = String(args.prompt || args.text || args.description || '').trim();
        if (!prompt) {
          return { status: 'error', message: 'Video generation needs a prompt.' };
        }

        const payload: Record<string, any> = {
          prompt,
          mode: normaliseMode(args.mode),
        };
        const avatarId = stringArg(args, 'avatar_id', 'avatarId');
        const voiceId = stringArg(args, 'voice_id', 'voiceId');
        const styleId = stringArg(args, 'style_id', 'styleId');
        const orientation = normaliseOrientation(args.orientation);
        const callbackUrl = stringArg(args, 'callback_url', 'callbackUrl');
        const callbackId = stringArg(args, 'callback_id', 'callbackId');

        if (avatarId) payload.avatar_id = avatarId;
        if (voiceId) payload.voice_id = voiceId;
        if (styleId) payload.style_id = styleId;
        if (orientation) payload.orientation = orientation;
        if (Array.isArray(args.files) && args.files.length > 0) payload.files = args.files.slice(0, 20);
        if (callbackUrl) payload.callback_url = callbackUrl;
        if (callbackId) payload.callback_id = callbackId;
        if (typeof args.incognito_mode === 'boolean') payload.incognito_mode = args.incognito_mode;
        if (typeof args.incognitoMode === 'boolean') payload.incognito_mode = args.incognitoMode;

        const session = await createHeyGenVideoAgentSession(payload as any);
        const sessionId = session.session_id;
        const videoId = session.video_id || null;
        const resultData = {
          provider: 'heygen',
          artifactType: 'video',
          sessionId,
          session_id: sessionId,
          videoId,
          video_id: videoId,
          status: session.status,
          prompt,
          pollIntervalMs: DEFAULT_POLL_INTERVAL_MS,
          createdAt: session.created_at,
        };

        useUI.getState().setTaskResult(buildVideoTaskResult(
          videoId
            ? `HeyGen started rendering video ${videoId}.`
            : 'HeyGen started the video agent session.',
          resultData,
        ));

        if (args.enableBackgroundUiPoll !== false) {
          startUiPoll(sessionId, videoId);
        }

        return {
          status: 'processing',
          message: videoId
            ? `HeyGen video generation started. Video ${videoId} is rendering now.`
            : `HeyGen video agent session ${sessionId} started and is preparing the render.`,
          data: resultData,
        };
      } catch (err: any) {
        return { status: 'error', message: err?.message || 'Failed to initiate HeyGen video generation.' };
      }
    }

    case 'video_status': {
      try {
        const sessionId = stringArg(args, 'sessionId', 'session_id');
        let videoId = stringArg(args, 'videoId', 'video_id');
        if (!sessionId && !videoId) {
          return { status: 'error', message: 'sessionId or videoId is required.' };
        }

        let session: Awaited<ReturnType<typeof getHeyGenVideoAgentSession>> | null = null;
        if (sessionId) {
          session = await getHeyGenVideoAgentSession(sessionId);
          videoId = session.video_id || videoId;
        }

        let video: HeyGenVideoDetail | null = null;
        if (videoId) {
          video = await getHeyGenVideo(videoId);
        }

        const status = video?.status || session?.status || 'unknown';
        const progress = Number(session?.progress);
        const data = {
          provider: 'heygen',
          artifactType: 'video',
          sessionId,
          session_id: sessionId,
          videoId,
          video_id: videoId,
          status,
          progress: Number.isFinite(progress) ? progress : undefined,
          videoUrl: video?.video_url || undefined,
          video_url: video?.video_url || undefined,
          thumbnailUrl: video?.thumbnail_url || undefined,
          thumbnail_url: video?.thumbnail_url || undefined,
          duration: video?.duration || undefined,
          failureCode: video?.failure_code || undefined,
          failureMessage: video?.failure_message || undefined,
          raw: { session, video },
        };

        if (video?.status === 'completed' && video.video_url) {
          return {
            status: 'success',
            message: `HeyGen video ${video.id} is ready${video.duration ? ` (${Math.round(video.duration)} seconds)` : ''}.`,
            data,
          };
        }
        if (video?.status === 'failed' || session?.status === 'failed') {
          return {
            status: 'error',
            message: video?.failure_message || 'HeyGen video generation failed.',
            data,
          };
        }
        return {
          status: 'processing',
          message: Number.isFinite(progress)
            ? `HeyGen is still rendering (${progress}%).`
            : `HeyGen is still rendering (${status}).`,
          data,
        };
      } catch (err: any) {
        return { status: 'error', message: err?.message || 'Failed to check HeyGen video status.' };
      }
    }

    case 'video_list_sessions': {
      try {
        const limit = Math.min(Math.max(Number(args.limit) || 20, 1), 100);
        const token = stringArg(args, 'token', 'pageToken', 'next_token');
        const result = await listHeyGenVideoAgentSessions({ limit, token });
        const sessions = (result.data || []).map(session => ({
          sessionId: session.session_id,
          session_id: session.session_id,
          title: session.title || 'Untitled HeyGen session',
          createdAt: session.created_at,
          created_at: session.created_at,
          createdAtIso: new Date(session.created_at * 1000).toISOString(),
        }));

        useUI.getState().setTaskResult({
          title: 'HeyGen Video Agent Sessions',
          message: sessions.length
            ? `Loaded ${sessions.length} recent HeyGen video agent session${sessions.length === 1 ? '' : 's'}.`
            : 'No HeyGen video agent sessions were returned.',
          downloadFilename: 'heygen_video_agent_sessions.json',
          downloadData: JSON.stringify({
            sessions,
            hasMore: Boolean(result.has_more),
            nextToken: result.next_token || null,
          }, null, 2),
          mimeType: 'application/json',
        });

        return {
          status: 'success',
          message: sessions.length
            ? `Loaded ${sessions.length} recent HeyGen video agent session${sessions.length === 1 ? '' : 's'}.`
            : 'No HeyGen video agent sessions were returned.',
          data: {
            provider: 'heygen',
            sessions,
            hasMore: Boolean(result.has_more),
            has_more: Boolean(result.has_more),
            nextToken: result.next_token || null,
            next_token: result.next_token || null,
          },
        };
      } catch (err: any) {
        return { status: 'error', message: err?.message || 'Failed to list HeyGen video agent sessions.' };
      }
    }

    default:
      return { status: 'error', message: `Video agent does not support tool: ${toolName}` };
  }
};
