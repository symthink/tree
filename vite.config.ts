import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'configure-mobile-user-agent',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // iPhone 13 User-Agent
          res.setHeader('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1');
          next();
        });
      }
    }
  ],
  root: 'demo',
  resolve: {
    alias: {
      '@symthink/tree': path.resolve(__dirname, './src'),
      'react-native': 'react-native-web',
    },
    extensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.tsx', '.ts', '.jsx', '.js'],
  },
  server: {
    port: 3000,
    open: true,
  },
  optimizeDeps: {
    include: ['react-native-web'],
  },
}); 