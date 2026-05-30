import { defineConfig } from 'vite';

export default defineConfig({
  base: '/sloth-rescue-squad/',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
});
