import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://vael-anore.vercel.app',
  server: { host: '0.0.0.0', port: 4321 },
  devToolbar: { enabled: false },
  build: { inlineStylesheets: 'auto' }
});
