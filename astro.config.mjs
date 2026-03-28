// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://lunogram.dev',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()]
  },
  output: 'static',
  redirects: {
    '/nl': {
      status: 302,
      destination: '/'
    },
    '/en': {
      status: 302,
      destination: '/'
    },
    '/about': {
      status: 301,
      destination: '/'
    },
    '/pricing': {
      status: 301,
      destination: '/'
    }
  }
});
