/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {
  GoogleGenAI,
  LiveCallbacks,
  LiveClientToolResponse,
  LiveConnectConfig,
  LiveServerContent,
  LiveServerMessage,
  LiveServerToolCall,
  LiveServerToolCallCancellation,
  Part,
  Session,
} from '@google/genai';
import EventEmitter from 'eventemitter3';
import { DEFAULT_LIVE_API_MODEL } from './constants';
import { difference } from 'lodash';
import { base64ToArrayBuffer } from './utils';

/**
 * Represents a single log entry in the system.
 * Used for tracking and displaying system events, messages, and errors.
 */
export interface StreamingLog {
  // Optional count for repeated log entries
  count?: number;
  // Optional additional data associated with the log
  data?: unknown;
  // Timestamp of when the log was created
  date: Date;
  // The log message content
  message: string | object;
  // The type/category of the log entry
  type: string;
}

/**
 * Event types that can be emitted by the MultimodalLiveClient.
 * Each event corresponds to a specific message from GenAI or client state change.
 */
export interface LiveClientEventTypes {
  // Emitted when audio data is received
  audio: (data: ArrayBuffer) => void;
  // Emitted when the connection closes
  close: (event: CloseEvent) => void;
  // Emitted when content is received from the server
  content: (data: LiveServerContent) => void;
  // Emitted when an error occurs
  error: (e: ErrorEvent) => void;
  // Emitted when the server interrupts the current generation
  interrupted: () => void;
  // Emitted for logging events
  log: (log: StreamingLog) => void;
  // Emitted when the connection opens
  open: () => void;
  // Emitted when the initial setup is complete
  setupcomplete: () => void;
  // Emitted when a tool call is received
  toolcall: (toolCall: LiveServerToolCall) => void;
  // Emitted when a tool call is cancelled
  toolcallcancellation: (
    toolcallCancellation: LiveServerToolCallCancellation
  ) => void;
  // Emitted when the current turn is complete
  turncomplete: () => void;
  inputTranscription: (text: string, isFinal: boolean) => void;
  outputTranscription: (text: string, isFinal: boolean) => void;
}

export class GenAILiveClient extends EventEmitter<LiveClientEventTypes> {
  public readonly model: string = DEFAULT_LIVE_API_MODEL;

  protected readonly client: GoogleGenAI;
  protected session?: Session;

  private _status: 'connected' | 'disconnected' | 'connecting' = 'disconnected';
  private connectionId = 0;
  public get status() {
    return this._status;
  }

  /**
   * Creates a new GenAILiveClient instance.
   * @param apiKey - API key for authentication with Google GenAI
   * @param model - Optional model name to override the default model
   */
  constructor(apiKey: string, model?: string) {
    super();
    if (model) this.model = model;

    this.client = new GoogleGenAI({
      apiKey: apiKey,
    });
  }

  public async connect(config: LiveConnectConfig): Promise<boolean> {
    if (this._status === 'connected' || this._status === 'connecting') {
      return false;
    }

    const connectionId = ++this.connectionId;
    this._status = 'connecting';
    const callbacks: LiveCallbacks = {
      onopen: () => this.onOpen(connectionId),
      onmessage: message => this.onMessage(message, connectionId),
      onerror: error => this.onError(error, connectionId),
      onclose: event => this.onClose(event, connectionId),
    };

    try {
      this.session = await this.client.live.connect({
        model: this.model,
        config: {
          ...config,
        },
        callbacks,
      });
    } catch (e: any) {
      console.error('Error connecting to GenAI Live:', e);
      if (connectionId === this.connectionId) {
        this._status = 'disconnected';
        this.session = undefined;
      }
      const errorEvent = new ErrorEvent('error', {
        error: e,
        message: e?.message || 'Failed to connect.',
      });
      this.onError(errorEvent, connectionId);
      return false;
    }

    if (connectionId !== this.connectionId) {
      this.session?.close();
      return false;
    }

    this._status = 'connected';
    return true;
  }

  public disconnect() {
    const session = this.session;
    const readyState = this.getSessionReadyState(session);
    this.connectionId += 1;
    this.session = undefined;
    this._status = 'disconnected';

    if (
      session &&
      (readyState === undefined ||
        readyState === WebSocket.CONNECTING ||
        readyState === WebSocket.OPEN)
    ) {
      try {
        session.close();
      } catch (e: any) {
        console.warn('Live session close failed:', e?.message);
      }
    }

    this.log('client.close', `Disconnected`);
    return true;
  }

  public send(parts: Part | Part[], turnComplete: boolean = true) {
    if (!this.isSessionOpen()) {
      this.log('client.send.skipped', 'Live session is not open');
      return;
    }
    const session = this.session;
    if (!session) return;
    if (!this.isSessionOpen(session)) return;
    try {
      session.sendClientContent({ turns: parts, turnComplete });
    } catch (e: any) {
      console.warn('send failed (connection may have closed):', e?.message);
    }
    this.log(`client.send`, parts);
  }

  public sendRealtimeInput(chunks: Array<{ mimeType: string; data: string }>) {
    if (!this.isSessionOpen()) {
      this.log('client.realtimeInput.skipped', 'Live session is not open');
      return;
    }
    // Snapshot the session so the forEach works even if disconnect() nulls it mid-iteration
    const session = this.session;
    if (!session) return;
    chunks.forEach(chunk => {
      if (!this.isSessionOpen(session)) return;
      try {
        session.sendRealtimeInput({ media: chunk });
      } catch (e: any) {
        console.warn('sendRealtimeInput failed (connection may have closed):', e?.message);
      }
    });

    let hasAudio = false;
    let hasVideo = false;
    for (let i = 0; i < chunks.length; i++) {
      const ch = chunks[i];
      if (ch.mimeType.includes('audio')) hasAudio = true;
      if (ch.mimeType.includes('image')) hasVideo = true;
      if (hasAudio && hasVideo) break;
    }

    let message = 'unknown';
    if (hasAudio && hasVideo) message = 'audio + video';
    else if (hasAudio) message = 'audio';
    else if (hasVideo) message = 'video';
    this.log(`client.realtimeInput`, message);
  }

  public sendToolResponse(toolResponse: LiveClientToolResponse) {
    if (!this.isSessionOpen()) {
      this.log('client.toolResponse.skipped', 'Live session is not open');
      return;
    }
    const session = this.session;
    if (!session) return;
    if (!this.isSessionOpen(session)) return;
    if (
      toolResponse.functionResponses &&
      toolResponse.functionResponses.length
    ) {
      try {
        session.sendToolResponse({
          functionResponses: toolResponse.functionResponses!,
        });
      } catch (e: any) {
        console.warn('sendToolResponse failed (connection may have closed):', e?.message);
      }
    }

    this.log(`client.toolResponse`, { toolResponse });
  }

  private getSessionReadyState(session = this.session) {
    const conn = (session as unknown as { conn?: { ws?: { readyState?: number } } } | undefined)?.conn;
    return typeof conn?.ws?.readyState === 'number' ? conn.ws.readyState : undefined;
  }

  private isSessionOpen(session = this.session) {
    if (this._status !== 'connected' || !session || session !== this.session) return false;

    const readyState = this.getSessionReadyState(session);
    if (readyState !== undefined && readyState !== WebSocket.OPEN) {
      this._status = 'disconnected';
      return false;
    }

    return true;
  }

  protected onMessage(message: LiveServerMessage, connectionId = this.connectionId) {
    if (connectionId !== this.connectionId) return;

    if (message.setupComplete) {
      this.emit('setupcomplete');
      return;
    }
    if (message.toolCall) {
      this.log('server.toolCall', message);
      this.emit('toolcall', message.toolCall);
      return;
    }
    if (message.toolCallCancellation) {
      this.log('receive.toolCallCancellation', message);
      this.emit('toolcallcancellation', message.toolCallCancellation);
      return;
    }

    if (message.serverContent) {
      const { serverContent } = message;
      if (serverContent.interrupted) {
        this.log('receive.serverContent', 'interrupted');
        this.emit('interrupted');
        return;
      }

      if (serverContent.inputTranscription) {
        this.emit(
          'inputTranscription',
          serverContent.inputTranscription.text ?? '',
          // FIX: Property 'isFinal' does not exist on type 'Transcription'.
          (serverContent.inputTranscription as any).isFinal ?? false,
        );
        this.log(
          'server.inputTranscription',
          serverContent.inputTranscription.text ?? '',
        );
      }

      if (serverContent.outputTranscription) {
        this.emit(
          'outputTranscription',
          serverContent.outputTranscription.text ?? '',
          // FIX: Property 'isFinal' does not exist on type 'Transcription'.
          (serverContent.outputTranscription as any).isFinal ?? false,
        );
        this.log(
          'server.outputTranscription',
          serverContent.outputTranscription.text ?? '',
        );
      }

      if (serverContent.modelTurn) {
        let parts: Part[] = serverContent.modelTurn.parts || [];

        const audioParts = parts.filter(p =>
          p.inlineData?.mimeType?.startsWith('audio/pcm'),
        );
        const base64s = audioParts.map(p => p.inlineData?.data);
        const otherParts = difference(parts, audioParts);

        base64s.forEach(b64 => {
          if (b64) {
            const data = base64ToArrayBuffer(b64);
            this.emit('audio', data);
            this.log(`server.audio`, `buffer (${data.byteLength})`);
          }
        });

        if (otherParts.length > 0) {
          const content: LiveServerContent = { modelTurn: { parts: otherParts } };
          this.emit('content', content);
          this.log(`server.content`, message);
        }
      }

      if (serverContent.turnComplete) {
        this.log('server.send', 'turnComplete');
        this.emit('turncomplete');
      }
    }
  }

  protected onError(e: ErrorEvent, connectionId = this.connectionId) {
    if (connectionId !== this.connectionId) return;

    this._status = 'disconnected';
    console.error('error:', e);

    const message = `Could not connect to GenAI Live: ${e.message}`;
    this.log(`server.${e.type}`, message);
    this.emit('error', e);
  }

  protected onOpen(connectionId = this.connectionId) {
    if (connectionId !== this.connectionId) return;

    this._status = 'connected';
    this.emit('open');
  }

  protected onClose(e: CloseEvent, connectionId = this.connectionId) {
    if (connectionId !== this.connectionId) return;

    this._status = 'disconnected';
    let reason = e.reason || '';
    if (reason.toLowerCase().includes('error')) {
      const prelude = 'ERROR]';
      const preludeIndex = reason.indexOf(prelude);
      if (preludeIndex > 0) {
        reason = reason.slice(preludeIndex + prelude.length + 1, Infinity);
      }
    }

    this.log(
      `server.${e.type}`,
      `disconnected ${reason ? `with reason: ${reason}` : ``}`
    );
    this.emit('close', e);
  }

  /**
   * Internal method to emit a log event.
   * @param type - Log type
   * @param message - Log message
   */
  protected log(type: string, message: string | object) {
    this.emit('log', {
      type,
      message,
      date: new Date(),
    });
  }
}
