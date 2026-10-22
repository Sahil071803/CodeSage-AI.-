import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Dev proxy: the browser always calls same-origin /api/... requests, and Vite
 * forwards them to the Spring Boot backend (target = VITE_API_BASE_URL in .env).
 * This removes CORS and port/origin mismatches (localhost vs 127.0.0.1, etc.)
 * entirely during development — no Access-Control headers needed.
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backend = (env.VITE_API_BASE_URL || 'http://localhost:9090').replace(/\/+$/, '');

  const proxy = {
    '/api': {
      target: backend,
      changeOrigin: true,
      configure: (proxyServer) => {
        // Drop the browser's Origin header before forwarding so the backend
        // never rejects a local dev origin as an invalid CORS request.
        proxyServer.on('proxyReq', (proxyReq) => proxyReq.removeHeader('origin'));
      },
    },
  };

  return {
    plugins: [react()],
    server: { port: 5173, open: false, proxy },
    preview: { proxy },
  };
});
