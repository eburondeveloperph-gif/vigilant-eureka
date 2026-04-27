/**
 * YouTube Agent (YouTube Data API v3)
 *
 * Read-only operations use the public Google API key (no OAuth required) so
 * Beatrice can search and report results during voice/chat regardless of
 * sign-in state.
 *
 * Tools:
 *   • youtube_search          — search videos / channels / playlists
 *   • youtube_video_details   — full metadata for a video id
 *   • youtube_channel_info    — channel metadata + recent uploads
 *   • youtube_trending        — trending videos by region
 *   • youtube_playlist_items  — list items in a playlist
 *   • youtube_status          — diagnostic
 */

import type { AgentHandler, AgentResult } from './types';
import { withApiKey } from '@/lib/google-api-key';

const YT_BASE = 'https://www.googleapis.com/youtube/v3';

async function ytFetch(path: string, params: Record<string, any>): Promise<any> {
  const url = withApiKey(`${YT_BASE}/${path}`, params);
  const resp = await fetch(url);
  let data: any = null;
  try { data = await resp.json(); } catch { /* ignore */ }
  if (!resp.ok) {
    const msg =
      data?.error?.message || `YouTube API error (HTTP ${resp.status})`;
    throw new Error(msg);
  }
  return data;
}

const formatDuration = (iso: string | undefined): string => {
  if (!iso) return '';
  // ISO 8601 duration like PT4M13S → "4m 13s"
  const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso);
  if (!m) return iso;
  const [, h, mm, ss] = m;
  const out: string[] = [];
  if (h) out.push(`${h}h`);
  if (mm) out.push(`${mm}m`);
  if (ss) out.push(`${ss}s`);
  return out.join(' ') || '0s';
};

export const handle: AgentHandler = async (
  toolName: string,
  args: Record<string, any>,
): Promise<AgentResult> => {
  try {
    switch (toolName) {
      case 'youtube_status': {
        // Lightweight ping — list trending US videos with maxResults=1
        await ytFetch('videos', { part: 'id', chart: 'mostPopular', maxResults: 1, regionCode: 'US' });
        return {
          status: 'success',
          message: 'YouTube Data API is reachable.',
          data: { configured: true },
        };
      }

      case 'youtube_search': {
        const q = String(args.query || args.q || '').trim();
        if (!q) {
          return { status: 'error', message: 'A search query is required.' };
        }
        const type = (args.type as string) || 'video'; // video | channel | playlist
        const maxResults = Math.min(Math.max(Number(args.limit) || 6, 1), 20);
        const data = await ytFetch('search', {
          part: 'snippet',
          q,
          type,
          maxResults,
          safeSearch: args.safeSearch ?? 'moderate',
          regionCode: args.regionCode,
          relevanceLanguage: args.language,
        });
        const items = (data.items || []).map((it: any) => ({
          kind: it.id?.kind?.replace('youtube#', '') || type,
          videoId: it.id?.videoId,
          channelId: it.id?.channelId,
          playlistId: it.id?.playlistId,
          title: it.snippet?.title,
          channelTitle: it.snippet?.channelTitle,
          publishedAt: it.snippet?.publishedAt,
          description: it.snippet?.description,
          thumbnail: it.snippet?.thumbnails?.medium?.url || it.snippet?.thumbnails?.default?.url,
          url: it.id?.videoId
            ? `https://www.youtube.com/watch?v=${it.id.videoId}`
            : it.id?.channelId
              ? `https://www.youtube.com/channel/${it.id.channelId}`
              : it.id?.playlistId
                ? `https://www.youtube.com/playlist?list=${it.id.playlistId}`
                : null,
        }));
        return {
          status: 'success',
          message: `Found ${items.length} YouTube ${type}${items.length === 1 ? '' : 's'} for "${q}".`,
          data: { query: q, type, items },
        };
      }

      case 'youtube_video_details': {
        const id = String(args.videoId || args.id || '').trim();
        if (!id) return { status: 'error', message: 'videoId is required.' };
        const data = await ytFetch('videos', {
          part: 'snippet,contentDetails,statistics',
          id,
        });
        const v = data.items?.[0];
        if (!v) return { status: 'error', message: `No video found for id "${id}".` };
        const summary = {
          videoId: v.id,
          title: v.snippet?.title,
          channelTitle: v.snippet?.channelTitle,
          channelId: v.snippet?.channelId,
          description: v.snippet?.description,
          publishedAt: v.snippet?.publishedAt,
          tags: v.snippet?.tags || [],
          duration: formatDuration(v.contentDetails?.duration),
          views: v.statistics?.viewCount,
          likes: v.statistics?.likeCount,
          comments: v.statistics?.commentCount,
          thumbnail: v.snippet?.thumbnails?.high?.url || v.snippet?.thumbnails?.medium?.url,
          url: `https://www.youtube.com/watch?v=${v.id}`,
        };
        return {
          status: 'success',
          message: `Video: "${summary.title}" by ${summary.channelTitle} (${summary.duration}).`,
          data: summary,
        };
      }

      case 'youtube_channel_info': {
        const channelId = (args.channelId as string)?.trim();
        const username = (args.handle as string)?.trim() || (args.username as string)?.trim();
        if (!channelId && !username) {
          return { status: 'error', message: 'Provide channelId or handle/username.' };
        }
        const data = await ytFetch('channels', {
          part: 'snippet,statistics,contentDetails,brandingSettings',
          ...(channelId ? { id: channelId } : { forHandle: username }),
        });
        const c = data.items?.[0];
        if (!c) return { status: 'error', message: 'No channel found.' };
        const uploadsPlaylist = c.contentDetails?.relatedPlaylists?.uploads;
        let recentUploads: Array<{ videoId: string; title: string; publishedAt: string }> = [];
        if (uploadsPlaylist) {
          try {
            const items = await ytFetch('playlistItems', {
              part: 'snippet',
              playlistId: uploadsPlaylist,
              maxResults: 5,
            });
            recentUploads = (items.items || []).map((it: any) => ({
              videoId: it.snippet?.resourceId?.videoId,
              title: it.snippet?.title,
              publishedAt: it.snippet?.publishedAt,
            }));
          } catch { /* best-effort */ }
        }
        return {
          status: 'success',
          message: `Channel: "${c.snippet?.title}" (${c.statistics?.subscriberCount} subscribers).`,
          data: {
            channelId: c.id,
            title: c.snippet?.title,
            description: c.snippet?.description,
            subscribers: c.statistics?.subscriberCount,
            videoCount: c.statistics?.videoCount,
            viewCount: c.statistics?.viewCount,
            country: c.snippet?.country,
            customUrl: c.snippet?.customUrl,
            thumbnail: c.snippet?.thumbnails?.high?.url || c.snippet?.thumbnails?.default?.url,
            uploadsPlaylist,
            recentUploads,
            url: `https://www.youtube.com/channel/${c.id}`,
          },
        };
      }

      case 'youtube_trending': {
        const regionCode = (args.regionCode as string) || 'US';
        const maxResults = Math.min(Math.max(Number(args.limit) || 8, 1), 25);
        const categoryId = args.categoryId ? String(args.categoryId) : undefined;
        const data = await ytFetch('videos', {
          part: 'snippet,contentDetails,statistics',
          chart: 'mostPopular',
          regionCode,
          maxResults,
          videoCategoryId: categoryId,
        });
        const items = (data.items || []).map((v: any) => ({
          videoId: v.id,
          title: v.snippet?.title,
          channelTitle: v.snippet?.channelTitle,
          duration: formatDuration(v.contentDetails?.duration),
          views: v.statistics?.viewCount,
          publishedAt: v.snippet?.publishedAt,
          url: `https://www.youtube.com/watch?v=${v.id}`,
          thumbnail: v.snippet?.thumbnails?.medium?.url,
        }));
        return {
          status: 'success',
          message: `Top ${items.length} trending in ${regionCode}.`,
          data: { regionCode, items },
        };
      }

      case 'youtube_playlist_items': {
        const playlistId = (args.playlistId as string)?.trim();
        if (!playlistId) return { status: 'error', message: 'playlistId is required.' };
        const maxResults = Math.min(Math.max(Number(args.limit) || 15, 1), 50);
        const data = await ytFetch('playlistItems', {
          part: 'snippet,contentDetails',
          playlistId,
          maxResults,
        });
        const items = (data.items || []).map((it: any) => ({
          videoId: it.contentDetails?.videoId,
          title: it.snippet?.title,
          channelTitle: it.snippet?.videoOwnerChannelTitle,
          position: it.snippet?.position,
          publishedAt: it.contentDetails?.videoPublishedAt,
          url: it.contentDetails?.videoId
            ? `https://www.youtube.com/watch?v=${it.contentDetails.videoId}`
            : null,
        }));
        return {
          status: 'success',
          message: `Loaded ${items.length} item${items.length === 1 ? '' : 's'} from playlist.`,
          data: { playlistId, items },
        };
      }

      default:
        return { status: 'error', message: `Unknown YouTube tool: "${toolName}".` };
    }
  } catch (err: any) {
    return {
      status: 'error',
      message: err?.message || 'YouTube API request failed.',
    };
  }
};
