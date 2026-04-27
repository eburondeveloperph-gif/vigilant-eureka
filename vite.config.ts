import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const heygenApiKey = env.HEYGEN_API_KEY || env.VITE_HEYGEN_API_KEY;
    const deepgramApiKey = env.DEEPGRAM_API_KEY || env.VITE_DEEPGRAM_API_KEY;
    const heygenProxyPlugin = {
      name: 'heygen-api-proxy',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (!req.url?.startsWith('/api/heygen')) {
            next();
            return;
          }

          const upstreamPath = req.url.replace(/^\/api\/heygen/, '') || '/';
          if (!/^\/(video-agents|videos)(\/[A-Za-z0-9_-]+)?(\?.*)?$/.test(upstreamPath)) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: { code: 'not_found', message: 'Unsupported HeyGen proxy path.' } }));
            return;
          }

          if (!heygenApiKey) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              error: {
                code: 'missing_heygen_api_key',
                message: 'Set HEYGEN_API_KEY in .env.local to enable HeyGen video generation.',
              },
            }));
            return;
          }

          const body = await new Promise<Buffer>((resolve, reject) => {
            const chunks: Buffer[] = [];
            req.on('data', chunk => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
            req.on('end', () => resolve(Buffer.concat(chunks)));
            req.on('error', reject);
          });

          try {
            const upstream = await fetch(`https://api.heygen.com/v3${upstreamPath}`, {
              method: req.method,
              headers: {
                'X-Api-Key': heygenApiKey,
                'Content-Type': req.headers['content-type'] || 'application/json',
              },
              body: req.method === 'GET' || req.method === 'HEAD' ? undefined : body,
            });
            const responseBody = Buffer.from(await upstream.arrayBuffer());
            res.statusCode = upstream.status;
            const contentType = upstream.headers.get('content-type');
            const retryAfter = upstream.headers.get('retry-after');
            if (contentType) res.setHeader('Content-Type', contentType);
            if (retryAfter) res.setHeader('Retry-After', retryAfter);
            res.end(responseBody);
          } catch (error) {
            res.statusCode = 502;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              error: {
                code: 'heygen_proxy_failed',
                message: error instanceof Error ? error.message : 'HeyGen proxy request failed.',
              },
            }));
          }
        });
      },
    };
    const deepgramTokenPlugin = {
      name: 'deepgram-realtime-proxy',
      configureServer(server) {
        let wsRuntime: Promise<{ WebSocketServer: any; WebSocket: any }> | null = null;
        const getWsRuntime = async () => {
          if (!wsRuntime) {
            wsRuntime = import('ws').then(mod => ({
              WebSocketServer: mod.WebSocketServer,
              WebSocket: mod.default || mod.WebSocket,
            }));
          }
          return wsRuntime;
        };

        server.httpServer?.on('upgrade', (req, socket, head) => {
          const requestUrl = new URL(req.url || '/', 'http://localhost');
          if (requestUrl.pathname !== '/api/deepgram/listen') return;

          const rejectUpgrade = (statusCode: number, message: string) => {
            socket.write(`HTTP/1.1 ${statusCode} ${message}\r\nConnection: close\r\n\r\n`);
            socket.destroy();
          };

          if (!deepgramApiKey) {
            rejectUpgrade(500, 'Missing Deepgram API key');
            return;
          }

          void getWsRuntime()
            .then(({ WebSocketServer, WebSocket }) => {
              const wss = new WebSocketServer({ noServer: true });
              wss.handleUpgrade(req, socket, head, (clientSocket) => {
                const upstreamUrl = `wss://api.deepgram.com/v1/listen${requestUrl.search}`;
                const upstreamSocket = new WebSocket(upstreamUrl, {
                  headers: {
                    Authorization: `Token ${deepgramApiKey}`,
                  },
                });

                const closeBoth = () => {
                  if (clientSocket.readyState === WebSocket.OPEN) clientSocket.close();
                  if (upstreamSocket.readyState === WebSocket.OPEN) upstreamSocket.close();
                };

                clientSocket.on('message', data => {
                  if (upstreamSocket.readyState === WebSocket.OPEN) {
                    upstreamSocket.send(data);
                  }
                });
                clientSocket.on('close', closeBoth);
                clientSocket.on('error', closeBoth);

                upstreamSocket.on('message', data => {
                  if (clientSocket.readyState === WebSocket.OPEN) {
                    clientSocket.send(data);
                  }
                });
                upstreamSocket.on('close', closeBoth);
                upstreamSocket.on('error', closeBoth);
              });
            })
            .catch(() => rejectUpgrade(502, 'Deepgram proxy failed'));
        });

        server.middlewares.use(async (req, res, next) => {
          if (req.url !== '/api/deepgram/token') {
            next();
            return;
          }

          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: { code: 'method_not_allowed', message: 'Use POST.' } }));
            return;
          }

          if (!deepgramApiKey) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              error: {
                code: 'missing_deepgram_api_key',
                message: 'Set DEEPGRAM_API_KEY in .env.local to enable realtime Deepgram STT.',
              },
            }));
            return;
          }

          try {
            const { DeepgramClient } = await import('@deepgram/sdk');
            const client = new DeepgramClient({ apiKey: deepgramApiKey });
            const token = await client.auth.v1.tokens.grant({ ttl_seconds: 120 });
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              access_token: token.access_token,
              expires_in: token.expires_in,
            }));
          } catch (error) {
            res.statusCode = 502;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              error: {
                code: 'deepgram_token_failed',
                message: error instanceof Error ? error.message : 'Could not create Deepgram token.',
              },
            }));
          }
        });
      },
    };
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        headers: {
          'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
        },
      },
      preview: {
        headers: {
          'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
        },
      },
      plugins: [react(), heygenProxyPlugin, deepgramTokenPlugin],
      build: {
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (!id.includes('node_modules')) return undefined;

              if (id.includes('pdfjs-dist')) return 'pdf';
              if (id.includes('@google/genai')) return 'genai';
              if (id.includes('firebase')) return 'firebase';
              return undefined;
            },
          },
        },
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
