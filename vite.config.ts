import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['@blinkdotnew/ui'],
  },
  server: {
    port: 3001,
    strictPort: true,
    host: true,
    allowedHosts: true,
  }
});