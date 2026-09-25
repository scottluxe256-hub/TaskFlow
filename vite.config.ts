// @ts-nocheck
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api/holidays': {
        target: 'https://dayoffapi.vercel.app/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/holidays/, ''),
      },
    },
  },
});
