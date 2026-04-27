/**
 * r task ...
 * Agent Registry & Dispatcher
 *
 * Maps tool names to their specialized agent handlers.
 * Beatrice (the orchestrator) calls dispatchToAgent() whenever a tool
 * needs to be executed — the registry routes it to the right worker.
 */
import type { ConversationContext } from '@/lib/conversation-context';
import type { AgentHandler, AgentResult } from './types';

/**
 * Each entry maps a tool name or name prefix to its handler.
 * Prefix matching uses `startsWith` — so 'gmail_' matches 'gmail_send', 'gmail_read', etc.
 */
type AgentEntry = {
  loadHandler: () => Promise<AgentHandler>;
  /** If true, match by prefix (startsWith). If false, match exact name only. */
  prefix: boolean;
};

const registry = new Map<string, AgentEntry>();

const lazyAgent = (
  loader: () => Promise<{ handle: AgentHandler }>,
): (() => Promise<AgentHandler>) => {
  let cached: Promise<AgentHandler> | null = null;
  return () => {
    if (!cached) {
      cached = loader().then(module => module.handle);
    }
    return cached;
  };
};

const emailAgent = lazyAgent(() => import('./email-agent'));
const calendarAgent = lazyAgent(() => import('./calendar-agent'));
const documentAgent = lazyAgent(() => import('./document-agent'));
const driveAgent = lazyAgent(() => import('./drive-agent'));
const imageAgent = lazyAgent(() => import('./image-agent'));
const navigationAgent = lazyAgent(() => import('./navigation-agent'));
const videoAgent = lazyAgent(() => import('./video-agent'));
const visionAgent = lazyAgent(() => import('./vision-agent'));
const customerSupportAgent = lazyAgent(() => import('./customer-support-agent'));
const eburonflixAgent = lazyAgent(() => import('./eburonflix-agent'));
const conversationMemoryAgent = lazyAgent(() => import('./conversation-memory-agent'));
const knowledgeBaseAgent = lazyAgent(() => import('./knowledge-base-agent'));
const whatsappAgent = lazyAgent(() => import('./whatsapp-agent'));
const zapierAgent = lazyAgent(() => import('./zapier-agent'));
const sheetsAgent = lazyAgent(() => import('./sheets-agent'));
const slidesAgent = lazyAgent(() => import('./slides-agent'));
const tasksAgent = lazyAgent(() => import('./tasks-agent'));
const peopleAgent = lazyAgent(() => import('./people-agent'));
const formsAgent = lazyAgent(() => import('./forms-agent'));
const translateAgent = lazyAgent(() => import('./translate-agent'));
const chatAgent = lazyAgent(() => import('./chat-agent'));
const youtubeAgent = lazyAgent(() => import('./youtube-agent'));

const register = (key: string, loadHandler: () => Promise<AgentHandler>, prefix: boolean) => {
  registry.set(key, { loadHandler, prefix });
};

// ── Email Agent ─────────────────────────────────────────
register('gmail_', emailAgent, true);
register('send_email', emailAgent, false);

// ── Calendar Agent ─────────────────────────────────────
register('calendar_', calendarAgent, true);
register('create_calendar_event', calendarAgent, false);
register('meet_', calendarAgent, true);
register('set_reminder', calendarAgent, false);

// ── Document Agent ─────────────────────────────────────
register('document_', documentAgent, true);

// ── Drive / Docs Agent ─────────────────────────────────
register('drive_', driveAgent, true);
register('docs_', driveAgent, true);

// ── Navigation Agent ───────────────────────────────────
register('find_route', navigationAgent, false);
register('maps_', navigationAgent, true);
register('find_nearby_places', navigationAgent, false);
register('get_traffic_info', navigationAgent, false);

// ── Video Agent ────────────────────────────────────────
register('video_', videoAgent, true);

// ── Image Agent ────────────────────────────────────────
register('image_', imageAgent, true);

// ── Vision / CCTV Agent ────────────────────────────────
register('vision_', visionAgent, true);

// ── Customer Support Agent ─────────────────────────────
register('start_return', customerSupportAgent, false);
register('get_order_status', customerSupportAgent, false);
register('speak_to_representative', customerSupportAgent, false);
register('call_representative', customerSupportAgent, false);

// ── EburonFlix Agent ───────────────────────────────────
register('eburonflix_', eburonflixAgent, true);

// ── Conversation Memory Agent ──────────────────────────
register('remember_this', conversationMemoryAgent, false);
register('remember_that', conversationMemoryAgent, false);
register('conversation_memory_', conversationMemoryAgent, true);
register('conversation_history_', conversationMemoryAgent, true);

// ── Knowledge Base Agent (/files) ──────────────────────
register('knowledge_base_', knowledgeBaseAgent, true);

// ── WhatsApp Agent (Meta Cloud API) ───────────────────
register('whatsapp_', whatsappAgent, true);

// ── Zapier Agent (Catch Hook webhooks) ────────────────
register('zapier_', zapierAgent, true);

// ── Google Workspace Extended Agents ─────────────────
register('sheets_', sheetsAgent, true);
register('slides_', slidesAgent, true);
register('tasks_', tasksAgent, true);
register('people_', peopleAgent, true);
register('forms_', formsAgent, true);
register('translate_', translateAgent, true);
register('chat_', chatAgent, true);
register('youtube_', youtubeAgent, true);

/**
 * Routes a tool call to the correct specialized agent.
 *
 * Matching strategy:
 * 1. Try exact match first (no prefix)
 * 2. Then try prefix matches (tool name starts with registered key)
 */
export async function dispatchToAgent(
  toolName: string,
  args: Record<string, any>,
  ctx: ConversationContext,
): Promise<AgentResult> {
  // 1. Try exact match
  const exactEntry = registry.get(toolName);
  if (exactEntry && !exactEntry.prefix) {
    const handler = await exactEntry.loadHandler();
    return handler(toolName, args, ctx);
  }

  // 2. Try prefix match
  for (const [key, entry] of registry) {
    if (entry.prefix && toolName.startsWith(key)) {
      const handler = await entry.loadHandler();
      return handler(toolName, args, ctx);
    }
  }

  // 3. No agent found
  return {
    status: 'error',
    message: `No agent is configured for the tool "${toolName}". I did not generate mock data.`,
  };
}

/**
 * Returns the list of all registered agent tool name patterns (for logging/debug).
 */
export function getRegisteredAgentKeys(): string[] {
  return Array.from(registry.keys());
}
