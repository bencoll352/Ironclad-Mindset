import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/Ironclad-Mindset/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'ironclad-badge.jpg'],
      manifest: {
        name: 'Ironclad Mindset — Forged in Struggle. Built for Strength.',
        short_name: 'Ironclad',
        description:
          'Zero corporate fluff. Practical sobriety accountability, brain-fuel nutrition, and a 24/7 recovery companion.',
        start_url: '/Ironclad-Mindset/',
        scope: '/Ironclad-Mindset/',
        display: 'standalone',
        background_color: '#FFFFFF',
        theme_color: '#7A263A',
        orientation: 'portrait-primary',
        icons: [
          {
            src: '/Ironclad-Mindset/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
          {
            src: '/Ironclad-Mindset/ironclad-badge.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,jpg,png,ico,woff2}'],
        navigateFallback: '/Ironclad-Mindset/index.html',
        navigateFallbackDenylist: [/^\/api\//, /\/functions\/v1\//, /\/rest\/v1\//],
        // Keep chat endpoints and private records strictly out of service-worker response caches
        runtimeCaching: [
          {
            urlPattern: /(\/functions\/v1\/|\/rest\/v1\/|\/api\/cornerman)/i,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ironclad-google-fonts',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});
