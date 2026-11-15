/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['umbral-mark.svg'],
      manifest: {
        name: 'UMBRAL Hybrid AI',
        short_name: 'UMBRAL',
        description:
          'Verified opportunities, transparent requirement matching, and personal next-step planning powered by Firebase Hybrid AI.',
        theme_color: '#0F4C3A',
        background_color: '#F6F7F5',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/umbral-mark.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,json,woff2}'],
        navigateFallback: '/index.html',
        runtimeCaching: [],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.tsx', 'tests/integration/**/*.test.ts'],
  },
});
